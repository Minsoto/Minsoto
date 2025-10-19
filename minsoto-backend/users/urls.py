from django.urls import path
from . import views

urlpatterns = [
    # Authentication
    path('auth/google/', views.google_auth, name='google_auth'),
    path('auth/setup-username/', views.setup_username, name='setup_username'),
    
    # Profile
    path('profile/me/', views.profile_me, name='profile_me'),
    path('profile/<str:username>/', views.profile_detail, name='profile_detail'),
    path('profile/me/layout/', views.update_profile_layout, name='update_layout'),
    
    # User
    path('user/me/', views.user_me, name='user_me'),
    
    
    # Widgets data
    path('widgets/data/', views.widget_data, name='widget_data'),
    
    # Habits
    path('habits/', views.habits_list, name='habits_list'),
    path('habits/<uuid:habit_id>/', views.habit_detail, name='habit_detail'),
    
    # Tasks
    path('tasks/', views.tasks_list, name='tasks_list'),
    path('tasks/<uuid:task_id>/', views.task_detail, name='task_detail'),
    
    # Interests
    path('interests/', views.interests_list, name='interests_list'),
    path('interests/add/', views.add_interest, name='add_interest'),
    path('interests/<uuid:interest_id>/remove/', views.remove_interest, name='remove_interest'),
]
