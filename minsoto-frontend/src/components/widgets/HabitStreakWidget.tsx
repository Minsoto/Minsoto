'use client';

import BaseWidget from './BaseWidget';

interface Habit {
  id: string;
  name: string;
  time?: string;
}

interface HabitStreakWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  habits: Habit[];
  totalDays: number;
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
}

export default function HabitStreakWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  habits,
  totalDays,
  onVisibilityToggle,
  onDelete
}: HabitStreakWidgetProps) {
  const daysOfWeek = ['AM', 'Mon', 'Tue', 'Wed', 'Th', 'Fri', 'Sat'];

  return (
    <BaseWidget
      id={id}
      title="HABIT STREAKS"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
    >
      <div className="h-full flex flex-col">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2 text-[10px] opacity-40">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center">{day}</div>
          ))}
        </div>

        {/* Habits List */}
        <div className="flex-1 overflow-y-auto space-y-2 text-xs">
          {habits.slice(0, 6).map((habit, index) => (
            <div key={habit.id} className="flex items-center gap-2">
              <span className="opacity-50 min-w-[40px]">{habit.time || `${8 + index * 2}AM`}</span>
              <span className="flex-1 truncate">{habit.name}</span>
              <input type="checkbox" className="w-3 h-3" />
            </div>
          ))}
        </div>

        {/* Total Days */}
        <div className="mt-2 pt-2 border-t border-gray-800 flex items-center justify-between text-xs">
          <span className="opacity-50">{totalDays} DAYS</span>
          <span className="opacity-70">90.81</span>
        </div>
      </div>
    </BaseWidget>
  );
}
