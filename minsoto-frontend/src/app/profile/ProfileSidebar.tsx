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
}: ProfileSidebarProps & { bannerUrl?: string; onUpdateBanner?: (url: string) => void }) {
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
    <div className="w-full md:w-80 bg-[#090910] border-b md:border-b-0 md:border-r border-white/10 p-8 flex flex-col relative z-20 overflow-hidden">

      {/* BANNER BACKGROUND */}
      {bannerUrl && (
        <div className="absolute top-0 left-0 right-0 h-48 opacity-30 z-0 mask-image-b">
          <Image src={bannerUrl} alt="Banner" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#090910]" />
        </div>
      )}

      {/* Edit Banner Button */}
      {isOwner && (
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={() => setIsEditingBanner(true)}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white/50 hover:text-white transition-colors"
            title="Edit Banner"
          >
            <Edit3 size={14} />
          </button>
        </div>
      )}

      {/* Banner Edit Modal - Simple Overlay */}
      {isEditingBanner && (
        <div className="absolute inset-0 bg-[#090910]/95 z-50 flex flex-col items-center justify-center p-6 text-center">
          <h3 className="text-sm font-bold text-white mb-4">Set Banner Image</h3>
          <input
            type="text"
            value={newBannerUrl}
            onChange={(e) => setNewBannerUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none mb-4"
          />
          <div className="flex gap-2 w-full">
            <button onClick={() => setIsEditingBanner(false)} className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 text-sm">
              Cancel
            </button>
            <button onClick={handleSaveBanner} className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium">
              Save
            </button>
          </div>
        </div>
      )}

      {/* Profile Avatar */}
      <div className="relative mb-6 self-center md:self-start group z-10 mt-12 md:mt-0">
        <div className="w-24 h-24 rounded-full border-2 border-white/10 flex items-center justify-center overflow-hidden bg-white/5 relative shadow-2xl">
          {user.profile_picture_url ? (
            <Image
              src={user.profile_picture_url}
              alt={user.username}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-3xl font-light text-white/50 group-hover:text-white/80 transition-colors">
              {getDisplayChar()}
            </span>
          )}
        </div>

        {/* Profile Pic Edit Hint (Optional) */}
        {isOwner && (
          <div className="absolute -bottom-1 -right-1 bg-cyan-600 rounded-full p-1.5 cursor-pointer hover:scale-110 transition-transform">
            <Edit3 size={12} className="text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="text-center md:text-left mb-8 z-10">
        <h2 className="text-xl font-bold text-white mb-1">
          {user.first_name} {user.last_name}
        </h2>
        <div className="text-sm font-mono text-cyan-400 opacity-70">@{user.username}</div>
        {/* Placeholder for Bio */}
        <p className="text-white/40 text-sm mt-3 leading-relaxed line-clamp-3">
          {/* Bio would be passed here if available, currently mostly empty */}
          mindful productivity enthusiast. building something new.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-8 justify-center md:justify-start z-10">
        <div className="text-center md:text-left">
          <div className="text-2xl font-light text-white">{stats.connections}</div>
          <div className="text-[10px] tracking-widest text-white/30 uppercase mt-1">Connections</div>
        </div>
        <div className="text-center md:text-left">
          <div className="text-2xl font-light text-white">{stats.friends}</div>
          <div className="text-[10px] tracking-widest text-white/30 uppercase mt-1">Friends</div>
        </div>
      </div>

      <div className="h-px bg-white/10 mb-8 z-10" />

      {/* Interests */}
      {interests.length > 0 && (
        <div className="mb-8 z-10">
          <h3 className="text-[10px] tracking-widest text-white/40 mb-4 uppercase">Interests</h3>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            {interests.map((interest) => (
              <span
                key={interest.id}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
              >
                {interest.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto pt-8 z-10">
        {isOwner ? (
          <button
            onClick={onOpenEditor}
            className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-all flex items-center justify-center gap-2 group"
          >
            <Edit3 size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            Customize Layout
          </button>
        ) : (
          <button
            onClick={onSendMessage}
            className="w-full py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-sm font-medium text-blue-400 transition-all flex items-center justify-center gap-2"
          >
            <MessageSquare size={16} />
            Send Message
          </button>
        )}
      </div>
    </div>
  );
}
