'use client';

import BaseWidget from './BaseWidget';
import { Clock, CheckCircle, Circle } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  time?: string;
  completed?: boolean;
}

interface HabitStreakWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  habits: Habit[];
  currentStreak?: number;
  longestStreak?: number;
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
}

export default function HabitStreakWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  habits,
  currentStreak = 0,
  longestStreak = 0,
  onVisibilityToggle,
  onDelete
}: HabitStreakWidgetProps) {
  const completedToday = habits.filter(h => h.completed).length;

  return (
    <BaseWidget
      id={id}
      title="Daily Habits"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
      accent="purple"
    >
      <div className="h-full flex flex-col">
        {/* Streak Stats */}
        <div className="flex items-center gap-4 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-light text-orange-400">{currentStreak}</span>
            <span className="text-xs text-white/50">day streak</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-light text-white/70">{longestStreak}</span>
            <span className="text-xs text-white/40">best</span>
          </div>
        </div>

        {/* Today's Progress */}
        <div className="text-xs text-white/50 mb-3">
          Today: {completedToday}/{habits.length} completed
        </div>

        {/* Habits List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {habits.slice(0, 6).map((habit) => (
            <div
              key={habit.id}
              className={`flex items-center gap-3 p-2 rounded-lg transition-all ${habit.completed
                  ? 'bg-green-500/10 border border-green-500/20'
                  : 'bg-white/5 border border-white/10'
                }`}
            >
              {habit.completed ? (
                <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
              ) : (
                <Circle size={14} className="text-white/30 flex-shrink-0" />
              )}
              <span className={`flex-1 text-sm truncate ${habit.completed ? 'text-white/60 line-through' : ''}`}>
                {habit.name}
              </span>
              {habit.time && (
                <div className="flex items-center gap-1 text-[10px] text-white/40">
                  <Clock size={10} />
                  {habit.time}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </BaseWidget>
  );
}
