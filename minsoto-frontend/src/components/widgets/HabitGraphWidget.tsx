'use client';

import BaseWidget from './BaseWidget';

interface HabitGraphWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  data?: number[]; // Array of activity levels (0-4) for last 12 weeks
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
}

export default function HabitGraphWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  data = [],
  onVisibilityToggle,
  onDelete
}: HabitGraphWidgetProps) {
  // Generate mock data if none provided (12 weeks * 7 days = 84 days)
  const graphData = data.length > 0 ? data : Array.from({ length: 84 }, () =>
    Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0
  );

  // Split into weeks (7 days each)
  const weeks: number[][] = [];
  for (let i = 0; i < graphData.length; i += 7) {
    weeks.push(graphData.slice(i, i + 7));
  }

  // Calculate stats
  const totalContributions = graphData.reduce((a, b) => a + (b > 0 ? 1 : 0), 0);
  const currentStreak = (() => {
    let streak = 0;
    for (let i = graphData.length - 1; i >= 0; i--) {
      if (graphData[i] > 0) streak++;
      else break;
    }
    return streak;
  })();

  const days = ['', 'M', '', 'W', '', 'F', ''];

  return (
    <BaseWidget
      id={id}
      title="Activity"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
      accent="green"
    >
      <div className="h-full flex flex-col">
        {/* Stats Row */}
        <div className="flex items-center gap-6 mb-4">
          <div>
            <span className="text-2xl font-light">{totalContributions}</span>
            <span className="text-xs text-white/50 ml-1">Total</span>
          </div>
          <div>
            <span className="text-2xl font-light">{currentStreak}</span>
            <span className="text-xs text-white/50 ml-1">Best</span>
          </div>
        </div>

        {/* Graph Grid */}
        <div className="flex gap-1 flex-1">
          {/* Day labels */}
          <div className="flex flex-col justify-around text-[10px] text-white/30 pr-1">
            {days.map((day, i) => (
              <span key={i}>{day}</span>
            ))}
          </div>

          {/* Contribution grid */}
          <div className="flex gap-[3px] overflow-x-auto">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((level, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`contrib-cell contrib-${level}`}
                    style={{
                      background: level === 0
                        ? 'rgba(34, 197, 94, 0.1)'
                        : `rgba(34, 197, 94, ${0.2 + level * 0.2})`
                    }}
                    title={`Activity level: ${level}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-3 text-[10px] text-white/40">
          <span>Less</span>
          <div className="flex gap-[2px]">
            {[0, 1, 2, 3, 4].map(level => (
              <div
                key={level}
                className="w-2.5 h-2.5 rounded-sm"
                style={{
                  background: level === 0
                    ? 'rgba(34, 197, 94, 0.1)'
                    : `rgba(34, 197, 94, ${0.2 + level * 0.2})`
                }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </BaseWidget>
  );
}
