import uuid
from django.db import models
from django.conf import settings


class ResourceList(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resource_lists'
    )
    title = models.CharField(max_length=100)
    description = models.TextField(max_length=500, blank=True)
    # Free-form niche tag; aggregated by API for exploratory browsing
    niche_tag = models.CharField(max_length=50, blank=True)
    is_public = models.BooleanField(default=True)
    # is_community: appears in the public /resources directory
    is_community = models.BooleanField(default=False)
    # Forking support
    forked_from = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='forks'
    )
    # Cached counter for performance
    save_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['niche_tag', '-created_at']),
            models.Index(fields=['creator', '-created_at']),
            models.Index(fields=['is_community', '-save_count']),
        ]

    def __str__(self):
        return f"{self.title} by {self.creator.username}"


class Resource(models.Model):
    RESOURCE_TYPE_CHOICES = [
        ('tool', 'Tool'),
        ('reference', 'Reference'),
        ('community', 'Community'),
        ('tutorial', 'Tutorial'),
        ('other', 'Other'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource_list = models.ForeignKey(
        ResourceList,
        on_delete=models.CASCADE,
        related_name='resources'
    )
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='added_resources'
    )
    title = models.CharField(max_length=200)
    url = models.URLField()
    # Human-written, honest description — the whole point
    description = models.TextField(max_length=500, blank=True)
    resource_type = models.CharField(
        max_length=20,
        choices=RESOURCE_TYPE_CHOICES,
        default='tool'
    )
    is_free = models.BooleanField(default=True)
    # Position within the list (for manual ordering)
    position = models.PositiveIntegerField(default=0)
    # Cached upvote counter
    upvote_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position', '-upvote_count']
        indexes = [
            models.Index(fields=['resource_list', 'position']),
        ]

    def __str__(self):
        return f"{self.title} ({self.resource_list.title})"


class ResourceUpvote(models.Model):
    """Prevents double-voting; one upvote per user per resource."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resource_upvotes'
    )
    resource = models.ForeignKey(
        Resource,
        on_delete=models.CASCADE,
        related_name='upvotes'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['user', 'resource']]

    def __str__(self):
        return f"{self.user.username} → {self.resource.title}"


class UserSavedList(models.Model):
    """Tracks which users have saved which resource lists."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='saved_lists'
    )
    resource_list = models.ForeignKey(
        ResourceList,
        on_delete=models.CASCADE,
        related_name='saved_by'
    )
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [['user', 'resource_list']]
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.user.username} saved {self.resource_list.title}"
