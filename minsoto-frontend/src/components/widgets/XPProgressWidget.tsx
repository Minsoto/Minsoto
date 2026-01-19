'use client';

import { useEffect } from 'react';
import { useGamificationStore } from '@/stores/gamificationStore';
import BaseWidget from './BaseWidget';
import { TrendingUp, Flame, Star } from 'lucide-react';

interface XPProgressWidgetProps {
    id: string;
    visibility: 'public' | 'private';
    isEditMode: boolean;
    isOwner: boolean;
    onDelete?: () => void;
    onVisibilityToggle?: () => void;
}

export default function XPProgressWidget({
    id,
    visibility,
    isEditMode,
    isOwner,
    onDelete,
    onVisibilityToggle,
}: XPProgressWidgetProps) {
    const { xp, fetchXP } = useGamificationStore();

    useEffect(() => {
        if (!xp) {
            fetchXP();
        }
    }, [xp, fetchXP]);

    if (!xp) {
        return (
            <BaseWidget
                id={id}
                title="XP Progress"
                visibility={visibility}
                isEditMode={isEditMode}
                isOwner={isOwner}
                onDelete={onDelete}
                onVisibilityToggle={onVisibilityToggle}
            >
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin w-6 h-6 border-2 border-white/30 rounded-full border-t-transparent" />
                </div>
            </BaseWidget>
        );
    }

    // Level title based on level ranges
    const getLevelTitle = (level: number): string => {
        if (level >= 50) return '禅師 Zen Master';
        if (level >= 40) return '宗師 Grandmaster';
        if (level >= 30) return '賢者 Sage';
        if (level >= 25) return '達人 Master';
        if (level >= 20) return '専門家 Expert';
        if (level >= 15) return '熟練者 Adept';
        if (level >= 10) return '実践者 Practitioner';
        if (level >= 5) return '見習い Apprentice';
        return '初心者 Novice';
    };

    return (
        <BaseWidget
            id={id}
            title="XP Progress"
            visibility={visibility}
            isEditMode={isEditMode}
            isOwner={isOwner}
            onDelete={onDelete}
            onVisibilityToggle={onVisibilityToggle}
        >
            <div className="flex flex-col h-full justify-between">
                {/* Level & Title */}
                <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Star size={18} className="text-yellow-400" />
                        <span className="text-2xl font-bold text-white">Level {xp.level}</span>
                    </div>
                    <p className="text-xs text-white/50">{getLevelTitle(xp.level)}</p>
                </div>

                {/* XP Progress Bar */}
                <div className="mb-4">
                    <div className="flex justify-between text-xs text-white/50 mb-1">
                        <span>{xp.total_xp.toLocaleString()} XP</span>
                        <span>{xp.xp_to_next_level.toLocaleString()} to Level {xp.level + 1}</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${xp.progress_percent}%` }}
                        />
                    </div>
                    <div className="text-right text-xs text-white/30 mt-1">
                        {xp.progress_percent}%
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex justify-between items-center">
                    {/* Streak */}
                    <div className="flex items-center gap-1.5">
                        <Flame size={14} className={xp.current_streak_days > 0 ? 'text-orange-400' : 'text-white/30'} />
                        <span className="text-sm">
                            <span className="text-white font-medium">{xp.current_streak_days}</span>
                            <span className="text-white/40"> day streak</span>
                        </span>
                    </div>

                    {/* Multiplier */}
                    {xp.xp_multiplier > 1 && (
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded">
                            <TrendingUp size={12} className="text-green-400" />
                            <span className="text-xs text-green-400 font-medium">
                                +{((xp.xp_multiplier - 1) * 100).toFixed(0)}% XP
                            </span>
                        </div>
                    )}
                </div>

                {/* Category Breakdown (if space) */}
                <div className="mt-4 pt-3 border-t border-white/5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-white/40">Tasks</span>
                            <span className="text-white/70">{xp.tasks_xp.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Habits</span>
                            <span className="text-white/70">{xp.habits_xp.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Social</span>
                            <span className="text-white/70">{xp.social_xp.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/40">Guild</span>
                            <span className="text-white/70">{xp.guild_xp.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </BaseWidget>
    );
}
