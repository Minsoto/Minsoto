'use client';

import BaseWidget from './BaseWidget';

interface Interest {
  id: string;
  name: string;
}

interface InterestsWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  interests: Interest[];
  extensions?: { name: string; description: string }[];
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
}

export default function InterestsWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  interests,
  extensions = [],
  onVisibilityToggle,
  onDelete
}: InterestsWidgetProps) {
  return (
    <BaseWidget
      id={id}
      title="Interests"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
      accent="purple"
    >
      <div className="h-full flex flex-col gap-4 overflow-auto">
        {/* Interests Tags */}
        <div className="flex flex-wrap gap-2">
          {interests.map(interest => (
            <span
              key={interest.id}
              className="text-xs px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-200 hover:bg-purple-500/30 transition-colors cursor-default"
            >
              {interest.name}
            </span>
          ))}
        </div>

        {/* Community Extensions */}
        {extensions.length > 0 && (
          <div className="pt-3 border-t border-white/10">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Extensions</div>
            <div className="space-y-2">
              {extensions.slice(0, 2).map((ext, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center text-xs">
                    {ext.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{ext.name}</div>
                    <div className="text-xs text-white/50 truncate">{ext.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}
