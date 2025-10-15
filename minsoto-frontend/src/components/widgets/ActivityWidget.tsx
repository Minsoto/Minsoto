'use client';

import BaseWidget from './BaseWidget';

interface ActivityData {
  posts: number;
  circles: number;
  engagements: number;
  weeklyEngagement: number;
}

interface ActivityWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  data: ActivityData;
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
}

export default function ActivityWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  data,
  onVisibilityToggle,
  onDelete
}: ActivityWidgetProps) {
  return (
    <BaseWidget
      id={id}
      title="DAILY ACTIVITY"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
    >
      <div className="h-full flex flex-col gap-4">
        {/* Metrics */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs opacity-50">Posts Made</span>
            <div className="flex items-center gap-2">
              <span className="text-sm">{data.posts}</span>
              <div className="text-xs opacity-30">20.86</div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs opacity-50">Circles Joined</span>
            <span className="text-sm">{data.circles}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs opacity-50">Engagements</span>
            <span className="text-sm">{data.engagements}</span>
          </div>
        </div>

        {/* Visual Graph */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-end justify-around">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white rounded-full"
                style={{
                  height: `${Math.random() * 100}%`,
                  opacity: 0.1 + Math.random() * 0.3
                }}
              />
            ))}
          </div>
          <div className="absolute bottom-0 right-0 text-xs opacity-50">
            Weekly Engagement
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full py-2 border border-white border-opacity-20 text-xs tracking-wider hover:bg-white hover:bg-opacity-5 transition-colors">
          SEAT GB METHOD
        </button>
      </div>
    </BaseWidget>
  );
}
