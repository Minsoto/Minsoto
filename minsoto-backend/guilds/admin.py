from django.contrib import admin
from .models import Guild, GuildMembership, GuildPoll, GuildPollVote, GuildChangeRequest


@admin.register(Guild)
class GuildAdmin(admin.ModelAdmin):
    list_display = ('name', 'guild_type', 'member_count', 'is_public', 'created_at')
    list_filter = ('guild_type', 'is_public', 'is_verified')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(GuildMembership)
class GuildMembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'guild', 'role', 'joined_at')
    list_filter = ('role',)
    search_fields = ('user__username', 'guild__name')


@admin.register(GuildPoll)
class GuildPollAdmin(admin.ModelAdmin):
    list_display = ('title', 'guild', 'poll_type', 'status', 'deadline')
    list_filter = ('poll_type', 'status')
    search_fields = ('title', 'guild__name')


@admin.register(GuildPollVote)
class GuildPollVoteAdmin(admin.ModelAdmin):
    list_display = ('user', 'poll', 'option_index', 'voted_at')


@admin.register(GuildChangeRequest)
class GuildChangeRequestAdmin(admin.ModelAdmin):
    list_display = ('title', 'guild', 'change_type', 'status', 'created_at')
    list_filter = ('change_type', 'status')
    search_fields = ('title', 'guild__name')
