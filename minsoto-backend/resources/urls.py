from django.urls import path
from . import views

urlpatterns = [
    # Public browsing
    path('resources/', views.browse_lists, name='resources_browse'),
    path('resources/niches/', views.niche_tags, name='resources_niches'),
    path('resources/lists/<uuid:pk>/', views.list_detail, name='resource_list_detail'),

    # Auth required — management
    path('resources/lists/', views.create_list, name='create_resource_list'),
    path('resources/my/', views.my_lists, name='my_resource_lists'),
    path('resources/lists/<uuid:pk>/fork/', views.fork_list, name='fork_resource_list'),
    path('resources/lists/<uuid:pk>/save/', views.save_list, name='save_resource_list'),
    path('resources/lists/<uuid:pk>/unsave/', views.unsave_list, name='unsave_resource_list'),
    path('resources/lists/<uuid:pk>/items/', views.add_resource, name='add_resource'),

    # Resource item management
    path('resources/items/<uuid:pk>/', views.resource_item, name='resource_item'),
    path('resources/items/<uuid:pk>/upvote/', views.upvote_resource, name='upvote_resource'),
]
