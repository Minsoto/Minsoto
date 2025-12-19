from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from django.contrib.auth import get_user_model
from datetime import timedelta

User = get_user_model()


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
            'name': 'Common Interest Guild',
            'description': 'For communities around shared hobbies, topics, or passions.',
            'icon': '🎯',
            'color': 'purple',
            'default_settings': {
                'allow_public_join': True,
                'require_approval': False,
                'poll_quorum': 0.5,
                'max_members': None,
                'allow_member_polls': True,
                'allow_member_invites': True
            },
            'suggested_widgets': ['guild_info', 'guild_members', 'guild_activity', 'guild_discussions'],
            'default_pages': ['overview', 'members', 'polls', 'forums']
        },
        'organization': {
            'name': 'Organization Guild',
            'description': 'For colleges, companies, or organizations. Auto-enrollment via verified email domain.',
            'icon': '🏛️',
            'color': 'blue',
            'default_settings': {
                'allow_public_join': False,
                'require_approval': True,
                'poll_quorum': 0.5,
                'max_members': None,
                'allow_member_polls': True,
                'require_org_email': True
            },
            'suggested_widgets': ['guild_info', 'guild_members', 'guild_announcements', 'guild_events'],
            'default_pages': ['overview', 'members', 'polls', 'events']
        },
        'project': {
            'name': 'Project/Goal Guild',
            'description': 'For goal-oriented teams working towards a shared objective with deadlines.',
            'icon': '🚀',
            'color': 'orange',
            'default_settings': {
                'allow_public_join': False,
                'require_approval': True,
                'poll_quorum': 0.6,
                'max_members': 20,
                'allow_member_polls': True,
                'show_progress_publicly': True
            },
            'suggested_widgets': ['guild_info', 'guild_members', 'guild_tasks', 'guild_progress'],
            'default_pages': ['overview', 'members', 'tasks', 'polls']
        },
        'custom': {
            'name': 'Custom Guild',
            'description': 'Full customization. Define your own rules, layout, and structure.',
            'icon': '⚡',
            'color': 'green',
            'default_settings': {
                'allow_public_join': True,
                'require_approval': False,
                'poll_quorum': 0.5,
                'max_members': None,
                'allow_member_polls': True,
                'allow_member_invites': True
            },
            'customizable_options': [
                'join_rules', 'privacy', 'poll_settings', 'widget_layout', 
                'member_permissions', 'moderation', 'gamification'
            ],
            'suggested_widgets': ['guild_info', 'guild_members'],
            'default_pages': ['overview', 'members', 'polls']
        }
    }
    return Response(templates)


# =============================================================================
# Gamification Views
# =============================================================================

from .models import GuildTask, GuildHabit, GuildHabitLog, GuildChallenge, get_guild_level, get_guild_level_progress
from .serializers import (
    GuildTaskSerializer, GuildTaskCreateSerializer, 
    GuildHabitSerializer, GuildChallengeSerializer, 
    GuildLeaderboardSerializer
)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def guild_tasks(request, slug):
    """List or create guild tasks."""
    guild = get_object_or_404(Guild, slug=slug)
    
    # Check membership
    if not GuildMembership.objects.filter(user=request.user, guild=guild).exists():
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        tasks = guild.guild_tasks.all().prefetch_related('assigned_to', 'completed_by')
        return Response(GuildTaskSerializer(tasks, many=True).data)
    
    elif request.method == 'POST':
        # Check admin for creating tasks
        if not GuildMembership.objects.filter(user=request.user, guild=guild, role__in=['admin', 'owner']).exists():
            return Response({'error': 'Only admins can create tasks'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = GuildTaskCreateSerializer(data=request.data)
        if serializer.is_valid():
            assigned_ids = serializer.validated_data.pop('assigned_to_ids', [])
            task = serializer.save(guild=guild, created_by=request.user)
            
            if assigned_ids:
                task.assigned_to.set(assigned_ids)
                
            return Response(GuildTaskSerializer(task).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def guild_task_complete(request, slug, task_id):
    """Mark a task as completed by the user."""
    guild = get_object_or_404(Guild, slug=slug)
    task = get_object_or_404(GuildTask, id=task_id, guild=guild)
    
    # Check membership
    membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
    if not membership:
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    if task.is_completed:
        return Response({'error': 'Task already completed'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check assignment if applicable
    if task.assigned_to.exists() and not task.assigned_to.filter(id=request.user.id).exists():
        return Response({'error': 'You are not assigned to this task'}, status=status.HTTP_403_FORBIDDEN)
    
    # Mark user as completed
    if not task.completed_by.filter(id=request.user.id).exists():
        task.completed_by.add(request.user)
        is_fully_completed = task.check_completion()
        
        # Award XP to user for personal contribution
        membership.xp_contributed += task.point_value
        membership.save()
        
        return Response({
            'message': 'Task marked as done',
            'is_fully_completed': is_fully_completed,
            'task': GuildTaskSerializer(task).data
        })
    else:
        return Response({'error': 'You already completed this task'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def guild_habits(request, slug):
    """List or create guild habits."""
    guild = get_object_or_404(Guild, slug=slug)
    
    if not GuildMembership.objects.filter(user=request.user, guild=guild).exists():
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        habits = guild.guild_habits.filter(is_active=True)
        return Response(GuildHabitSerializer(habits, many=True, context={'request': request}).data)
    
    elif request.method == 'POST':
        # Admin only
        if not GuildMembership.objects.filter(user=request.user, guild=guild, role__in=['admin', 'owner']).exists():
            return Response({'error': 'Only admins can create habits'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = GuildHabitSerializer(data=request.data)
        if serializer.is_valid():
            habit = serializer.save(guild=guild, created_by=request.user)
            return Response(GuildHabitSerializer(habit, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def guild_habit_log(request, slug, habit_id):
    """Log participation in a guild habit."""
    guild = get_object_or_404(Guild, slug=slug)
    habit = get_object_or_404(GuildHabit, id=habit_id, guild=guild)
    
    if not GuildMembership.objects.filter(user=request.user, guild=guild).exists():
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    today = timezone.now().date()
    if GuildHabitLog.objects.filter(habit=habit, user=request.user, completed_at__date=today).exists():
        return Response({'error': 'Already completed today'}, status=status.HTTP_400_BAD_REQUEST)
    
    GuildHabitLog.objects.create(habit=habit, user=request.user, notes=request.data.get('notes', ''))
    
    return Response({
        'message': 'Habit logged!',
        'habit': GuildHabitSerializer(habit, context={'request': request}).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def guild_stats(request, slug):
    """Get guild stats including level, leaderboard, and challenges."""
    guild = get_object_or_404(Guild, slug=slug)
    
    # Leaderboard
    memberships = guild.memberships.select_related('user', 'user__profile').order_by('-xp_contributed')[:10]
    leaderboard = GuildLeaderboardSerializer(memberships, many=True).data
    
    # Challenges
    challenges = guild.challenges.filter(status='active')
    challenge_data = GuildChallengeSerializer(challenges, many=True).data
    
    return Response({
        'level': get_guild_level(guild.total_xp),
        'level_progress': get_guild_level_progress(guild.total_xp),
        'total_xp': guild.total_xp,
        'leaderboard': leaderboard,
        'active_challenges': challenge_data
    })


# =============================================================================
# Forum Views
# =============================================================================

from .models import GuildForumPost, GuildForumReply, GuildEvent
from .serializers import (
    GuildForumPostSerializer, GuildForumPostDetailSerializer, GuildForumPostCreateSerializer,
    GuildForumReplySerializer, GuildForumReplyCreateSerializer,
    GuildEventSerializer, GuildEventCreateSerializer
)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def guild_forums(request, slug):
    """List or create forum posts."""
    guild = get_object_or_404(Guild, slug=slug)
    
    if not GuildMembership.objects.filter(user=request.user, guild=guild).exists():
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        posts = guild.forum_posts.select_related('author').all()
        return Response(GuildForumPostSerializer(posts, many=True).data)
    
    elif request.method == 'POST':
        serializer = GuildForumPostCreateSerializer(data=request.data)
        if serializer.is_valid():
            post = serializer.save(guild=guild, author=request.user)
            return Response(GuildForumPostSerializer(post).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def guild_forum_post(request, slug, post_id):
    """Get, update, or delete a forum post."""
    guild = get_object_or_404(Guild, slug=slug)
    post = get_object_or_404(GuildForumPost, id=post_id, guild=guild)
    
    membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
    if not membership:
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        return Response(GuildForumPostDetailSerializer(post).data)
    
    elif request.method == 'PATCH':
        # Only author or admin can edit
        if post.author != request.user and not membership.is_admin:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = GuildForumPostCreateSerializer(post, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(GuildForumPostSerializer(post).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # Only author or admin can delete
        if post.author != request.user and not membership.is_admin:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        post.delete()
        return Response({'message': 'Post deleted'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def guild_forum_reply(request, slug, post_id):
    """Reply to a forum post."""
    guild = get_object_or_404(Guild, slug=slug)
    post = get_object_or_404(GuildForumPost, id=post_id, guild=guild)
    
    if not GuildMembership.objects.filter(user=request.user, guild=guild).exists():
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    if post.is_locked:
        return Response({'error': 'This post is locked'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = GuildForumReplyCreateSerializer(data=request.data)
    if serializer.is_valid():
        reply = serializer.save(post=post, author=request.user)
        return Response(GuildForumReplySerializer(reply).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =============================================================================
# Event Views
# =============================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def guild_events(request, slug):
    """List or create guild events."""
    guild = get_object_or_404(Guild, slug=slug)
    
    if not GuildMembership.objects.filter(user=request.user, guild=guild).exists():
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        # Filter by upcoming events by default
        upcoming = request.query_params.get('upcoming', 'true') == 'true'
        events = guild.events.all()
        if upcoming:
            events = events.filter(start_time__gte=timezone.now())
        return Response(GuildEventSerializer(events, many=True, context={'request': request}).data)
    
    elif request.method == 'POST':
        # Admin only for creating events
        if not GuildMembership.objects.filter(user=request.user, guild=guild, role__in=['admin', 'owner']).exists():
            return Response({'error': 'Only admins can create events'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = GuildEventCreateSerializer(data=request.data)
        if serializer.is_valid():
            event = serializer.save(guild=guild, created_by=request.user)
            return Response(GuildEventSerializer(event, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def guild_event_detail(request, slug, event_id):
    """Get, update, or delete a guild event."""
    guild = get_object_or_404(Guild, slug=slug)
    event = get_object_or_404(GuildEvent, id=event_id, guild=guild)
    
    membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
    if not membership:
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        return Response(GuildEventSerializer(event, context={'request': request}).data)
    
    elif request.method == 'PATCH':
        if not membership.is_admin:
            return Response({'error': 'Admin permission required'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = GuildEventCreateSerializer(event, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(GuildEventSerializer(event, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if not membership.is_admin:
            return Response({'error': 'Admin permission required'}, status=status.HTTP_403_FORBIDDEN)
        
        event.delete()
        return Response({'message': 'Event deleted'})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def guild_event_rsvp(request, slug, event_id):
    """RSVP to a guild event."""
    guild = get_object_or_404(Guild, slug=slug)
    event = get_object_or_404(GuildEvent, id=event_id, guild=guild)
    
    if not GuildMembership.objects.filter(user=request.user, guild=guild).exists():
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    action = request.data.get('action', 'toggle')
    
    if action == 'attend':
        event.attendees.add(request.user)
        return Response({'message': 'RSVP confirmed', 'is_attending': True})
    elif action == 'cancel':
        event.attendees.remove(request.user)
        return Response({'message': 'RSVP cancelled', 'is_attending': False})
    else:  # toggle
        if event.is_user_attending(request.user):
            event.attendees.remove(request.user)
            return Response({'message': 'RSVP cancelled', 'is_attending': False})
        else:
            event.attendees.add(request.user)
            return Response({'message': 'RSVP confirmed', 'is_attending': True})


# =============================================================================
# Achievement & Rewards Views
# =============================================================================

from .models import (
    GuildAchievement, GuildTreasury, GuildReward, GuildRewardRedemption,
    GUILD_ACHIEVEMENTS, GUILD_LEVEL_PERKS, get_guild_level_info,
    check_and_award_achievements, get_or_create_treasury
)
from .serializers import (
    GuildAchievementSerializer, GuildTreasurySerializer,
    GuildRewardSerializer, GuildRewardCreateSerializer, GuildRewardRedemptionSerializer
)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def guild_achievements(request, slug):
    """Get all achievements for a guild, both unlocked and available."""
    guild = get_object_or_404(Guild, slug=slug)
    
    # Check for new achievements when viewing
    check_and_award_achievements(guild)
    
    unlocked = guild.achievements.all()
    unlocked_keys = set(unlocked.values_list('achievement_key', flat=True))
    
    # Build available achievements list
    available = []
    for key, details in GUILD_ACHIEVEMENTS.items():
        if key not in unlocked_keys:
            available.append({
                'key': key,
                'name': details['name'],
                'description': details['description'],
                'icon': details['icon'],
                'xp_reward': details['xp_reward'],
                'unlocked': False
            })
    
    return Response({
        'unlocked': GuildAchievementSerializer(unlocked, many=True).data,
        'available': available
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def guild_treasury(request, slug):
    """Get guild treasury status."""
    guild = get_object_or_404(Guild, slug=slug)
    
    if not GuildMembership.objects.filter(user=request.user, guild=guild).exists():
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    # Check if guild level allows treasury (level 7+)
    level_info = get_guild_level_info(guild.total_xp)
    if level_info['level'] < 7:
        return Response({
            'enabled': False,
            'required_level': 7,
            'current_level': level_info['level'],
            'message': 'Treasury unlocks at Level 7'
        })
    
    treasury = get_or_create_treasury(guild)
    return Response({
        'enabled': True,
        'treasury': GuildTreasurySerializer(treasury).data,
        'recent_transactions': [
            {
                'amount': log.amount,
                'type': log.transaction_type,
                'reason': log.reason,
                'created_at': log.created_at.isoformat()
            }
            for log in treasury.logs.all()[:10]
        ]
    })


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def guild_rewards(request, slug):
    """List or create guild rewards."""
    guild = get_object_or_404(Guild, slug=slug)
    
    membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
    if not membership:
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        rewards = guild.rewards.filter(is_active=True)
        treasury = get_or_create_treasury(guild)
        return Response({
            'treasury_balance': treasury.balance,
            'rewards': GuildRewardSerializer(rewards, many=True, context={'request': request}).data
        })
    
    elif request.method == 'POST':
        if not membership.is_admin:
            return Response({'error': 'Admin permission required'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = GuildRewardCreateSerializer(data=request.data)
        if serializer.is_valid():
            reward = serializer.save(guild=guild)
            return Response(GuildRewardSerializer(reward, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def guild_reward_redeem(request, slug, reward_id):
    """Redeem a guild reward."""
    guild = get_object_or_404(Guild, slug=slug)
    reward = get_object_or_404(GuildReward, id=reward_id, guild=guild)
    
    membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
    if not membership:
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    if not reward.is_active:
        return Response({'error': 'Reward is not available'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check quantity
    if reward.quantity_available is not None:
        if reward.redemption_count >= reward.quantity_available:
            return Response({'error': 'Reward sold out'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check user's limit
    user_redemptions = reward.redemptions.filter(user=request.user).count()
    if user_redemptions >= reward.max_per_member:
        return Response({'error': 'You have reached the maximum redemptions for this reward'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check treasury balance (use member's contributed XP as "points")
    # For now, we'll use the guild treasury
    treasury = get_or_create_treasury(guild)
    if treasury.balance < reward.cost:
        return Response({'error': 'Not enough points in treasury'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Perform redemption
    treasury.spend_points(reward.cost, f'Redemption: {reward.name} by {request.user.username}')
    
    redemption = GuildRewardRedemption.objects.create(
        reward=reward,
        user=request.user
    )
    
    return Response({
        'message': f'Successfully redeemed {reward.name}!',
        'redemption': GuildRewardRedemptionSerializer(redemption).data
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def global_guild_leaderboard(request):
    """Get global guild leaderboard."""
    category = request.query_params.get('category', 'all')
    limit = min(int(request.query_params.get('limit', 20)), 50)
    
    guilds = Guild.objects.filter(is_public=True)
    
    if category != 'all':
        guilds = guilds.filter(guild_type=category)
    
    guilds = guilds.order_by('-total_xp')[:limit]
    
    leaderboard = []
    for rank, guild in enumerate(guilds, 1):
        level_info = get_guild_level_info(guild.total_xp)
        leaderboard.append({
            'rank': rank,
            'id': str(guild.id),
            'name': guild.name,
            'slug': guild.slug,
            'icon': guild.icon,
            'guild_type': guild.guild_type,
            'member_count': guild.member_count,
            'total_xp': guild.total_xp,
            'level': level_info['level'],
            'level_name': level_info['name'],
            'is_verified': guild.is_verified
        })
    
    return Response({
        'category': category,
        'leaderboard': leaderboard
    })


# =============================================================================
# Focus Sessions Views
# =============================================================================

from .models import FocusSession, AccountabilityPartnership, AccountabilityCheckIn
from .serializers import (
    FocusSessionSerializer, FocusSessionCreateSerializer,
    AccountabilityPartnershipSerializer, AccountabilityCheckInSerializer
)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def guild_focus_sessions(request, slug):
    """List or create focus sessions."""
    guild = get_object_or_404(Guild, slug=slug)
    
    membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
    if not membership:
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        status_filter = request.query_params.get('status', None)
        sessions = guild.focus_sessions.all()
        if status_filter:
            sessions = sessions.filter(status=status_filter)
        else:
            sessions = sessions.filter(status__in=['scheduled', 'active'])
        return Response(FocusSessionSerializer(sessions, many=True, context={'request': request}).data)
    
    elif request.method == 'POST':
        serializer = FocusSessionCreateSerializer(data=request.data)
        if serializer.is_valid():
            session = serializer.save(guild=guild, host=request.user)
            session.participants.add(request.user)
            return Response(FocusSessionSerializer(session, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def guild_focus_session_join(request, slug, session_id):
    """Join a focus session."""
    guild = get_object_or_404(Guild, slug=slug)
    session = get_object_or_404(FocusSession, id=session_id, guild=guild)
    
    membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
    if not membership:
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    if session.is_full:
        return Response({'error': 'Session is full'}, status=status.HTTP_400_BAD_REQUEST)
    
    if session.status not in ['scheduled', 'active']:
        return Response({'error': 'Session is not joinable'}, status=status.HTTP_400_BAD_REQUEST)
    
    session.participants.add(request.user)
    return Response({
        'message': 'Joined session',
        'session': FocusSessionSerializer(session, context={'request': request}).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def guild_focus_session_action(request, slug, session_id):
    """Start, pause, or end a focus session (host only)."""
    guild = get_object_or_404(Guild, slug=slug)
    session = get_object_or_404(FocusSession, id=session_id, guild=guild)
    
    if session.host != request.user:
        return Response({'error': 'Only host can control the session'}, status=status.HTTP_403_FORBIDDEN)
    
    action = request.data.get('action')
    
    if action == 'start':
        if session.start_session():
            return Response({'message': 'Session started', 'session': FocusSessionSerializer(session, context={'request': request}).data})
        return Response({'error': 'Cannot start session'}, status=status.HTTP_400_BAD_REQUEST)
    
    elif action == 'end':
        if session.end_session():
            return Response({'message': 'Session ended', 'session': FocusSessionSerializer(session, context={'request': request}).data})
        return Response({'error': 'Cannot end session'}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)


# =============================================================================
# Accountability Partners Views
# =============================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def guild_partnerships(request, slug):
    """List or create accountability partnerships."""
    guild = get_object_or_404(Guild, slug=slug)
    
    membership = GuildMembership.objects.filter(user=request.user, guild=guild).first()
    if not membership:
        return Response({'error': 'Must be a member'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        partnerships = AccountabilityPartnership.objects.filter(
            guild=guild,
            status='active'
        ).filter(
            Q(partner1=request.user) | Q(partner2=request.user)
        )
        pending = AccountabilityPartnership.objects.filter(
            guild=guild,
            status='pending',
            partner2=request.user
        )
        return Response({
            'active': AccountabilityPartnershipSerializer(partnerships, many=True).data,
            'pending_requests': AccountabilityPartnershipSerializer(pending, many=True).data
        })
    
    elif request.method == 'POST':
        partner_username = request.data.get('partner_username')
        try:
            partner = User.objects.get(username=partner_username)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check partner is also a member
        if not GuildMembership.objects.filter(user=partner, guild=guild).exists():
            return Response({'error': 'User is not a guild member'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check for existing partnership
        existing = AccountabilityPartnership.objects.filter(
            guild=guild,
            status__in=['pending', 'active']
        ).filter(
            Q(partner1=request.user, partner2=partner) |
            Q(partner1=partner, partner2=request.user)
        ).exists()
        
        if existing:
            return Response({'error': 'Partnership already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        partnership = AccountabilityPartnership.objects.create(
            guild=guild,
            partner1=request.user,
            partner2=partner,
            shared_goal=request.data.get('shared_goal', ''),
            check_in_frequency=request.data.get('check_in_frequency', 'daily')
        )
        return Response(AccountabilityPartnershipSerializer(partnership).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def guild_partnership_action(request, slug, partnership_id):
    """Accept, decline, or end a partnership."""
    guild = get_object_or_404(Guild, slug=slug)
    partnership = get_object_or_404(AccountabilityPartnership, id=partnership_id, guild=guild)
    
    if request.user not in [partnership.partner1, partnership.partner2]:
        return Response({'error': 'Not your partnership'}, status=status.HTTP_403_FORBIDDEN)
    
    action = request.data.get('action')
    
    if action == 'accept' and partnership.partner2 == request.user:
        partnership.accept()
        return Response({'message': 'Partnership accepted', 'partnership': AccountabilityPartnershipSerializer(partnership).data})
    
    elif action == 'decline' and partnership.partner2 == request.user:
        partnership.delete()
        return Response({'message': 'Partnership declined'})
    
    elif action == 'end':
        partnership.end_partnership()
        return Response({'message': 'Partnership ended'})
    
    return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def guild_partnership_checkin(request, slug, partnership_id):
    """Check in to an accountability partnership."""
    guild = get_object_or_404(Guild, slug=slug)
    partnership = get_object_or_404(AccountabilityPartnership, id=partnership_id, guild=guild)
    
    if request.user not in [partnership.partner1, partnership.partner2]:
        return Response({'error': 'Not your partnership'}, status=status.HTTP_403_FORBIDDEN)
    
    if partnership.status != 'active':
        return Response({'error': 'Partnership is not active'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create check-in
    checkin = AccountabilityCheckIn.objects.create(
        partnership=partnership,
        user=request.user,
        message=request.data.get('message', ''),
        mood=request.data.get('mood', 'good'),
        progress_percent=request.data.get('progress_percent', 0)
    )
    
    # Update partnership stats
    partnership.check_in(request.user)
    
    return Response({
        'message': 'Check-in recorded',
        'checkin': AccountabilityCheckInSerializer(checkin).data,
        'partnership': AccountabilityPartnershipSerializer(partnership).data
    })
