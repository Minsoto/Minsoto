'use client';

import { useState } from 'react';
import BaseWidget from './BaseWidget';
import { ChevronDown, Check } from 'lucide-react';

interface Habit {
    id: string;
    name: string;
    current_streak: number;
    completed_today?: boolean;
}

interface StreakShowcaseWidgetProps {
    id: string;
    visibility: 'public' | 'private';
    isEditMode: boolean;
    isOwner: boolean;
    onVisibilityToggle?: () => void;
    onDelete?: () => void;
    habits: Habit[];
    selectedHabitId?: string;
    onSelectHabit?: (habitId: string) => void;
}

// Get fire intensity based on streak
const getStreakStyle = (streak: number) => {
    if (streak >= 30) return {
        size: 'text-6xl',
        glow: 'drop-shadow-[0_0_20px_rgba(251,191,36,0.7)] animate-pulse',
        color: 'text-amber-400'
    };
    if (streak >= 14) return {
        size: 'text-5xl',
        glow: 'drop-shadow-[0_0_12px_rgba(251,146,60,0.6)]',
        color: 'text-orange-400'
    };
    if (streak >= 7) return {
        size: 'text-4xl',
        glow: 'drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]',
        color: 'text-red-400'
    };
    return { size: 'text-3xl', glow: '', color: 'text-white/60' };
};

export default function StreakShowcaseWidget({
    id,
    visibility,
    isEditMode,
    isOwner,
    onVisibilityToggle,
    onDelete,
    habits,
    selectedHabitId,
    onSelectHabit
}: StreakShowcaseWidgetProps) {
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    // Sort by streak
    const sortedHabits = [...habits]
        .filter(h => h.current_streak > 0)
        .sort((a, b) => b.current_streak - a.current_streak);

    // Get selected habit or default to highest streak
    const selectedHabit = selectedHabitId
        ? habits.find(h => h.id === selectedHabitId)
        : sortedHabits[0];

    const style = selectedHabit ? getStreakStyle(selectedHabit.current_streak) : getStreakStyle(0);

    return (
        <BaseWidget
            id={id}
            title="Streak Showcase"
            visibility={visibility}
            isEditMode={isEditMode}
            isOwner={isOwner}
            onVisibilityToggle={onVisibilityToggle}
            onDelete={onDelete}
        >
            <div className="h-full flex flex-col items-center justify-center relative">
                {/* Edit mode: Habit selector */}
                {isEditMode && isOwner && habits.length > 0 && (
                    <div className="absolute top-0 left-0 right-0">
                        <button
                            onClick={() => setIsSelectOpen(!isSelectOpen)}
                            className="w-full flex items-center justify-between p-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-sm"
                        >
                            <span className="text-white/70 truncate">
                                {selectedHabit?.name || 'Select habit'}
                            </span>
                            <ChevronDown size={14} className={`text-white/50 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isSelectOpen && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--glass-bg)] border border-white/10 rounded-lg overflow-hidden z-50 max-h-40 overflow-y-auto">
                                {sortedHabits.map(habit => (
                                    <button
                                        key={habit.id}
                                        onClick={() => {
                                            onSelectHabit?.(habit.id);
                                            setIsSelectOpen(false);
                                        }}
                                        className="w-full flex items-center justify-between p-3 hover:bg-white/10 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-white/80">{habit.name}</span>
                                            <span className="text-xs text-white/40">🔥 {habit.current_streak}</span>
                                        </div>
                                        {habit.id === selectedHabitId && (
                                            <Check size={14} className="text-emerald-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Main display */}
                {selectedHabit ? (
                    <div className="text-center py-4">
                        {/* Big fire emoji */}
                        <div className={`${style.size} ${style.glow} mb-3`}>
                            🔥
                        </div>

                        {/* Streak count */}
                        <div className={`text-4xl font-bold ${style.color} mb-1`}>
                            {selectedHabit.current_streak}
                            <span className="text-lg font-normal text-white/40 ml-1">days</span>
                        </div>

                        {/* Habit name */}
                        <div className="text-sm text-white/60 mt-2">
                            {selectedHabit.name}
                        </div>

                        {/* Completion badge */}
                        {selectedHabit.completed_today && (
                            <div className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                                <Check size={12} />
                                Done today
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-white/30 text-sm">
                        <div className="text-3xl mb-2 opacity-30">🔥</div>
                        No active streaks
                    </div>
                )}
            </div>
        </BaseWidget>
    );
}
