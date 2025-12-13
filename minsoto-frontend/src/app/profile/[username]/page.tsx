'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, Grid3x3, Palette, Edit3, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';

import Navigation from '@/components/Navigation';
import ProfileSidebar from '@/app/profile/ProfileSidebar';
import ProfileCanvas from '@/app/profile/ProfileCanvas';
import WidgetLibrary from '@/app/profile/WidgetLibrary';

interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Interest {
  id: string;
  name: string;
}

interface Widget {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  visibility: 'public' | 'private';
  config: Record<string, unknown>;
}

interface Stats {
  connections: number;
  friends: number;
}

interface Profile {
  id: string;
  user: User;
  bio: string;
  profile_picture_url: string;
  theme: string;
  layout: {
    widgets: Widget[];
  } | null;
  interests: Interest[];
  stats: Stats;
}

interface ProfileData {
  profile: Profile;
  is_owner: boolean;
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

interface WidgetData {
  tasks?: Task[];
  habits?: Habit[];
  habitGraphData?: boolean[];
  interests?: Interest[];
}

interface WidgetTemplate {
  type: string;
  name: string;
  description: string;
  defaultSize: { w: number; h: number };
  icon: string;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false);
  const [widgetData, setWidgetData] = useState<WidgetData>({});
  const [loading, setLoading] = useState(true);

  const username = params.username as string;

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get(`/profile/${username}/`);
      setProfileData(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const fetchWidgetData = useCallback(async () => {
    try {
      const response = await api.get('/widgets/data/');
      setWidgetData(response.data);
    } catch (error) {
      console.error('Failed to fetch widget data:', error);
    }
  }, []);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchProfile();
    fetchWidgetData();
  }, [username, isAuthenticated, router, fetchProfile, fetchWidgetData, _hasHydrated]);

  const handleLayoutChange = useCallback(async (updatedWidgets: Widget[]) => {
    if (!profileData?.is_owner) return;

    const newLayout = {
      widgets: updatedWidgets
    };

    try {
      await api.patch('/profile/me/layout/', { layout: newLayout });

      setProfileData(prev => prev ? {
        ...prev,
        profile: {
          ...prev.profile,
          layout: newLayout
        }
      } : null);
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  }, [profileData?.is_owner]);

  const handleWidgetVisibilityToggle = useCallback(async (widgetId: string) => {
    if (!profileData?.is_owner) return;

    const currentWidgets = profileData.profile.layout?.widgets || [];
    const updatedWidgets = currentWidgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, visibility: widget.visibility === 'public' ? 'private' as const : 'public' as const }
        : widget
    );

    handleLayoutChange(updatedWidgets);
  }, [profileData, handleLayoutChange]);

  const handleWidgetDelete = useCallback(async (widgetId: string) => {
    if (!profileData?.is_owner) return;

    const currentWidgets = profileData.profile.layout?.widgets || [];
    const updatedWidgets = currentWidgets.filter(
      widget => widget.id !== widgetId
    );

    handleLayoutChange(updatedWidgets);
  }, [profileData, handleLayoutChange]);

  const handleAddWidget = useCallback((template: WidgetTemplate) => {
    if (!profileData?.is_owner) return;

    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: template.type,
      position: { x: 0, y: Infinity },
      size: template.defaultSize,
      visibility: 'public',
      config: {}
    };

    const currentWidgets = profileData.profile.layout?.widgets || [];
    const updatedWidgets = [...currentWidgets, newWidget];

    handleLayoutChange(updatedWidgets);
  }, [profileData, handleLayoutChange]);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-white animate-spin" style={{ borderRadius: '50% 0 50% 0' }} />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-6xl font-thin opacity-20 mb-4">404</div>
          <p className="text-sm opacity-50">Profile not found</p>
        </div>
      </div>
    );
  }

  const { profile, is_owner } = profileData;

  return (
    <div className="min-h-screen bg-[#0d0d12] text-white">
      {/* Top Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <ProfileSidebar
          user={profile.user}
          stats={profile.stats}
          interests={profile.interests}
          isOwner={is_owner}
        />

        {/* Canvas */}
        <ProfileCanvas
          widgets={profile.layout?.widgets || []}
          isEditMode={isEditMode}
          isOwner={is_owner}
          widgetData={widgetData}
          onLayoutChange={handleLayoutChange}
          onWidgetVisibilityToggle={handleWidgetVisibilityToggle}
          onWidgetDelete={handleWidgetDelete}
        />

        {/* Floating Actions */}
        {is_owner && (
          <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
            {/* Add Widget */}
            <button
              onClick={() => setIsWidgetLibraryOpen(true)}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              title="Add Widget"
            >
              <Plus size={24} />
            </button>

            {/* Edit Mode Toggle */}
            <button
              onClick={toggleEditMode}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg ${isEditMode
                ? 'bg-green-500 text-black'
                : 'bg-black border border-white text-white'
                }`}
              title={isEditMode ? 'Save Layout' : 'Edit Mode'}
            >
              {isEditMode ? <Save size={20} /> : <Edit3 size={20} />}
            </button>

            {/* Grid View */}
            <button
              className="w-12 h-12 rounded-full bg-black border border-white flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors shadow-lg"
              title="Grid View"
            >
              <Grid3x3 size={20} />
            </button>

            {/* Theme Customization */}
            <button
              className="w-12 h-12 rounded-full bg-black border border-white flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors shadow-lg"
              title="Theme Customization"
            >
              <Palette size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Widget Library Drawer */}
      <WidgetLibrary
        isOpen={isWidgetLibraryOpen}
        onClose={() => setIsWidgetLibraryOpen(false)}
        onAddWidget={handleAddWidget}
      />
    </div>
  );
}
