'use client';

import BaseWidget from './BaseWidget';

interface StatsWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  currentValue: number;
  targetValue: number;
  label: string;
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
}

export default function StatsWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  currentValue,
  targetValue,
  label,
  onVisibilityToggle,
  onDelete
}: StatsWidgetProps) {
  const percentage = Math.round((currentValue / targetValue) * 100);

  return (
    <BaseWidget
      id={id}
      title="STATS"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
    >
      <div className="h-full flex flex-col justify-between">
        {/* Main Value */}
        <div className="text-center">
          <div className="text-5xl font-thin mb-2">{currentValue}</div>
          <div className="text-xs opacity-50 uppercase">{label}</div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-1 bg-gray-800 overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs opacity-50">
            <span>{currentValue}/{targetValue}</span>
            <span>{percentage}%</span>
          </div>
        </div>

        {/* Weekly Graph */}
        <div className="grid grid-cols-7 gap-1 mt-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <div key={day} className="text-center">
              <div className="text-[8px] opacity-30 mb-1">{day[0]}</div>
              <div 
                className="h-8 bg-white opacity-20"
                style={{ opacity: 0.1 + (index * 0.1) }}
              />
            </div>
          ))}
        </div>
      </div>
    </BaseWidget>
  );
}
