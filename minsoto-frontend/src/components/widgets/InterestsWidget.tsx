'use client';

import BaseWidget from './BaseWidget';

interface Interest {
  id: string;
  name: string;
}

interface Extension {
  name: string;
  description: string;
}

interface InterestsWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
  interests: Interest[];
  extensions?: Extension[];
}

export default function InterestsWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  onVisibilityToggle,
  onDelete,
  interests,
  extensions = []
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
    >
      <div className="h-full flex flex-col">
        {/* Interest tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {interests.slice(0, 8).map((interest) => (
            <span
              key={interest.id}
              className="px-2 py-1 text-xs border border-white/20 opacity-70"
            >
              {interest.name}
            </span>
          ))}
        </div>

        {/* Extensions */}
        {extensions.length > 0 && (
          <div className="mt-auto pt-3 border-t border-white/10">
            <div className="text-[10px] tracking-wider opacity-40 mb-2">EXTENSIONS</div>
            <div className="space-y-2">
              {extensions.map((ext, i) => (
                <div key={i} className="text-xs opacity-60">
                  {ext.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}
