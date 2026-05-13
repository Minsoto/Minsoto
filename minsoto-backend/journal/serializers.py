from rest_framework import serializers
from .models import JournalEntry
from social.models import Interest


class InterestTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ['id', 'name']


class JournalEntrySerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    tags = InterestTagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Interest.objects.all(),
        write_only=True,
        source='tags',
        required=False
    )

    class Meta:
        model = JournalEntry
        fields = [
            'id', 'author_username', 'title', 'content', 'visibility',
            'tags', 'tag_ids', 'slug', 'word_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author_username', 'slug', 'word_count', 'created_at', 'updated_at']

    def validate_content(self, value):
        if len(value.strip()) == 0:
            raise serializers.ValidationError("Content cannot be empty.")
        if len(value) > 5000:
            raise serializers.ValidationError("Content cannot exceed 5000 characters.")
        return value


class JournalEntryListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for feed listings."""
    author_username = serializers.CharField(source='author.username', read_only=True)
    tags = InterestTagSerializer(many=True, read_only=True)
    preview = serializers.SerializerMethodField()

    class Meta:
        model = JournalEntry
        fields = [
            'id', 'author_username', 'title', 'preview', 'tags',
            'slug', 'word_count', 'created_at'
        ]

    def get_preview(self, obj):
        """Return first 280 chars of content as a plain-text preview."""
        import re
        # Strip markdown syntax for preview
        text = re.sub(r'[#*`_\[\]()>~]', '', obj.content)
        return text[:280].strip()
