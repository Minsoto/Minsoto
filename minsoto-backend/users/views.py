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
from django.db.models import Q

from .models import (
    Profile, HabitStreak, Task, UserInterest, Interest, HabitLog,
    Organization, OrganizationMembership, Connection, Dashboard, extract_email_domain
)
from .serializers import (
    GoogleAuthSerializer,
    UserSerializer,
    ProfileSerializer,
    UsernameSetupSerializer,
    HabitStreakSerializer,
    TaskSerializer,
    UserInterestSerializer,
    ProfileDetailSerializer,
    LayoutUpdateSerializer,
    InterestSerializer,
    OrganizationSerializer,
    OrganizationDetailSerializer,
    OrganizationMembershipSerializer,
    ConnectionSerializer,
    ConnectionRequestSerializer,
    UserMinimalSerializer,
    DashboardSerializer,
    DashboardLayoutUpdateSerializer,
    DashboardStatsSerializer
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
def user_me(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_detail(request, username):
    """Get profile with visibility logic"""
    try:
        user = User.objects.get(username=username)
        profile, created = Profile.objects.get_or_create(user=user)
        
        is_owner = request.user == user
        
        # Create a copy of layout to avoid modifying the original
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def widget_data(request):
    """Get all widget data for current user"""
    user = request.user
    
    # Optimized queries with select_related/prefetch_related
    tasks = Task.objects.filter(user=user).only(
        'id', 'title', 'description', 'status', 'priority', 'due_date', 
        'is_public', 'created_at', 'updated_at'
    )
    habits = HabitStreak.objects.filter(user=user).prefetch_related('logs')
    interests = UserInterest.objects.filter(user=user).select_related('interest')
    
    # Get recent habit logs for graph using bulk query
    habit_logs = []
    if habits.exists():
        today = timezone.now().date()
        from datetime import timedelta
        last_28_days = [today - timedelta(days=i) for i in range(27, -1, -1)]
        
        # For the first habit, get completion data with bulk query
        first_habit = habits.first()
        if first_habit:
            completed_dates = set(
                HabitLog.objects.filter(
                    habit=first_habit,
                    date__in=last_28_days,
                    completed=True
                ).values_list('date', flat=True)
            )
            habit_logs = [day in completed_dates for day in last_28_days]
    
    data = {
        'tasks': TaskSerializer(tasks, many=True).data,
        'habits': HabitStreakSerializer(habits, many=True).data,
        'interests': UserInterestSerializer(interests, many=True).data,
        'habitGraphData': habit_logs,
    }
    
    return Response(data)



# Additional endpoints for widget management

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def habits_list(request):
    """List all habits or create new habit"""
    if request.method == 'GET':
        habits = request.user.habits.all()
        serializer = HabitStreakSerializer(habits, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = HabitStreakSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def habit_detail(request, habit_id):
    """Get, update, or delete a specific habit"""
    try:
        habit = HabitStreak.objects.get(id=habit_id, user=request.user)
    except HabitStreak.DoesNotExist:
        return Response({'error': 'Habit not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = HabitStreakSerializer(habit)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = HabitStreakSerializer(habit, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        habit.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def habit_log(request, habit_id):
    """Log or unlog habit completion for today"""
    try:
        habit = HabitStreak.objects.get(id=habit_id, user=request.user)
    except HabitStreak.DoesNotExist:
        return Response({'error': 'Habit not found'}, status=status.HTTP_404_NOT_FOUND)
    
    today = timezone.now().date()
    
    if request.method == 'POST':
        # Mark habit as completed today
        log, created = HabitLog.objects.get_or_create(
            habit=habit,
            date=today,
            defaults={'completed': True}
        )
        if not created:
            log.completed = True
            log.save()
        
        # Update streak
        if created or not log.completed:
            habit.current_streak += 1
            if habit.current_streak > habit.longest_streak:
                habit.longest_streak = habit.current_streak
            habit.save()
        
        return Response({
            'message': 'Habit logged',
            'completed': True,
            'current_streak': habit.current_streak
        })
    
    elif request.method == 'DELETE':
        # Remove today's completion
        try:
            log = HabitLog.objects.get(habit=habit, date=today)
            log.completed = False
            log.save()
            
            # Reset streak (simplified - in production would recalculate)
            if habit.current_streak > 0:
                habit.current_streak -= 1
                habit.save()
            
            return Response({
                'message': 'Habit log removed',
                'completed': False,
                'current_streak': habit.current_streak
            })
        except HabitLog.DoesNotExist:
            return Response({'message': 'No log to remove', 'completed': False})

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def tasks_list(request):
    """List all tasks or create new task"""
    if request.method == 'GET':
        status_filter = request.query_params.get('status')
        tasks = request.user.tasks.all()
        
        if status_filter:
            tasks = tasks.filter(status=status_filter)
        
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail(request, task_id):
    """Get, update, or delete a specific task"""
    try:
        task = Task.objects.get(id=task_id, user=request.user)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = TaskSerializer(task)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint for monitoring"""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'service': 'minsoto-backend'
    })


# =============================================================================
# PHASE 2A: Organizations Endpoints
# =============================================================================

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
    """
    Verify organization membership via Google OAuth.
    Expects: { "credential": "google_oauth_token" }
    """
    credential = request.data.get('credential')
    if not credential:
        return Response(
            {'error': 'Google credential required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Verify the Google token
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
            # Get or create organization
            organization, created = Organization.objects.get_or_create(
                domain=domain,
                defaults={
                    'name': domain.split('.')[0].upper(),  # Basic name from domain
                    'org_type': 'other'
                }
            )
            
            # Create or update membership
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


# =============================================================================
# PHASE 2A: Connections Endpoints
# =============================================================================

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
    
    # Can't connect to yourself
    if str(to_user_id) == str(request.user.id):
        return Response(
            {'error': 'Cannot connect to yourself'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        to_user = User.objects.get(id=to_user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if connection already exists
    existing = Connection.get_connection_between(request.user, to_user)
    if existing:
        if existing.status == 'accepted':
            return Response(
                {'error': 'Already connected'},
                status=status.HTTP_400_BAD_REQUEST
            )
        elif existing.status == 'pending':
            return Response(
                {'error': 'Connection request already pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Create connection request
    connection = Connection.objects.create(
        from_user=request.user,
        to_user=to_user,
        message=message,
        status='pending'
    )
    
    return Response(
        ConnectionSerializer(connection).data,
        status=status.HTTP_201_CREATED
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_connection(request):
    """Accept a pending connection request"""
    connection_id = request.data.get('connection_id')
    if not connection_id:
        return Response(
            {'error': 'connection_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        connection = Connection.objects.get(
            id=connection_id,
            to_user=request.user,
            status='pending'
        )
    except Connection.DoesNotExist:
        return Response(
            {'error': 'Connection request not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    connection.status = 'accepted'
    connection.save()
    
    return Response(ConnectionSerializer(connection).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_connection(request):
    """Reject a pending connection request"""
    connection_id = request.data.get('connection_id')
    if not connection_id:
        return Response(
            {'error': 'connection_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        connection = Connection.objects.get(
            id=connection_id,
            to_user=request.user,
            status='pending'
        )
    except Connection.DoesNotExist:
        return Response(
            {'error': 'Connection request not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
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
        return Response(
            {'error': 'Connection not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    connection.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upgrade_to_friend(request):
    """Request friend upgrade (sets pending state, other user must confirm)"""
    connection_id = request.data.get('connection_id')
    if not connection_id:
        return Response(
            {'error': 'connection_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        connection = Connection.objects.get(
            Q(from_user=request.user) | Q(to_user=request.user),
            id=connection_id,
            status='accepted',
            connection_type='connection'
        )
    except Connection.DoesNotExist:
        return Response(
            {'error': 'Connection not found or already friends'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check if upgrade already requested
    if connection.friend_upgrade_requested_by:
        # If the other party is requesting, confirm the upgrade
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
            return Response(
                {'error': 'Friend request already pending'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Set pending friend request
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
    action = request.data.get('action')  # 'accept' or 'reject'
    
    if not connection_id or action not in ['accept', 'reject']:
        return Response(
            {'error': 'connection_id and action (accept/reject) required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        connection = Connection.objects.get(
            Q(from_user=request.user) | Q(to_user=request.user),
            id=connection_id,
            status='accepted',
            connection_type='connection'
        )
    except Connection.DoesNotExist:
        return Response(
            {'error': 'Connection not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Verify there's a pending request and it's not from the current user
    if not connection.friend_upgrade_requested_by:
        return Response(
            {'error': 'No pending friend request'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if connection.friend_upgrade_requested_by == request.user:
        return Response(
            {'error': 'Cannot confirm your own request'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if action == 'accept':
        connection.connection_type = 'friend'
        connection.friend_upgrade_requested_by = None
        connection.friend_upgrade_requested_at = None
        connection.save()
        return Response({
            'message': 'You are now friends!',
            'connection': ConnectionSerializer(connection).data
        })
    else:  # reject
        connection.friend_upgrade_requested_by = None
        connection.friend_upgrade_requested_at = None
        connection.save()
        return Response({'message': 'Friend request declined'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mutual_friends(request, user_id):
    """Get mutual friends between current user and specified user"""
    try:
        other_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get current user's friends
    my_friends_q = Connection.objects.filter(
        Q(from_user=request.user) | Q(to_user=request.user),
        status='accepted',
        connection_type='friend'
    )
    my_friend_ids = set()
    for conn in my_friends_q:
        if conn.from_user == request.user:
            my_friend_ids.add(conn.to_user.id)
        else:
            my_friend_ids.add(conn.from_user.id)
    
    # Get other user's friends
    their_friends_q = Connection.objects.filter(
        Q(from_user=other_user) | Q(to_user=other_user),
        status='accepted',
        connection_type='friend'
    )
    their_friend_ids = set()
    for conn in their_friends_q:
        if conn.from_user == other_user:
            their_friend_ids.add(conn.to_user.id)
        else:
            their_friend_ids.add(conn.from_user.id)
    
    # Find intersection
    mutual_ids = my_friend_ids & their_friend_ids
    mutual_users = User.objects.filter(id__in=mutual_ids)[:10]  # Limit to 10
    
    return Response({
        'count': len(mutual_ids),
        'users': UserMinimalSerializer(mutual_users, many=True).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def connection_status(request, user_id):
    """Check connection status with a specific user"""
    try:
        other_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    connection = Connection.get_connection_between(request.user, other_user)
    
    if not connection:
        return Response({'status': 'none', 'connection': None})
    
    if connection.status == 'pending':
        if connection.from_user == request.user:
            return Response({'status': 'pending_sent', 'connection': ConnectionSerializer(connection).data})
        else:
            return Response({'status': 'pending_received', 'connection': ConnectionSerializer(connection).data})
    elif connection.status == 'accepted':
        if connection.connection_type == 'friend':
            return Response({'status': 'friends', 'connection': ConnectionSerializer(connection).data})
        else:
            return Response({'status': 'connected', 'connection': ConnectionSerializer(connection).data})
    
    return Response({'status': 'none', 'connection': None})


# =============================================================================
# PHASE 2A: User Discovery Endpoint
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def discover_users(request):
    """
    Discover users with optional filters.
    Query params: ?search=&organization=&interests=
    """
    search = request.query_params.get('search', '')
    organization_domain = request.query_params.get('organization', '')
    
    # Start with all users except current user
    users = User.objects.exclude(id=request.user.id).filter(
        is_setup_complete=True
    ).select_related('profile')
    
    # Filter by search term (username, first_name, last_name)
    if search:
        users = users.filter(
            Q(username__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )
    
    # Filter by organization
    if organization_domain:
        users = users.filter(
            organization_memberships__organization__domain=organization_domain,
            organization_memberships__verification_status='verified',
            organization_memberships__is_visible=True
        )
    
    # Limit results
    users = users[:50]
    
    # Get connection status for each user
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


# =============================================================================
# PHASE 2B: Dashboard Endpoints
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_get(request):
    """Get user's dashboard with layout and widget data"""
    dashboard, created = Dashboard.objects.get_or_create(user=request.user)
    
    # Also fetch widget data for the dashboard
    tasks = Task.objects.filter(user=request.user).only(
        'id', 'title', 'status', 'priority', 'due_date'
    )[:20]
    habits = HabitStreak.objects.filter(user=request.user).prefetch_related('logs')
    
    return Response({
        'dashboard': DashboardSerializer(dashboard).data,
        'widget_data': {
            'tasks': TaskSerializer(tasks, many=True).data,
            'habits': HabitStreakSerializer(habits, many=True).data,
        }
    })


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def dashboard_layout_update(request):
    """Update dashboard layout"""
    dashboard, created = Dashboard.objects.get_or_create(user=request.user)
    
    serializer = DashboardLayoutUpdateSerializer(data=request.data)
    if serializer.is_valid():
        dashboard.layout = serializer.validated_data['layout']
        dashboard.save()
        return Response({
            'message': 'Dashboard layout saved',
            'layout': dashboard.layout
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_focus(request):
    """Get today's focus items: tasks due today and habits to complete"""
    today = timezone.now().date()
    
    # Tasks due today or overdue
    tasks_today = Task.objects.filter(
        user=request.user,
        due_date__lte=today,
        status__in=['todo', 'in_progress']
    ).order_by('due_date', '-priority')[:10]
    
    # Today's habits
    habits = HabitStreak.objects.filter(user=request.user)
    habits_data = []
    for habit in habits:
        completed_today = HabitLog.objects.filter(
            habit=habit,
            date=today,
            completed=True
        ).exists()
        habits_data.append({
            'id': str(habit.id),
            'name': habit.name,
            'completed_today': completed_today,
            'current_streak': habit.current_streak,
            'time': None  # HabitStreak doesn't have time field
        })
    
    return Response({
        'tasks': TaskSerializer(tasks_today, many=True).data,
        'habits': habits_data,
        'date': today.isoformat()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get productivity stats for dashboard"""
    from datetime import timedelta
    today = timezone.now().date()
    week_ago = today - timedelta(days=7)
    
    # Task stats
    tasks_completed_today = Task.objects.filter(
        user=request.user,
        status='completed',
        updated_at__date=today
    ).count()
    
    tasks_completed_week = Task.objects.filter(
        user=request.user,
        status='completed',
        updated_at__date__gte=week_ago
    ).count()
    
    total_tasks = Task.objects.filter(user=request.user).count()
    
    # Habit stats
    habits = HabitStreak.objects.filter(user=request.user)
    total_habits = habits.count()
    
    habits_completed_today = HabitLog.objects.filter(
        habit__user=request.user,
        date=today,
        completed=True
    ).count()
    
    # Streak stats
    current_streak = 0
    longest_streak = 0
    if habits.exists():
        current_streak = max(h.current_streak for h in habits)
        longest_streak = max(h.longest_streak for h in habits)
    
    stats = {
        'tasks_completed_today': tasks_completed_today,
        'tasks_completed_week': tasks_completed_week,
        'habits_completed_today': habits_completed_today,
        'habits_total_today': total_habits,
        'current_streak': current_streak,
        'longest_streak': longest_streak,
        'total_tasks': total_tasks,
        'total_habits': total_habits
    }
    
    return Response(stats)
