from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('dashboard/', views.dashboard_get, name='dashboard_get'),
    path('dashboard/layout/', views.dashboard_layout_update, name='dashboard_layout_update'),
    path('dashboard/focus/', views.dashboard_focus, name='dashboard_focus'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    
    # Widgets data
    path('widgets/data/', views.widget_data, name='widget_data'),
    path('widgets/data/<str:username>/', views.widget_data_for_user, name='widget_data_for_user'),
    
    # Habits
    path('habits/', views.habits_list, name='habits_list'),
    path('habits/<uuid:habit_id>/', views.habit_detail, name='habit_detail'),
    path('habits/<uuid:habit_id>/log/', views.habit_log, name='habit_log'),
    
    # Tasks
    path('tasks/', views.tasks_list, name='tasks_list'),
    path('tasks/<uuid:task_id>/', views.task_detail, name='task_detail'),
    
    # Goals
    path('goals/', views.goals_list, name='goals_list'),
    path('goals/<uuid:goal_id>/', views.goal_detail, name='goal_detail'),
]

