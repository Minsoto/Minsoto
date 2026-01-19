'use client';

import { create } from 'zustand';
import api from '@/lib/api';

interface DashboardWidget {
    id: string;
    type: string;
    position: { x: number; y: number };
    size: { w: number; h: number };
}

interface DashboardLayout {
    widgets: DashboardWidget[];
}

interface FocusTask {
    id: string;
    title: string;
    status: string;
    priority: string;
    due_date: string | null;
}

interface FocusHabit {
    id: string;
    name: string;
    completed_today: boolean;
    current_streak: number;
    time: string | null;
    image_url?: string;
}

interface DashboardStats {
    tasks_completed_today: number;
    tasks_completed_week: number;
    habits_completed_today: number;
    habits_total_today: number;
    current_streak: number;
    longest_streak: number;
    total_tasks: number;
    total_habits: number;
}

interface DashboardState {
    layout: DashboardLayout;
    isEditMode: boolean;
    loading: boolean;
    focusTasks: FocusTask[];
    focusHabits: FocusHabit[];
    upcomingTasks: FocusTask[];
    stats: DashboardStats | null;

    // Actions
    fetchDashboard: () => Promise<void>;
    fetchFocus: () => Promise<void>;
    fetchStats: () => Promise<void>;
    updateLayout: (layout: DashboardLayout) => Promise<void>;
    toggleEditMode: () => void;
}

export const useDashboardStore = create<DashboardState>()((set) => ({
    layout: { widgets: [] },
    isEditMode: false,
    loading: false,
    focusTasks: [],
    focusHabits: [],
    upcomingTasks: [],
    stats: null,

    fetchDashboard: async () => {
        set({ loading: true });
        try {
            const response = await api.get('/dashboard/');
            set({
                layout: response.data.dashboard.layout || { widgets: [] },
            });
        } catch (error) {
            console.error('Failed to fetch dashboard:', error);
        } finally {
            set({ loading: false });
        }
    },

    fetchFocus: async () => {
        try {
            const response = await api.get('/dashboard/focus/');
            set({
                focusTasks: response.data.tasks || [],
                focusHabits: response.data.habits || [],
                upcomingTasks: response.data.upcoming_tasks || []
            });
        } catch (error) {
            console.error('Failed to fetch focus:', error);
        }
    },

    fetchStats: async () => {
        try {
            const response = await api.get('/dashboard/stats/');
            set({ stats: response.data });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    },

    updateLayout: async (layout) => {
        try {
            await api.patch('/dashboard/layout/', { layout });
            set({ layout });
        } catch (error) {
            console.error('Failed to update layout:', error);
        }
    },

    toggleEditMode: () => {
        set((state) => ({ isEditMode: !state.isEditMode }));
    }
}));
