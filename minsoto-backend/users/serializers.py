from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, Interest, HabitStreak, Task, UserInterest, HabitLog

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_setup_complete')
        read_only_fields = ('id', 'email')


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ('id', 'name', 'description')
        read_only_fields = ('id',)


class UserInterestSerializer(serializers.ModelSerializer):
    interest_name = serializers.CharField(source='interest.name', read_only=True)
    interest_id = serializers.UUIDField(source='interest.id', read_only=True)
    
    class Meta:
        model = UserInterest
        fields = ['id', 'interest_id', 'interest_name', 'is_public', 'added_at']
        read_only_fields = ('id', 'added_at')


class HabitLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitLog
        fields = ['id', 'date', 'completed', 'notes', 'created_at']
        read_only_fields = ('id', 'created_at')


class HabitStreakSerializer(serializers.ModelSerializer):
    recent_logs = serializers.SerializerMethodField()
    
    class Meta:
        model = HabitStreak
        fields = ['id', 'name', 'description', 'current_streak', 'longest_streak', 
                  'is_public', 'created_at', 'updated_at', 'recent_logs']
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_recent_logs(self, obj):
        # Get last 30 days of logs
        recent = obj.logs.all()[:30]
        return HabitLogSerializer(recent, many=True).data


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'priority', 'due_date', 
                  'is_public', 'created_at', 'updated_at']
        read_only_fields = ('id', 'created_at', 'updated_at')


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ('id', 'user', 'bio', 'profile_picture_url', 'theme', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class ProfileDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    interests = UserInterestSerializer(source='user.user_interests', many=True, read_only=True)
    stats = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ['id', 'user', 'bio', 'profile_picture_url', 'theme', 'layout', 
                  'interests', 'stats', 'created_at', 'updated_at']
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_stats(self, obj):
        """Calculate profile statistics"""
        user = obj.user
        return {
            'connections': 0,  # Will implement in Phase 2
            'friends': 0,      # Will implement in Phase 2
            'total_tasks': user.tasks.count(),
            'completed_tasks': user.tasks.filter(status='completed').count(),
            'active_habits': user.habits.count(),
            'interests_count': user.user_interests.count(),
        }


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


class LayoutUpdateSerializer(serializers.Serializer):
    layout = serializers.JSONField()
    
    def validate_layout(self, value):
        """Validate layout structure"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Layout must be a JSON object.")
        if 'widgets' not in value:
            raise serializers.ValidationError("Layout must contain 'widgets' key.")
        if not isinstance(value['widgets'], list):
            raise serializers.ValidationError("'widgets' must be an array.")
        return value
