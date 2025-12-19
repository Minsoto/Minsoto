from django.urls import path
from . import views

urlpatterns = [
    # Guild CRUD and listing
    path('', views.guilds_list, name='guilds_list'),
    path('templates/', views.guild_templates, name='guild_templates'),
    path('leaderboard/', views.global_guild_leaderboard, name='global_guild_leaderboard'),
    
    # Guild Operations
    path('<slug:slug>/', views.guild_detail, name='guild_detail'),
    path('<slug:slug>/join/', views.guild_join, name='guild_join'),
    path('<slug:slug>/leave/', views.guild_leave, name='guild_leave'),
    path('<slug:slug>/members/', views.guild_members, name='guild_members'),
    
    # Polls & Changes
    path('<slug:slug>/polls/', views.guild_polls, name='guild_polls'),
    path('<slug:slug>/polls/<uuid:poll_id>/vote/', views.guild_poll_vote, name='guild_poll_vote'),
    path('<slug:slug>/changes/', views.guild_change_requests, name='guild_change_requests'),
    path('<slug:slug>/changes/<uuid:change_id>/review/', views.guild_review_change, name='guild_review_change'),
    
    # Gamification
    path('<slug:slug>/tasks/', views.guild_tasks, name='guild_tasks'),
    path('<slug:slug>/tasks/<uuid:task_id>/complete/', views.guild_task_complete, name='guild_task_complete'),
    path('<slug:slug>/habits/', views.guild_habits, name='guild_habits'),
    path('<slug:slug>/habits/<uuid:habit_id>/log/', views.guild_habit_log, name='guild_habit_log'),
    path('<slug:slug>/stats/', views.guild_stats, name='guild_stats'),
    
    # Forums
    path('<slug:slug>/forums/', views.guild_forums, name='guild_forums'),
    path('<slug:slug>/forums/<uuid:post_id>/', views.guild_forum_post, name='guild_forum_post'),
    path('<slug:slug>/forums/<uuid:post_id>/reply/', views.guild_forum_reply, name='guild_forum_reply'),
    
    # Events
    path('<slug:slug>/events/', views.guild_events, name='guild_events'),
    path('<slug:slug>/events/<uuid:event_id>/', views.guild_event_detail, name='guild_event_detail'),
    path('<slug:slug>/events/<uuid:event_id>/rsvp/', views.guild_event_rsvp, name='guild_event_rsvp'),
    
    # Achievements & Rewards
    path('<slug:slug>/achievements/', views.guild_achievements, name='guild_achievements'),
    path('<slug:slug>/treasury/', views.guild_treasury, name='guild_treasury'),
    path('<slug:slug>/rewards/', views.guild_rewards, name='guild_rewards'),
    path('<slug:slug>/rewards/<uuid:reward_id>/redeem/', views.guild_reward_redeem, name='guild_reward_redeem'),
    
    # Focus Sessions
    path('<slug:slug>/focus-sessions/', views.guild_focus_sessions, name='guild_focus_sessions'),
    path('<slug:slug>/focus-sessions/<uuid:session_id>/join/', views.guild_focus_session_join, name='guild_focus_session_join'),
    path('<slug:slug>/focus-sessions/<uuid:session_id>/action/', views.guild_focus_session_action, name='guild_focus_session_action'),
    
    # Accountability Partners
    path('<slug:slug>/partnerships/', views.guild_partnerships, name='guild_partnerships'),
    path('<slug:slug>/partnerships/<uuid:partnership_id>/action/', views.guild_partnership_action, name='guild_partnership_action'),
    path('<slug:slug>/partnerships/<uuid:partnership_id>/checkin/', views.guild_partnership_checkin, name='guild_partnership_checkin'),
]
