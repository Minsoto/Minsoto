from django.contrib import admin
from .models import HabitStreak, HabitLog, Task, Dashboard

@admin.register(HabitStreak)
class HabitStreakAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'current_streak', 'longest_streak', 'is_public')
    list_filter = ('is_public', 'created_at')
    search_fields = ('user__username', 'name')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(HabitLog)
class HabitLogAdmin(admin.ModelAdmin):
    list_display = ('habit', 'date', 'completed')
    list_filter = ('completed', 'date')
    search_fields = ('habit__name', 'habit__user__username')
    readonly_fields = ('id', 'created_at')


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'status', 'priority', 'due_date', 'is_public')
    list_filter = ('status', 'priority', 'is_public', 'created_at')
    search_fields = ('user__username', 'title', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')

@admin.register(Dashboard)
class DashboardAdmin(admin.ModelAdmin):
    list_display = ('user', 'last_synced', 'created_at')
    readonly_fields = ('id', 'created_at', 'last_synced')
