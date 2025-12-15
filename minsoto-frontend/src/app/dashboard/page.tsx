'use client';

import { useAuthStore } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import TodaysFocus from '@/components/dashboard/TodaysFocus';
import QuickActions from '@/components/dashboard/QuickActions';
import StatsWidget from '@/components/dashboard/StatsWidget';

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

export default function DashboardPage() {
    const { user, isAuthenticated, _hasHydrated } = useAuthStore();
    const { fetchFocus, fetchStats } = useDashboardStore();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        setGreeting(getGreeting());
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchFocus();
            fetchStats();
        }
    }, [isAuthenticated, fetchFocus, fetchStats]);

    if (!_hasHydrated) return null;

    const firstName = user?.first_name || user?.username || 'there';

    return (
        <div className="min-h-screen bg-[var(--background)] text-white selection:bg-cyan-500/30">
            <Navigation />

            {/* Spacer for fixed nav */}
            <div className="h-16" />

            <main className="container-wide py-8">
                {/* Header Section */}
                <div className="mb-8 animate-fadeIn">
                    <h1 className="heading-lg text-white">
                        {greeting}, <span className="text-gradient">{firstName}</span>
                    </h1>
                    <p className="text-white/40 mt-1">
                        Here&apos;s your productivity overview
                    </p>
                </div>

                {/* Main Grid - Bento Style */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col - Today's Focus (Main panel) */}
                    <div className="lg:col-span-2 min-h-[500px]">
                        <TodaysFocus />
                    </div>

                    {/* Right Col - Stats & Actions */}
                    <div className="flex flex-col gap-6">
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
