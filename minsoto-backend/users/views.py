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

from .models import Profile, HabitStreak, Task, UserInterest, Interest, HabitLog
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
    InterestSerializer
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
        request.user.username = serializer.validated_data['username']
        request.user.is_setup_complete = True
        request.user.save()
        
        return Response({
            'user': UserSerializer(request.user).data
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
    
    data = {
        'habits': HabitStreakSerializer(user.habits.all(), many=True).data,
        'tasks': TaskSerializer(user.tasks.all(), many=True).data,
        'interests': UserInterestSerializer(user.user_interests.all(), many=True).data,
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
