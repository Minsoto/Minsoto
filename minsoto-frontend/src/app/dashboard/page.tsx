'use client';

import { useAuthStore } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import TodaysFocus from '@/components/dashboard/TodaysFocus';
import QuickActions from '@/components/dashboard/QuickActions';
import StatsWidget from '@/components/dashboard/StatsWidget';
import GoalsWidget from '@/components/dashboard/GoalsWidget';
import PomodoroWidget from '@/components/dashboard/PomodoroWidget';
import { Settings2, Plus, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

type WidgetType = 'todays-focus' | 'stats' | 'quick-actions' | 'goals' | 'pomodoro';

const ALL_WIDGETS: { type: WidgetType; name: string; icon: string }[] = [
    { type: 'todays-focus', name: 'Daily Focus', icon: '📋' },
    { type: 'stats', name: 'Stats', icon: '📊' },
    { type: 'quick-actions', name: 'Quick Actions', icon: '⚡' },
    { type: 'goals', name: 'Goals', icon: '🎯' },
    { type: 'pomodoro', name: 'Pomodoro', icon: '⏱️' },
];

const DEFAULT_WIDGETS: WidgetType[] = ['todays-focus', 'stats', 'quick-actions', 'goals', 'pomodoro'];

export default function DashboardPage() {
    const { user, isAuthenticated, _hasHydrated } = useAuthStore();
    const { fetchFocus, fetchStats } = useDashboardStore();
    const [greeting, setGreeting] = useState('');
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [enabledWidgets, setEnabledWidgets] = useState<WidgetType[]>(DEFAULT_WIDGETS);

    useEffect(() => {
        setGreeting(getGreeting());
        // Load saved widgets from localStorage
        const saved = localStorage.getItem('dashboard-widgets');
        if (saved) {
            try {
                setEnabledWidgets(JSON.parse(saved));
            } catch {
                setEnabledWidgets(DEFAULT_WIDGETS);
            }
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchFocus();
            fetchStats();
        }
    }, [isAuthenticated, fetchFocus, fetchStats]);

    const toggleWidget = (type: WidgetType) => {
        setEnabledWidgets(prev => {
            if (prev.includes(type)) {
                return prev.filter(w => w !== type);
            } else {
                return [...prev, type];
            }
        });
    };

    const saveWidgets = () => {
        localStorage.setItem('dashboard-widgets', JSON.stringify(enabledWidgets));
        setIsCustomizing(false);
    };

    const renderWidget = (type: WidgetType) => {
        switch (type) {
            case 'todays-focus':
                return <TodaysFocus />;
            case 'stats':
                return <StatsWidget />;
            case 'quick-actions':
                return <QuickActions />;
            case 'goals':
                return <GoalsWidget />;
            case 'pomodoro':
                return <PomodoroWidget />;
            default:
                return null;
        }
    };

    if (!_hasHydrated) return null;

    const firstName = user?.first_name || user?.username || 'there';

    return (
        <div className="min-h-screen bg-[var(--background)] text-white selection:bg-cyan-500/30">
            <Navigation />
            <div className="h-16" />

            <main className="container-wide py-8">
                {/* Header */}
                <div className="mb-8 animate-fadeIn flex items-start justify-between">
                    <div>
                        <h1 className="heading-lg text-white">
                            {greeting}, <span className="text-gradient">{firstName}</span>
                        </h1>
                        <p className="text-white/40 mt-1">
                            Here&apos;s your productivity overview
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCustomizing(true)}
                        className="flex items-center gap-2 px-4 py-2 glass-panel rounded-lg hover:bg-white/10 transition-colors text-sm text-white/60 hover:text-white"
                    >
                        <Settings2 size={16} />
                        Customize
                    </button>
                </div>

                {/* Widget Grid - Fixed responsive layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enabledWidgets.includes('todays-focus') && (
                        <div className="lg:col-span-2 min-h-[400px]">
                            <TodaysFocus />
                        </div>
                    )}
                    {enabledWidgets.includes('stats') && (
                        <div className="min-h-[200px]">
                            <StatsWidget />
                        </div>
                    )}
                    {enabledWidgets.includes('pomodoro') && (
                        <div className="min-h-[300px]">
                            <PomodoroWidget />
                        </div>
                    )}
                    {enabledWidgets.includes('quick-actions') && (
                        <div className="min-h-[200px]">
                            <QuickActions />
                        </div>
                    )}
                    {enabledWidgets.includes('goals') && (
                        <div className="min-h-[300px]">
                            <GoalsWidget />
                        </div>
                    )}
                </div>

                {/* Empty state */}
                {enabledWidgets.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-white/40 mb-4">No widgets enabled</p>
                        <button
                            onClick={() => setIsCustomizing(true)}
                            className="text-cyan-400 hover:underline"
                        >
                            Add some widgets
                        </button>
                    </div>
                )}
            </main>

            {/* Customize Modal */}
            <AnimatePresence>
                {isCustomizing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="glass-panel rounded-2xl p-6 w-full max-w-md"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">Customize Dashboard</h2>
                                <button
                                    onClick={() => setIsCustomizing(false)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X size={18} className="text-white/60" />
                                </button>
                            </div>

                            <p className="text-white/50 text-sm mb-4">Toggle widgets on/off</p>

                            <div className="space-y-2 mb-6">
                                {ALL_WIDGETS.map(widget => (
                                    <button
                                        key={widget.type}
                                        onClick={() => toggleWidget(widget.type)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${enabledWidgets.includes(widget.type)
                                                ? 'border-cyan-500/50 bg-cyan-500/10'
                                                : 'border-white/10 bg-white/5 hover:bg-white/10'
                                            }`}
                                    >
                                        <span className="text-xl">{widget.icon}</span>
                                        <span className="text-white flex-1 text-left">{widget.name}</span>
                                        {enabledWidgets.includes(widget.type) ? (
                                            <Check size={18} className="text-cyan-400" />
                                        ) : (
                                            <Plus size={18} className="text-white/40" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setEnabledWidgets(DEFAULT_WIDGETS);
                                    }}
                                    className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 transition-colors text-sm"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={saveWidgets}
                                    className="flex-1 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-medium transition-colors text-sm"
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
