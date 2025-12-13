'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';

import Navigation from '@/components/Navigation';
import ProfileSidebar from '@/app/profile/ProfileSidebar';
import ProfileCanvas from '@/app/profile/ProfileCanvas';
import LayoutEditorModal from '@/app/profile/LayoutEditorModal';

interface ProfileData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  profile: any;
  is_owner: boolean;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [widgetData, setWidgetData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const username = params.username as string;

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get(`/profile/${username}/`);
      setProfileData(response.data);
    } catch (error) {
      console.error('Failed to fetch profile', error);
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const fetchWidgetData = useCallback(async () => {
    try {
      const response = await api.get('/widgets/data/');
      setWidgetData(response.data);
    } catch (error) {
      console.error('Failed to fetch widget data', error);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSaveLayout = async (updatedWidgets: any[]) => {
    if (!profileData?.is_owner) return;
    try {
      const newLayout = { widgets: updatedWidgets };
      await api.patch('/profile/me/layout/', { layout: newLayout });

      // Update local state
      setProfileData(prev => prev ? {
        ...prev,
        profile: { ...prev.profile, layout: newLayout }
      } : null);
    } catch (error) {
      console.error('Failed to save layout:', error);
    }
  };

  const handleUpdateBanner = async (url: string) => {
    try {
      await api.patch('/profile/me/', { banner_url: url });
      setProfileData(prev => prev ? {
        ...prev,
        profile: { ...prev.profile, banner_url: url }
      } : null);
    } catch (error) {
      console.error('Failed to update banner:', error);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white"><div className="animate-spin w-8 h-8 border-2 border-cyan-500 rounded-full border-t-transparent" /></div>;
  if (!profileData) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Profile not found</div>;

  const { profile, is_owner } = profileData;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />

      <div className="flex flex-col md:flex-row min-h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <ProfileSidebar
          user={profile.user}
          stats={profile.stats}
          interests={profile.interests}
          isOwner={is_owner}
          onOpenEditor={() => setIsEditorOpen(true)}
          bannerUrl={profile.banner_url}
          onUpdateBanner={handleUpdateBanner}
        />

        {/* Main Canvas View */}
        <div className="flex-1 bg-[#050508] relative">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />

          <ProfileCanvas
            widgets={profile.layout?.widgets || []}
            widgetData={widgetData}
            isOwner={is_owner}
          />
        </div>
      </div>

      {/* Editor Modal */}
      {is_owner && (
        <LayoutEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          currentWidgets={profile.layout?.widgets || []}
          onSave={handleSaveLayout}
          widgetData={widgetData}
        />
      )}
    </div>
  );
}
