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

      {/* EDIT OVERLAY */}
      {isEditMode && isOwner && (
        <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-3 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-3 left-3 cursor-move p-2 bg-white/10 rounded-lg hover:bg-white/20">
            <GripVertical size={16} className="text-white" />
          </div>

          <div className="flex gap-2 scale-110">
            <button
              onClick={(e) => { e.stopPropagation(); onVisibilityToggle?.(); }}
              className={`p-2 rounded-lg transition-colors border ${isPrivate
                ? 'bg-red-500/20 border-red-500/50 text-red-200 hover:bg-red-500/30'
                : 'bg-green-500/20 border-green-500/50 text-green-200 hover:bg-green-500/30'
                }`}
              title={isPrivate ? 'Currently Private (Hidden)' : 'Currently Public (Visible)'}
            >
              {isPrivate ? <Lock size={16} /> : <Eye size={16} />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-200 transition-colors"
              title="Delete Widget"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <p className="text-xs font-mono text-white/50 mt-2 bg-black/50 px-2 py-1 rounded">
            click & drag to move
          </p>
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
