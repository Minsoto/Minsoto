from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_setup_complete',
                  'status', 'status_message', 'last_active', 'focus_session_start')
        read_only_fields = ('id', 'email', 'last_active')


class UserMinimalSerializer(serializers.ModelSerializer):
    """Minimal user info for connection/organization displays"""
    profile_picture_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'profile_picture_url', 
                  'status', 'status_message')
        read_only_fields = fields
    
    def get_profile_picture_url(self, obj):
        if hasattr(obj, 'profile') and obj.profile:
            return obj.profile.profile_picture_url
        return ''


class UserStatusSerializer(serializers.Serializer):
    """Serializer for updating user status"""
    status = serializers.ChoiceField(choices=['online', 'idle', 'focus', 'dnd', 'offline'])
    status_message = serializers.CharField(max_length=100, required=False, allow_blank=True)


class GoogleAuthSerializer(serializers.Serializer):
    access_token = serializers.CharField()


class UsernameSetupSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    
    def validate_username(self, value):
        User = get_user_model()
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        # Add username format validation
        if not value.replace('_', '').replace('-', '').isalnum():
            raise serializers.ValidationError("Username can only contain letters, numbers, underscores, and hyphens.")
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters long.")
        return value

