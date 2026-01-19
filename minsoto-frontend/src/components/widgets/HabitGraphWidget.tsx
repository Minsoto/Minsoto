'use client';

import BaseWidget from './BaseWidget';

interface HabitGraphWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
  data?: number[];
}

export default function HabitGraphWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  onVisibilityToggle,
  onDelete
}: HabitGraphWidgetProps) {
  // Generate sample activity data (7 rows x 12 weeks)
  const weeks = Array(12).fill(null).map(() =>
    Array(7).fill(null).map(() => Math.floor(Math.random() * 5))
  );

  const totalContributions = weeks.flat().reduce((a, b) => a + b, 0);
  const dayLabels = ['M', '', 'W', '', 'F', '', ''];

  return (
    <BaseWidget
      id={id}
      title="Activity"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
    >
      <div className="h-full flex flex-col">
        {/* Stats row */}
        <div className="flex gap-6 mb-4 text-xs">
          <div>
            <span className="opacity-40">Total: </span>
            <span>{totalContributions}</span>
          </div>
        </div>

        {/* Grid */}
        <div className="flex gap-1 flex-1">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] text-[9px] opacity-30 pr-1">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-[12px] flex items-center">{label}</div>
            ))}
          </div>

          {/* Contribution grid */}
          <div className="flex gap-[3px] overflow-x-auto">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((level, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="w-[12px] h-[12px]"
                    style={{
                      background: level === 0
                        ? 'rgba(255, 255, 255, 0.05)'
                        : `rgba(255, 255, 255, ${0.1 + level * 0.2})`
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 text-[10px] opacity-40">
          <span>Less</span>
          <div className="flex gap-[2px]">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className="w-[10px] h-[10px]"
                style={{ background: `rgba(255, 255, 255, ${0.05 + level * 0.2})` }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </BaseWidget>
  );
}
