import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('idle', 'Idle'),
        ('focus', 'Focus'),
        ('dnd', 'Do Not Disturb'),
        ('offline', 'Offline'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    google_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    is_setup_complete = models.BooleanField(default=False)
    last_username_change = models.DateTimeField(null=True, blank=True)
    
    # Status fields
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='offline')
    status_message = models.CharField(max_length=100, blank=True, default='')
    last_active = models.DateTimeField(auto_now=True)
    focus_session_start = models.DateTimeField(null=True, blank=True)  # When focus mode started
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email

