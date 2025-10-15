'use client';

import BaseWidget from './BaseWidget';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface CommunityItem {
  title: string;
  description: string;
  icon: string;
}

interface CommunityWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  items: CommunityItem[];
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
}

export default function CommunityWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  items,
  onVisibilityToggle,
  onDelete
}: CommunityWidgetProps) {
  return (
    <BaseWidget
      id={id}
      title="COMMUNITY SUMMARY"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
    >
      <div className="h-full flex flex-col">
        {/* Subtitle */}
        <div className="text-xs opacity-50 mb-3">POTRESTS</div>

        {/* Community Items */}
        <div className="flex-1 space-y-3">
          {items.slice(0, 2).map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs">{item.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{item.title}</div>
                <div className="text-[10px] opacity-50 truncate">{item.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-900">
          <button className="p-1 hover:bg-white hover:bg-opacity-5 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button className="p-1 hover:bg-white hover:bg-opacity-5 transition-colors">
            <Download size={14} />
          </button>
          <button className="p-1 hover:bg-white hover:bg-opacity-5 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </BaseWidget>
  );
}
