import uuid
from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Q, F, CheckConstraint

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
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True)
    profile_picture_url = models.URLField(blank=True)
    banner_url = models.TextField(blank=True, null=True)
    theme = models.CharField(max_length=50, default='dark')
    layout = models.JSONField(default=dict, blank=True)
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


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, 'profile'):
        instance.profile.save()


class UserInterest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_interests')
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
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='organization_memberships')
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
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='connections_sent'
    )
    to_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
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
        settings.AUTH_USER_MODEL,
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
            CheckConstraint(
                check=~Q(from_user=F('to_user')),
                name='prevent_self_connection'
            ),
        ]
        # Note: Bidirectional uniqueness is handled in views via get_connection_between()
        # A true DB-level bidirectional constraint would require a migration with raw SQL:
        # CREATE UNIQUE INDEX idx_unique_connection_pair 
        # ON social_connection(LEAST(from_user_id, to_user_id), GREATEST(from_user_id, to_user_id));

    def __str__(self):
        return f"{self.from_user.username} -> {self.to_user.username} ({self.status})"
    
    @classmethod
    def get_connection_between(cls, user1, user2):
        """Get connection between two users regardless of direction"""
        return cls.objects.filter(
            Q(from_user=user1, to_user=user2) |
            Q(from_user=user2, to_user=user1)
        ).first()
    
    @classmethod
    def are_connected(cls, user1, user2):
        """Check if two users are connected (accepted)"""
        return cls.objects.filter(
            Q(from_user=user1, to_user=user2) |
            Q(from_user=user2, to_user=user1),
            status='accepted'
        ).exists()
    
    @classmethod
    def are_friends(cls, user1, user2):
        """Check if two users are friends"""
        return cls.objects.filter(
            Q(from_user=user1, to_user=user2) |
            Q(from_user=user2, to_user=user1),
            status='accepted',
            connection_type='friend'
        ).exists()

# Utility function
def extract_email_domain(email):
    """Extract domain from email address"""
    if '@' in email:
        return email.split('@')[1].lower()
    return None
