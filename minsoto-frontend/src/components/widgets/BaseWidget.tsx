'use client';

import { useState } from 'react';
import { Lock, Eye, Trash2, GripVertical, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
  accent?: 'purple' | 'green' | 'blue' | 'orange';
}

export default function BaseWidget({
  id: _id,
  title,
  children,
  visibility,
  isEditMode,
  isOwner,
  onVisibilityToggle,
  onDelete,
  className = '',
  accent = 'purple'
}: BaseWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isPrivate = visibility === 'private';

  const accentColors = {
    purple: 'from-purple-500/20 to-purple-900/10 border-purple-500/30',
    green: 'from-green-500/20 to-green-900/10 border-green-500/30',
    blue: 'from-blue-500/20 to-blue-900/10 border-blue-500/30',
    orange: 'from-orange-500/20 to-orange-900/10 border-orange-500/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        relative h-full rounded-2xl p-5 overflow-hidden
        bg-gradient-to-br ${accentColors[accent]}
        backdrop-blur-xl border
        ${isEditMode && isOwner ? 'cursor-move ring-2 ring-purple-500/20' : ''}
        hover:border-purple-500/50 transition-all duration-300
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />

      {/* Edit Mode Controls */}
      {isEditMode && isOwner && isHovered && (
        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
          <button
            onClick={onVisibilityToggle}
            className="p-1.5 bg-black/50 rounded-lg border border-white/10 hover:bg-purple-500/20 transition-colors"
            title={isPrivate ? 'Make Public' : 'Make Private'}
          >
            {isPrivate ? <Lock size={12} /> : <Eye size={12} />}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 bg-black/50 rounded-lg border border-white/10 hover:bg-red-500/20 transition-colors"
            title="Delete Widget"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {/* Drag Handle */}
      {isEditMode && isOwner && (
        <div className="absolute top-3 left-3 cursor-move opacity-50 hover:opacity-100 transition-opacity">
          <GripVertical size={14} />
        </div>
      )}

      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium tracking-wider text-white/60 uppercase">
            {title}
          </h3>
          {isPrivate && isOwner && (
            <Lock size={10} className="text-purple-400/60" />
          )}
        </div>
        {!isEditMode && (
          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/5 rounded transition-all">
            <Maximize2 size={12} className="text-white/40" />
          </button>
        )}
      </div>

      {/* Widget Content */}
      <div className="text-white h-[calc(100%-2.5rem)] relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

