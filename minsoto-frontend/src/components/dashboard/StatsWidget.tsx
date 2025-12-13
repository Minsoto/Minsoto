'use client';

import { useDashboardStore } from '@/stores/dashboardStore';
import { Flame, CheckSquare, Target, TrendingUp, Zap } from 'lucide-react';

export default function StatsWidget() {
    const { stats } = useDashboardStore();

    if (!stats) {
        return (
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-900/5 border border-blue-500/20 rounded-2xl p-6 h-full">
                <div className="animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-1/2 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-12 bg-white/10 rounded"></div>
                        <div className="h-12 bg-white/10 rounded"></div>
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
            gradient: 'from-orange-500 to-red-500'
        },
        {
            icon: CheckSquare,
            label: 'Tasks Today',
            value: stats.tasks_completed_today,
            suffix: 'done',
            gradient: 'from-green-500 to-emerald-500'
        },
        {
            icon: Target,
            label: 'Habits Today',
            value: `${stats.habits_completed_today}/${stats.habits_total_today}`,
            suffix: '',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            icon: TrendingUp,
            label: 'This Week',
            value: stats.tasks_completed_week,
            suffix: 'tasks',
            gradient: 'from-blue-500 to-cyan-500'
        }
    ];

    return (
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-900/5 border border-blue-500/20 rounded-2xl p-6 h-full">
            <h2 className="text-xs font-medium tracking-wider text-white/60 uppercase mb-5">
                Your Stats
            </h2>

            <div className="space-y-4">
                {statItems.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                    >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                            <item.icon size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-white/50">{item.label}</div>
                            <div className="text-xl font-light">
                                {item.value}
                                {item.suffix && <span className="text-sm text-white/40 ml-1">{item.suffix}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Longest streak highlight */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap size={14} className="text-yellow-400" />
                    <span className="text-sm text-white/50">Best Streak</span>
                </div>
                <span className="text-lg font-light text-orange-400">{stats.longest_streak} days</span>
            </div>
        </div>
    );
}
