'use client';

import { useAuthStore } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import TodaysFocus from '@/components/dashboard/TodaysFocus';
import QuickActions from '@/components/dashboard/QuickActions';
import StatsWidget from '@/components/dashboard/StatsWidget';

export default function DashboardPage() {
    const { isAuthenticated, _hasHydrated } = useAuthStore();
    const { fetchFocus, fetchStats } = useDashboardStore();

    useEffect(() => {
        if (isAuthenticated) {
            fetchFocus();
            fetchStats();
        }
    }, [isAuthenticated, fetchFocus, fetchStats]);

    if (!_hasHydrated) return null;

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
            <Navigation />

            <main className="container mx-auto px-4 md:px-6 py-6 pb-20">
                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                            Command Center
                        </h1>
                        <p className="text-white/40 text-sm mt-1">Overview of your productivity metrics</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-xs font-mono text-cyan-400 opacity-60">SYSTEM STATUS: ONLINE</div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-6 h-auto md:h-[600px]">

                    {/* Left Col - Core Control (Tasks/Habits) */}
                    <div className="md:col-span-2 lg:col-span-2 h-[500px] md:h-full">
                        <TodaysFocus />
                    </div>

                    {/* Right Col - Stats & Actions */}
                    <div className="md:col-span-2 lg:col-span-2 flex flex-col gap-6 h-full">
                        <div className="flex-1">
                            <StatsWidget />
                        </div>
                        <div className="flex-1">
                            <QuickActions />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
