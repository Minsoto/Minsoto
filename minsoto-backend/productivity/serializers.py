from rest_framework import serializers
from .models import HabitStreak, HabitLog, Task, Dashboard

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


class DashboardSerializer(serializers.ModelSerializer):
    """Serializer for user's private dashboard"""
    class Meta:
        model = Dashboard
        fields = ('id', 'layout', 'preferences', 'last_synced', 'created_at')
        read_only_fields = ('id', 'last_synced', 'created_at')


class DashboardLayoutUpdateSerializer(serializers.Serializer):
    """Serializer for updating dashboard layout"""
    layout = serializers.JSONField()
    
    def validate_layout(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Layout must be a JSON object.")
        return value


class DashboardPreferencesSerializer(serializers.Serializer):
    """Serializer for dashboard preferences"""
    preferences = serializers.JSONField()


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard productivity stats"""
    tasks_completed_today = serializers.IntegerField()
    tasks_completed_week = serializers.IntegerField()
    habits_completed_today = serializers.IntegerField()
    habits_total_today = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    total_tasks = serializers.IntegerField()
    total_habits = serializers.IntegerField()
