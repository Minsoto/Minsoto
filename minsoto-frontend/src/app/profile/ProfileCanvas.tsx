'use client';

import { useCallback } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import TasksWidget from '../../components/widgets/TasksWidget';
import HabitStreakWidget from '../../components/widgets/HabitStreakWidget';
import HabitGraphWidget from '../../components/widgets/HabitGraphWidget';
import InterestsWidget from '../../components/widgets/InterestsWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Widget {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  visibility: 'public' | 'private';
  config: Record<string, unknown>;
}

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed';
}

interface Habit {
  id: string;
  name: string;
  time?: string;
}

interface Interest {
  id: string;
  name: string;
}

interface WidgetData {
  tasks?: Task[];
  habits?: Habit[];
  habitGraphData?: boolean[];
  interests?: Interest[];
}

interface ProfileCanvasProps {
  widgets: Widget[];
  isEditMode: boolean;
  isOwner: boolean;
  widgetData: WidgetData;
  onLayoutChange: (widgets: Widget[]) => void;
  onWidgetVisibilityToggle: (widgetId: string) => void;
  onWidgetDelete: (widgetId: string) => void;
}

export default function ProfileCanvas({
  widgets,
  isEditMode,
  isOwner,
  widgetData,
  onLayoutChange,
  onWidgetVisibilityToggle,
  onWidgetDelete
}: ProfileCanvasProps) {
  // Convert widgets to react-grid-layout format
  const layouts = widgets.map(widget => ({
    i: widget.id,
    x: widget.position.x,
    y: widget.position.y,
    w: widget.size.w,
    h: widget.size.h,
    minW: 1,
    minH: 1,
    maxW: 4,
    maxH: 4,
    static: !isEditMode || !isOwner
  }));

  const handleLayoutChange = useCallback((layout: Layout[]) => {
    if (!isEditMode || !isOwner) return;

    const updatedWidgets = widgets.map(widget => {
      const layoutItem = layout.find(l => l.i === widget.id);
      if (layoutItem) {
        return {
          ...widget,
          position: { x: layoutItem.x, y: layoutItem.y },
          size: { w: layoutItem.w, h: layoutItem.h }
        };
      }
      return widget;
    });

    onLayoutChange(updatedWidgets);
  }, [widgets, isEditMode, isOwner, onLayoutChange]);

  const renderWidget = (widget: Widget) => {
    const commonProps = {
      id: widget.id,
      visibility: widget.visibility,
      isEditMode,
      isOwner,
      onVisibilityToggle: () => onWidgetVisibilityToggle(widget.id),
      onDelete: () => onWidgetDelete(widget.id)
    };

    switch (widget.type) {
      case 'tasks':
        return (
          <TasksWidget
            {...commonProps}
            tasks={widgetData.tasks || []}
          />
        );

      case 'habit-streak':
        return (
          <HabitStreakWidget
            {...commonProps}
            habits={widgetData.habits || []}
            currentStreak={12}
            longestStreak={38}
          />
        );

      case 'habit-graph':
        return (
          <HabitGraphWidget
            {...commonProps}
            data={[]}
          />
        );

      case 'interests':
        return (
          <InterestsWidget
            {...commonProps}
            interests={widgetData.interests || []}
            extensions={[
              { name: 'Circle Chat', description: 'Habit Tracker' },
              { name: 'Active% Tracker', description: 'Project Stats' }
            ]}
          />
        );

      default:
        return (
          <div className="h-full flex items-center justify-center text-xs opacity-50">
            Unknown widget type: {widget.type}
          </div>
        );
    }
  };

  return (
    <div className="flex-1 bg-[#0d0d12] p-6 overflow-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs tracking-wider text-white/60 uppercase">Profile Canvas</h2>
          {isEditMode && isOwner && (
            <span className="text-xs text-purple-400/70">Edit Mode Active</span>
          )}
        </div>
        <div className="h-px bg-white/10 mt-2" />
      </div>

      {/* Grid Layout */}
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layouts }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
        rowHeight={200}
        isDraggable={isEditMode && isOwner}
        isResizable={isEditMode && isOwner}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".cursor-move"
        compactType="vertical"
        preventCollision={false}
      >
        {widgets.map(widget => (
          <div key={widget.id} className="widget-container">
            {renderWidget(widget)}
          </div>
        ))}
      </ResponsiveGridLayout>

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <div className="text-6xl font-thin opacity-10 mb-4">空</div>
          <p className="text-sm opacity-50">No widgets yet</p>
          <p className="text-xs opacity-30 mt-2">
            {isOwner ? 'Click + to add widgets' : 'This profile is empty'}
          </p>
        </div>
      )}
    </div>
  );
}
