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
  change?: number; // Percentage change
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
  change = 0,
  onVisibilityToggle,
  onDelete
}: StatsWidgetProps) {
  const percentage = Math.round((currentValue / targetValue) * 100);
  const isPositive = change >= 0;

  return (
    <BaseWidget
      id={id}
      title="Stats"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
      accent="blue"
    >
      <div className="h-full flex flex-col justify-between">
        {/* Main Value */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="stat-value text-white mb-1">{currentValue}</div>
          <div className="text-sm text-white/50 uppercase tracking-wide">{label}</div>

          {/* Change indicator */}
          {change !== 0 && (
            <div className={`text-xs mt-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{change}% from last week
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-white/40">
            <span>{currentValue}/{targetValue}</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </BaseWidget>
  );
}
