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
      title="INTERESTS"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
      className="bg-white text-black"
    >
      <div className="h-full flex flex-col gap-4 overflow-auto">
        {/* Interests Section */}
        <div>
          <div className="text-xs font-medium mb-2">INTERESTS</div>
          <div className="flex flex-wrap gap-2">
            {interests.map(interest => (
              <span
                key={interest.id}
                className="text-xs px-2 py-1 bg-gray-200 opacity-70"
              >
                {interest.name}
              </span>
            ))}
          </div>
        </div>

        {/* Community Extensions Section */}
        {extensions.length > 0 && (
          <div>
            <div className="text-xs font-medium mb-2">COMMUNITY EXTENSIONS</div>
            <div className="space-y-2">
              {extensions.slice(0, 2).map((ext, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-100">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{ext.name}</div>
                    <div className="text-[10px] opacity-60 truncate">{ext.description}</div>
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
