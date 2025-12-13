from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from django.db import transaction
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import (
    Profile, Interest, UserInterest, Organization, 
    OrganizationMembership, Connection, extract_email_domain
)
from .serializers import (
    ProfileSerializer, ProfileDetailSerializer, LayoutUpdateSerializer,
    InterestSerializer, UserInterestSerializer,
    OrganizationSerializer, OrganizationDetailSerializer, OrganizationMembershipSerializer,
    ConnectionSerializer, ConnectionRequestSerializer, UserMinimalSerializer
)

User = get_user_model()


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_me(request):
    # Ensure profile exists
    profile, created = Profile.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        serializer = ProfileDetailSerializer(profile)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            with transaction.atomic():
                serializer.save()
            return Response(ProfileDetailSerializer(profile).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_detail(request, username):
    """Get profile with visibility logic"""
    try:
        user = User.objects.get(username=username)
        profile, created = Profile.objects.get_or_create(user=user)
        
        is_owner = request.user == user
        
        profile_data = ProfileDetailSerializer(profile).data
        
        # Filter widgets based on visibility
        if not is_owner and profile_data.get('layout'):
            visible_widgets = [
                w for w in profile_data['layout'].get('widgets', [])
                if w.get('visibility') == 'public'
            ]
            profile_data['layout']['widgets'] = visible_widgets
        
        return Response({
            'profile': profile_data,
            'is_owner': is_owner
        })
        
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_layout(request):
    """Save widget layout"""
    profile, created = Profile.objects.get_or_create(user=request.user)
    
    serializer = LayoutUpdateSerializer(data=request.data)
    if serializer.is_valid():
        profile.layout = serializer.validated_data['layout']
        profile.save()
        return Response({
            'message': 'Layout saved successfully',
            'layout': profile.layout
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Interests
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def interests_list(request):
    """List all available interests"""
    interests = Interest.objects.all()
    serializer = InterestSerializer(interests, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_interest(request):
    """Add interest to user profile"""
    interest_id = request.data.get('interest_id')
    is_public = request.data.get('is_public', True)
    
    try:
        interest = Interest.objects.get(id=interest_id)
        user_interest, created = UserInterest.objects.get_or_create(
            user=request.user,
            interest=interest,
            defaults={'is_public': is_public}
        )
        
        if not created:
            return Response(
                {'error': 'Interest already added'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = UserInterestSerializer(user_interest)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
        
    except Interest.DoesNotExist:
        return Response(
            {'error': 'Interest not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_interest(request, interest_id):
    """Remove interest from user profile"""
    try:
        user_interest = UserInterest.objects.get(
            user=request.user,
            interest_id=interest_id
        )
        user_interest.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
        
    except UserInterest.DoesNotExist:
        return Response(
            {'error': 'Interest not found'},
            status=status.HTTP_404_NOT_FOUND
        )


# Organizations
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def organizations_list(request):
    """List all verified organizations"""
    organizations = Organization.objects.filter(is_verified=True)
    serializer = OrganizationSerializer(organizations, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def organization_detail(request, domain):
    """Get organization details and members"""
    try:
        organization = Organization.objects.get(domain=domain)
        serializer = OrganizationDetailSerializer(organization)
        
        # Check if current user is a member
        is_member = OrganizationMembership.objects.filter(
            user=request.user,
            organization=organization,
            verification_status='verified'
        ).exists()
        
        return Response({
            'organization': serializer.data,
            'is_member': is_member
        })
    except Organization.DoesNotExist:
        return Response(
            {'error': 'Organization not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_organization(request):
    """Verify organization membership via Google OAuth"""
    credential = request.data.get('credential')
    if not credential:
        return Response(
            {'error': 'Google credential required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID
        )
        
        email = idinfo['email']
        domain = extract_email_domain(email)
        
        if not domain:
            return Response(
                {'error': 'Invalid email format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            organization, created = Organization.objects.get_or_create(
                domain=domain,
                defaults={
                    'name': domain.split('.')[0].upper(),
                    'org_type': 'other'
                }
            )
            
            membership, mem_created = OrganizationMembership.objects.update_or_create(
                user=request.user,
                organization=organization,
                defaults={
                    'verification_status': 'verified',
                    'verification_email': email,
                    'is_primary': not request.user.organization_memberships.filter(
                        is_primary=True
                    ).exists()
                }
            )
        
        return Response({
            'message': f'Successfully verified with {organization.name}',
            'organization': OrganizationSerializer(organization).data,
            'membership': OrganizationMembershipSerializer(membership).data
        }, status=status.HTTP_201_CREATED if mem_created else status.HTTP_200_OK)
        
    except ValueError as e:
        return Response(
            {'error': f'Invalid Google token: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_organizations(request):
    """Get current user's organizations"""
    memberships = request.user.organization_memberships.filter(
        verification_status='verified'
    ).select_related('organization')
    serializer = OrganizationMembershipSerializer(memberships, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def leave_organization(request, org_id):
    """Leave an organization"""
    try:
        membership = OrganizationMembership.objects.get(
            user=request.user,
            organization_id=org_id
        )
        membership.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except OrganizationMembership.DoesNotExist:
        return Response(
            {'error': 'Membership not found'},
            status=status.HTTP_404_NOT_FOUND
        )


# Connections
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def connections_list(request):
    """List user's connections. Query params: ?type=all|friends|connections"""
    connection_type = request.query_params.get('type', 'all')
    
    connections = Connection.objects.filter(
        Q(from_user=request.user) | Q(to_user=request.user),
        status='accepted'
    ).select_related('from_user', 'to_user', 'from_user__profile', 'to_user__profile')
    
    if connection_type == 'friends':
        connections = connections.filter(connection_type='friend')
    elif connection_type == 'connections':
        connections = connections.filter(connection_type='connection')
    
    serializer = ConnectionSerializer(connections, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pending_connections(request):
    """Get pending connection requests received by current user"""
    pending = Connection.objects.filter(
        to_user=request.user,
        status='pending'
    ).select_related('from_user', 'from_user__profile')
    serializer = ConnectionSerializer(pending, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sent_connections(request):
    """Get connection requests sent by current user"""
    sent = Connection.objects.filter(
        from_user=request.user,
        status='pending'
    ).select_related('to_user', 'to_user__profile')
    serializer = ConnectionSerializer(sent, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_connection_request(request):
    """Send a connection request to another user"""
    serializer = ConnectionRequestSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    to_user_id = serializer.validated_data['to_user_id']
    message = serializer.validated_data.get('message', '')
    
    if str(to_user_id) == str(request.user.id):
        return Response({'error': 'Cannot connect to yourself'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        to_user = User.objects.get(id=to_user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    existing = Connection.get_connection_between(request.user, to_user)
    if existing:
        if existing.status == 'accepted':
            return Response({'error': 'Already connected'}, status=status.HTTP_400_BAD_REQUEST)
        elif existing.status == 'pending':
            return Response({'error': 'Connection request already pending'}, status=status.HTTP_400_BAD_REQUEST)
    
    connection = Connection.objects.create(
        from_user=request.user,
        to_user=to_user,
        message=message,
        status='pending'
    )
    
    return Response(ConnectionSerializer(connection).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_connection(request):
    """Accept a pending connection request"""
    connection_id = request.data.get('connection_id')
    if not connection_id:
        return Response({'error': 'connection_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        connection = Connection.objects.get(
            id=connection_id,
            to_user=request.user,
            status='pending'
        )
    except Connection.DoesNotExist:
        return Response({'error': 'Connection request not found'}, status=status.HTTP_404_NOT_FOUND)
    
    connection.status = 'accepted'
    connection.save()
    
    return Response(ConnectionSerializer(connection).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_connection(request):
    """Reject a pending connection request"""
    connection_id = request.data.get('connection_id')
    if not connection_id:
        return Response({'error': 'connection_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        connection = Connection.objects.get(
            id=connection_id,
            to_user=request.user,
            status='pending'
        )
    except Connection.DoesNotExist:
        return Response({'error': 'Connection request not found'}, status=status.HTTP_404_NOT_FOUND)
    
    connection.status = 'rejected'
    connection.save()
    
    return Response({'message': 'Connection request rejected'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_connection(request, connection_id):
    """Remove an existing connection"""
    try:
        connection = Connection.objects.get(
            Q(from_user=request.user) | Q(to_user=request.user),
            id=connection_id,
            status='accepted'
        )
    except Connection.DoesNotExist:
        return Response({'error': 'Connection not found'}, status=status.HTTP_404_NOT_FOUND)
    
    connection.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upgrade_to_friend(request):
    """Request friend upgrade"""
    connection_id = request.data.get('connection_id')
    if not connection_id:
        return Response({'error': 'connection_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        connection = Connection.objects.get(
            Q(from_user=request.user) | Q(to_user=request.user),
            id=connection_id,
            status='accepted',
            connection_type='connection'
        )
    except Connection.DoesNotExist:
        return Response({'error': 'Connection not found or already friends'}, status=status.HTTP_404_NOT_FOUND)
    
    if connection.friend_upgrade_requested_by:
        if connection.friend_upgrade_requested_by != request.user:
            connection.connection_type = 'friend'
            connection.friend_upgrade_requested_by = None
            connection.friend_upgrade_requested_at = None
            connection.save()
            return Response({
                'message': 'Friend request confirmed! You are now friends.',
                'connection': ConnectionSerializer(connection).data
            })
        else:
            return Response({'error': 'Friend request already pending'}, status=status.HTTP_400_BAD_REQUEST)
    
    connection.friend_upgrade_requested_by = request.user
    connection.friend_upgrade_requested_at = timezone.now()
    connection.save()
    
    return Response({
        'message': 'Friend request sent',
        'connection': ConnectionSerializer(connection).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_friend_upgrade(request):
    """Confirm/reject a pending friend upgrade request"""
    connection_id = request.data.get('connection_id')
    action = request.data.get('action')
    
    if not connection_id or action not in ['accept', 'reject']:
        return Response({'error': 'connection_id and action required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        connection = Connection.objects.get(
            Q(from_user=request.user) | Q(to_user=request.user),
            id=connection_id,
            status='accepted',
            connection_type='connection'
        )
    except Connection.DoesNotExist:
        return Response({'error': 'Connection not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if not connection.friend_upgrade_requested_by or connection.friend_upgrade_requested_by == request.user:
        return Response({'error': 'Invalid request'}, status=status.HTTP_400_BAD_REQUEST)
    
    if action == 'accept':
        connection.connection_type = 'friend'
        connection.friend_upgrade_requested_by = None
        connection.friend_upgrade_requested_at = None
        connection.save()
        return Response({
            'message': 'You are now friends!',
            'connection': ConnectionSerializer(connection).data
        })
    else:
        connection.friend_upgrade_requested_by = None
        connection.friend_upgrade_requested_at = None
        connection.save()
        return Response({'message': 'Friend request declined'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mutual_friends(request, user_id):
    try:
        other_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Simplified mutual friends logic
    my_friends_ids = set()
    for conn in Connection.objects.filter(
        Q(from_user=request.user) | Q(to_user=request.user),
        status='accepted', connection_type='friend'
    ):
        my_friends_ids.add(conn.to_user.id if conn.from_user == request.user else conn.from_user.id)
        
    their_friends_ids = set()
    for conn in Connection.objects.filter(
        Q(from_user=other_user) | Q(to_user=other_user),
        status='accepted', connection_type='friend'
    ):
        their_friends_ids.add(conn.to_user.id if conn.from_user == other_user else conn.from_user.id)
    
    mutual_ids = my_friends_ids & their_friends_ids
    mutual_users = User.objects.filter(id__in=mutual_ids)[:10]
    
    return Response({
        'count': len(mutual_ids),
        'users': UserMinimalSerializer(mutual_users, many=True).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def connection_status(request, user_id):
    try:
        other_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    connection = Connection.get_connection_between(request.user, other_user)
    
    if not connection:
        return Response({'status': 'none', 'connection': None})
    
    if connection.status == 'pending':
        status_val = 'pending_sent' if connection.from_user == request.user else 'pending_received'
        return Response({'status': status_val, 'connection': ConnectionSerializer(connection).data})
    elif connection.status == 'accepted':
        status_val = 'friends' if connection.connection_type == 'friend' else 'connected'
        return Response({'status': status_val, 'connection': ConnectionSerializer(connection).data})
    
    return Response({'status': 'none', 'connection': None})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def discover_users(request):
    """Discover users with optional filters"""
    search = request.query_params.get('search', '')
    organization_domain = request.query_params.get('organization', '')
    
    users = User.objects.exclude(id=request.user.id).filter(is_setup_complete=True).select_related('profile')
    
    if search:
        users = users.filter(
            Q(username__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )
    
    if organization_domain:
        users = users.filter(
            organization_memberships__organization__domain=organization_domain,
            organization_memberships__verification_status='verified',
            organization_memberships__is_visible=True
        )
    
    users = users[:50]
    
    results = []
    for user in users:
        connection = Connection.get_connection_between(request.user, user)
        connection_status_val = 'none'
        if connection:
            if connection.status == 'pending':
                connection_status_val = 'pending_sent' if connection.from_user == request.user else 'pending_received'
            elif connection.status == 'accepted':
                connection_status_val = 'friends' if connection.connection_type == 'friend' else 'connected'
        
        user_data = UserMinimalSerializer(user).data
        user_data['connection_status'] = connection_status_val
        
        # Add interests
        interests = user.user_interests.filter(is_public=True)[:5]
        user_data['interests'] = [ui.interest.name for ui in interests]
        
        # Add organizations
        orgs = user.organization_memberships.filter(
            verification_status='verified',
            show_on_profile=True
        ).select_related('organization')[:3]
        user_data['organizations'] = [m.organization.name for m in orgs]
        
        results.append(user_data)
    
    return Response(results)
