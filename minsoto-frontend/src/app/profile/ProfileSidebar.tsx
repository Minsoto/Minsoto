'use client';

import { User, Users, MessageCircle } from 'lucide-react';

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
}

export default function ProfileSidebar({
  user,
  stats,
  interests,
  isOwner,
  onSendMessage
}: ProfileSidebarProps) {
  // Get initials or kanji character
  const getDisplayChar = () => {
    if (user.first_name) {
      return user.first_name[0].toUpperCase();
    }
    return user.username[0].toUpperCase();
  };

  return (
    <div className="w-64 bg-black border-r border-white p-6 flex flex-col">
      {/* Profile Avatar */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto">
          {user.profile_picture_url ? (
            <img
              src={user.profile_picture_url}
              alt={user.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-4xl text-black font-thin">
              {getDisplayChar()}
            </span>
          )}
        </div>
      </div>

      {/* Username */}
      <div className="text-center mb-6">
        <div className="text-sm opacity-70">@{user.username}</div>
        <div className="text-xs opacity-40 mt-1">
          {user.first_name} {user.last_name}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-xs">
          <User size={14} className="opacity-50" />
          <span>{stats.connections} CONNECTIONS</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Users size={14} className="opacity-50" />
          <span>{stats.friends} FRIENDS</span>
        </div>
      </div>

      {/* Kanji Divider */}
      <div className="flex items-center gap-2 my-4">
        <div className="flex-1 h-px bg-white opacity-10" />
        <span className="text-xs opacity-30">僕 庄 友</span>
        <div className="flex-1 h-px bg-white opacity-10" />
      </div>

      {/* Interests */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-2">
          {interests.slice(0, 5).map(interest => (
            <div key={interest.id} className="flex items-center gap-2 text-xs">
              <div className="w-1 h-1 bg-white opacity-30" />
              <span className="opacity-70">{interest.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Send Message Button */}
      {!isOwner && (
        <button
          onClick={onSendMessage}
          className="w-full py-3 border border-white text-sm tracking-widest hover:bg-white hover:text-black transition-colors mt-6"
        >
          SEND MESSAGE
        </button>
      )}
    </div>
  );
}
