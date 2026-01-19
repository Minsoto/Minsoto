from django.urls import path
from . import views

urlpatterns = [
    # Profile
    path('profile/me/', views.profile_me, name='profile_me'),
    path('profile/me/layout/', views.update_profile_layout, name='update_layout'),
    path('profile/<str:username>/', views.profile_detail, name='profile_detail'),
    
    # Interests
    path('interests/', views.interests_list, name='interests_list'),
    path('interests/add/', views.add_interest, name='add_interest'),
    path('interests/<uuid:interest_id>/remove/', views.remove_interest, name='remove_interest'),
    
    # Organizations
    path('organizations/', views.organizations_list, name='organizations_list'),
    path('organizations/verify/', views.verify_organization, name='verify_organization'),
    path('organizations/my/', views.my_organizations, name='my_organizations'),
    path('organizations/<str:domain>/', views.organization_detail, name='organization_detail'),
    path('organizations/<uuid:org_id>/leave/', views.leave_organization, name='leave_organization'),
    
    # Connections
    path('connections/', views.connections_list, name='connections_list'),
    path('connections/pending/', views.pending_connections, name='pending_connections'),
    path('connections/sent/', views.sent_connections, name='sent_connections'),
    path('connections/request/', views.send_connection_request, name='send_connection_request'),
    path('connections/accept/', views.accept_connection, name='accept_connection'),
    path('connections/reject/', views.reject_connection, name='reject_connection'),
    path('connections/upgrade/', views.upgrade_to_friend, name='upgrade_to_friend'),
    path('connections/upgrade/confirm/', views.confirm_friend_upgrade, name='confirm_friend_upgrade'),
    path('connections/status/<uuid:user_id>/', views.connection_status, name='connection_status'),
    path('connections/mutual/<uuid:user_id>/', views.mutual_friends, name='mutual_friends'),
    path('connections/<uuid:connection_id>/remove/', views.remove_connection, name='remove_connection'),
    
    # User Discovery
    path('discover/', views.discover_users, name='discover_users'),
]
