from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta

from .models import Guild, GuildMembership, GuildPoll, GuildPollVote, GuildChangeRequest
from .serializers import (
    GuildSerializer, GuildDetailSerializer, GuildCreateSerializer,
    GuildMemberSerializer, GuildPollSerializer, GuildPollCreateSerializer,
    GuildChangeRequestSerializer, GuildChangeRequestCreateSerializer
)


# =============================================================================
# Guild CRUD
# =============================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def guilds_list(request):
    """List all public guilds or create a new guild."""
    if request.method == 'GET':
        # Filter options
        guild_type = request.query_params.get('type', None)
        search = request.query_params.get('search', '')
        my_guilds = request.query_params.get('my', 'false') == 'true'
        
        if my_guilds:
            # Get user's guilds
            guild_ids = GuildMembership.objects.filter(
                user=request.user
            ).values_list('guild_id', flat=True)
            guilds = Guild.objects.filter(id__in=guild_ids)
        else:
            guilds = Guild.objects.filter(is_public=True)
        
        if guild_type:
            guilds = guilds.filter(guild_type=guild_type)
        if search:
            guilds = guilds.filter(name__icontains=search)
        
        serializer = GuildSerializer(guilds[:50], many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = GuildCreateSerializer(data=request.data)
        if serializer.is_valid():
            guild = serializer.save(created_by=request.user)
            
            # Creator becomes owner
            GuildMembership.objects.create(
                user=request.user,
                guild=guild,
                role='owner'
            )
            
            return Response(GuildDetailSerializer(guild).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
def guild_detail(request, slug):
    """Get, update, or delete a guild."""
    guild = get_object_or_404(Guild, slug=slug)
    
    if request.method == 'GET':
        serializer = GuildDetailSerializer(guild, context={'request': request})
        
        # Check if user is a member
        is_member = False
        user_role = None
        if request.user.is_authenticated:
            membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
            if membership:
                is_member = True
                user_role = membership.role
        
        return Response({
            'guild': serializer.data,
            'is_member': is_member,
            'user_role': user_role
        })
    
    elif request.method == 'PATCH':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check admin permission
        membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
        if not membership or not membership.is_admin:
            return Response({'error': 'Admin permission required'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = GuildDetailSerializer(guild, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if not request.user.is_authenticated:
            return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Only owner can delete
        membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
        if not membership or not membership.is_owner:
            return Response({'error': 'Owner permission required'}, status=status.HTTP_403_FORBIDDEN)
        
        guild.delete()
        return Response({'message': 'Guild deleted'}, status=status.HTTP_200_OK)


# =============================================================================
# Membership
# =============================================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def guild_join(request, slug):
    """Join a guild."""
    guild = get_object_or_404(Guild, slug=slug)
    
    # Check if already a member
    if GuildMembership.objects.filter(user=request.user, guild=guild).exists():
        return Response({'error': 'Already a member'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if guild allows public join
    settings = guild.guild_settings or {}
    if not settings.get('allow_public_join', True):
        return Response({'error': 'This guild requires an invitation'}, status=status.HTTP_403_FORBIDDEN)
    
    # Check max members
    max_members = settings.get('max_members')
    if max_members and guild.member_count >= max_members:
        return Response({'error': 'Guild is at capacity'}, status=status.HTTP_403_FORBIDDEN)
    
    membership = GuildMembership.objects.create(
        user=request.user,
        guild=guild,
        role='member'
    )
    
    return Response({
        'message': f'Joined {guild.name}',
        'membership': GuildMemberSerializer(membership).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def guild_leave(request, slug):
    """Leave a guild."""
    guild = get_object_or_404(Guild, slug=slug)
    
    membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
    if not membership:
        return Response({'error': 'Not a member'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Owner cannot leave (must transfer or delete guild)
    if membership.is_owner:
        return Response({'error': 'Owner cannot leave. Transfer ownership or delete the guild.'}, status=status.HTTP_403_FORBIDDEN)
    
    membership.delete()
    return Response({'message': f'Left {guild.name}'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def guild_members(request, slug):
    """Get guild members."""
    guild = get_object_or_404(Guild, slug=slug)
    memberships = guild.memberships.select_related('user').all()
    serializer = GuildMemberSerializer(memberships, many=True)
    return Response(serializer.data)


# =============================================================================
# Polls
# =============================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def guild_polls(request, slug):
    """List or create polls for a guild."""
    guild = get_object_or_404(Guild, slug=slug)
    
    # Verify membership
    membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
    if not membership:
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        status_filter = request.query_params.get('status', 'active')
        polls = guild.polls.filter(status=status_filter)
        serializer = GuildPollSerializer(polls, many=True, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = GuildPollCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Set default deadline if not provided
            deadline = serializer.validated_data.get('deadline')
            if not deadline:
                deadline = timezone.now() + timedelta(days=7)
            
            # Set default options for certain poll types
            options = serializer.validated_data.get('options', [])
            if not options:
                poll_type = serializer.validated_data.get('poll_type', 'custom')
                if poll_type in ('admin_vote', 'task_approval', 'habit_approval', 'change_approval'):
                    options = ['Yes', 'No']
            
            poll = serializer.save(
                guild=guild,
                created_by=request.user,
                options=options,
                deadline=deadline
            )
            return Response(GuildPollSerializer(poll, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def guild_poll_vote(request, slug, poll_id):
    """Vote on a poll."""
    guild = get_object_or_404(Guild, slug=slug)
    poll = get_object_or_404(GuildPoll, id=poll_id, guild=guild)
    
    # Verify membership
    membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
    if not membership:
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    # Check poll is active
    if poll.status != 'active':
        return Response({'error': 'Poll is closed'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check deadline
    if timezone.now() > poll.deadline:
        poll.close_poll()
        return Response({'error': 'Poll deadline has passed'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if already voted
    if GuildPollVote.objects.filter(poll=poll, user=request.user).exists():
        return Response({'error': 'Already voted'}, status=status.HTTP_400_BAD_REQUEST)
    
    option_index = request.data.get('option_index')
    if option_index is None or option_index < 0 or option_index >= len(poll.options):
        return Response({'error': 'Invalid option'}, status=status.HTTP_400_BAD_REQUEST)
    
    GuildPollVote.objects.create(
        poll=poll,
        user=request.user,
        option_index=option_index
    )
    
    return Response({
        'message': 'Vote recorded',
        'poll': GuildPollSerializer(poll, context={'request': request}).data
    })


# =============================================================================
# Change Requests
# =============================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def guild_change_requests(request, slug):
    """List or create change requests."""
    guild = get_object_or_404(Guild, slug=slug)
    
    membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
    if not membership:
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        # Admins see all, members see their own
        if membership.is_admin:
            changes = guild.change_requests.all()
        else:
            changes = guild.change_requests.filter(requested_by=request.user)
        
        serializer = GuildChangeRequestSerializer(changes, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = GuildChangeRequestCreateSerializer(data=request.data)
        if serializer.is_valid():
            change = serializer.save(guild=guild, requested_by=request.user)
            return Response(GuildChangeRequestSerializer(change).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def guild_review_change(request, slug, change_id):
    """Approve or reject a change request (admin only)."""
    guild = get_object_or_404(Guild, slug=slug)
    change = get_object_or_404(GuildChangeRequest, id=change_id, guild=guild)
    
    membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
    if not membership or not membership.is_admin:
        return Response({'error': 'Admin permission required'}, status=status.HTTP_403_FORBIDDEN)
    
    action = request.data.get('action')  # 'approve' or 'reject'
    notes = request.data.get('notes', '')
    
    if action == 'approve':
        change.approve(request.user, notes)
        return Response({'message': 'Change approved', 'change': GuildChangeRequestSerializer(change).data})
    elif action == 'reject':
        change.reject(request.user, notes)
        return Response({'message': 'Change rejected', 'change': GuildChangeRequestSerializer(change).data})
    else:
        return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)


# =============================================================================
# Guild Templates
# =============================================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def guild_templates(request):
    """Get guild creation templates."""
    templates = {
        'interest': {
            'name': 'Interest Guild',
            'description': 'For communities around shared hobbies, topics, or passions.',
            'icon': '🎯',
            'default_settings': {
                'allow_public_join': True,
                'require_approval': False,
                'poll_quorum': 0.5
            },
            'suggested_widgets': ['guild_info', 'guild_members', 'guild_activity', 'guild_discussions']
        },
        'organization': {
            'name': 'Organization Guild',
            'description': 'For colleges, companies, or formal organizations. Auto-enrollment via verified email.',
            'icon': '🏛️',
            'default_settings': {
                'allow_public_join': False,
                'require_approval': True,
                'poll_quorum': 0.5
            },
            'suggested_widgets': ['guild_info', 'guild_members', 'guild_announcements', 'guild_events']
        },
        'project': {
            'name': 'Project Guild',
            'description': 'For goal-oriented teams working towards a shared objective.',
            'icon': '🚀',
            'default_settings': {
                'allow_public_join': False,
                'require_approval': True,
                'poll_quorum': 0.6
            },
            'suggested_widgets': ['guild_info', 'guild_members', 'guild_tasks', 'guild_progress']
        },
        'custom': {
            'name': 'Custom Guild',
            'description': 'Full customization. Define your own rules and layout.',
            'icon': '⚡',
            'default_settings': {
                'allow_public_join': True,
                'require_approval': False,
                'poll_quorum': 0.5
            },
            'suggested_widgets': ['guild_info', 'guild_members']
        }
    }
    return Response(templates)
