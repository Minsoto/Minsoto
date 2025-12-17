import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.utils.text import slugify


class Guild(models.Model):
    """
    A collaborative group for shared interests, organizations, or projects.
    Features widget-based profile pages and democratic poll-based decisions.
    """
    GUILD_TYPE_CHOICES = [
        ('interest', 'Common Interest'),
        ('organization', 'Organization'),
        ('project', 'Project/Goal'),
        ('custom', 'Custom'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=10, default='🏰')  # Emoji
    banner_url = models.URLField(blank=True)
    
    guild_type = models.CharField(max_length=20, choices=GUILD_TYPE_CHOICES, default='custom')
    
    # Link to organization (optional, for organization-type guilds)
    organization = models.ForeignKey(
        'social.Organization',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='guilds'
    )
    
    # Widget layout like user profiles
    layout = models.JSONField(default=dict, blank=True)
    
    # Customizable settings (renamed to avoid conflict with django.conf.settings)
    guild_settings = models.JSONField(default=dict, blank=True)
    # Example guild_settings: { 
    #   "allow_public_join": true, 
    #   "require_approval": false,
    #   "poll_quorum": 0.5,
    #   "max_members": null
    # }
    
    is_public = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    
    # Stats
    total_xp = models.PositiveIntegerField(default=0)
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='guilds_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['guild_type']),
            models.Index(fields=['is_public']),
        ]
    
    def __str__(self):
        return f"{self.icon} {self.name}"
    
    def save(self, *args, **kwargs):
        if not self.guild_settings:
            self.guild_settings = self.get_default_settings()
        
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Guild.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
    
    @property
    def member_count(self):
        return self.memberships.count()
    
    def get_default_layout(self):
        """Return default widget layout for guild profile."""
        return {
            "widgets": [
                {
                    "id": str(uuid.uuid4()),
                    "type": "guild_info",
                    "position": {"x": 0, "y": 0},
                    "size": {"w": 2, "h": 1},
                    "visibility": "public",
                    "config": {}
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "guild_members",
                    "position": {"x": 0, "y": 1},
                    "size": {"w": 1, "h": 1},
                    "visibility": "public",
                    "config": {"show_count": 6}
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "guild_activity",
                    "position": {"x": 1, "y": 1},
                    "size": {"w": 1, "h": 1},
                    "visibility": "public",
                    "config": {}
                }
            ]
        }
    
    def get_default_settings(self):
        """Return default settings based on guild type."""
        defaults = {
            "allow_public_join": True,
            "require_approval": False,
            "poll_quorum": 0.5,
            "max_members": None,
        }
        
        if self.guild_type == 'organization':
            defaults["require_approval"] = True
            defaults["allow_public_join"] = False
        elif self.guild_type == 'project':
            defaults["require_approval"] = True
            
        return defaults


class GuildMembership(models.Model):
    """
    Links users to guilds with role-based permissions.
    """
    ROLE_CHOICES = [
        ('owner', 'Owner'),      # Creator, full control
        ('admin', 'Admin'),      # Elected via polls
        ('member', 'Member'),    # Regular member
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='guild_memberships'
    )
    guild = models.ForeignKey(
        Guild,
        on_delete=models.CASCADE,
        related_name='memberships'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    
    # XP contributed to guild
    xp_contributed = models.PositiveIntegerField(default=0)
    
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='guild_invites_sent'
    )
    
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'guild']
        ordering = ['role', '-joined_at']
        indexes = [
            models.Index(fields=['guild', 'role']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.user.username} @ {self.guild.name} ({self.role})"
    
    @property
    def is_admin(self):
        return self.role in ('owner', 'admin')
    
    @property
    def is_owner(self):
        return self.role == 'owner'


class GuildPoll(models.Model):
    """
    Polls for democratic decision-making within guilds.
    Any member can create a poll, all members can vote.
    """
    POLL_TYPE_CHOICES = [
        ('admin_vote', 'Admin Election'),
        ('task_approval', 'Task Approval'),
        ('habit_approval', 'Habit Approval'),
        ('change_approval', 'Change Approval'),
        ('points_update', 'Points Update'),
        ('custom', 'Custom Poll'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('passed', 'Passed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    guild = models.ForeignKey(
        Guild,
        on_delete=models.CASCADE,
        related_name='polls'
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='guild_polls_created'
    )
    
    poll_type = models.CharField(max_length=20, choices=POLL_TYPE_CHOICES, default='custom')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Poll options: ["Yes", "No"] or ["Option A", "Option B", "Option C"]
    options = models.JSONField(default=list)
    
    # For change_approval polls: preview of proposed changes
    change_preview = models.JSONField(null=True, blank=True)
    
    # Reference to related object (e.g., user ID for admin vote)
    related_id = models.UUIDField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Voting settings
    deadline = models.DateTimeField()
    required_quorum = models.FloatField(default=0.5)  # 50% minimum participation
    
    created_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['guild', 'status']),
            models.Index(fields=['deadline']),
        ]
    
    def __str__(self):
        return f"{self.guild.name}: {self.title}"
    
    @property
    def vote_count(self):
        return self.votes.count()
    
    @property
    def quorum_reached(self):
        member_count = self.guild.member_count
        if member_count == 0:
            return False
        return (self.vote_count / member_count) >= self.required_quorum
    
    def get_results(self):
        """Get vote counts per option."""
        results = {}
        for i, option in enumerate(self.options):
            results[option] = self.votes.filter(option_index=i).count()
        return results
    
    def close_poll(self):
        """Close the poll and determine outcome."""
        results = self.get_results()
        if not results:
            self.status = 'failed'
        else:
            # For yes/no polls, check if majority voted yes
            if self.options == ['Yes', 'No']:
                if results.get('Yes', 0) > results.get('No', 0) and self.quorum_reached:
                    self.status = 'passed'
                else:
                    self.status = 'failed'
            else:
                self.status = 'closed'
        
        self.closed_at = timezone.now()
        self.save()
        return self.status


class GuildPollVote(models.Model):
    """
    Individual votes on guild polls.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    poll = models.ForeignKey(
        GuildPoll,
        on_delete=models.CASCADE,
        related_name='votes'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='guild_poll_votes'
    )
    option_index = models.PositiveSmallIntegerField()  # Index into poll.options
    
    voted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['poll', 'user']
        indexes = [
            models.Index(fields=['poll', 'option_index']),
        ]
    
    def __str__(self):
        return f"{self.user.username} voted on {self.poll.title}"


class GuildChangeRequest(models.Model):
    """
    Suggested changes from members that require admin approval.
    """
    CHANGE_TYPE_CHOICES = [
        ('layout', 'Layout Change'),
        ('settings', 'Settings Change'),
        ('info', 'Info Change'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    guild = models.ForeignKey(
        Guild,
        on_delete=models.CASCADE,
        related_name='change_requests'
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='guild_change_requests'
    )
    
    change_type = models.CharField(max_length=20, choices=CHANGE_TYPE_CHOICES)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    
    # The actual proposed changes
    proposed_changes = models.JSONField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='guild_changes_reviewed'
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['guild', 'status']),
        ]
    
    def __str__(self):
        return f"{self.guild.name}: {self.title} ({self.status})"
    
    def approve(self, admin_user, notes=''):
        """Approve and apply the change."""
        self.status = 'approved'
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        self.review_notes = notes
        self.save()
        
        # Apply the changes
        guild = self.guild
        if self.change_type == 'layout':
            guild.layout = self.proposed_changes
        elif self.change_type == 'settings':
            guild.guild_settings.update(self.proposed_changes)
        elif self.change_type == 'info':
            for key, value in self.proposed_changes.items():
                if hasattr(guild, key):
                    setattr(guild, key, value)
        guild.save()
        
        return True
    
    def reject(self, admin_user, notes=''):
        """Reject the change request."""
        self.status = 'rejected'
        self.reviewed_by = admin_user
        self.reviewed_at = timezone.now()
        self.review_notes = notes
        self.save()
