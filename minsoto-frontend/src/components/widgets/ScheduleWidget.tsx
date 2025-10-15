'use client';

import BaseWidget from './BaseWidget';
import { Circle } from 'lucide-react';

interface ScheduleItem {
  time: string;
  title: string;
  completed?: boolean;
}

interface ScheduleWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  schedule: ScheduleItem[];
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
}

export default function ScheduleWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  schedule,
  onVisibilityToggle,
  onDelete
}: ScheduleWidgetProps) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <BaseWidget
      id={id}
      title="TODAY'S SCHEDULE"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
    >
      <div className="h-full flex flex-col">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-3 text-[10px] opacity-40 text-center">
          {daysOfWeek.map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Schedule Items */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {schedule.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-3 py-2 border-b border-gray-900 last:border-0"
            >
              <span className="text-xs opacity-50 min-w-[50px]">{item.time}</span>
              <span className="text-xs flex-1">{item.title}</span>
              <Circle 
                size={12} 
                className={item.completed ? 'fill-white' : 'opacity-30'} 
              />
            </div>
          ))}
        </div>
      </div>
    </BaseWidget>
  );
}
