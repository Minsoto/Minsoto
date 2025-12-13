'use client';

import { useDashboardStore } from '@/stores/dashboardStore';
import { Flame, CheckSquare, Target, Zap } from 'lucide-react';

export default function StatsWidget() {
    const { stats } = useDashboardStore();

    if (!stats) {
        return (
            <div className="glass-panel rounded-2xl p-6 h-full border border-white/5 bg-white/5 animate-pulse" />
        );
    }

    const statItems = [
        {
            icon: Flame,
            label: 'Streak',
            value: stats.current_streak,
            unit: 'days',
            color: 'text-orange-500',
            bg: 'bg-orange-500/10'
        },
        {
            icon: CheckSquare,
            label: 'Tasks',
            value: stats.tasks_completed_today,
            unit: 'done',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            icon: Target,
            label: 'Habits',
            value: `${stats.habits_completed_today}/${stats.habits_total_today}`,
            unit: 'goals',
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            icon: Zap,
            label: 'Focus',
            value: ((stats.tasks_completed_week / Math.max(stats.tasks_completed_week + 5, 1)) * 100).toFixed(0),
            unit: '%',
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        }
    ];

    return (
        <div className="glass-panel rounded-2xl p-6 h-full flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 z-0" />

            <div className="relative z-10">
                <h2 className="text-xs font-bold tracking-widest text-white/40 mb-6 uppercase">
                    Vital Verify
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    {statItems.map((item) => (
                        <div key={item.label} className="flex flex-col gap-1 p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`p-1.5 rounded-md ${item.bg}`}>
                                    <item.icon size={12} className={item.color} />
                                </div>
                                <span className="text-[10px] uppercase tracking-wider text-white/40">{item.label}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-medium text-white">{item.value}</span>
                                <span className="text-[10px] text-white/30">{item.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 pt-4 mt-2 border-t border-white/5 flex justify-between items-center text-xs">
                <span className="text-white/30">Best Streak</span>
                <span className="text-orange-400 font-mono">{stats.longest_streak} 🔥</span>
            </div>
        </div>
    );
}
