from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import Guild, GuildMembership, GuildPoll, GuildPollVote, GuildChangeRequest, GuildHabit, GuildHabitLog

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
            'id', 'name', 'slug', 'description', 'icon', 'banner_url', 'logo', 'banner',
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
            'id', 'name', 'slug', 'description', 'icon', 'banner_url', 'logo', 'banner',
            'guild_type', 'organization_name', 'layout', 'guild_settings',
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


# =============================================================================
# Gamification Serializers
# =============================================================================

from .models import GuildTask, GuildHabit, GuildHabitLog, GuildChallenge

class GuildTaskSerializer(serializers.ModelSerializer):
    """Serializer for shared guild tasks."""
    assigned_to = GuildMemberSerializer(source='assigned_to.all', many=True, read_only=True)
    completed_by = GuildMemberSerializer(source='completed_by.all', many=True, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = GuildTask
        fields = [
            'id', 'title', 'description', 'priority', 'point_value', 'xp_reward',
            'completion_type', 'is_completed', 'assigned_to', 'completed_by',
            'due_date', 'completed_at', 'created_by_username', 'created_at'
        ]
        read_only_fields = ['id', 'is_completed', 'completed_by', 'completed_at', 'created_by_username', 'created_at']


class GuildTaskCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating guild tasks."""
    assigned_to_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = GuildTask
        fields = [
            'title', 'description', 'priority', 'point_value', 
            'xp_reward', 'completion_type', 'due_date', 'assigned_to_ids'
        ]


class GuildHabitSerializer(serializers.ModelSerializer):
    """Serializer for guild habits."""
    today_status = serializers.SerializerMethodField()
    
    class Meta:
        model = GuildHabit
        fields = [
            'id', 'name', 'description', 'icon', 'color', 'frequency',
            'point_value', 'xp_reward', 'participation_goal', 'is_active',
            'today_status', 'created_at'
        ]
        read_only_fields = ['id', 'today_status', 'created_at']
    
    def get_today_status(self, obj):
        request = self.context.get('request')
        status = obj.get_today_participation()
        user_completed = False
        
        if request and request.user.is_authenticated:
            today = timezone.now().date()
            user_completed = GuildHabitLog.objects.filter(
                habit=obj,
                user=request.user,
                completed_at__date=today
            ).exists()
            
        return {
            **status,
            'user_completed': user_completed
        }


class GuildChallengeSerializer(serializers.ModelSerializer):
    """Serializer for guild challenges."""
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = GuildChallenge
        fields = [
            'id', 'title', 'description', 'icon', 'target_type',
            'target_value', 'current_value', 'xp_reward', 'status',
            'starts_at', 'deadline', 'progress_percentage', 'created_at'
        ]


class GuildLeaderboardSerializer(serializers.Serializer):
    """Serializer for guild leaderboard entries."""
    user_id = serializers.UUIDField(source='user.id')
    username = serializers.CharField(source='user.username')
    display_name = serializers.SerializerMethodField()
    profile_picture = serializers.CharField(source='user.profile.profile_picture_url', allow_null=True)
    xp_contributed = serializers.IntegerField()
    role = serializers.CharField()
    
    def get_display_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username


# =============================================================================
# Forum Serializers
# =============================================================================

from .models import GuildForumPost, GuildForumReply, GuildEvent

class GuildForumReplySerializer(serializers.ModelSerializer):
    """Serializer for forum replies."""
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = GuildForumReply
        fields = ['id', 'content', 'author_username', 'author_avatar', 'created_at', 'updated_at']
        read_only_fields = ['id', 'author_username', 'author_avatar', 'created_at', 'updated_at']
    
    def get_author_avatar(self, obj):
        try:
            return obj.author.profile.profile_picture_url
        except:
            return None


class GuildForumPostSerializer(serializers.ModelSerializer):
    """Serializer for forum posts."""
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    reply_count = serializers.ReadOnlyField()
    
    class Meta:
        model = GuildForumPost
        fields = [
            'id', 'title', 'content', 'author_username', 'author_avatar',
            'is_pinned', 'is_locked', 'reply_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author_username', 'author_avatar', 'reply_count', 'created_at', 'updated_at']
    
    def get_author_avatar(self, obj):
        try:
            return obj.author.profile.profile_picture_url
        except:
            return None


class GuildForumPostDetailSerializer(GuildForumPostSerializer):
    """Detailed serializer for forum posts including replies."""
    replies = GuildForumReplySerializer(many=True, read_only=True)
    
    class Meta(GuildForumPostSerializer.Meta):
        fields = GuildForumPostSerializer.Meta.fields + ['replies']


class GuildForumPostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating forum posts."""
    class Meta:
        model = GuildForumPost
        fields = ['title', 'content']


class GuildForumReplyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating forum replies."""
    class Meta:
        model = GuildForumReply
        fields = ['content']


# =============================================================================
# Event Serializers
# =============================================================================

class GuildEventSerializer(serializers.ModelSerializer):
    """Serializer for guild events."""
    attendee_count = serializers.ReadOnlyField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    is_attending = serializers.SerializerMethodField()
    
    class Meta:
        model = GuildEvent
        fields = [
            'id', 'title', 'description', 'start_time', 'end_time', 'is_all_day',
            'location', 'url', 'attendee_count', 'is_attending',
            'created_by_username', 'created_at'
        ]
        read_only_fields = ['id', 'attendee_count', 'is_attending', 'created_by_username', 'created_at']
    
    def get_is_attending(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_user_attending(request.user)
        return False


class GuildEventCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating guild events."""
    class Meta:
        model = GuildEvent
        fields = ['title', 'description', 'start_time', 'end_time', 'is_all_day', 'location', 'url']


# =============================================================================
# Achievement & Rewards Serializers
# =============================================================================

from .models import GuildAchievement, GuildTreasury, GuildReward, GuildRewardRedemption, GUILD_ACHIEVEMENTS

class GuildAchievementSerializer(serializers.ModelSerializer):
    """Serializer for guild achievements."""
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    icon = serializers.SerializerMethodField()
    xp_reward = serializers.SerializerMethodField()
    
    class Meta:
        model = GuildAchievement
        fields = ['id', 'achievement_key', 'name', 'description', 'icon', 'xp_reward', 'unlocked_at']
    
    def get_name(self, obj):
        return obj.details.get('name', obj.achievement_key)
    
    def get_description(self, obj):
        return obj.details.get('description', '')
    
    def get_icon(self, obj):
        return obj.details.get('icon', '🏆')
    
    def get_xp_reward(self, obj):
        return obj.details.get('xp_reward', 0)


class GuildTreasurySerializer(serializers.ModelSerializer):
    """Serializer for guild treasury."""
    class Meta:
        model = GuildTreasury
        fields = ['balance', 'lifetime_earned', 'lifetime_spent', 'updated_at']
        read_only_fields = fields


class GuildRewardSerializer(serializers.ModelSerializer):
    """Serializer for guild rewards."""
    redemption_count = serializers.ReadOnlyField()
    can_redeem = serializers.SerializerMethodField()
    user_redemptions = serializers.SerializerMethodField()
    
    class Meta:
        model = GuildReward
        fields = [
            'id', 'name', 'description', 'icon', 'cost', 'reward_type',
            'quantity_available', 'max_per_member', 'is_active',
            'redemption_count', 'can_redeem', 'user_redemptions', 'created_at'
        ]
        read_only_fields = ['id', 'redemption_count', 'can_redeem', 'user_redemptions', 'created_at']
    
    def get_can_redeem(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Check if available
        if obj.quantity_available is not None and obj.redemption_count >= obj.quantity_available:
            return False
        
        # Check user's redemption limit
        user_count = obj.redemptions.filter(user=request.user).count()
        if user_count >= obj.max_per_member:
            return False
        
        return obj.is_active
    
    def get_user_redemptions(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.redemptions.filter(user=request.user).count()


class GuildRewardCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating guild rewards."""
    class Meta:
        model = GuildReward
        fields = ['name', 'description', 'icon', 'cost', 'reward_type', 'quantity_available', 'max_per_member']


class GuildRewardRedemptionSerializer(serializers.ModelSerializer):
    """Serializer for reward redemptions."""
    reward_name = serializers.CharField(source='reward.name', read_only=True)
    reward_icon = serializers.CharField(source='reward.icon', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = GuildRewardRedemption
        fields = ['id', 'reward_name', 'reward_icon', 'username', 'status', 'redeemed_at', 'fulfilled_at', 'notes']
        read_only_fields = ['id', 'reward_name', 'reward_icon', 'username', 'redeemed_at']


# =============================================================================
# Focus Sessions & Accountability Serializers
# =============================================================================

from .models import FocusSession, AccountabilityPartnership, AccountabilityCheckIn


class FocusSessionSerializer(serializers.ModelSerializer):
    """Serializer for focus sessions."""
    host_username = serializers.CharField(source='host.username', read_only=True)
    participant_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    is_participant = serializers.SerializerMethodField()
    
    class Meta:
        model = FocusSession
        fields = [
            'id', 'title', 'description', 'scheduled_start', 'scheduled_end',
            'work_duration', 'break_duration', 'cycles', 'max_participants',
            'status', 'current_cycle', 'is_on_break', 'xp_per_cycle',
            'host_username', 'participant_count', 'is_full', 'is_participant', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'current_cycle', 'is_on_break', 'created_at']
    
    def get_is_participant(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.participants.filter(id=request.user.id).exists()
        return False


class FocusSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating focus sessions."""
    class Meta:
        model = FocusSession
        fields = ['title', 'description', 'scheduled_start', 'scheduled_end', 'work_duration', 'break_duration', 'cycles', 'max_participants', 'xp_per_cycle']


class AccountabilityPartnershipSerializer(serializers.ModelSerializer):
    """Serializer for accountability partnerships."""
    partner1_username = serializers.CharField(source='partner1.username', read_only=True)
    partner2_username = serializers.CharField(source='partner2.username', read_only=True)
    
    class Meta:
        model = AccountabilityPartnership
        fields = [
            'id', 'partner1_username', 'partner2_username', 'status',
            'shared_goal', 'check_in_frequency', 'streak_days',
            'last_check_in', 'total_check_ins', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'streak_days', 'last_check_in', 'total_check_ins', 'created_at']


class AccountabilityCheckInSerializer(serializers.ModelSerializer):
    """Serializer for accountability check-ins."""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = AccountabilityCheckIn
        fields = ['id', 'username', 'message', 'mood', 'progress_percent', 'created_at']
        read_only_fields = ['id', 'username', 'created_at']
