import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone


class UserXP(models.Model):
    """
    Tracks user's XP, level, and streak information.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='xp_profile'
    )
    total_xp = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    
    # Streak tracking
    current_streak_days = models.PositiveIntegerField(default=0)
    longest_streak_days = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    # XP Multiplier (based on streak)
    xp_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.00)
    
    # Category-specific XP
    tasks_xp = models.PositiveIntegerField(default=0)
    habits_xp = models.PositiveIntegerField(default=0)
    social_xp = models.PositiveIntegerField(default=0)
    guild_xp = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User XP'
        verbose_name_plural = 'User XP'

    def __str__(self):
        return f"{self.user.username} - Level {self.level} ({self.total_xp} XP)"

    @staticmethod
    def xp_for_level(level):
        """
        Calculate XP required to reach a specific level.
        Formula: 100 × N × (N + 1) / 2
        """
        return int(100 * level * (level + 1) / 2)

    def xp_to_next_level(self):
        """XP needed for next level."""
        return self.xp_for_level(self.level + 1) - self.total_xp

    def xp_progress_percent(self):
        """Progress percentage to next level."""
        current_level_xp = self.xp_for_level(self.level)
        next_level_xp = self.xp_for_level(self.level + 1)
        level_xp_range = next_level_xp - current_level_xp
        current_progress = self.total_xp - current_level_xp
        return min(100, int((current_progress / level_xp_range) * 100))

    def add_xp(self, amount, category='tasks'):
        """
        Add XP to user, applying multiplier and checking for level up.
        Returns the actual amount added and whether user leveled up.
        """
        # Apply multiplier
        actual_amount = int(amount * float(self.xp_multiplier))
        self.total_xp += actual_amount
        
        # Track by category
        if category == 'tasks':
            self.tasks_xp += actual_amount
        elif category == 'habits':
            self.habits_xp += actual_amount
        elif category == 'social':
            self.social_xp += actual_amount
        elif category == 'guild':
            self.guild_xp += actual_amount
        
        # Check for level up
        leveled_up = False
        while self.total_xp >= self.xp_for_level(self.level + 1):
            self.level += 1
            leveled_up = True
        
        # Update streak
        today = timezone.now().date()
        if self.last_activity_date:
            days_diff = (today - self.last_activity_date).days
            if days_diff == 1:
                self.current_streak_days += 1
                self.longest_streak_days = max(self.longest_streak_days, self.current_streak_days)
                self._update_multiplier()
            elif days_diff > 1:
                self.current_streak_days = 1
                self.xp_multiplier = 1.00
        else:
            self.current_streak_days = 1
        
        self.last_activity_date = today
        self.save()
        
        return actual_amount, leveled_up

    def _update_multiplier(self):
        """Update XP multiplier based on streak."""
        if self.current_streak_days >= 90:
            self.xp_multiplier = 1.20
        elif self.current_streak_days >= 30:
            self.xp_multiplier = 1.15
        elif self.current_streak_days >= 14:
            self.xp_multiplier = 1.10
        elif self.current_streak_days >= 7:
            self.xp_multiplier = 1.05
        else:
            self.xp_multiplier = 1.00


class XPTransaction(models.Model):
    """
    Records every XP earning event.
    """
    SOURCE_TYPES = [
        ('task_complete', 'Task Completed'),
        ('habit_log', 'Habit Logged'),
        ('streak_bonus', 'Streak Bonus'),
        ('achievement', 'Achievement Unlocked'),
        ('daily_goal', 'Daily Goal Complete'),
        ('weekly_goal', 'Weekly Goal Complete'),
        ('social', 'Social Action'),
        ('guild', 'Guild Activity'),
        ('profile', 'Profile Action'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='xp_transactions'
    )
    amount = models.IntegerField()  # Can be negative for penalties (if we ever add them)
    source_type = models.CharField(max_length=30, choices=SOURCE_TYPES)
    source_id = models.UUIDField(null=True, blank=True)  # ID of task/habit/achievement
    description = models.CharField(max_length=255)
    
    # Snapshot of user's XP at transaction time
    new_total_xp = models.PositiveIntegerField()
    new_level = models.PositiveIntegerField()
    leveled_up = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['source_type']),
        ]

    def __str__(self):
        return f"{self.user.username}: +{self.amount} XP ({self.source_type})"


class Achievement(models.Model):
    """
    Defines all available achievements.
    """
    CATEGORIES = [
        ('productivity', 'Productivity'),
        ('habits', 'Habits'),
        ('social', 'Social'),
        ('guild', 'Guild'),
        ('mastery', 'Mastery'),
        ('secret', 'Secret'),
    ]
    
    RARITIES = [
        ('common', 'Common'),
        ('uncommon', 'Uncommon'),
        ('rare', 'Rare'),
        ('epic', 'Epic'),
        ('legendary', 'Legendary'),
    ]

    id = models.CharField(max_length=50, primary_key=True)  # e.g., 'task_legend'
    name = models.CharField(max_length=100)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORIES)
    rarity = models.CharField(max_length=20, choices=RARITIES, default='common')
    
    xp_reward = models.PositiveIntegerField(default=0)
    icon = models.CharField(max_length=10, default='⭐')  # Emoji or icon name
    
    # Title unlocked with this achievement (optional)
    unlocks_title = models.CharField(max_length=50, blank=True)
    
    # Requirement definition (JSON)
    # e.g., {"type": "count", "metric": "tasks_completed", "target": 1000}
    requirements = models.JSONField(default=dict)
    
    # Is this achievement visible before unlocking?
    is_hidden = models.BooleanField(default=False)
    
    # For ordering/display
    sort_order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'sort_order']

    def __str__(self):
        return f"{self.icon} {self.name} ({self.rarity})"


class UserAchievement(models.Model):
    """
    Tracks which achievements a user has unlocked.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='achievements'
    )
    achievement = models.ForeignKey(
        Achievement,
        on_delete=models.CASCADE,
        related_name='user_achievements'
    )
    
    # Progress tracking for non-binary achievements
    progress = models.PositiveIntegerField(default=0)
    target = models.PositiveIntegerField(default=0)
    
    unlocked = models.BooleanField(default=False)
    unlocked_at = models.DateTimeField(null=True, blank=True)
    
    # Was XP already awarded?
    xp_awarded = models.BooleanField(default=False)

    class Meta:
        unique_together = ['user', 'achievement']
        ordering = ['-unlocked_at']

    def __str__(self):
        status = "✓" if self.unlocked else f"{self.progress}/{self.target}"
        return f"{self.user.username} - {self.achievement.name} [{status}]"

    def update_progress(self, new_progress):
        """Update progress and check for unlock."""
        self.progress = new_progress
        if self.progress >= self.target and not self.unlocked:
            self.unlocked = True
            self.unlocked_at = timezone.now()
            self.save()
            return True  # Achievement unlocked!
        self.save()
        return False


class UserPoints(models.Model):
    """
    Tracks user's spendable points for rewards.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='points_balance'
    )
    balance = models.PositiveIntegerField(default=0)
    total_earned = models.PositiveIntegerField(default=0)
    total_spent = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'User Points'
        verbose_name_plural = 'User Points'

    def __str__(self):
        return f"{self.user.username}: {self.balance} points"

    def add_points(self, amount):
        """Add points from completing tasks/habits."""
        self.balance += amount
        self.total_earned += amount
        self.save()
        return self.balance

    def spend_points(self, amount):
        """Spend points on rewards. Returns False if insufficient."""
        if amount > self.balance:
            return False
        self.balance -= amount
        self.total_spent += amount
        self.save()
        return True


class PointTransaction(models.Model):
    """
    Records point transactions (earn/spend).
    """
    TRANSACTION_TYPES = [
        ('earn', 'Earned'),
        ('spend', 'Spent'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='point_transactions'
    )
    amount = models.PositiveIntegerField()
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    
    # Source info
    source_type = models.CharField(max_length=30)  # 'task', 'habit', 'reward'
    source_id = models.UUIDField(null=True, blank=True)
    description = models.CharField(max_length=255)
    
    # Balance snapshot
    new_balance = models.PositiveIntegerField()
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        sign = '+' if self.transaction_type == 'earn' else '-'
        return f"{self.user.username}: {sign}{self.amount} points ({self.source_type})"


class Reward(models.Model):
    """
    User-defined rewards that can be purchased with points.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rewards'
    )
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=255, blank=True)
    cost = models.PositiveIntegerField()
    icon = models.CharField(max_length=10, default='🎁')  # Emoji
    
    is_active = models.BooleanField(default=True)
    times_redeemed = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['cost', 'name']

    def __str__(self):
        return f"{self.icon} {self.name} ({self.cost} pts)"


class RewardRedemption(models.Model):
    """
    Records when users redeem rewards.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reward_redemptions'
    )
    reward = models.ForeignKey(
        Reward,
        on_delete=models.SET_NULL,
        null=True,
        related_name='redemptions'
    )
    reward_name = models.CharField(max_length=100)  # Snapshot in case reward deleted
    points_spent = models.PositiveIntegerField()
    
    redeemed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-redeemed_at']

    def __str__(self):
        return f"{self.user.username} redeemed {self.reward_name}"
