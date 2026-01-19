import uuid
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from social.models import Profile, Organization, OrganizationMembership, extract_email_domain
from .serializers import GoogleAuthSerializer, UserSerializer, UsernameSetupSerializer

User = get_user_model()

# Common email providers to exclude from auto-organization enrollment
COMMON_EMAIL_DOMAINS = {
    'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com',
    'yahoo.com', 'yahoo.co.in', 'icloud.com', 'me.com', 'aol.com',
    'protonmail.com', 'proton.me', 'mail.com', 'zoho.com', 'yandex.com'
}


def _auto_enroll_organization(user, email):
    """
    Auto-enroll user in organization based on email domain.
    For college/company emails, creates org if not exists and adds user.
    """
    domain = extract_email_domain(email)
    if not domain or domain in COMMON_EMAIL_DOMAINS:
        return None
    
    # Determine org type based on common patterns
    org_type = 'other'
    if any(edu in domain for edu in ['.edu', '.ac.', '.edu.', 'college', 'university', 'iiit', 'iit', 'nit']):
        org_type = 'college'
    elif any(corp in domain for corp in ['.co.', '.corp.', '.inc.']):
        org_type = 'company'
    
    # Create or get organization
    org_name = domain.split('.')[0].upper()  # e.g., iiits.in -> IIITS
    org, _ = Organization.objects.get_or_create(
        domain=domain,
        defaults={
            'name': org_name,
            'org_type': org_type,
            'is_verified': False  # Auto-created orgs start unverified
        }
    )
    
    # Create membership (auto-verified since they logged in with this email)
    membership, _ = OrganizationMembership.objects.get_or_create(
        user=user,
        organization=org,
        defaults={
            'verification_status': 'verified',
            'verification_email': email,
            'is_primary': True
        }
    )
    
    return membership


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    serializer = GoogleAuthSerializer(data=request.data)
    if serializer.is_valid():
        credential = serializer.validated_data['access_token']
        
        try:
            # Verify the JWT credential with Google
            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
            
            # Extract user data
            google_user_id = idinfo['sub']
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            picture = idinfo.get('picture', '')
            
            try:
                # Try to find existing user
                user = User.objects.get(email=email)
                
                # Update Google ID if not set
                if not user.google_id:
                    user.google_id = google_user_id
                    user.save()
                    
            except User.DoesNotExist:
                # Create new user with transaction to ensure profile is created
                with transaction.atomic():
                    user = User.objects.create_user(
                        email=email,
                        username=email,  # Temporary username
                        first_name=first_name,
                        last_name=last_name,
                        google_id=google_user_id,
                        is_setup_complete=False
                    )
                    
                    # Create profile (signal should handle this, but ensure it exists)
                    profile, created = Profile.objects.get_or_create(
                        user=user,
                        defaults={'profile_picture_url': picture}
                    )
                    if not created and not profile.profile_picture_url:
                        profile.profile_picture_url = picture
                        profile.save()
                    
                    # Auto-enroll in organization based on email domain
                    _auto_enroll_organization(user, email)
            
            tokens = get_tokens_for_user(user)
            user_data = UserSerializer(user).data
            
            return Response({
                'tokens': tokens,
                'user': user_data
            })
            
        except ValueError as e:
            return Response(
                {'error': f'Invalid Google token: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {'error': f'Authentication failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def setup_username(request):
    if request.user.is_setup_complete:
        return Response(
            {'error': 'User setup already completed'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = UsernameSetupSerializer(data=request.data)
    if serializer.is_valid():
        with transaction.atomic():
            # Update username and setup status
            request.user.username = serializer.validated_data['username']
            request.user.is_setup_complete = True
            request.user.save()
            
            # Get or create profile
            profile, created = Profile.objects.get_or_create(user=request.user)
            
            # Initialize profile with default widgets if it's a new profile
            if created or not profile.layout or not profile.layout.get('widgets'):
                default_widgets = [
                    {
                        "id": str(uuid.uuid4()),
                        "type": "interests",
                        "position": {"x": 0, "y": 0},
                        "size": {"w": 1, "h": 2},
                        "visibility": "public",
                        "config": {}
                    },
                    {
                        "id": str(uuid.uuid4()),
                        "type": "tasks",
                        "position": {"x": 1, "y": 0},
                        "size": {"w": 2, "h": 2},
                        "visibility": "public",
                        "config": {}
                    }
                ]
                
                profile.layout = {"widgets": default_widgets}
                profile.save()
        
        return Response({
            'user': UserSerializer(request.user).data,
            'message': 'Profile setup completed successfully!'
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_username(request):
    """
    Change username with 30-day rate limit.
    """
    user = request.user
    
    # Check rate limit
    if user.last_username_change:
        delta = timezone.now() - user.last_username_change
        if delta.days < 30:
            return Response(
                {'error': f'You can change your username again in {30 - delta.days} days.'},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
    
    serializer = UsernameSetupSerializer(data=request.data)
    if serializer.is_valid():
        try:
            with transaction.atomic():
                user.username = serializer.validated_data['username']
                user.last_username_change = timezone.now()
                user.save()
                return Response({'username': user.username})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_me(request):
    user = request.user
    
    # Auto-fix: If user has a complete profile but is_setup_complete=False, fix it
    if not user.is_setup_complete:
        has_custom_username = user.username and user.username != user.email
        has_profile = hasattr(user, 'profile') and user.profile is not None
        has_widgets = (
            has_profile and 
            user.profile.layout and 
            user.profile.layout.get('widgets')
        )
        
        if has_custom_username and has_widgets:
            user.is_setup_complete = True
            user.save(update_fields=['is_setup_complete'])
    
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for monitoring"""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'service': 'minsoto-backend'
    })


@api_view(['POST', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_status(request):
    """Update user's presence status (online/idle/focus/dnd/offline)"""
    from .serializers import UserStatusSerializer
    
    serializer = UserStatusSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        user.status = serializer.validated_data['status']
        
        if 'status_message' in serializer.validated_data:
            user.status_message = serializer.validated_data['status_message']
        
        # Track focus session start time
        if serializer.validated_data['status'] == 'focus':
            if not user.focus_session_start:
                user.focus_session_start = timezone.now()
        else:
            user.focus_session_start = None
        
        user.save()
        
        return Response({
            'status': user.status,
            'status_message': user.status_message,
            'focus_session_start': user.focus_session_start
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

