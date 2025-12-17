from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Guild, GuildMembership, GuildPoll, GuildPollVote, GuildChangeRequest

User = get_user_model()


class GuildMemberSerializer(serializers.ModelSerializer):
    """Minimal user info for guild member displays."""
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    
    class Meta:
        model = GuildMembership
        fields = ['id', 'username', 'first_name', 'role', 'xp_contributed', 'joined_at']
        read_only_fields = fields


class GuildSerializer(serializers.ModelSerializer):
    """Serializer for guild listings."""
    member_count = serializers.ReadOnlyField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = Guild
        fields = [
            'id', 'name', 'slug', 'description', 'icon', 'banner_url',
            'guild_type', 'organization_name', 'is_public', 'is_verified',
            'member_count', 'total_xp', 'created_by_username', 'created_at'
        ]
        read_only_fields = ['id', 'slug', 'member_count', 'total_xp', 'created_by_username', 'created_at']


class GuildDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for guild profile page."""
    member_count = serializers.ReadOnlyField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    members = GuildMemberSerializer(source='memberships', many=True, read_only=True)
    
    class Meta:
        model = Guild
        fields = [
            'id', 'name', 'slug', 'description', 'icon', 'banner_url',
            'guild_type', 'organization_name', 'layout', 'settings',
            'is_public', 'is_verified', 'member_count', 'total_xp',
            'members', 'created_by_username', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'member_count', 'total_xp', 'created_by_username', 'created_at']


class GuildCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating guilds."""
    class Meta:
        model = Guild
        fields = ['name', 'description', 'icon', 'guild_type', 'is_public']
    
    def create(self, validated_data):
        guild = Guild.objects.create(**validated_data)
        # Set default layout and settings based on type
        if not guild.layout:
            guild.layout = guild.get_default_layout()
        if not guild.guild_settings:
            guild.guild_settings = guild.get_default_settings()
        guild.save()
        return guild


class GuildPollSerializer(serializers.ModelSerializer):
    """Serializer for polls."""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    vote_count = serializers.ReadOnlyField()
    quorum_reached = serializers.ReadOnlyField()
    results = serializers.SerializerMethodField()
    user_voted = serializers.SerializerMethodField()
    
    class Meta:
        model = GuildPoll
        fields = [
            'id', 'poll_type', 'title', 'description', 'options',
            'change_preview', 'related_id', 'status', 'deadline',
            'required_quorum', 'vote_count', 'quorum_reached', 'results',
            'user_voted', 'created_by_username', 'created_at', 'closed_at'
        ]
        read_only_fields = ['id', 'vote_count', 'quorum_reached', 'results', 'created_at', 'closed_at']
    
    def get_results(self, obj):
        # Only show results if poll is closed or user has voted
        request = self.context.get('request')
        if obj.status != 'active':
            return obj.get_results()
        if request and GuildPollVote.objects.filter(poll=obj, user=request.user).exists():
            return obj.get_results()
        return None
    
    def get_user_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return GuildPollVote.objects.filter(poll=obj, user=request.user).exists()
        return False


class GuildPollCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating polls."""
    class Meta:
        model = GuildPoll
        fields = ['poll_type', 'title', 'description', 'options', 'change_preview', 'related_id', 'deadline']


class GuildChangeRequestSerializer(serializers.ModelSerializer):
    """Serializer for change requests."""
    requested_by_username = serializers.CharField(source='requested_by.username', read_only=True)
    reviewed_by_username = serializers.CharField(source='reviewed_by.username', read_only=True)
    
    class Meta:
        model = GuildChangeRequest
        fields = [
            'id', 'change_type', 'title', 'description', 'proposed_changes',
            'status', 'requested_by_username', 'reviewed_by_username',
            'reviewed_at', 'review_notes', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'reviewed_by_username', 'reviewed_at', 'review_notes', 'created_at']


class GuildChangeRequestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating change requests."""
    class Meta:
        model = GuildChangeRequest
        fields = ['change_type', 'title', 'description', 'proposed_changes']
