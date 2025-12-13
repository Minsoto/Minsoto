from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('auth/google/', views.google_auth, name='google_auth'),
    path('auth/setup-username/', views.setup_username, name='setup_username'),
    
    # User
    path('user/me/', views.user_me, name='user_me'),
    path('user/username/change/', views.change_username, name='change_username'),
    
    # Health Check
    path('health/', views.health_check, name='health_check'),
]
