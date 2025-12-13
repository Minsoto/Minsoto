'use client';

import BaseWidget from './BaseWidget';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
  label: string;
  currentValue: number;
  previousValue?: number;
  unit?: string;
  change?: number;
}

export default function StatsWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  onVisibilityToggle,
  onDelete,
  label,
  currentValue,
  unit = '',
  change
}: StatsWidgetProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <BaseWidget
      id={id}
      title={label}
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
    >
      <div className="h-full flex flex-col justify-center">
        {/* Main stat */}
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-light">{currentValue}</span>
          {unit && <span className="text-sm opacity-40">{unit}</span>}
        </div>

        {/* Change indicator */}
        {change !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${isPositive ? 'opacity-70' : isNegative ? 'opacity-50' : 'opacity-40'
            }`}>
            {isPositive && <TrendingUp size={12} />}
            {isNegative && <TrendingDown size={12} />}
            <span>
              {isPositive ? '+' : ''}{change}%
            </span>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}
