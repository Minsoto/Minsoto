from django.urls import path
from . import views

urlpatterns = [
    # Guild CRUD and listing
    path('guilds/', views.guilds_list, name='guilds_list'),
    path('guilds/templates/', views.guild_templates, name='guild_templates'),
    path('guilds/<slug:slug>/', views.guild_detail, name='guild_detail'),
    
    # Membership
    path('guilds/<slug:slug>/join/', views.guild_join, name='guild_join'),
    path('guilds/<slug:slug>/leave/', views.guild_leave, name='guild_leave'),
    path('guilds/<slug:slug>/members/', views.guild_members, name='guild_members'),
    
    # Polls
    path('guilds/<slug:slug>/polls/', views.guild_polls, name='guild_polls'),
    path('guilds/<slug:slug>/polls/<uuid:poll_id>/vote/', views.guild_poll_vote, name='guild_poll_vote'),
    
    # Change Requests
    path('guilds/<slug:slug>/changes/', views.guild_change_requests, name='guild_change_requests'),
    path('guilds/<slug:slug>/changes/<uuid:change_id>/review/', views.guild_review_change, name='guild_review_change'),
]
