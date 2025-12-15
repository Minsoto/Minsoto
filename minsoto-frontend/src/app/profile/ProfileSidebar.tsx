'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Edit3, MessageSquare } from 'lucide-react';

interface ProfileSidebarProps {
  user: {
    username: string;
    profile_picture_url?: string;
    first_name?: string;
    last_name?: string;
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
}

export default function ProfileSidebar({
  user,
  stats,
  interests,
  isOwner,
  onSendMessage,
  onOpenEditor,
  bannerUrl,
  onUpdateBanner
}: ProfileSidebarProps) {
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const [newBannerUrl, setNewBannerUrl] = useState(bannerUrl || '');

  const getDisplayChar = () => {
    if (user.first_name) return user.first_name[0].toUpperCase();
    return user.username[0].toUpperCase();
  };

  const handleSaveBanner = () => {
    onUpdateBanner?.(newBannerUrl);
    setIsEditingBanner(false);
  };

  return (
    <div className="w-full lg:w-[340px] p-6 flex flex-col gap-6">
      {/* Profile Card */}
      <div className="glass-panel rounded-2xl overflow-hidden relative">
        {/* Banner */}
        <div className="h-24 relative bg-gradient-to-br from-white/10 to-white/5">
          {bannerUrl && (
            <Image
              src={bannerUrl}
              alt="Banner"
              fill
              className="object-cover"
            />
          )}
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
          <div className="w-20 h-20 rounded-full border-4 border-[var(--background)] bg-[var(--glass-bg)] flex items-center justify-center overflow-hidden">
            {user.profile_picture_url ? (
              <Image
                src={user.profile_picture_url}
                alt={user.username}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-2xl font-light text-white/60">
                {getDisplayChar()}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="px-5 pt-3 pb-5">
          <h2 className="text-lg font-semibold text-white">
            {user.first_name} {user.last_name}
          </h2>
          <p className="text-sm text-white/40">@{user.username}</p>

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
              onChange={(e) => setNewBannerUrl(e.target.value)}
              placeholder="https://..."
              className="input mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setIsEditingBanner(false)}
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
    </div>
  );
}
