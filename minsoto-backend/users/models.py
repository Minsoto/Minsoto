from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    google_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    is_setup_complete = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email



class Interest(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

####################################################################
# Additional Models for User Profiles, Interests, Habits, and Tasks

class Profile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True)
    profile_picture_url = models.URLField(blank=True)
    theme = models.CharField(max_length=50, default='dark')
    layout = models.JSONField(default=dict, blank=True)
    # Layout structure:
    # {
    #   "widgets": [
    #     {
    #       "id": "uuid",
    #       "type": "tasks",
    #       "position": {"x": 0, "y": 0},
    #       "size": {"w": 2, "h": 2},
    #       "visibility": "public|private",
    #       "data": {}
    #     }
    #   ]
    # }
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class UserInterest(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='interests')
    interest = models.ForeignKey(Interest, on_delete=models.CASCADE)
    is_public = models.BooleanField(default=True)
    added_at = models.DateTimeField(auto_now_add=True)

class HabitStreak(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class HabitLog(models.Model):
    habit = models.ForeignKey(HabitStreak, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField()
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['habit', 'date']

class Task(models.Model):
    STATUS_CHOICES = [
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    due_date = models.DateTimeField(null=True, blank=True)
    is_public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
