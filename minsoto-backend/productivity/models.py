import uuid
from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

class HabitStreak(models.Model):
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
    ]
    
    COLOR_CHOICES = [
        ('blue', 'Blue'),
        ('purple', 'Purple'),
        ('pink', 'Pink'),
        ('red', 'Red'),
        ('orange', 'Orange'),
        ('yellow', 'Yellow'),
        ('green', 'Green'),
        ('cyan', 'Cyan'),
        ('indigo', 'Indigo'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    image_url = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=False)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='daily', db_column='target_frequency')
    color = models.CharField(max_length=20, choices=COLOR_CHOICES, default='blue')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-current_streak', '-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.name}"


class HabitLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    habit = models.ForeignKey(HabitStreak, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField()
    completed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['habit', 'date']
        ordering = ['-date']
        indexes = [
            models.Index(fields=['habit', '-date']),
            models.Index(fields=['date', 'completed']),
        ]

    def __str__(self):
        return f"{self.habit.name} - {self.date}"


class Task(models.Model):
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    due_date = models.DateTimeField(null=True, blank=True)
    image_url = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['due_date']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.title}"


class Dashboard(models.Model):
    """
    Private productivity dashboard separate from public profile.
    Stores user's personal widget layout and preferences.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='dashboard')
    layout = models.JSONField(default=dict, blank=True)
    preferences = models.JSONField(default=dict, blank=True)
    last_synced = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Dashboard"

    class Meta:
        verbose_name_plural = "Dashboards"


class Goal(models.Model):
    """
    Long-term goals with progress tracking.
    E.g., "Read 24 books", "Run 500km", "Save $10,000"
    """
    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('health', 'Health'),
        ('career', 'Career'),
        ('learning', 'Learning'),
        ('finance', 'Finance'),
        ('personal', 'Personal'),
        ('other', 'Other'),
    ]
    
    COLOR_CHOICES = [
        ('pink', 'Pink'),
        ('green', 'Green'),
        ('yellow', 'Yellow'),
        ('blue', 'Blue'),
        ('purple', 'Purple'),
        ('cyan', 'Cyan'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    target_value = models.FloatField(default=100)
    current_value = models.FloatField(default=0)
    unit = models.CharField(max_length=50, blank=True)  # "books", "km", "$"
    deadline = models.DateField(null=True, blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    color = models.CharField(max_length=20, choices=COLOR_CHOICES, default='cyan')
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_completed']),
            models.Index(fields=['user', 'category']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.title}"
    
    @property
    def progress_percent(self):
        if self.target_value <= 0:
            return 0
        return min(100, round((self.current_value / self.target_value) * 100))


# Signal to create Dashboard when user is created
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_dashboard(sender, instance, created, **kwargs):
    if created:
        Dashboard.objects.get_or_create(user=instance)
