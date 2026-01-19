'use client';

import { useState } from 'react';
import { GripVertical, Eye, Lock, Trash2 } from 'lucide-react';

interface BaseWidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
  className?: string;
}

export default function BaseWidget({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  id,
  title,
  children,
  visibility,
  isEditMode,
  isOwner,
  onVisibilityToggle,
  onDelete,
  className = ''
}: BaseWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isPrivate = visibility === 'private';

  return (
    <div
      className={`glass-panel rounded-2xl h-full flex flex-col relative overflow-hidden group transition-all duration-300 ${className} ${isEditMode ? 'hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* HEADER */}
      <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-xs font-bold tracking-widest text-white/40 uppercase truncate pr-4">
          {title}
        </h3>

        {/* Indicators */}
        <div className="flex items-center gap-2">
          {isPrivate && (
            <Lock size={12} className="text-white/20" />
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-5 overflow-hidden">
        {children}
      </div>

      {/* EDIT MODE TOOLBAR - only at top, doesn't block content */}
      {isEditMode && isOwner && (
        <div className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/80 to-transparent transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {/* Drag Handle */}
          <div className="cursor-move p-1.5 bg-white/10 rounded hover:bg-white/20 transition-colors">
            <GripVertical size={14} className="text-white" />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onVisibilityToggle?.(); }}
              className={`p-1.5 rounded transition-colors ${isPrivate
                ? 'bg-red-500/30 text-red-300 hover:bg-red-500/50'
                : 'bg-green-500/30 text-green-300 hover:bg-green-500/50'
                }`}
              title={isPrivate ? 'Private (click to make public)' : 'Public (click to hide)'}
            >
              {isPrivate ? <Lock size={12} /> : <Eye size={12} />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="p-1.5 bg-white/10 rounded text-white/70 hover:bg-red-500/30 hover:text-red-300 transition-colors"
              title="Delete Widget"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Visibility Tint for Owner when not editing */}
      {!isEditMode && isOwner && isPrivate && (
        <div className="absolute top-2 right-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" title="Private Widget" />
        </div>
      )}
    </div>
  );
}
