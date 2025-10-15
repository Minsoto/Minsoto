from django.contrib import admin

# Register your models here.
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Profile, Interest, UserInterest, HabitStreak, HabitLog, Task


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_setup_complete', 'is_staff')
    list_filter = ('is_setup_complete', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('google_id', 'is_setup_complete')}),
    )


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'theme', 'created_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Interest)
class InterestAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    readonly_fields = ('id', 'created_at')


@admin.register(UserInterest)
class UserInterestAdmin(admin.ModelAdmin):
    list_display = ('user', 'interest', 'is_public', 'added_at')
    list_filter = ('is_public', 'added_at')
    search_fields = ('user__username', 'interest__name')
    readonly_fields = ('id', 'added_at')


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
