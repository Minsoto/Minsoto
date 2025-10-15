'use client';

import BaseWidget from './BaseWidget';
import Image from 'next/image';

interface PostWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  imageUrl: string;
  tags: string[];
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
}

export default function PostWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  imageUrl,
  tags,
  onVisibilityToggle,
  onDelete
}: PostWidgetProps) {
  return (
    <BaseWidget
      id={id}
      title="HIGHLIGHTED POST"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
    >
      <div className="h-full flex gap-3">
        {/* Image */}
        <div className="w-24 h-24 bg-gray-800 relative overflow-hidden flex-shrink-0">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Post"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs opacity-30">
              No Image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-1">
            {tags.map((tag, index) => (
              <div key={index} className="text-xs opacity-70">
                {tag}
              </div>
            ))}
          </div>
          <div className="text-[10px] opacity-40">Highlighted</div>
        </div>
      </div>
    </BaseWidget>
  );
}

