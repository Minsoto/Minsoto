'use client';

import { useState } from 'react';
import { Lock, Eye, Trash2, GripVertical } from 'lucide-react';
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
  className = ''
}: BaseWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);

  const isPrivate = visibility === 'private';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        relative h-full bg-black border
        ${isPrivate && isOwner ? 'border-gray-600' : 'border-white'}
        rounded-none p-4 overflow-hidden
        ${isEditMode && isOwner ? 'cursor-move' : ''}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-white" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-white" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white" />

      {/* Edit Mode Controls */}
      {isEditMode && isOwner && isHovered && (
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <button
            onClick={onVisibilityToggle}
            className="p-1 bg-black border border-white hover:bg-gray-900 transition-colors"
            title={isPrivate ? 'Make Public' : 'Make Private'}
          >
            {isPrivate ? <Lock size={14} /> : <Eye size={14} />}
          </button>
          <button
            onClick={onDelete}
            className="p-1 bg-black border border-white hover:bg-red-900 transition-colors"
            title="Delete Widget"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Drag Handle */}
      {isEditMode && isOwner && (
        <div className="absolute top-2 left-2 cursor-move">
          <GripVertical size={16} className="text-gray-500" />
        </div>
      )}

      {/* Widget Header */}
      <div className="flex items-center justify-between mb-3 pl-6">
        <h3 className="text-xs font-light tracking-widest opacity-70 uppercase">
          {title}
        </h3>
        {isPrivate && isOwner && (
          <Lock size={12} className="text-gray-500" />
        )}
      </div>

      {/* Widget Content */}
      <div className="text-white h-[calc(100%-2rem)]">
        {children}
      </div>
    </motion.div>
  );
}
