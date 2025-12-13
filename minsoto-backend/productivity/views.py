from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta

from .models import HabitStreak, HabitLog, Task, Dashboard
from .serializers import (
    HabitStreakSerializer, HabitLogSerializer, TaskSerializer,
    DashboardSerializer, DashboardLayoutUpdateSerializer, DashboardStatsSerializer
)
# Cross-app imports
from social.models import UserInterest
from social.serializers import UserInterestSerializer

# =============================================================================
# Habits
# =============================================================================

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
            
            # Reset streak (simplified)
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


# =============================================================================
# Tasks
# =============================================================================

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


# =============================================================================
# Dashboard & Widget Data
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
        user=request.user
    ).filter(
        Q(due_date__isnull=True) | Q(due_date__date__lte=today)
    ).filter(
        Q(status__in=['todo', 'in_progress']) | 
        Q(status='completed', updated_at__date=today)
    ).order_by('status', 'due_date', '-priority')[:20]
    
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
            'time': None
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
        habit__in=habits,
        date=today,
        completed=True
    ).count()
    
    max_current = 0
    max_longest = 0
    for h in habits:
        max_current = max(max_current, h.current_streak)
        max_longest = max(max_longest, h.longest_streak)
        
    data = {
        'tasks_completed_today': tasks_completed_today,
        'tasks_completed_week': tasks_completed_week,
        'habits_completed_today': habits_completed_today,
        'habits_total_today': total_habits,
        'current_streak': max_current,
        'longest_streak': max_longest,
        'total_tasks': total_tasks,
        'total_habits': total_habits
    }
    
    # Use serializer to validate structure (optional but good practice)
    serializer = DashboardStatsSerializer(data=data)
    # Hack: We aren't really validating input here, just constructing output. 
    # But for consistency related to imports, we just return data.
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def widget_data(request):
    """Get all widget data for current user"""
    user = request.user
    
    tasks = Task.objects.filter(user=user).only(
        'id', 'title', 'description', 'status', 'priority', 'due_date', 
        'is_public', 'created_at', 'updated_at'
    )
    habits = HabitStreak.objects.filter(user=user).prefetch_related('logs')
    interests = UserInterest.objects.filter(user=user).select_related('interest')
    
    # Get recent habit logs for graph
    habit_logs = []
    if habits.exists():
        today = timezone.now().date()
        last_28_days = [today - timedelta(days=i) for i in range(27, -1, -1)]
        
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
