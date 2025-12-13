'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import Navigation from '@/components/Navigation';
import TodaysFocus from '@/components/dashboard/TodaysFocus';
import QuickActions from '@/components/dashboard/QuickActions';
import StatsWidget from '@/components/dashboard/StatsWidget';

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, _hasHydrated } = useAuthStore();
    const { fetchDashboard, fetchFocus, fetchStats, loading } = useDashboardStore();

    useEffect(() => {
        if (!_hasHydrated) return;

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        fetchDashboard();
        fetchFocus();
        fetchStats();
    }, [isAuthenticated, router, _hasHydrated, fetchDashboard, fetchFocus, fetchStats]);

    if (!_hasHydrated || loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div
                    className="w-16 h-16 border-2 border-white animate-spin"
                    style={{ borderRadius: '50% 0 50% 0' }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-light tracking-wide mb-2">Dashboard</h1>
                    <p className="text-white/50">Your private productivity hub</p>
                </div>

                {/* Today's Focus */}
                <TodaysFocus />

                {/* Quick Actions + Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    <div className="lg:col-span-2">
                        <QuickActions />
                    </div>
                    <div>
                        <StatsWidget />
                    </div>
                </div>
            </main>
        </div>
    );
}
