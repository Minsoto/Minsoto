import json
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.conf import settings
from .models import Profile, HabitStreak, Task, UserInterest
from .serializers import (
    GoogleAuthSerializer, 
    UserSerializer, 
    ProfileSerializer,
    UsernameSetupSerializer,
    HabitStreakSerializer,
    TaskSerializer,
    UserInterestSerializer,
    ProfileDetailSerializer
)

User = get_user_model()

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
        credential = serializer.validated_data['access_token']  # This is actually the JWT credential
        
        try:
            # Verify the JWT credential with Google
            idinfo = id_token.verify_oauth2_token(
                credential, 
                google_requests.Request(), 
                settings.GOOGLE_CLIENT_ID
            )
            
            # Extract user data from the verified token
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
                # Create new user
                user = User.objects.create_user(
                    email=email,
                    username=email,  # Temporary username
                    first_name=first_name,
                    last_name=last_name,
                    google_id=google_user_id,
                    is_setup_complete=False
                )
                
                # Create profile
                Profile.objects.create(
                    user=user,
                    profile_picture_url=picture
                )
            
            tokens = get_tokens_for_user(user)
            user_data = UserSerializer(user).data
            
            return Response({
                'tokens': tokens,
                'user': user_data
            })
            
        except ValueError as e:
            # Invalid token
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
        request.user.username = serializer.validated_data['username']
        request.user.is_setup_complete = True
        request.user.save()
        
        return Response({
            'user': UserSerializer(request.user).data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile_me(request):
    try:
        profile = request.user.profile
    except Profile.DoesNotExist:
        profile = Profile.objects.create(user=request.user)
    
    if request.method == 'GET':
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# users/views.py additions

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_detail(request, username):
    """Get profile with visibility logic"""
    try:
        user = User.objects.get(username=username)
        profile = user.profile
        
        is_owner = request.user == user
        
        # Filter widgets based on visibility
        if not is_owner and profile.layout:
            visible_widgets = [
                w for w in profile.layout.get('widgets', [])
                if w.get('visibility') == 'public'
            ]
            profile.layout['widgets'] = visible_widgets
        
        serializer = ProfileDetailSerializer(profile)
        return Response({
            'profile': serializer.data,
            'is_owner': is_owner
        })
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_layout(request):
    """Save widget layout"""
    profile = request.user.profile
    layout_data = request.data.get('layout')
    
    if layout_data:
        profile.layout = layout_data
        profile.save()
        return Response({'message': 'Layout saved successfully'})
    
    return Response({'error': 'Invalid layout data'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def widget_data(request):
    """Get all widget data for current user"""
    user = request.user
    
    data = {
        'habits': HabitStreakSerializer(user.habits.all(), many=True).data,
        'tasks': TaskSerializer(user.tasks.all(), many=True).data,
        'interests': UserInterestSerializer(user.interests.all(), many=True).data,
        # Add more widget data as needed
    }
    
    return Response(data)
