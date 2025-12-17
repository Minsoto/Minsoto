'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { Flame, CheckSquare, Target, Star, Coins } from 'lucide-react';

export default function StatsWidget() {
    const { stats } = useDashboardStore();
    const { xp, points, fetchXP, fetchPoints } = useGamificationStore();

    useEffect(() => {
        fetchXP();
        fetchPoints();
    }, [fetchXP, fetchPoints]);

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
            unit: 'logged',
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            icon: Coins,
            label: 'Points',
            value: points?.balance ?? 0,
            unit: 'pts',
            color: 'text-yellow-500',
            bg: 'bg-yellow-500/10'
        }
    ];

    return (
        <div className="glass-panel rounded-2xl p-6 h-full flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 z-0" />

            <div className="relative z-10">
                <h2 className="text-xs font-bold tracking-widest text-white/40 mb-4 uppercase">
                    Your Stats
                </h2>

                {/* XP Progress Bar */}
                {xp && (
                    <div className="mb-4 p-3 bg-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Star size={14} className="text-yellow-400" />
                                <span className="text-sm font-medium text-white">Level {xp.level}</span>
                            </div>
                            <span className="text-xs text-white/50">{xp.total_xp.toLocaleString()} XP</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                style={{ width: `${xp.progress_percent}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-white/30">{xp.progress_percent}%</span>
                            <span className="text-[10px] text-white/30">{xp.xp_to_next_level} to Lvl {xp.level + 1}</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
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

            <div className="relative z-10 pt-3 mt-2 border-t border-white/5 flex justify-between items-center text-xs">
                <span className="text-white/30">Best Streak</span>
                <span className="text-orange-400 font-mono">{stats.longest_streak} 🔥</span>
            </div>
        </div>
    );
}
