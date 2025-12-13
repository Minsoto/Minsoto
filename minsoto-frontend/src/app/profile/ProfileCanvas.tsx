'use client';

import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import TasksWidget from '../../components/widgets/TasksWidget';
import HabitStreakWidget from '../../components/widgets/HabitStreakWidget';
import HabitGraphWidget from '../../components/widgets/HabitGraphWidget';
import InterestsWidget from '../../components/widgets/InterestsWidget';
import ImageWidget from '../../components/widgets/ImageWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Note: Widget interfaces kept consistent
interface Widget {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  visibility: 'public' | 'private';
  config: Record<string, unknown>;
}

interface ProfileCanvasProps {
  widgets: Widget[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  widgetData: any;
  isOwner: boolean;
}

export default function ProfileCanvas({
  widgets,
  widgetData,
  isOwner
}: ProfileCanvasProps) {
  // Read-only layouts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layouts = widgets.map((widget: any) => ({
    i: widget.id,
    x: widget.position.x,
    y: widget.position.y,
    w: widget.size.w,
    h: widget.size.h,
    static: true // Always static in view mode
  }));

  const renderWidget = (widget: Widget) => {
    // In view mode, no edit controls
    const commonProps = {
      id: widget.id,
      visibility: widget.visibility,
      isEditMode: false,
      isOwner: isOwner,
      // Pass handlers that do nothing in view mode or aren't needed
      onVisibilityToggle: () => { },
      onDelete: () => { }
    };

    // Filter private widgets for non-owners
    if (widget.visibility === 'private' && !isOwner) {
      return null;
    }

    switch (widget.type) {
      case 'tasks': return <TasksWidget {...commonProps} tasks={widgetData.tasks || []} />;
      case 'habit-streak': {
        const habits = widgetData.habits || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const maxCurrent = Math.max(0, ...habits.map((h: any) => h.current_streak || 0));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const maxLongest = Math.max(0, ...habits.map((h: any) => h.longest_streak || 0));
        return <HabitStreakWidget {...commonProps} habits={habits} currentStreak={maxCurrent} longestStreak={maxLongest} />;
      }
      case 'habit-graph': return <HabitGraphWidget {...commonProps} />;
      case 'interests': return <InterestsWidget {...commonProps} interests={widgetData.interests || []} />;
      case 'image': return <ImageWidget {...commonProps} config={widget.config || {}} />;
      default: return null;
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-hidden">
      {widgets.length > 0 ? (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layouts }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
          rowHeight={160}
          isDraggable={false}
          isResizable={false}
          margin={[20, 20]} // increased gutter
        >
          {widgets.map((widget) => {
            const rendered = renderWidget(widget);
            if (!rendered) return null;
            return (
              <div key={widget.id}>
                {rendered}
              </div>
            );
          })}
        </ResponsiveGridLayout>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/5 rounded-3xl m-8">
          <p className="text-white/30 text-sm">No public widgets enabled</p>
        </div>
      )}
    </div>
  );
}
