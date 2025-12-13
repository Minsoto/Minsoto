from django.contrib import admin
from .models import Profile, Interest, UserInterest, Organization, OrganizationMembership, Connection

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

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('name', 'domain', 'org_type', 'is_verified')
    list_filter = ('is_verified', 'org_type')
    search_fields = ('name', 'domain')

@admin.register(OrganizationMembership)
class OrganizationMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'organization', 'verification_status', 'role')
    list_filter = ('verification_status', 'role')

@admin.register(Connection)
class ConnectionAdmin(admin.ModelAdmin):
    list_display = ('from_user', 'to_user', 'status', 'connection_type')
    list_filter = ('status', 'connection_type')
