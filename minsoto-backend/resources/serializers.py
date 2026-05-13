from rest_framework import serializers
from .models import ResourceList, Resource, UserSavedList
from django.contrib.auth import get_user_model

User = get_user_model()


class ResourceSerializer(serializers.ModelSerializer):
    added_by_username = serializers.CharField(source='added_by.username', read_only=True)

    class Meta:
        model = Resource
        fields = [
            'id', 'title', 'url', 'description', 'resource_type',
            'is_free', 'position', 'upvote_count', 'added_by_username',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'upvote_count', 'added_by_username', 'created_at', 'updated_at']

    def validate_url(self, value):
        if not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError("URL must start with http:// or https://")
        return value


class ResourceListSerializer(serializers.ModelSerializer):
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    resources = ResourceSerializer(many=True, read_only=True)
    resource_count = serializers.SerializerMethodField()
    forked_from_title = serializers.CharField(source='forked_from.title', read_only=True, default=None)
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = ResourceList
        fields = [
            'id', 'title', 'description', 'niche_tag', 'is_public',
            'is_community', 'creator_username', 'forked_from', 'forked_from_title',
            'save_count', 'resource_count', 'resources', 'is_saved',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'creator_username', 'save_count', 'forked_from',
            'forked_from_title', 'created_at', 'updated_at'
        ]

    def get_resource_count(self, obj):
        return obj.resources.count()

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.saved_by.filter(user=request.user).exists()
        return False


class ResourceListCardSerializer(serializers.ModelSerializer):
    """Lightweight serializer for browse/listing views."""
    creator_username = serializers.CharField(source='creator.username', read_only=True)
    resource_count = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = ResourceList
        fields = [
            'id', 'title', 'description', 'niche_tag', 'creator_username',
            'save_count', 'resource_count', 'is_saved', 'is_community',
            'forked_from', 'created_at'
        ]

    def get_resource_count(self, obj):
        return obj.resources.count()

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.saved_by.filter(user=request.user).exists()
        return False
