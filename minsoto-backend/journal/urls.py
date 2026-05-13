from django.urls import path
from . import views

urlpatterns = [
    # Public feed
    path('journal/<str:username>/', views.journal_feed, name='journal_feed'),
    path('journal/<str:username>/<str:slug>/', views.journal_entry_detail, name='journal_entry_detail'),

    # Auth required
    path('journal/', views.create_entry, name='create_journal_entry'),
    path('journal/me/entries/', views.my_entries, name='my_journal_entries'),
    path('journal/me/drafts/', views.my_drafts, name='my_journal_drafts'),
    path('journal/entry/<uuid:pk>/', views.entry_detail_owner, name='journal_entry_owner'),
]
