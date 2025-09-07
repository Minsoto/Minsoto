# backend/users/urls.py

from django.urls import path
from .views import UserCreateAPIView, CurrentUserAPIView
from .views import GoogleLogin, CompleteGoogleRegistrationView


urlpatterns = [
    path('register/', UserCreateAPIView.as_view(), name='user-register'),
    path('me/', CurrentUserAPIView.as_view(), name='current-user'),
    path('google/', GoogleLogin.as_view(), name='google_login'),
    path('google/complete/', CompleteGoogleRegistrationView.as_view(), name='google_complete_registration'),
]
