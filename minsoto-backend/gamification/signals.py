"""
Django signals for XP and Points tracking.
Automatically awards XP when users complete tasks, log habits, etc.

ANTI-SPAM PROTECTIONS:
- XP/Points only awarded once per task/habit completion (checked via existing transactions)
- Daily XP cap per category
- Daily points cap
- Task point_value capped at 500
- Habit point_value_per_completion capped at 100
- Streak-based multipliers with max cap of 50%
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta

from productivity.models import Task, HabitLog, Goal
from .models import UserXP, XPTransaction, UserPoints, PointTransaction


# =============================================================================
# ANTI-SPAM CONFIGURATION
# =============================================================================
DAILY_XP_CAP = 500  # Max XP per day
DAILY_POINTS_CAP = 1000  # Max points per day
MAX_TASK_POINTS = 500  # Max points assignable to a task
MAX_HABIT_POINTS = 100  # Max base points per habit completion
MAX_STREAK_MULTIPLIER = 1.5  # 50% max bonus from streaks


def get_or_create_user_xp(user):
    """Get or create UserXP profile for a user."""
    xp_profile, created = UserXP.objects.get_or_create(user=user)
    return xp_profile


def get_or_create_user_points(user):
    """Get or create UserPoints for a user."""
    points, created = UserPoints.objects.get_or_create(user=user)
    return points


def get_daily_xp_earned(user):
    """Get total XP earned today by a user."""
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    total = XPTransaction.objects.filter(
        user=user,
        created_at__gte=today_start
    ).values_list('amount', flat=True)
    return sum(total)


def get_daily_points_earned(user):
    """Get total points earned today by a user."""
    today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
    total = PointTransaction.objects.filter(
        user=user,
        transaction_type='earn',
        created_at__gte=today_start
    ).values_list('amount', flat=True)
    return sum(total)


def calculate_streak_multiplier(streak_days):
    """
    Calculate point multiplier based on streak length.
    
    Streak Bonus Tiers:
    - 7+ days: +10%
    - 14+ days: +20%
    - 30+ days: +30%
    - 60+ days: +40%
    - 100+ days: +50% (max)
    
    Returns: multiplier (1.0 to 1.5)
    """
    if streak_days >= 100:
        return 1.5
    elif streak_days >= 60:
        return 1.4
    elif streak_days >= 30:
        return 1.3
    elif streak_days >= 14:
        return 1.2
    elif streak_days >= 7:
        return 1.1
    return 1.0


def award_xp(user, amount, source_type, source_id=None, description=''):
    """
    Award XP to a user and create transaction record.
    Respects daily cap.
    """
    # Check daily cap
    daily_earned = get_daily_xp_earned(user)
    remaining_cap = max(0, DAILY_XP_CAP - daily_earned)
    
    if remaining_cap <= 0:
        return 0, False  # At daily cap
    
    # Apply cap
    capped_amount = min(amount, remaining_cap)
    
    xp_profile = get_or_create_user_xp(user)
    actual_amount, leveled_up = xp_profile.add_xp(capped_amount, category=source_type.split('_')[0])
    
    # Create transaction record
    XPTransaction.objects.create(
        user=user,
        amount=actual_amount,
        source_type=source_type,
        source_id=source_id,
        description=description,
        new_total_xp=xp_profile.total_xp,
        new_level=xp_profile.level,
        leveled_up=leveled_up
    )
    
    return actual_amount, leveled_up


def award_points(user, amount, source_type, source_id=None, description='', streak_multiplier=1.0):
    """
    Award points to a user and create transaction record.
    Applies streak multiplier and respects daily cap.
    """
    if amount <= 0:
        return 0
    
    # Apply streak multiplier (capped)
    multiplier = min(streak_multiplier, MAX_STREAK_MULTIPLIER)
    boosted_amount = int(amount * multiplier)
    
    # Check daily cap
    daily_earned = get_daily_points_earned(user)
    remaining_cap = max(0, DAILY_POINTS_CAP - daily_earned)
    
    if remaining_cap <= 0:
        return 0  # At daily cap
    
    # Apply cap
    final_amount = min(boosted_amount, remaining_cap)
    
    user_points = get_or_create_user_points(user)
    new_balance = user_points.add_points(final_amount)
    
    # Create transaction record with multiplier info
    bonus_info = f' (+{int((multiplier - 1) * 100)}% streak)' if multiplier > 1 else ''
    PointTransaction.objects.create(
        user=user,
        amount=final_amount,
        transaction_type='earn',
        source_type=source_type,
        source_id=source_id,
        description=f'{description}{bonus_info}',
        new_balance=new_balance
    )
    
    return new_balance


# =============================================================================
# Signal Handlers
# =============================================================================

@receiver(post_save, sender=Task)
def on_task_save(sender, instance, created, **kwargs):
    """Award XP and points when a task is completed."""
    if not created and instance.status == 'completed':
        # Check if we've already awarded XP for this task (anti-spam)
        existing = XPTransaction.objects.filter(
            user=instance.user,
            source_type='task_complete',
            source_id=instance.id
        ).exists()
        
        if not existing:
            # Calculate XP based on priority
            xp_amounts = {
                'low': 10,
                'medium': 25,
                'high': 40,
                'urgent': 50,
            }
            xp_amount = xp_amounts.get(instance.priority, 20)
            
            # Award XP
            award_xp(
                user=instance.user,
                amount=xp_amount,
                source_type='task_complete',
                source_id=instance.id,
                description=f'Completed task: {instance.title[:50]}'
            )
            
            # Award points if task has point_value set (capped)
            if hasattr(instance, 'point_value') and instance.point_value > 0:
                capped_points = min(instance.point_value, MAX_TASK_POINTS)
                award_points(
                    user=instance.user,
                    amount=capped_points,
                    source_type='task',
                    source_id=instance.id,
                    description=f'Task completed: {instance.title[:50]}'
                )


@receiver(post_save, sender=HabitLog)
def on_habit_log(sender, instance, created, **kwargs):
    """Award XP and points when a habit is logged."""
    if created and instance.completed:
        # Check if we've already awarded XP for this log (anti-spam)
        existing = XPTransaction.objects.filter(
            user=instance.habit.user,
            source_type='habit_log',
            source_id=instance.id
        ).exists()
        
        if not existing:
            habit = instance.habit
            streak = habit.current_streak
            
            # Base XP for habit completion
            xp_amount = 10
            
            # XP Streak bonus
            if streak >= 30:
                xp_amount += 15
            elif streak >= 7:
                xp_amount += 5
            
            award_xp(
                user=habit.user,
                amount=xp_amount,
                source_type='habit_log',
                source_id=instance.id,
                description=f'Logged habit: {habit.name}'
            )
            
            # Award points with streak multiplier
            if hasattr(habit, 'point_value_per_completion') and habit.point_value_per_completion > 0:
                base_points = min(habit.point_value_per_completion, MAX_HABIT_POINTS)
                streak_multiplier = calculate_streak_multiplier(streak)
                
                award_points(
                    user=habit.user,
                    amount=base_points,
                    source_type='habit',
                    source_id=instance.id,
                    description=f'Habit: {habit.name}',
                    streak_multiplier=streak_multiplier
                )


@receiver(post_save, sender=Goal)
def on_goal_save(sender, instance, created, **kwargs):
    """Award XP when a goal is completed."""
    if not created:
        # Check if goal was just completed
        if instance.is_completed:
            existing = XPTransaction.objects.filter(
                user=instance.user,
                source_type='goal_complete',
                source_id=instance.id
            ).exists()
            
            if not existing:
                # Goal completion = 50 XP (significant achievement)
                award_xp(
                    user=instance.user,
                    amount=50,
                    source_type='goal_complete',
                    source_id=instance.id,
                    description=f'Completed goal: {instance.title[:50]}'
                )
        # Award XP for goal progress (5 XP per progress update, max 1 per day per goal)
        else:
            today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            already_awarded_today = XPTransaction.objects.filter(
                user=instance.user,
                source_type='goal_progress',
                source_id=instance.id,
                created_at__gte=today_start
            ).exists()
            
            if not already_awarded_today and instance.current_value > 0:
                award_xp(
                    user=instance.user,
                    amount=5,
                    source_type='goal_progress',
                    source_id=instance.id,
                    description=f'Progress on goal: {instance.title[:50]}'
                )
