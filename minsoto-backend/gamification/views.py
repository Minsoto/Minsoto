from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from .models import (
    UserXP, XPTransaction, Achievement, UserAchievement,
    UserPoints, PointTransaction, Reward, RewardRedemption
)
from .serializers import (
    UserXPSerializer, XPTransactionSerializer,
    AchievementSerializer, UserAchievementSerializer,
    UserPointsSerializer, PointTransactionSerializer,
    RewardSerializer, RewardCreateSerializer, RewardRedemptionSerializer
)
from .signals import get_or_create_user_xp, get_or_create_user_points


# =============================================================================
# XP Endpoints
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def xp_me(request):
    """Get current user's XP profile."""
    xp_profile = get_or_create_user_xp(request.user)
    serializer = UserXPSerializer(xp_profile)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def xp_transactions(request):
    """Get user's XP transaction history."""
    transactions = XPTransaction.objects.filter(user=request.user)[:50]
    serializer = XPTransactionSerializer(transactions, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def xp_leaderboard(request):
    """Get XP leaderboard (top 50 users)."""
    scope = request.query_params.get('scope', 'global')
    
    # Base queryset
    queryset = UserXP.objects.select_related('user').order_by('-total_xp')
    
    if scope == 'weekly':
        # For weekly, we'd need to filter by transactions in last 7 days
        # For now, just return overall
        pass
    
    top_users = queryset[:50]
    
    results = []
    for i, xp_profile in enumerate(top_users, 1):
        results.append({
            'rank': i,
            'username': xp_profile.user.username,
            'level': xp_profile.level,
            'total_xp': xp_profile.total_xp,
            'is_you': xp_profile.user == request.user
        })
    
    # Find current user's rank if not in top 50
    user_in_list = any(r['is_you'] for r in results)
    user_rank = None
    if not user_in_list:
        user_xp = get_or_create_user_xp(request.user)
        user_rank = UserXP.objects.filter(total_xp__gt=user_xp.total_xp).count() + 1
    
    return Response({
        'leaderboard': results,
        'your_rank': user_rank
    })


# =============================================================================
# Achievements Endpoints
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def achievements_list(request):
    """List all achievements (non-hidden or unlocked by user)."""
    # Get user's unlocked achievements
    unlocked_ids = UserAchievement.objects.filter(
        user=request.user, unlocked=True
    ).values_list('achievement_id', flat=True)
    
    # Show non-hidden or unlocked achievements
    achievements = Achievement.objects.filter(
        models__pk__in=unlocked_ids
    ) | Achievement.objects.filter(is_hidden=False)
    
    # Actually simpler approach:
    achievements = Achievement.objects.all()
    visible = []
    for ach in achievements:
        if not ach.is_hidden or ach.id in unlocked_ids:
            visible.append(ach)
    
    serializer = AchievementSerializer(visible, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def achievements_me(request):
    """Get user's achievement progress."""
    user_achievements = UserAchievement.objects.filter(
        user=request.user
    ).select_related('achievement')
    
    serializer = UserAchievementSerializer(user_achievements, many=True)
    return Response(serializer.data)


# =============================================================================
# Points Endpoints
# =============================================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def points_me(request):
    """Get current user's points balance."""
    user_points = get_or_create_user_points(request.user)
    serializer = UserPointsSerializer(user_points)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def points_transactions(request):
    """Get user's point transaction history."""
    transactions = PointTransaction.objects.filter(user=request.user)[:50]
    serializer = PointTransactionSerializer(transactions, many=True)
    return Response(serializer.data)


# =============================================================================
# Rewards Endpoints
# =============================================================================

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def rewards_list(request):
    """List user's rewards or create a new reward."""
    if request.method == 'GET':
        rewards = Reward.objects.filter(user=request.user, is_active=True)
        serializer = RewardSerializer(rewards, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = RewardCreateSerializer(data=request.data)
        if serializer.is_valid():
            reward = serializer.save(user=request.user)
            return Response(RewardSerializer(reward).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def reward_detail(request, reward_id):
    """Get, update, or delete a reward."""
    try:
        reward = Reward.objects.get(id=reward_id, user=request.user)
    except Reward.DoesNotExist:
        return Response({'error': 'Reward not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = RewardSerializer(reward)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = RewardCreateSerializer(reward, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(RewardSerializer(reward).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        reward.is_active = False  # Soft delete
        reward.save()
        return Response({'message': 'Reward deleted'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reward_redeem(request, reward_id):
    """Redeem a reward (spend points)."""
    try:
        reward = Reward.objects.get(id=reward_id, user=request.user, is_active=True)
    except Reward.DoesNotExist:
        return Response({'error': 'Reward not found'}, status=status.HTTP_404_NOT_FOUND)
    
    user_points = get_or_create_user_points(request.user)
    
    if user_points.balance < reward.cost:
        return Response({
            'error': 'Insufficient points',
            'required': reward.cost,
            'available': user_points.balance
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Spend points
    if not user_points.spend_points(reward.cost):
        return Response({'error': 'Failed to spend points'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Create transaction record
    PointTransaction.objects.create(
        user=request.user,
        amount=reward.cost,
        transaction_type='spend',
        source_type='reward',
        source_id=reward.id,
        description=f'Redeemed: {reward.name}',
        new_balance=user_points.balance
    )
    
    # Update reward stats
    reward.times_redeemed += 1
    reward.save()
    
    # Create redemption record
    redemption = RewardRedemption.objects.create(
        user=request.user,
        reward=reward,
        reward_name=reward.name,
        points_spent=reward.cost
    )
    
    return Response({
        'message': f'Redeemed: {reward.name}',
        'points_spent': reward.cost,
        'new_balance': user_points.balance,
        'redemption': RewardRedemptionSerializer(redemption).data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def redemptions_history(request):
    """Get user's reward redemption history."""
    redemptions = RewardRedemption.objects.filter(user=request.user)[:50]
    serializer = RewardRedemptionSerializer(redemptions, many=True)
    return Response(serializer.data)
