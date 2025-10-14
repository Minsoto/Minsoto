from django.urls import path
from . import views
from .views import profile_detail, update_profile_layout, widget_data

urlpatterns = [
    path('auth/google/', views.google_auth, name='google_auth'),
    path('auth/setup-username/', views.setup_username, name='setup_username'),
    path('profile/me/', views.profile_me, name='profile_me'),
    path('user/me/', views.user_me, name='user_me'),
    path('profile/<str:username>/', profile_detail, name='profile_detail'),
    path('profile/me/layout/', update_profile_layout, name='update_layout'),
    path('widgets/data/', widget_data, name='widget_data'),
]
