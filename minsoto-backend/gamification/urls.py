from django.urls import path
from . import views

urlpatterns = [
    # XP
    path('xp/me/', views.xp_me, name='xp_me'),
    path('xp/transactions/', views.xp_transactions, name='xp_transactions'),
    path('xp/leaderboard/', views.xp_leaderboard, name='xp_leaderboard'),
    
    # Achievements
    path('achievements/', views.achievements_list, name='achievements_list'),
    path('achievements/me/', views.achievements_me, name='achievements_me'),
    
    # Points
    path('points/me/', views.points_me, name='points_me'),
    path('points/transactions/', views.points_transactions, name='points_transactions'),
    
    # Rewards
    path('rewards/', views.rewards_list, name='rewards_list'),
    path('rewards/<uuid:reward_id>/', views.reward_detail, name='reward_detail'),
    path('rewards/<uuid:reward_id>/redeem/', views.reward_redeem, name='reward_redeem'),
    path('rewards/history/', views.redemptions_history, name='redemptions_history'),
]
