'use client';

import { useState } from 'react';
import Image from 'next/image';
import BaseWidget from './BaseWidget';
import { Edit2, Check, X } from 'lucide-react';

interface ImageWidgetProps {
    id: string;
    visibility: 'public' | 'private';
    isEditMode: boolean;
    isOwner: boolean;
    onVisibilityToggle?: () => void;
    onDelete?: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdateConfig?: (id: string, newConfig: any) => void;
}

export default function ImageWidget({
    id,
    visibility,
    isEditMode,
    isOwner,
    onVisibilityToggle,
    onDelete,
    config,
    onUpdateConfig
}: ImageWidgetProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [url, setUrl] = useState(config.url || '');
    const [caption, setCaption] = useState(config.caption || '');
    const [mode, setMode] = useState<'cover' | 'contain'>(config.mode || 'cover');

    const handleSave = () => {
        onUpdateConfig?.(id, { ...config, url, caption, mode });
        setIsEditing(false);
    };

    const hasImage = !!config.url;

    return (
        <BaseWidget
            id={id}
            title={config.caption || "Image"}
            visibility={visibility}
            isEditMode={isEditMode}
            isOwner={isOwner}
            onVisibilityToggle={onVisibilityToggle}
            onDelete={onDelete}
            className={!hasImage && !isEditing ? 'border-dashed border-2 border-white/10' : ''}
        >
            <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden rounded-xl">

                {/* VIEW MODE */}
                {!isEditing && (
                    <>
                        {config.url ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={config.url}
                                    alt={config.caption || "Widget Image"}
                                    fill
                                    className={`object-${config.mode || 'cover'}`}
                                />
                                {/* Optional overlay caption */}
                                {config.caption && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                        <p className="text-white text-sm font-medium">{config.caption}</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center p-4">
                                <p className="text-white/30 text-sm mb-2">No Image Set</p>
                                {isOwner && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-blue-400 text-xs hover:underline"
                                    >
                                        Configure Widget
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Owner Edit Button (visible on hover if has image) */}
                        {isOwner && hasImage && isEditMode && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setUrl(config.url || '');
                                    setCaption(config.caption || '');
                                    setMode(config.mode || 'cover');
                                    setIsEditing(true);
                                }}
                                className="absolute top-2 right-2 p-2 bg-black/50 backdrop-blur rounded-lg text-white/70 hover:text-white hover:bg-black/70 transition-all z-10"
                            >
                                <Edit2 size={14} />
                            </button>
                        )}
                    </>
                )}

                {/* EDIT MODE OVERLAY */}
                {isEditing && (
                    <div className="absolute inset-0 bg-[#090910] z-20 flex flex-col p-4 gap-3">
                        <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">Configure Image</h4>

                        <div className="space-y-1">
                            <label className="text-[10px] text-white/40">Image URL</label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-blue-500/50 outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] text-white/40">Caption (Optional)</label>
                            <input
                                type="text"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="My workspace..."
                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-blue-500/50 outline-none"
                            />
                        </div>

                        <div className="flex gap-2 mt-auto">
                            <button
                                onClick={() => setMode(m => m === 'cover' ? 'contain' : 'cover')}
                                className="px-3 py-1 bg-white/5 rounded text-xs text-white/60 hover:text-white"
                            >
                                Mode: {mode}
                            </button>
                            <div className="flex-1" />
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-1.5 hover:bg-white/10 rounded text-red-400 transition-colors"
                            >
                                <X size={16} />
                            </button>
                            <button
                                onClick={handleSave}
                                className="p-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded transition-colors"
                            >
                                <Check size={16} />
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </BaseWidget>
    );
}
