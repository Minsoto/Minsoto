'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Edit3, MessageSquare, AlertTriangle, Camera } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

interface ProfileSidebarProps {
  user: {
    username: string;
    profile_picture_url?: string;
    first_name?: string;
    last_name?: string;
    status?: 'online' | 'idle' | 'focus' | 'dnd' | 'offline';
    status_message?: string;
  };
  stats: {
    connections: number;
    friends: number;
  };
  interests: { id: string; name: string }[];
  isOwner: boolean;
  onSendMessage?: () => void;
  onOpenEditor?: () => void;
  bannerUrl?: string;
  onUpdateBanner?: (url: string) => void;
  onUpdateAvatar?: (url: string) => void;
}

// URL validation helper
const isValidImageUrl = (urlString: string): boolean => {
  if (!urlString) return true; // Empty is valid (clears the image)
  try {
    const urlObj = new URL(urlString);
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const hasValidExtension = validExtensions.some(ext =>
      urlObj.pathname.toLowerCase().endsWith(ext)
    );
    const isImageService = urlString.includes('imgur.com') ||
      urlString.includes('cloudinary.com') ||
      urlString.includes('unsplash.com') ||
      urlString.includes('pexels.com') ||
      urlString.includes('giphy.com') ||
      urlString.includes('tenor.com') ||
      urlString.includes('googleusercontent.com') ||
      urlString.includes('githubusercontent.com');
    return hasValidExtension || isImageService || urlObj.protocol === 'data:';
  } catch {
    return false;
  }
};

export default function ProfileSidebar({
  user,
  stats,
  interests,
  isOwner,
  onSendMessage,
  onOpenEditor,
  bannerUrl,
  onUpdateBanner,
  onUpdateAvatar
}: ProfileSidebarProps) {
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [newBannerUrl, setNewBannerUrl] = useState(bannerUrl || '');
  const [newAvatarUrl, setNewAvatarUrl] = useState(user.profile_picture_url || '');
  const [bannerError, setBannerError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [avatarUrlError, setAvatarUrlError] = useState('');

  const getDisplayChar = () => {
    if (user.first_name) return user.first_name[0].toUpperCase();
    return user.username[0].toUpperCase();
  };

  const handleSaveBanner = () => {
    if (newBannerUrl && !isValidImageUrl(newBannerUrl)) {
      setUrlError('Unsupported link. Please use a valid image URL.');
      return;
    }
    setUrlError('');
    setBannerError(false);
    onUpdateBanner?.(newBannerUrl);
    setIsEditingBanner(false);
  };

  const handleSaveAvatar = () => {
    if (newAvatarUrl && !isValidImageUrl(newAvatarUrl)) {
      setAvatarUrlError('Unsupported link. Please use a valid image URL.');
      return;
    }
    setAvatarUrlError('');
    setAvatarError(false);
    onUpdateAvatar?.(newAvatarUrl);
    setIsEditingAvatar(false);
  };

  return (
    <div className="w-full lg:w-[340px] p-6 flex flex-col gap-6">
      {/* Profile Card */}
      <div className="glass-panel rounded-2xl overflow-hidden relative">
        {/* Banner */}
        <div className="h-24 relative bg-gradient-to-br from-white/10 to-white/5">
          {bannerUrl && !bannerError ? (
            bannerUrl.toLowerCase().includes('.gif') ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bannerUrl}
                alt="Banner"
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setBannerError(true)}
              />
            ) : (
              <Image
                src={bannerUrl}
                alt="Banner"
                fill
                className="object-cover"
                onError={() => setBannerError(true)}
              />
            )
          ) : bannerError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle size={20} className="text-red-400 mx-auto mb-1" />
                <p className="text-red-400 text-xs">Unsupported link</p>
              </div>
            </div>
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--glass-bg)] to-transparent" />

          {/* Edit Banner Button */}
          {isOwner && (
            <button
              onClick={() => setIsEditingBanner(true)}
              className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/60 hover:text-white transition-all"
              title="Edit Banner"
            >
              <Edit3 size={12} />
            </button>
          )}
        </div>

        {/* Avatar - overlapping banner */}
        <div className="px-5 -mt-10 relative z-10">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full border-4 border-[var(--background)] bg-[var(--glass-bg)] flex items-center justify-center overflow-hidden">
              {user.profile_picture_url && !avatarError ? (
                user.profile_picture_url.toLowerCase().includes('.gif') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.profile_picture_url}
                    alt={user.username}
                    className="w-full h-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <Image
                    src={user.profile_picture_url}
                    alt={user.username}
                    fill
                    className="object-cover"
                    onError={() => setAvatarError(true)}
                  />
                )
              ) : avatarError ? (
                <AlertTriangle size={24} className="text-red-400" />
              ) : (
                <span className="text-2xl font-light text-white/60">
                  {getDisplayChar()}
                </span>
              )}
            </div>

            {/* Edit Avatar Button */}
            {isOwner && (
              <button
                onClick={() => setIsEditingAvatar(true)}
                className="absolute inset-0 w-20 h-20 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                title="Change Photo"
              >
                <Camera size={20} className="text-white" />
              </button>
            )}

            {/* Status Badge */}
            <div className="absolute bottom-0 right-0">
              <StatusBadge status={user.status || 'offline'} size="md" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="px-5 pt-3 pb-5">
          <h2 className="text-lg font-semibold text-white">
            {user.first_name} {user.last_name}
          </h2>
          <p className="text-sm text-white/40">@{user.username}</p>
          {user.status_message && (
            <p className="text-xs text-white/50 mt-1 italic">{user.status_message}</p>
          )}

          {/* Bio placeholder */}
          <p className="text-sm text-white/50 mt-3 leading-relaxed line-clamp-2">
            Mindful productivity enthusiast. Building something new.
          </p>

          {/* Stats Row */}
          <div className="flex gap-6 mt-4 pt-4 border-t border-white/10">
            <div>
              <div className="text-lg font-semibold text-white">{stats.connections}</div>
              <div className="text-xs text-white/40">Connections</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{stats.friends}</div>
              <div className="text-xs text-white/40">Friends</div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5">
            {isOwner ? (
              <button
                onClick={onOpenEditor}
                className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-white/80 transition-all flex items-center justify-center gap-2"
              >
                <Edit3 size={14} />
                Customize Layout
              </button>
            ) : (
              <button
                onClick={onSendMessage}
                className="w-full py-2.5 rounded-lg btn-primary text-sm flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} />
                Send Message
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Interests Card */}
      {interests.length > 0 && (
        <div className="glass-panel rounded-xl p-5">
          <h3 className="text-xs font-medium text-white/40 uppercase tracking-wide mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest.id}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70"
              >
                {interest.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Banner Edit Modal */}
      {isEditingBanner && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="glass-panel rounded-xl p-6 w-full max-w-md">
            <h3 className="text-sm font-semibold text-white mb-4">Set Banner Image</h3>
            <input
              type="text"
              value={newBannerUrl}
              onChange={(e) => { setNewBannerUrl(e.target.value); setUrlError(''); }}
              placeholder="https://... (.jpg, .png, .gif, .webp)"
              className="input mb-2"
            />
            <p className="text-[10px] text-white/40 mb-2">Supported: jpg, png, gif, webp, svg</p>
            {urlError && (
              <div className="flex items-center gap-2 mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertTriangle size={14} className="text-red-400" />
                <p className="text-red-400 text-xs">{urlError}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setIsEditingBanner(false); setUrlError(''); }}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBanner}
                className="flex-1 btn btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Edit Modal */}
      {isEditingAvatar && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6">
          <div className="glass-panel rounded-xl p-6 w-full max-w-md">
            <h3 className="text-sm font-semibold text-white mb-4">Set Profile Picture</h3>
            <input
              type="text"
              value={newAvatarUrl}
              onChange={(e) => { setNewAvatarUrl(e.target.value); setAvatarUrlError(''); }}
              placeholder="https://... (.jpg, .png, .gif, .webp)"
              className="input mb-2"
            />
            <p className="text-[10px] text-white/40 mb-2">Supported: jpg, png, gif, webp, svg</p>
            {avatarUrlError && (
              <div className="flex items-center gap-2 mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertTriangle size={14} className="text-red-400" />
                <p className="text-red-400 text-xs">{avatarUrlError}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setIsEditingAvatar(false); setAvatarUrlError(''); }}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAvatar}
                className="flex-1 btn btn-primary"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
