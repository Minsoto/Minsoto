import uuid
from django.db import models
from django.conf import settings
from django.utils.text import slugify


class JournalEntry(models.Model):
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('draft', 'Draft'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='journal_entries'
    )
    title = models.CharField(max_length=120, blank=True)
    # Markdown supported; front-end renders with a Markdown parser
    content = models.TextField()
    visibility = models.CharField(
        max_length=10,
        choices=VISIBILITY_CHOICES,
        default='public'  # Digital garden default: public
    )
    # Reuse existing Interest model as lightweight tags
    tags = models.ManyToManyField('social.Interest', blank=True, related_name='journal_entries')
    # Auto slug: YYYY-MM-DD-N per author; set in save()
    slug = models.CharField(max_length=50, blank=True)
    word_count = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        # slug is unique per author
        unique_together = [['author', 'slug']]
        indexes = [
            models.Index(fields=['author', 'visibility', '-created_at']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.author.username} — {self.title or self.slug}"

    def _compute_word_count(self):
        return len(self.content.split()) if self.content else 0

    def _generate_slug(self):
        """Generate a unique slug in the format YYYY-MM-DD-N for this author."""
        from django.utils import timezone
        today = timezone.now().date()
        date_str = today.strftime('%Y-%m-%d')
        # Count entries by this author on the same day
        existing = JournalEntry.objects.filter(
            author=self.author,
            slug__startswith=date_str
        ).exclude(pk=self.pk).count()
        return f"{date_str}-{existing + 1}"

    def save(self, *args, **kwargs):
        self.word_count = self._compute_word_count()
        if not self.slug:
            self.slug = self._generate_slug()
        super().save(*args, **kwargs)
