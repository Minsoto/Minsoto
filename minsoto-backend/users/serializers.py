from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile, Interest

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_setup_complete')
        read_only_fields = ('id', 'email')

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ('user', 'bio', 'profile_picture_url', 'theme', 'created_at', 'updated_at')

class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ('id', 'name', 'description')

class GoogleAuthSerializer(serializers.Serializer):
    access_token = serializers.CharField()

class UsernameSetupSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    
    def validate_username(self, value):
        User = get_user_model()
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value
