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
    logo = models.ImageField(upload_to='guild_logos/', blank=True, null=True)
    banner = models.ImageField(upload_to='guild_banners/', blank=True, null=True)
    
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
                    "type": "guild_welcome",
                    "position": {"x": 2, "y": 0},
                    "size": {"w": 2, "h": 2},
                    "visibility": "public",
                    "config": {"title": "About Us", "content": "Welcome to our guild!"}
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
    
    # Track if admin was elected via poll
    is_elected = models.BooleanField(default=False)
    elected_at = models.DateTimeField(null=True, blank=True)
    election_poll = models.ForeignKey(
        'GuildPoll',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='elected_admins'
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


# =============================================================================
# Guild Gamification Models
# =============================================================================

class GuildTask(models.Model):
    """
    Shared tasks that can be assigned to multiple guild members.
    Completion can require all assignees or majority vote.
    """
    COMPLETION_TYPE_CHOICES = [
        ('all', 'All Assignees'),
        ('majority', 'Majority Vote'),
        ('any', 'Any Assignee'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    guild = models.ForeignKey(Guild, on_delete=models.CASCADE, related_name='guild_tasks')
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    assigned_to = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='assigned_guild_tasks',
        blank=True
    )
    
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    point_value = models.PositiveIntegerField(default=20)
    xp_reward = models.PositiveIntegerField(default=15)
    
    completion_type = models.CharField(max_length=10, choices=COMPLETION_TYPE_CHOICES, default='any')
    is_completed = models.BooleanField(default=False)
    
    # Track who has marked it complete (for majority voting)
    completed_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='completed_guild_tasks',
        blank=True
    )
    
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='guild_tasks_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['guild', 'is_completed']),
            models.Index(fields=['due_date']),
        ]
    
    def __str__(self):
        return f"{self.guild.name}: {self.title}"
    
    def check_completion(self):
        """Check if task should be marked as completed based on completion_type."""
        if self.is_completed:
            return True
            
        assignee_count = self.assigned_to.count()
        completed_count = self.completed_by.count()
        
        if assignee_count == 0:
            # No specific assignees - any completion counts
            should_complete = completed_count > 0
        elif self.completion_type == 'any':
            should_complete = completed_count > 0
        elif self.completion_type == 'all':
            should_complete = completed_count >= assignee_count
        elif self.completion_type == 'majority':
            should_complete = completed_count > (assignee_count / 2)
        else:
            should_complete = False
        
        if should_complete and not self.is_completed:
            self.is_completed = True
            self.completed_at = timezone.now()
            self.save()
            # Award XP to guild
            self.guild.total_xp += self.xp_reward
            self.guild.save()
            
        return self.is_completed


class GuildHabit(models.Model):
    """
    Collective habits tracked for the entire guild.
    Members log their participation daily.
    """
    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekdays', 'Weekdays'),
        ('weekly', 'Weekly'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    guild = models.ForeignKey(Guild, on_delete=models.CASCADE, related_name='guild_habits')
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=10, default='✅')
    color = models.CharField(max_length=20, default='#10B981')
    
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='daily')
    point_value = models.PositiveIntegerField(default=5)
    xp_reward = models.PositiveIntegerField(default=3)
    
    # Participation goal (optional)
    participation_goal = models.PositiveIntegerField(default=80)  # Target % of members
    
    is_active = models.BooleanField(default=True)
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='guild_habits_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['guild', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.guild.name}: {self.name}"
    
    def get_today_participation(self):
        """Get participation stats for today."""
        today = timezone.now().date()
        logs = self.logs.filter(completed_at__date=today)
        member_count = self.guild.memberships.count()
        return {
            'completed': logs.count(),
            'total': member_count,
            'percentage': (logs.count() / member_count * 100) if member_count > 0 else 0
        }


class GuildHabitLog(models.Model):
    """
    Individual logs of guild habit completion by members.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    habit = models.ForeignKey(GuildHabit, on_delete=models.CASCADE, related_name='logs')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='guild_habit_logs'
    )
    
    completed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-completed_at']
        indexes = [
            models.Index(fields=['habit', 'completed_at']),
            models.Index(fields=['user', 'completed_at']),
        ]
        # One log per user per habit per day
        constraints = [
            models.UniqueConstraint(
                fields=['habit', 'user'],
                condition=models.Q(completed_at__date=models.F('completed_at__date')),
                name='unique_daily_guild_habit_log'
            )
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.habit.name}"
    
    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        
        if is_new:
            # Award XP to guild
            self.habit.guild.total_xp += self.habit.xp_reward
            self.habit.guild.save()
            
            # Award XP to member's contribution
            membership = GuildMembership.objects.filter(
                user=self.user,
                guild=self.habit.guild
            ).first()
            if membership:
                membership.xp_contributed += self.habit.xp_reward
                membership.save()


class GuildChallenge(models.Model):
    """
    Time-limited group challenges for guilds.
    """
    TARGET_TYPE_CHOICES = [
        ('tasks', 'Complete Tasks'),
        ('habits', 'Log Habits'),
        ('xp', 'Earn XP'),
        ('streak', 'Maintain Streak'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    guild = models.ForeignKey(Guild, on_delete=models.CASCADE, related_name='challenges')
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=10, default='🎯')
    
    target_type = models.CharField(max_length=10, choices=TARGET_TYPE_CHOICES)
    target_value = models.PositiveIntegerField()  # e.g., complete 100 tasks
    current_value = models.PositiveIntegerField(default=0)
    
    xp_reward = models.PositiveIntegerField(default=100)
    
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    
    starts_at = models.DateTimeField()
    deadline = models.DateTimeField()
    completed_at = models.DateTimeField(null=True, blank=True)
    
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='guild_challenges_created'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['guild', 'status']),
            models.Index(fields=['deadline']),
        ]
    
    def __str__(self):
        return f"{self.guild.name}: {self.title}"
    
    @property
    def progress_percentage(self):
        if self.target_value == 0:
            return 100
        return min(100, (self.current_value / self.target_value) * 100)
    
    def increment_progress(self, amount=1):
        """Increment challenge progress."""
        if self.status != 'active':
            return False
            
        self.current_value += amount
        
        if self.current_value >= self.target_value:
            self.status = 'completed'
            self.completed_at = timezone.now()
            # Award XP
            self.guild.total_xp += self.xp_reward
            self.guild.save()
        
        self.save()
        return True
    
    def check_expired(self):
        """Check if challenge has expired."""
        if self.status == 'active' and timezone.now() > self.deadline:
            self.status = 'failed'
            self.save()
            return True
        return False


# Guild Level thresholds with perks
GUILD_LEVEL_THRESHOLDS = [
    (1, 0),
    (2, 500),
    (3, 1500),
    (4, 3000),
    (5, 6000),
    (6, 10000),
    (7, 15000),
    (8, 22000),
    (9, 30000),
    (10, 40000),
]

# Perks unlocked at each level
GUILD_LEVEL_PERKS = {
    1: {'name': 'Starter', 'perks': ['Basic features', 'Up to 20 members']},
    2: {'name': 'Growing', 'perks': ['Custom banner', 'Up to 50 members']},
    3: {'name': 'Active', 'perks': ['Guild events', 'Custom widgets', 'Up to 100 members']},
    4: {'name': 'Thriving', 'perks': ['Increased task rewards', 'Up to 200 members']},
    5: {'name': 'Established', 'perks': ['Verified badge eligible', 'Priority support', 'Unlimited members']},
    6: {'name': 'Popular', 'perks': ['Featured in discovery', 'Custom roles']},
    7: {'name': 'Elite', 'perks': ['Guild treasury', 'Rewards store']},
    8: {'name': 'Legendary', 'perks': ['2x XP weekends', 'Exclusive badges']},
    9: {'name': 'Mythic', 'perks': ['Custom achievements', 'API access']},
    10: {'name': 'Transcendent', 'perks': ['Leaderboard featured', 'All perks unlocked']},
}

# Achievement definitions
GUILD_ACHIEVEMENTS = {
    'first_steps': {
        'name': 'First Steps',
        'description': 'Guild created',
        'icon': '🏁',
        'xp_reward': 0,
        'criteria': {'type': 'creation'}
    },
    'growing_community': {
        'name': 'Growing Community',
        'description': 'Reach 10 members',
        'icon': '👥',
        'xp_reward': 100,
        'criteria': {'type': 'member_count', 'value': 10}
    },
    'thriving_community': {
        'name': 'Thriving Community',
        'description': 'Reach 50 members',
        'icon': '🌟',
        'xp_reward': 250,
        'criteria': {'type': 'member_count', 'value': 50}
    },
    'democratic': {
        'name': 'Democratic',
        'description': 'Complete 10 polls',
        'icon': '🗳️',
        'xp_reward': 100,
        'criteria': {'type': 'poll_count', 'value': 10}
    },
    'productive_week': {
        'name': 'Productive Week',
        'description': 'Complete 50 tasks in 7 days',
        'icon': '📈',
        'xp_reward': 200,
        'criteria': {'type': 'weekly_tasks', 'value': 50}
    },
    'habit_masters': {
        'name': 'Habit Masters',
        'description': '90% habit completion rate',
        'icon': '🔥',
        'xp_reward': 150,
        'criteria': {'type': 'habit_rate', 'value': 0.9}
    },
    'level_5': {
        'name': 'Established Guild',
        'description': 'Reach Level 5',
        'icon': '⭐',
        'xp_reward': 300,
        'criteria': {'type': 'level', 'value': 5}
    },
    'level_10': {
        'name': 'Legendary Guild',
        'description': 'Reach Level 10',
        'icon': '👑',
        'xp_reward': 500,
        'criteria': {'type': 'level', 'value': 10}
    },
    'challenge_champion': {
        'name': 'Challenge Champion',
        'description': 'Complete 5 guild challenges',
        'icon': '🏆',
        'xp_reward': 200,
        'criteria': {'type': 'challenge_count', 'value': 5}
    },
    'streak_master': {
        'name': 'Streak Master',
        'description': '30-day guild activity streak',
        'icon': '💎',
        'xp_reward': 400,
        'criteria': {'type': 'activity_streak', 'value': 30}
    },
}


def get_guild_level(total_xp):
    """Calculate guild level from total XP."""
    level = 1
    for lvl, threshold in GUILD_LEVEL_THRESHOLDS:
        if total_xp >= threshold:
            level = lvl
        else:
            break
    return level


def get_guild_level_info(total_xp):
    """Get full level information including perks."""
    level = get_guild_level(total_xp)
    perks = GUILD_LEVEL_PERKS.get(level, GUILD_LEVEL_PERKS[1])
    current_threshold = GUILD_LEVEL_THRESHOLDS[level - 1][1] if level <= len(GUILD_LEVEL_THRESHOLDS) else 0
    next_threshold = GUILD_LEVEL_THRESHOLDS[level][1] if level < len(GUILD_LEVEL_THRESHOLDS) else current_threshold
    
    return {
        'level': level,
        'name': perks['name'],
        'perks': perks['perks'],
        'current_xp': total_xp,
        'current_threshold': current_threshold,
        'next_threshold': next_threshold,
        'progress': get_guild_level_progress(total_xp),
        'unlocked_perks': [p for l in range(1, level + 1) for p in GUILD_LEVEL_PERKS.get(l, {}).get('perks', [])]
    }


def get_guild_level_progress(total_xp):
    """Get current level progress percentage."""
    level = get_guild_level(total_xp)
    current_threshold = GUILD_LEVEL_THRESHOLDS[level - 1][1] if level <= len(GUILD_LEVEL_THRESHOLDS) else 0
    next_threshold = GUILD_LEVEL_THRESHOLDS[level][1] if level < len(GUILD_LEVEL_THRESHOLDS) else current_threshold
    
    if next_threshold == current_threshold:
        return 100
    
    xp_in_level = total_xp - current_threshold
    xp_for_level = next_threshold - current_threshold
    return (xp_in_level / xp_for_level) * 100


# =============================================================================
# Guild Forum Models
# =============================================================================

class GuildForumPost(models.Model):
    """Discussion posts within guild forums."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    guild = models.ForeignKey(Guild, on_delete=models.CASCADE, related_name='forum_posts')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='guild_forum_posts'
    )
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-is_pinned', '-created_at']
        indexes = [
            models.Index(fields=['guild', '-created_at']),
            models.Index(fields=['author']),
        ]
    
    def __str__(self):
        return f"{self.guild.name}: {self.title}"
    
    @property
    def reply_count(self):
        return self.replies.count()


class GuildForumReply(models.Model):
    """Replies to forum posts."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(GuildForumPost, on_delete=models.CASCADE, related_name='replies')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='guild_forum_replies'
    )
    
    content = models.TextField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post', 'created_at']),
        ]
    
    def __str__(self):
        return f"Reply by {self.author.username} on {self.post.title}"


# =============================================================================
# Guild Event Models
# =============================================================================

class GuildEvent(models.Model):
    """Shared events and calendar entries for guilds."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    guild = models.ForeignKey(Guild, on_delete=models.CASCADE, related_name='events')
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='guild_events_created'
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    is_all_day = models.BooleanField(default=False)
    
    location = models.CharField(max_length=200, blank=True)
    url = models.URLField(blank=True)
    
    attendees = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='guild_events_attending',
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['start_time']
        indexes = [
            models.Index(fields=['guild', 'start_time']),
        ]
    
    def __str__(self):
        return f"{self.guild.name}: {self.title}"
    
    @property
    def attendee_count(self):
        return self.attendees.count()
    
    def is_user_attending(self, user):
        return self.attendees.filter(id=user.id).exists()


def apply_admin_election(poll):
    """Apply admin election result when poll passes."""
    if poll.poll_type == 'admin_vote' and poll.status == 'passed':
        user_id = poll.related_id
        membership = GuildMembership.objects.filter(
            user_id=user_id, 
            guild=poll.guild
        ).first()
        if membership:
            membership.role = 'admin'
            membership.is_elected = True
            membership.elected_at = timezone.now()
            membership.election_poll = poll
            membership.save()
            return True
    return False


# =============================================================================
# Guild Achievement Models
# =============================================================================

class GuildAchievement(models.Model):
    """Tracks achievements unlocked by guilds."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    guild = models.ForeignKey(Guild, on_delete=models.CASCADE, related_name='achievements')
    achievement_key = models.CharField(max_length=50)  # Key from GUILD_ACHIEVEMENTS
    unlocked_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['guild', 'achievement_key']
        ordering = ['-unlocked_at']
    
    def __str__(self):
        return f"{self.guild.name}: {self.achievement_key}"
    
    @property
    def details(self):
        return GUILD_ACHIEVEMENTS.get(self.achievement_key, {})


def check_and_award_achievements(guild):
    """Check if guild qualifies for any new achievements."""
    from django.db.models import Count
    
    awarded = []
    existing = set(guild.achievements.values_list('achievement_key', flat=True))
    
    # Check member count achievements
    member_count = guild.memberships.count()
    if member_count >= 10 and 'growing_community' not in existing:
        GuildAchievement.objects.create(guild=guild, achievement_key='growing_community')
        guild.total_xp += GUILD_ACHIEVEMENTS['growing_community']['xp_reward']
        awarded.append('growing_community')
    
    if member_count >= 50 and 'thriving_community' not in existing:
        GuildAchievement.objects.create(guild=guild, achievement_key='thriving_community')
        guild.total_xp += GUILD_ACHIEVEMENTS['thriving_community']['xp_reward']
        awarded.append('thriving_community')
    
    # Check level achievements
    level = get_guild_level(guild.total_xp)
    if level >= 5 and 'level_5' not in existing:
        GuildAchievement.objects.create(guild=guild, achievement_key='level_5')
        guild.total_xp += GUILD_ACHIEVEMENTS['level_5']['xp_reward']
        awarded.append('level_5')
    
    if level >= 10 and 'level_10' not in existing:
        GuildAchievement.objects.create(guild=guild, achievement_key='level_10')
        guild.total_xp += GUILD_ACHIEVEMENTS['level_10']['xp_reward']
        awarded.append('level_10')
    
    # Check poll count
    poll_count = guild.polls.filter(status__in=['passed', 'failed']).count()
    if poll_count >= 10 and 'democratic' not in existing:
        GuildAchievement.objects.create(guild=guild, achievement_key='democratic')
        guild.total_xp += GUILD_ACHIEVEMENTS['democratic']['xp_reward']
        awarded.append('democratic')
    
    # Check challenge count
    challenge_count = guild.challenges.filter(status='completed').count()
    if challenge_count >= 5 and 'challenge_champion' not in existing:
        GuildAchievement.objects.create(guild=guild, achievement_key='challenge_champion')
        guild.total_xp += GUILD_ACHIEVEMENTS['challenge_champion']['xp_reward']
        awarded.append('challenge_champion')
    
    if awarded:
        guild.save()
    
    return awarded


# =============================================================================
# Guild Treasury & Rewards Store
# =============================================================================

class GuildTreasury(models.Model):
    """Collective points pool for the guild."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    guild = models.OneToOneField(Guild, on_delete=models.CASCADE, related_name='treasury')
    
    # Points balance
    balance = models.PositiveIntegerField(default=0)
    lifetime_earned = models.PositiveIntegerField(default=0)
    lifetime_spent = models.PositiveIntegerField(default=0)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.guild.name} Treasury: {self.balance} points"
    
    def add_points(self, amount, reason=''):
        self.balance += amount
        self.lifetime_earned += amount
        self.save()
        GuildTreasuryLog.objects.create(
            treasury=self,
            amount=amount,
            transaction_type='earn',
            reason=reason
        )
    
    def spend_points(self, amount, reason=''):
        if amount > self.balance:
            return False
        self.balance -= amount
        self.lifetime_spent += amount
        self.save()
        GuildTreasuryLog.objects.create(
            treasury=self,
            amount=amount,
            transaction_type='spend',
            reason=reason
        )
        return True


class GuildTreasuryLog(models.Model):
    """Log of treasury transactions."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    treasury = models.ForeignKey(GuildTreasury, on_delete=models.CASCADE, related_name='logs')
    amount = models.PositiveIntegerField()
    transaction_type = models.CharField(max_length=10, choices=[('earn', 'Earn'), ('spend', 'Spend')])
    reason = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']


class GuildReward(models.Model):
    """Rewards available in the guild store."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    guild = models.ForeignKey(Guild, on_delete=models.CASCADE, related_name='rewards')
    
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=10, default='🎁')
    cost = models.PositiveIntegerField()
    
    # Limits
    quantity_available = models.PositiveIntegerField(null=True, blank=True)  # null = unlimited
    max_per_member = models.PositiveIntegerField(default=1)
    
    # Reward type
    REWARD_TYPES = [
        ('title', 'Custom Title'),
        ('badge', 'Badge'),
        ('role', 'Custom Role'),
        ('priority', 'Priority Access'),
        ('physical', 'Physical Reward'),
        ('other', 'Other'),
    ]
    reward_type = models.CharField(max_length=20, choices=REWARD_TYPES, default='other')
    reward_data = models.JSONField(default=dict, blank=True)  # Extra data like title name, badge icon
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['cost', 'name']
    
    def __str__(self):
        return f"{self.icon} {self.name} ({self.cost} points)"
    
    @property
    def redemption_count(self):
        return self.redemptions.count()


class GuildRewardRedemption(models.Model):
    """Track reward redemptions by members."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reward = models.ForeignKey(GuildReward, on_delete=models.CASCADE, related_name='redemptions')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='guild_reward_redemptions'
    )
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('fulfilled', 'Fulfilled'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    redeemed_at = models.DateTimeField(auto_now_add=True)
    fulfilled_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-redeemed_at']
    
    def __str__(self):
        return f"{self.user.username} redeemed {self.reward.name}"


def get_or_create_treasury(guild):
    """Get or create treasury for a guild."""
    treasury, created = GuildTreasury.objects.get_or_create(guild=guild)
    return treasury


# =============================================================================
# Focus Sessions
# =============================================================================

class FocusSession(models.Model):
    """Synchronized co-working/study sessions for guild members."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    guild = models.ForeignKey(Guild, on_delete=models.CASCADE, related_name='focus_sessions')
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Session timing
    scheduled_start = models.DateTimeField()
    scheduled_end = models.DateTimeField()
    actual_start = models.DateTimeField(null=True, blank=True)
    actual_end = models.DateTimeField(null=True, blank=True)
    
    # Session settings
    work_duration = models.PositiveIntegerField(default=25)  # Pomodoro: 25 min work
    break_duration = models.PositiveIntegerField(default=5)  # 5 min break
    cycles = models.PositiveIntegerField(default=4)  # Number of work cycles
    
    # Host
    host = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hosted_focus_sessions'
    )
    
    # Participants
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='focus_sessions',
        blank=True
    )
    max_participants = models.PositiveIntegerField(default=10)
    
    # Status
    STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('active', 'In Progress'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    current_cycle = models.PositiveIntegerField(default=0)
    is_on_break = models.BooleanField(default=False)
    
    # XP rewards
    xp_per_cycle = models.PositiveIntegerField(default=10)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-scheduled_start']
        indexes = [
            models.Index(fields=['guild', 'status']),
            models.Index(fields=['scheduled_start']),
        ]
    
    def __str__(self):
        return f"{self.guild.name}: {self.title}"
    
    @property
    def participant_count(self):
        return self.participants.count()
    
    @property
    def is_full(self):
        return self.participant_count >= self.max_participants
    
    def start_session(self):
        if self.status == 'scheduled':
            self.status = 'active'
            self.actual_start = timezone.now()
            self.current_cycle = 1
            self.save()
            return True
        return False
    
    def end_session(self):
        if self.status == 'active':
            self.status = 'completed'
            self.actual_end = timezone.now()
            self.save()
            # Award XP to participants
            xp_earned = self.current_cycle * self.xp_per_cycle
            for participant in self.participants.all():
                membership = GuildMembership.objects.filter(
                    user=participant, guild=self.guild
                ).first()
                if membership:
                    membership.xp_contributed += xp_earned
                    membership.save()
            self.guild.total_xp += xp_earned * self.participant_count
            self.guild.save()
            return True
        return False


class FocusSessionLog(models.Model):
    """Log individual participant activity in a focus session."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(FocusSession, on_delete=models.CASCADE, related_name='logs')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='focus_session_logs'
    )
    
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    cycles_completed = models.PositiveIntegerField(default=0)
    xp_earned = models.PositiveIntegerField(default=0)
    
    class Meta:
        unique_together = ['session', 'user']


# =============================================================================
# Accountability Partners
# =============================================================================

class AccountabilityPartnership(models.Model):
    """Pairs of members for mutual accountability."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    guild = models.ForeignKey(Guild, on_delete=models.CASCADE, related_name='partnerships')
    
    # Partners
    partner1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='accountability_partnerships_as_p1'
    )
    partner2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='accountability_partnerships_as_p2'
    )
    
    # Status
    STATUS_CHOICES = [
        ('pending', 'Pending'),  # Waiting for partner2 to accept
        ('active', 'Active'),
        ('ended', 'Ended'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Goals
    shared_goal = models.TextField(blank=True)
    check_in_frequency = models.CharField(
        max_length=20, 
        choices=[('daily', 'Daily'), ('weekly', 'Weekly'), ('biweekly', 'Bi-weekly')],
        default='daily'
    )
    
    # Stats
    streak_days = models.PositiveIntegerField(default=0)
    last_check_in = models.DateTimeField(null=True, blank=True)
    total_check_ins = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.partner1.username} <-> {self.partner2.username}"
    
    def accept(self):
        if self.status == 'pending':
            self.status = 'active'
            self.save()
            return True
        return False
    
    def end_partnership(self):
        self.status = 'ended'
        self.ended_at = timezone.now()
        self.save()
    
    def check_in(self, user):
        """Record a check-in from one partner."""
        if user not in [self.partner1, self.partner2]:
            return False
        
        self.last_check_in = timezone.now()
        self.total_check_ins += 1
        
        # Update streak
        if self.check_in_frequency == 'daily':
            # Simplified streak logic
            self.streak_days += 1
        
        self.save()
        
        # Create check-in log
        AccountabilityCheckIn.objects.create(
            partnership=self,
            user=user
        )
        
        return True


class AccountabilityCheckIn(models.Model):
    """Log of accountability check-ins."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    partnership = models.ForeignKey(
        AccountabilityPartnership,
        on_delete=models.CASCADE,
        related_name='check_ins'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='accountability_check_ins'
    )
    
    message = models.TextField(blank=True)
    mood = models.CharField(
        max_length=20,
        choices=[
            ('great', 'Great'),
            ('good', 'Good'),
            ('okay', 'Okay'),
            ('struggling', 'Struggling'),
        ],
        default='good'
    )
    progress_percent = models.PositiveIntegerField(default=0)  # 0-100
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
