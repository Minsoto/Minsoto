from rest_framework import serializers
from django.contrib.auth import get_user_model
from users.serializers import UserSerializer, UserMinimalSerializer
from .models import (
    Profile, Interest, UserInterest, Organization, 
    OrganizationMembership, Connection
)

User = get_user_model()

class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Interest
        fields = ('id', 'name', 'description')
        read_only_fields = ('id',)


class UserInterestSerializer(serializers.ModelSerializer):
    interest_name = serializers.CharField(source='interest.name', read_only=True)
    interest_id = serializers.UUIDField(source='interest.id', read_only=True)
    
    class Meta:
        model = UserInterest
        fields = ['id', 'interest_id', 'interest_name', 'is_public', 'added_at']
        read_only_fields = ('id', 'added_at')


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ('id', 'user', 'bio', 'profile_picture_url', 'theme', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')


class OrganizationSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'domain', 'logo_url', 'org_type', 
            'description', 'is_verified', 'website', 'location',
            'member_count', 'created_at'
        ]
        read_only_fields = ('id', 'created_at', 'member_count')


class OrganizationMembershipSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)
    user = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = OrganizationMembership
        fields = [
            'id', 'user', 'organization', 'verification_status',
            'role', 'is_primary', 'is_visible', 'show_on_profile', 'joined_at'
        ]
        read_only_fields = ('id', 'joined_at', 'verification_status')


class OrganizationMemberSerializer(serializers.ModelSerializer):
    """Serializer for showing members in organization directory"""
    user = UserMinimalSerializer(read_only=True)
    interests = serializers.SerializerMethodField()
    
    class Meta:
        model = OrganizationMembership
        fields = ['id', 'user', 'role', 'joined_at', 'interests']
    
    def get_interests(self, obj):
        # Get user's public interests (limited to 5)
        # Note: 'user_interests' is related name on User
        interests = obj.user.user_interests.filter(is_public=True)[:5]
        return [ui.interest.name for ui in interests]


class OrganizationDetailSerializer(serializers.ModelSerializer):
    """Detailed organization view with member list"""
    member_count = serializers.IntegerField(read_only=True)
    members = serializers.SerializerMethodField()
    
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'domain', 'logo_url', 'org_type',
            'description', 'is_verified', 'website', 'location',
            'member_count', 'members', 'created_at'
        ]
    
    def get_members(self, obj):
        # Get verified members, limit to 50 for performance
        members = obj.memberships.filter(
            verification_status='verified',
            is_visible=True
        ).select_related('user', 'user__profile')[:50]
        return OrganizationMemberSerializer(members, many=True).data


class ConnectionSerializer(serializers.ModelSerializer):
    from_user = UserMinimalSerializer(read_only=True)
    to_user = UserMinimalSerializer(read_only=True)
    
    class Meta:
        model = Connection
        fields = [
            'id', 'from_user', 'to_user', 'status', 
            'connection_type', 'message', 'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')


class ConnectionRequestSerializer(serializers.Serializer):
    """Serializer for sending connection requests"""
    to_user_id = serializers.UUIDField()
    message = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_to_user_id(self, value):
        try:
            user = User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")
        return value


class ConnectionActionSerializer(serializers.Serializer):
    """Serializer for accepting/rejecting connections"""
    connection_id = serializers.UUIDField()


class ConnectionStatusSerializer(serializers.Serializer):
    """Response serializer for connection status"""
    status = serializers.CharField()  # 'none', 'pending_sent', 'pending_received', 'connected', 'friends'
    connection = ConnectionSerializer(required=False, allow_null=True)


class ProfileDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    interests = UserInterestSerializer(source='user.user_interests', many=True, read_only=True)
    stats = serializers.SerializerMethodField()
    organizations = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ['id', 'user', 'bio', 'profile_picture_url', 'theme', 'layout', 
                  'interests', 'organizations', 'stats', 'created_at', 'updated_at']
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_stats(self, obj):
        """Calculate profile statistics including connections"""
        from django.db.models import Q
        user = obj.user
        
        # Count accepted connections
        connections_count = Connection.objects.filter(
            Q(from_user=user) | Q(to_user=user),
            status='accepted'
        ).count()
        
        # Count friends (upgraded connections)
        friends_count = Connection.objects.filter(
            Q(from_user=user) | Q(to_user=user),
            status='accepted',
            connection_type='friend'
        ).count()
        
        return {
            'connections': connections_count,
            'friends': friends_count,
            'total_tasks': user.tasks.count(),
            'completed_tasks': user.tasks.filter(status='completed').count(),
            'active_habits': user.habits.count(),
            'interests_count': user.user_interests.count(),
        }
    
    def get_organizations(self, obj):
        """Get user's verified organizations that are visible on profile"""
        memberships = obj.user.organization_memberships.filter(
            verification_status='verified',
            show_on_profile=True
        ).select_related('organization')
        return OrganizationSerializer(
            [m.organization for m in memberships], 
            many=True
        ).data


class LayoutUpdateSerializer(serializers.Serializer):
    layout = serializers.JSONField()
    
    def validate_layout(self, value):
        """Validate layout structure"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Layout must be a JSON object.")
        if 'widgets' not in value:
            raise serializers.ValidationError("Layout must contain 'widgets' key.")
        if not isinstance(value['widgets'], list):
            raise serializers.ValidationError("'widgets' must be an array.")
        return value
