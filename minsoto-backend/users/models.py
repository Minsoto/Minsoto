import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

class CustomUser(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    google_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    is_setup_complete = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class Interest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
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
    #       "config": {}
    #     }
    #   ]
    # }
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    def get_default_layout(self):
        """Return default layout for new profiles"""
        return {
            "widgets": [
                {
                    "id": str(uuid.uuid4()),
                    "type": "interests",
                    "position": {"x": 0, "y": 0},
                    "size": {"w": 2, "h": 1},
                    "visibility": "public",
                    "config": {}
                }
            ]
        }


# Signal to auto-create profile when user is created
@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)


@receiver(post_save, sender=CustomUser)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()


class UserInterest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='user_interests')
    interest = models.ForeignKey(Interest, on_delete=models.CASCADE)
    is_public = models.BooleanField(default=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'interest']
        ordering = ['-added_at']
        indexes = [
            models.Index(fields=['user', '-added_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.interest.name}"


class HabitStreak(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='habits')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    is_public = models.BooleanField(default=False)
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
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    due_date = models.DateTimeField(null=True, blank=True)
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


# =============================================================================
# PHASE 2A: Organizations & Connections
# =============================================================================

class Organization(models.Model):
    """
    Represents a company, college, or community organization.
    Organizations are auto-detected from email domains or manually verified.
    """
    ORG_TYPE_CHOICES = [
        ('college', 'College/University'),
        ('company', 'Company'),
        ('school', 'School'),
        ('community', 'Community'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    domain = models.CharField(max_length=100, unique=True)  # e.g., "iiits.in"
    logo_url = models.URLField(blank=True)
    org_type = models.CharField(max_length=20, choices=ORG_TYPE_CHOICES, default='other')
    description = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    website = models.URLField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['domain']),
            models.Index(fields=['is_verified']),
        ]

    def __str__(self):
        return f"{self.name} ({self.domain})"
    
    @property
    def member_count(self):
        return self.memberships.filter(verification_status='verified').count()


class OrganizationMembership(models.Model):
    """
    Links users to organizations with verification status.
    Users can belong to multiple organizations (college + company, etc.)
    """
    VERIFICATION_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ]
    
    ROLE_CHOICES = [
        ('member', 'Member'),
        ('admin', 'Admin'),
        ('moderator', 'Moderator'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='organization_memberships')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='memberships')
    verification_status = models.CharField(max_length=20, choices=VERIFICATION_STATUS_CHOICES, default='pending')
    verification_email = models.EmailField(blank=True)  # Email used for verification
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    is_primary = models.BooleanField(default=False)  # Primary organization shown on profile
    is_visible = models.BooleanField(default=True)  # Show in organization directory
    show_on_profile = models.BooleanField(default=True)  # Show badge on profile
    joined_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'organization']
        ordering = ['-is_primary', '-joined_at']
        indexes = [
            models.Index(fields=['user', 'verification_status']),
            models.Index(fields=['organization', 'verification_status']),
        ]

    def __str__(self):
        return f"{self.user.username} @ {self.organization.name}"


class Connection(models.Model):
    """
    Represents a connection between two users.
    Two-tier system: Connection (basic) -> Friend (upgraded)
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    
    CONNECTION_TYPE_CHOICES = [
        ('connection', 'Connection'),
        ('friend', 'Friend'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    from_user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='connections_sent'
    )
    to_user = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='connections_received'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    connection_type = models.CharField(
        max_length=20, 
        choices=CONNECTION_TYPE_CHOICES, 
        default='connection'
    )
    message = models.TextField(blank=True, max_length=500)  # Optional message with request
    # Phase 2C: Track friend upgrade requests
    friend_upgrade_requested_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='friend_upgrade_requests'
    )
    friend_upgrade_requested_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['from_user', 'status']),
            models.Index(fields=['to_user', 'status']),
            models.Index(fields=['status', 'connection_type']),
        ]
        constraints = [
            # Prevent self-connections
            models.CheckConstraint(
                check=~models.Q(from_user=models.F('to_user')),
                name='prevent_self_connection'
            ),
        ]

    def __str__(self):
        return f"{self.from_user.username} -> {self.to_user.username} ({self.status})"
    
    @classmethod
    def get_connection_between(cls, user1, user2):
        """Get connection between two users regardless of direction"""
        return cls.objects.filter(
            models.Q(from_user=user1, to_user=user2) |
            models.Q(from_user=user2, to_user=user1)
        ).first()
    
    @classmethod
    def are_connected(cls, user1, user2):
        """Check if two users are connected (accepted)"""
        return cls.objects.filter(
            models.Q(from_user=user1, to_user=user2) |
            models.Q(from_user=user2, to_user=user1),
            status='accepted'
        ).exists()
    
    @classmethod
    def are_friends(cls, user1, user2):
        """Check if two users are friends"""
        return cls.objects.filter(
            models.Q(from_user=user1, to_user=user2) |
            models.Q(from_user=user2, to_user=user1),
            status='accepted',
            connection_type='friend'
        ).exists()


# Utility function for extracting domain from email
def extract_email_domain(email):
    """Extract domain from email address"""
    if '@' in email:
        return email.split('@')[1].lower()
    return None


# =============================================================================
# PHASE 2B: Dashboard Model
# =============================================================================

class Dashboard(models.Model):
    """
    Private productivity dashboard separate from public profile.
    Stores user's personal widget layout and preferences.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='dashboard')
    layout = models.JSONField(default=dict, blank=True)
    # Layout structure:
    # {
    #   "widgets": [
    #     {"id": "uuid", "type": "tasks", "position": {"x": 0, "y": 0}, "size": {"w": 2, "h": 2}}
    #   ]
    # }
    preferences = models.JSONField(default=dict, blank=True)
    # Preferences: {"theme": "dark", "showQuickActions": true, "focusMode": false}
    last_synced = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}'s Dashboard"

    class Meta:
        verbose_name_plural = "Dashboards"


# Signal to create Dashboard when user is created
@receiver(post_save, sender=CustomUser)
def create_user_dashboard(sender, instance, created, **kwargs):
    if created:
        Dashboard.objects.get_or_create(user=instance)

