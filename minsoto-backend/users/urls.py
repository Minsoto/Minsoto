from django.urls import path
from . import views

urlpatterns = [
    path('auth/google/', views.google_auth, name='google_auth'),
    path('auth/setup-username/', views.setup_username, name='setup_username'),
    path('profile/me/', views.profile_me, name='profile_me'),
    path('user/me/', views.user_me, name='user_me'),
    path('test-email/', views.send_test_email, name='test_email'),  # For testing
]
