from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('auth/google/', views.google_auth, name='google_auth'),
    path('auth/setup-username/', views.setup_username, name='setup_username'),
    
    # Profile
    path('profile/me/', views.profile_me, name='profile_me'),
    path('profile/<str:username>/', views.profile_detail, name='profile_detail'),
    path('profile/me/layout/', views.update_profile_layout, name='update_layout'),
    
    # User
    path('user/me/', views.user_me, name='user_me'),
    
    
    # Widgets data
    path('widgets/data/', views.widget_data, name='widget_data'),
    
    # Habits
    path('habits/', views.habits_list, name='habits_list'),
    path('habits/<uuid:habit_id>/', views.habit_detail, name='habit_detail'),
    
    # Tasks
    path('tasks/', views.tasks_list, name='tasks_list'),
    path('tasks/<uuid:task_id>/', views.task_detail, name='task_detail'),
    
    # Interests
    path('interests/', views.interests_list, name='interests_list'),
    path('interests/add/', views.add_interest, name='add_interest'),
    path('interests/<uuid:interest_id>/remove/', views.remove_interest, name='remove_interest'),
    
    # Health Check
    path('health/', views.health_check, name='health_check'),
    
    # =========================================================================
    # PHASE 2A: Organizations
    # =========================================================================
    path('organizations/', views.organizations_list, name='organizations_list'),
    path('organizations/<str:domain>/', views.organization_detail, name='organization_detail'),
    path('organizations/verify/', views.verify_organization, name='verify_organization'),
    path('organizations/my/', views.my_organizations, name='my_organizations'),
    path('organizations/<uuid:org_id>/leave/', views.leave_organization, name='leave_organization'),
    
    # =========================================================================
    # PHASE 2A: Connections
    # =========================================================================
    path('connections/', views.connections_list, name='connections_list'),
    path('connections/pending/', views.pending_connections, name='pending_connections'),
    path('connections/sent/', views.sent_connections, name='sent_connections'),
    path('connections/request/', views.send_connection_request, name='send_connection_request'),
    path('connections/accept/', views.accept_connection, name='accept_connection'),
    path('connections/reject/', views.reject_connection, name='reject_connection'),
    path('connections/<uuid:connection_id>/remove/', views.remove_connection, name='remove_connection'),
    path('connections/upgrade/', views.upgrade_to_friend, name='upgrade_to_friend'),
    path('connections/status/<uuid:user_id>/', views.connection_status, name='connection_status'),
    
    # =========================================================================
    # PHASE 2A: User Discovery
    # =========================================================================
    path('discover/', views.discover_users, name='discover_users'),
]

