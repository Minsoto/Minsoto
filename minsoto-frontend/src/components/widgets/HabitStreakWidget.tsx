'use client';

import BaseWidget from './BaseWidget';
import { CheckCircle, Circle } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  completed_today?: boolean;
}

interface HabitStreakWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
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
  habits,
  currentStreak = 0,
  longestStreak = 0
}: HabitStreakWidgetProps) {
  const completedToday = habits.filter(h => h.completed_today).length;

  return (
    <BaseWidget
      id={id}
      title="Habits"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
    >
      <div className="h-full flex flex-col">
        {/* Stats */}
        <div className="flex gap-6 mb-4">
          <div>
            <div className="text-2xl font-light">{currentStreak}</div>
            <div className="text-[10px] opacity-40 tracking-wider">CURRENT</div>
          </div>
          <div>
            <div className="text-2xl font-light opacity-50">{longestStreak}</div>
            <div className="text-[10px] opacity-40 tracking-wider">LONGEST</div>
          </div>
        </div>

        {/* Progress */}
        <div className="text-xs mb-3 opacity-50">
          Today: {completedToday}/{habits.length}
        </div>

        {/* Habit list */}
        <div className="space-y-2 overflow-auto flex-1">
          {habits.slice(0, 5).map((habit) => (
            <div
              key={habit.id}
              className="flex items-center gap-2 text-sm"
            >
              {habit.completed_today ? (
                <CheckCircle size={12} className="opacity-70" />
              ) : (
                <Circle size={12} className="opacity-30" />
              )}
              <span className={habit.completed_today ? 'opacity-50 line-through' : ''}>
                {habit.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </BaseWidget>
  );
}
