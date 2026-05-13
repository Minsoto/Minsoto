'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Navigation from '@/components/Navigation';
import ProfileSidebar from '@/app/profile/ProfileSidebar';
import { motion } from 'framer-motion';
import { Settings2, LayoutGrid } from 'lucide-react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Widgets
import TasksWidget from '@/components/widgets/TasksWidget';
import HabitStreakWidget from '@/components/widgets/HabitStreakWidget';
import HabitGraphWidget from '@/components/widgets/HabitGraphWidget';
import InterestsWidget from '@/components/widgets/InterestsWidget';
import ImageWidget from '@/components/widgets/ImageWidget';
import StreakShowcaseWidget from '@/components/widgets/StreakShowcaseWidget';
import TextWidget from '@/components/widgets/TextWidget';
import XPProgressWidget from '@/components/widgets/XPProgressWidget';
import PointsWidget from '@/components/widgets/PointsWidget';
import GoalsWidget from '@/components/dashboard/GoalsWidget';

// The full layout editor modal that already exists
import LayoutEditorModal from '@/app/profile/LayoutEditorModal';

import api from '@/lib/api';
import { toast } from 'sonner';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Widget {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  visibility: 'public' | 'private';
  config: Record<string, unknown>;
}

export default function BoardPage() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  const [widgets, setWidgets] = useState<Widget[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [widgetData, setWidgetData] = useState<any>({ tasks: [], habits: [], interests: [] });
  const [loading, setLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) router.push('/login');
  }, [_hasHydrated, isAuthenticated, router]);

  // Load profile widgets + data
  const fetchBoard = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, widgetDataRes] = await Promise.allSettled([
        api.get('/profile/me/'),
        api.get('/widgets/data/'),
      ]);

      if (profileRes.status === 'fulfilled') {
        const layout = profileRes.value.data.layout;
        setWidgets(layout?.widgets || []);
        setProfile(profileRes.value.data);
      }
      
      if (widgetDataRes.status === 'fulfilled') {
        setWidgetData(widgetDataRes.value.data);
      }
    } catch {
      // silent — partial data is fine
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBoard();
      
      const handleRefresh = () => fetchBoard();
      window.addEventListener('minsoto-global-refresh', handleRefresh);
      return () => window.removeEventListener('minsoto-global-refresh', handleRefresh);
    }
  }, [isAuthenticated, fetchBoard]);

  // Save layout via the profile API
  const handleSave = async (updated: Widget[]) => {
    try {
      await api.patch('/profile/me/layout/', { layout: { widgets: updated } });
      setWidgets(updated);
      toast.success('Board saved');
    } catch {
      toast.error('Failed to save board');
    }
  };

  // Read-only canvas render
  const renderWidget = (widget: Widget) => {
    const commonProps = {
      id: widget.id,
      visibility: widget.visibility,
      isEditMode: false,
      isOwner: true,
      onVisibilityToggle: () => {},
      onDelete: () => {},
      onUpdate: fetchBoard,
    };

    const habits = widgetData.habits || [];

    switch (widget.type) {
      case 'tasks':
        return <TasksWidget {...commonProps} tasks={widgetData.tasks || []} />;
      case 'habit-streak': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const maxCurrent = Math.max(0, ...habits.map((h: any) => h.current_streak || 0));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const maxLongest = Math.max(0, ...habits.map((h: any) => h.longest_streak || 0));
        return <HabitStreakWidget {...commonProps} habits={habits} currentStreak={maxCurrent} longestStreak={maxLongest} />;
      }
      case 'streak-showcase': {
        const selectedHabitId = widget.config?.selectedHabitId as string | undefined;
        return <StreakShowcaseWidget {...commonProps} habits={habits} selectedHabitId={selectedHabitId} />;
      }
      case 'habit-graph':
        return <HabitGraphWidget {...commonProps} />;
      case 'interests':
        return <InterestsWidget {...commonProps} interests={widgetData.interests || []} />;
      case 'image':
        return <ImageWidget {...commonProps} config={widget.config || {}} />;
      case 'text':
        return <TextWidget {...commonProps} config={widget.config || {}} />;
      case 'xp-progress':
        return <XPProgressWidget {...commonProps} />;
      case 'points':
        return <PointsWidget {...commonProps} />;
      case 'goals':
        return <GoalsWidget />;

      default:
        return null;
    }
  };

  const layouts = widgets.map(w => ({
    i: w.id,
    x: w.position.x,
    y: w.position.y,
    w: w.size.w,
    h: w.size.h,
    static: true,
  }));

  const renderSkeleton = () => (
    <div className="min-h-screen bg-black text-white relative selection:bg-[var(--accent-primary)] selection:text-black">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[120px] bg-[var(--accent-primary)] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[150px] bg-[var(--accent-secondary)]" />
      </div>
      <div className="relative z-10">
        <Navigation />
        <div className="h-16" />
        <main className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Skeleton */}
            <div className="w-full lg:w-[340px] shrink-0">
              <div className="glass-panel rounded-2xl h-[400px] animate-pulse bg-white/5" />
            </div>
            {/* Grid Skeleton */}
            <div className="flex-1">
              <div className="glass-panel rounded-2xl h-[600px] animate-pulse bg-white/5" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  if (!_hasHydrated || loading) return renderSkeleton();

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-[var(--accent-primary)] selection:text-black">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[120px] bg-[var(--accent-primary)] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[150px] bg-[var(--accent-secondary)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CgkJPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJub25lIj48L3JlY3Q+CgkJPGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiPjwvY2lyY2xlPgoJPC9zdmc+')] opacity-30" />
      </div>

      <div className="relative z-10">
        <Navigation />
        <div className="h-16" />

      <main className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit">
            {profile && (
              <ProfileSidebar
                user={{
                  ...profile.user,
                  profile_picture_url: profile.profile_picture_url,
                  status: 'online', // Mock or real status
                }}
                stats={profile.stats || { connections: 0, friends: 0 }}
                interests={profile.interests || []}
                isOwner={true}
                onOpenEditor={() => setEditorOpen(true)}
                bannerUrl={profile.banner_url}
                onUpdateBanner={async (url) => {
                  try {
                    await api.patch('/profile/me/', { banner_url: url });
                    fetchBoard();
                  } catch (e) {
                    toast.error('Failed to update banner');
                  }
                }}
                onUpdateAvatar={async (url) => {
                  try {
                    await api.patch('/profile/me/', { profile_picture_url: url });
                    fetchBoard();
                  } catch (e) {
                    toast.error('Failed to update avatar');
                  }
                }}
              />
            )}
          </div>

          {/* Board Area */}
          <div className="flex-1 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 px-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center">
                  <LayoutGrid size={20} className="text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">My Board</h1>
                  <p className="text-sm text-white/50 mt-0.5">
                    Your personal space — widgets, habits, goals, images, everything.
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditorOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-black font-bold text-sm shadow-lg shadow-[var(--accent-primary)]/20 hover:shadow-[var(--accent-primary)]/40 transition-shadow"
              >
                <Settings2 size={16} />
                Customize
              </motion.button>
            </div>

            {/* Widget Canvas */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-48 rounded-3xl glass-panel animate-pulse" />
                ))}
              </div>
            ) : widgets.length > 0 ? (
              <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layouts }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
                rowHeight={160}
                isDraggable={false}
                isResizable={false}
                margin={[20, 20]}
              >
                {widgets.map(widget => {
                  const rendered = renderWidget(widget);
                  if (!rendered) return null;
                  return <div key={widget.id} className="h-full w-full">{rendered}</div>;
                })}
              </ResponsiveGridLayout>
            ) : (
              <div className="mx-4 flex flex-col items-center justify-center h-80 rounded-3xl glass-panel border border-[var(--glass-border)] border-dashed">
                <p className="text-white/40 text-sm mb-4 font-medium">Your board is empty.</p>
                <button
                  onClick={() => setEditorOpen(true)}
                  className="text-sm font-bold text-[var(--accent-primary)] hover:scale-105 transition-transform"
                >
                  + Add widgets
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      </div>

      {/* Full Layout Editor — the original profile editor modal */}
      <LayoutEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        currentWidgets={widgets}
        onSave={handleSave}
        widgetData={widgetData}
      />
    </div>
  );
}
