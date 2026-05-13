from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from .models import JournalEntry
from .serializers import JournalEntrySerializer, JournalEntryListSerializer

User = get_user_model()


@api_view(['GET'])
@permission_classes([AllowAny])
def journal_feed(request, username):
    """
    Public journal feed for a given username.
    Returns only public entries. Paginated.
    """
    user = get_object_or_404(User, username=username)
    entries = JournalEntry.objects.filter(
        author=user,
        visibility='public'
    ).select_related('author').prefetch_related('tags')

    # Simple cursor-style pagination via offset
    offset = int(request.query_params.get('offset', 0))
    limit = min(int(request.query_params.get('limit', 20)), 50)
    total = entries.count()
    page = entries[offset:offset + limit]

    serializer = JournalEntryListSerializer(page, many=True, context={'request': request})
    return Response({
        'count': total,
        'offset': offset,
        'limit': limit,
        'results': serializer.data
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def journal_entry_detail(request, username, slug):
    """Get a single public journal entry by username + slug."""
    user = get_object_or_404(User, username=username)
    entry = get_object_or_404(
        JournalEntry,
        author=user,
        slug=slug,
        visibility='public'
    )
    serializer = JournalEntrySerializer(entry, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_entry(request):
    """Create a new journal entry for the authenticated user."""
    serializer = JournalEntrySerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(author=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def entry_detail_owner(request, pk):
    """Owner-only CRUD for a specific entry (by UUID)."""
    entry = get_object_or_404(JournalEntry, pk=pk, author=request.user)

    if request.method == 'GET':
        serializer = JournalEntrySerializer(entry, context={'request': request})
        return Response(serializer.data)

    if request.method == 'PATCH':
        serializer = JournalEntrySerializer(
            entry, data=request.data, partial=True, context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_drafts(request):
    """Return authenticated user's draft entries."""
    drafts = JournalEntry.objects.filter(
        author=request.user,
        visibility='draft'
    ).select_related('author').prefetch_related('tags')
    serializer = JournalEntryListSerializer(drafts, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_entries(request):
    """Return all entries (public + draft) for the authenticated user."""
    entries = JournalEntry.objects.filter(
        author=request.user
    ).select_related('author').prefetch_related('tags')
    serializer = JournalEntryListSerializer(entries, many=True, context={'request': request})
    return Response(serializer.data)
