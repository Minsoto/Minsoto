# backend/users/views.py
from django.shortcuts import render
from rest_framework import generics, permissions
from .serializers import UserCreateSerializer, UserSerializer
from .models import CustomUser
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.signing import Signer, BadSignature
from .models import CustomUser

class UserCreateAPIView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny] # Anyone can register.

class CurrentUserAPIView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated] # Only logged-in users.
    serializer_class = UserSerializer

    def get_object(self):
        # This view returns the user object of the currently authenticated user.
        return self.request.user

# This view handles the initial code exchange and determines if it's a login or registration.
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    
    def post(self, request, *args, **kwargs):
        # We're overriding post to inject our custom logic
        original_response = super().post(request, *args, **kwargs)

        # If user is found, original_response will contain the JWT tokens.
        # We can check for the existence of the user via the email from the social account data.
        sociallogin = self.get_serializer().validated_data['user']
        user_email = sociallogin.email
        
        if not CustomUser.objects.filter(email=user_email).exists():
            # User does not exist, so this is a registration attempt.
            # We create a temporary signed token with the user's email.
            signer = Signer()
            registration_token = signer.sign(user_email)
            return Response(
                {
                    "status": "new_user",
                    "registration_token": registration_token
                },
                status=status.HTTP_200_OK
            )
        
        # If user exists, return the original response which contains the login tokens
        return original_response

# This view handles the final step of registration.
class CompleteGoogleRegistrationView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        registration_token = request.data.get('registration_token')
        username = request.data.get('username')
        password = request.data.get('password')

        if not all([registration_token, username, password]):
            return Response({'error': 'Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)

        signer = Signer()
        try:
            email = signer.unsign(registration_token, max_age=3600) # Token valid for 1 hour
        except BadSignature:
            return Response({'error': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if CustomUser.objects.filter(username=username).exists():
             return Response({'error': 'Username is already taken.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the new user
        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # Here you would typically log the user in by generating JWT tokens
        # For simplicity, we'll just return success. The frontend should redirect to login.
        # A more advanced flow would generate and return tokens directly.
        return Response({'message': 'Registration successful! Please log in.'}, status=status.HTTP_201_CREATED)