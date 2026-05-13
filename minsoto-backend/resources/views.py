from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Count
from django.shortcuts import get_object_or_404

from .models import ResourceList, Resource, ResourceUpvote, UserSavedList
from .serializers import ResourceListSerializer, ResourceListCardSerializer, ResourceSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def browse_lists(request):
    """
    Browse public community resource lists.
    Query params: ?niche=<tag>&q=<search>&offset=0&limit=20
    """
    qs = ResourceList.objects.filter(is_public=True, is_community=True).select_related('creator')

    niche = request.query_params.get('niche', '').strip()
    if niche:
        qs = qs.filter(niche_tag__iexact=niche)

    q = request.query_params.get('q', '').strip()
    if q:
        qs = qs.filter(title__icontains=q) | qs.filter(description__icontains=q)

    qs = qs.order_by('-save_count', '-created_at')

    offset = int(request.query_params.get('offset', 0))
    limit = min(int(request.query_params.get('limit', 20)), 50)
    total = qs.count()
    page = qs[offset:offset + limit]

    serializer = ResourceListCardSerializer(page, many=True, context={'request': request})
    return Response({'count': total, 'offset': offset, 'limit': limit, 'results': serializer.data})


@api_view(['GET'])
@permission_classes([AllowAny])
def niche_tags(request):
    """Return all niche tags currently in use, ordered by list count."""
    tags = (
        ResourceList.objects
        .filter(is_public=True, is_community=True)
        .exclude(niche_tag='')
        .values('niche_tag')
        .annotate(count=Count('id'))
        .order_by('-count')
    )
    return Response([{'niche': t['niche_tag'], 'count': t['count']} for t in tags])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_list(request):
    """Create a new resource list."""
    serializer = ResourceListSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(creator=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def list_detail(request, pk):
    """Get a resource list (public or owned). PATCH/DELETE require ownership."""
    resource_list = get_object_or_404(ResourceList, pk=pk)

    if request.method == 'GET':
        if not resource_list.is_public:
            if not request.user.is_authenticated or resource_list.creator != request.user:
                return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ResourceListSerializer(resource_list, context={'request': request})
        return Response(serializer.data)

    # Write operations require authentication + ownership
    if not request.user.is_authenticated or resource_list.creator != request.user:
        return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'PATCH':
        serializer = ResourceListSerializer(
            resource_list, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        resource_list.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def fork_list(request, pk):
    """Fork a public resource list — creates an independent copy under the user's account."""
    original = get_object_or_404(ResourceList, pk=pk, is_public=True)

    with transaction.atomic():
        forked = ResourceList.objects.create(
            creator=request.user,
            title=f"{original.title} (fork)",
            description=original.description,
            niche_tag=original.niche_tag,
            is_public=False,  # User decides when/if to make their fork public
            is_community=False,
            forked_from=original,
        )
        # Copy all resources from original to fork
        new_resources = [
            Resource(
                resource_list=forked,
                added_by=request.user,
                title=r.title,
                url=r.url,
                description=r.description,
                resource_type=r.resource_type,
                is_free=r.is_free,
                position=r.position,
            )
            for r in original.resources.all()
        ]
        Resource.objects.bulk_create(new_resources)

    serializer = ResourceListSerializer(forked, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_list(request, pk):
    """Save a resource list to the user's collection."""
    resource_list = get_object_or_404(ResourceList, pk=pk, is_public=True)

    saved, created = UserSavedList.objects.get_or_create(
        user=request.user,
        resource_list=resource_list
    )
    if created:
        # Update cached counter
        ResourceList.objects.filter(pk=pk).update(save_count=resource_list.save_count + 1)
        return Response({'saved': True}, status=status.HTTP_201_CREATED)
    return Response({'saved': True, 'detail': 'Already saved.'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unsave_list(request, pk):
    """Remove a resource list from the user's saved collection."""
    resource_list = get_object_or_404(ResourceList, pk=pk)
    deleted, _ = UserSavedList.objects.filter(
        user=request.user,
        resource_list=resource_list
    ).delete()
    if deleted:
        ResourceList.objects.filter(pk=pk).update(
            save_count=max(0, resource_list.save_count - 1)
        )
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_lists(request):
    """Return the user's created lists and saved lists."""
    created = ResourceList.objects.filter(creator=request.user).order_by('-created_at')
    saved = ResourceList.objects.filter(
        saved_by__user=request.user
    ).exclude(creator=request.user).order_by('-saved_by__saved_at')

    return Response({
        'created': ResourceListCardSerializer(created, many=True, context={'request': request}).data,
        'saved': ResourceListCardSerializer(saved, many=True, context={'request': request}).data,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_resource(request, pk):
    """Add a resource item to a list (owner only)."""
    resource_list = get_object_or_404(ResourceList, pk=pk, creator=request.user)
    serializer = ResourceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(resource_list=resource_list, added_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def resource_item(request, pk):
    """Edit or delete a resource item (list owner only)."""
    resource = get_object_or_404(Resource, pk=pk, resource_list__creator=request.user)

    if request.method == 'PATCH':
        serializer = ResourceSerializer(resource, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        resource.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upvote_resource(request, pk):
    """Toggle upvote on a resource item."""
    resource = get_object_or_404(Resource, pk=pk)

    upvote, created = ResourceUpvote.objects.get_or_create(
        user=request.user,
        resource=resource
    )
    if created:
        Resource.objects.filter(pk=pk).update(upvote_count=resource.upvote_count + 1)
        return Response({'upvoted': True, 'upvote_count': resource.upvote_count + 1})
    else:
        upvote.delete()
        new_count = max(0, resource.upvote_count - 1)
        Resource.objects.filter(pk=pk).update(upvote_count=new_count)
        return Response({'upvoted': False, 'upvote_count': new_count})
