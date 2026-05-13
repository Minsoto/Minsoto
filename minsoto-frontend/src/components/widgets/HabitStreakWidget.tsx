'use client';

import { useState } from 'react';
import BaseWidget from './BaseWidget';
import { Check, Flame, Plus } from 'lucide-react';
import Image from 'next/image';
import { useGlobalActionsStore } from '@/stores/globalActionsStore';

interface Habit {
  id: string;
  name: string;
  completed_today?: boolean;
  image_url?: string;
  current_streak?: number;
}

interface HabitStreakWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
  onUpdate?: () => void;
  habits: Habit[];
  currentStreak?: number;
  longestStreak?: number;
}

export default function HabitStreakWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  onVisibilityToggle,
  onDelete,
  onUpdate,
  habits,
  currentStreak = 0,
  longestStreak = 0
}: HabitStreakWidgetProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const { openHabitModal } = useGlobalActionsStore();

  const handleToggle = async (habitId: string, isCompleted: boolean) => {
    if (!isOwner) return;
    setLoading(habitId);
    try {
      const { default: api } = await import('@/lib/api');
      if (isCompleted) {
        await api.delete(`/habits/${habitId}/log/`);
      } else {
        await api.post(`/habits/${habitId}/log/`);
      }
      onUpdate?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const completedToday = habits.filter(h => h.completed_today).length;

  // Sort by streak
  const sortedHabits = [...habits].sort((a, b) =>
    (b.current_streak || 0) - (a.current_streak || 0)
  );

  return (
    <BaseWidget
      id={id}
      title="Habits"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
      headerAction={
        isOwner && (
          <button
            onClick={openHabitModal}
            className="p-1 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-white"
            title="Add Habit"
          >
            <Plus size={14} />
          </button>
        )
      }
    >
      <div className="h-full flex flex-col">
        {/* Header Stats */}
        <div className="flex gap-6 mb-4 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Flame size={20} className="text-amber-400" />
            <div>
              <div className="text-2xl font-bold text-white">{currentStreak}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wide">Current</div>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white/50">{longestStreak}</div>
            <div className="text-[10px] text-white/40 uppercase tracking-wide">Best</div>
          </div>
        </div>

        {/* Progress */}
        <div className="text-xs mb-3 text-white/50">
          Today: <span className="text-white">{completedToday}/{habits.length}</span>
        </div>

        {/* Habit list with images and streaks */}
        <div className="space-y-2 overflow-auto flex-1">
          {sortedHabits.slice(0, 6).map((habit) => (
            <div
              key={habit.id}
              onClick={() => handleToggle(habit.id, habit.completed_today || false)}
              className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                isOwner ? 'cursor-pointer hover:bg-white/10' : ''
              } ${habit.completed_today ? 'bg-white/5' : ''}`}
            >
              {/* Image or icon */}
              <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center">
                {habit.image_url ? (
                  <Image
                    src={habit.image_url}
                    alt=""
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white/20 text-sm">📌</div>
                )}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm truncate ${habit.completed_today ? 'text-white/50' : 'text-white/80'}`}>
                  {habit.name}
                </div>
                {(habit.current_streak || 0) > 0 && (
                  <div className="flex items-center gap-1 text-xs text-amber-400/70">
                    <Flame size={10} />
                    {habit.current_streak}d
                  </div>
                )}
              </div>

              {/* Completion indicator */}
              {loading === habit.id ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin flex-shrink-0" />
              ) : habit.completed_today ? (
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-emerald-400" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </BaseWidget>
  );
}
