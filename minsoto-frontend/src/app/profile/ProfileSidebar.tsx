'use client';

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
  onOpenEditor
}: ProfileSidebarProps) {
  const getDisplayChar = () => {
    if (user.first_name) return user.first_name[0].toUpperCase();
    return user.username[0].toUpperCase();
  };

  return (
    <div className="w-full md:w-80 bg-[#090910] border-b md:border-b-0 md:border-r border-white/10 p-8 flex flex-col relative z-20">

      {/* Profile Avatar */}
      <div className="relative mb-6 self-center md:self-start group">
        <div className="w-24 h-24 rounded-full border-2 border-white/10 flex items-center justify-center overflow-hidden bg-white/5 relative">
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
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Info */}
      <div className="text-center md:text-left mb-8">
        <h2 className="text-xl font-bold text-white mb-1">
          {user.first_name} {user.last_name}
        </h2>
        <div className="text-sm font-mono text-cyan-400 opacity-70">@{user.username}</div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-8 justify-center md:justify-start">
        <div className="text-center md:text-left">
          <div className="text-2xl font-light text-white">{stats.connections}</div>
          <div className="text-[10px] tracking-widest text-white/30 uppercase mt-1">Connections</div>
        </div>
        <div className="text-center md:text-left">
          <div className="text-2xl font-light text-white">{stats.friends}</div>
          <div className="text-[10px] tracking-widest text-white/30 uppercase mt-1">Friends</div>
        </div>
      </div>

      <div className="h-px bg-white/10 mb-8" />

      {/* Interests */}
      {interests.length > 0 && (
        <div className="mb-8">
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
      <div className="mt-auto pt-8">
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
