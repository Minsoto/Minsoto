from rest_framework import serializers
from .models import (
    UserXP, XPTransaction, Achievement, UserAchievement,
    UserPoints, PointTransaction, Reward, RewardRedemption
)


class UserXPSerializer(serializers.ModelSerializer):
    """Serializer for user XP profile."""
    xp_to_next_level = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserXP
        fields = [
            'total_xp', 'level', 'xp_to_next_level', 'progress_percent',
            'current_streak_days', 'longest_streak_days', 'xp_multiplier',
            'tasks_xp', 'habits_xp', 'social_xp', 'guild_xp',
            'username'
        ]
        read_only_fields = fields

    def get_xp_to_next_level(self, obj):
        return obj.xp_to_next_level()

    def get_progress_percent(self, obj):
        return obj.xp_progress_percent()


class XPTransactionSerializer(serializers.ModelSerializer):
    """Serializer for XP transactions."""
    class Meta:
        model = XPTransaction
        fields = [
            'id', 'amount', 'source_type', 'description',
            'new_total_xp', 'new_level', 'leveled_up', 'created_at'
        ]
        read_only_fields = fields


class AchievementSerializer(serializers.ModelSerializer):
    """Serializer for achievement definitions."""
    class Meta:
        model = Achievement
        fields = [
            'id', 'name', 'description', 'category', 'rarity',
            'xp_reward', 'icon', 'unlocks_title', 'is_hidden'
        ]


class UserAchievementSerializer(serializers.ModelSerializer):
    """Serializer for user achievements with progress."""
    achievement = AchievementSerializer(read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = [
            'achievement', 'progress', 'target', 
            'unlocked', 'unlocked_at'
        ]
        read_only_fields = fields


class UserPointsSerializer(serializers.ModelSerializer):
    """Serializer for user points balance."""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserPoints
        fields = ['balance', 'total_earned', 'total_spent', 'username']
        read_only_fields = fields


class PointTransactionSerializer(serializers.ModelSerializer):
    """Serializer for point transactions."""
    class Meta:
        model = PointTransaction
        fields = [
            'id', 'amount', 'transaction_type', 'source_type',
            'description', 'new_balance', 'created_at'
        ]
        read_only_fields = fields


class RewardSerializer(serializers.ModelSerializer):
    """Serializer for rewards."""
    class Meta:
        model = Reward
        fields = [
            'id', 'name', 'description', 'cost', 'icon',
            'is_active', 'times_redeemed', 'created_at'
        ]
        read_only_fields = ['id', 'times_redeemed', 'created_at']


class RewardCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating rewards."""
    class Meta:
        model = Reward
        fields = ['name', 'description', 'cost', 'icon']


class RewardRedemptionSerializer(serializers.ModelSerializer):
    """Serializer for reward redemptions."""
    class Meta:
        model = RewardRedemption
        fields = ['id', 'reward_name', 'points_spent', 'redeemed_at']
        read_only_fields = fields
