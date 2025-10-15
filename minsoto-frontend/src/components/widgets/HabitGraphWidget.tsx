'use client';

import BaseWidget from './BaseWidget';

interface HabitGraphWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  days: number;
  data: boolean[]; // Array of 28 days (4 weeks)
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
}

export default function HabitGraphWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  days,
  data,
  onVisibilityToggle,
  onDelete
}: HabitGraphWidgetProps) {
  // Generate grid for 28 days (4 rows x 7 cols)
  const gridData = data.length > 0 ? data : Array(28).fill(false);

  return (
    <BaseWidget
      id={id}
      title="HABIT STREAKS"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
      className="bg-white text-black"
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">{days} DAYS</span>
          <div className="flex gap-2">
            <button className="text-xs opacity-60 hover:opacity-100">Read</button>
            <button className="text-xs opacity-60 hover:opacity-100 px-2 py-1 bg-gray-200">
              📖
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {gridData.map((completed, index) => (
            <div
              key={index}
              className={`aspect-square ${
                completed ? 'bg-black' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Checkmark */}
        <div className="absolute bottom-3 right-3">
          <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center">
            ✓
          </div>
        </div>
      </div>
    </BaseWidget>
  );
}
