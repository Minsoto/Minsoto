'use client';

import { useDashboardStore } from '@/stores/dashboardStore';
import { Flame, CheckSquare, Target, TrendingUp } from 'lucide-react';

export default function StatsWidget() {
    const { stats } = useDashboardStore();

    if (!stats) {
        return (
            <div className="border border-white/20 p-6 relative">
                <div className="animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                        <div className="h-8 bg-white/10 rounded"></div>
                        <div className="h-8 bg-white/10 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    const statItems = [
        {
            icon: Flame,
            label: 'Current Streak',
            value: stats.current_streak,
            suffix: 'days',
            color: 'text-orange-400'
        },
        {
            icon: CheckSquare,
            label: 'Tasks Today',
            value: stats.tasks_completed_today,
            suffix: 'done',
            color: 'text-green-400'
        },
        {
            icon: Target,
            label: 'Habits Today',
            value: `${stats.habits_completed_today}/${stats.habits_total_today}`,
            suffix: '',
            color: 'text-blue-400'
        },
        {
            icon: TrendingUp,
            label: 'This Week',
            value: stats.tasks_completed_week,
            suffix: 'tasks',
            color: 'text-purple-400'
        }
    ];

    return (
        <div className="border border-white/20 p-6 relative h-full">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white" />

            <h2 className="text-xs font-light tracking-widest opacity-70 mb-6">
                STATS
            </h2>

            <div className="space-y-4">
                {statItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <item.icon size={16} className={item.color} />
                            <span className="text-sm text-white/70">{item.label}</span>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-light">{item.value}</span>
                            {item.suffix && (
                                <span className="text-xs text-white/50 ml-1">{item.suffix}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Longest streak highlight */}
            <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Longest Streak</span>
                    <span className="text-orange-400">{stats.longest_streak} days</span>
                </div>
            </div>
        </div>
    );
}
