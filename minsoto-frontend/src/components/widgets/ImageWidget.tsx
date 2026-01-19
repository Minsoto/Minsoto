'use client';

import { useState } from 'react';
import Image from 'next/image';
import BaseWidget from './BaseWidget';
import { Edit2, Check, X, AlertTriangle } from 'lucide-react';

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
    const [imageError, setImageError] = useState(false);

    const handleSave = () => {
        // Validate URL format
        if (url && !isValidImageUrl(url)) {
            alert('Unsupported link. Please use a valid image URL (jpg, png, gif, webp, svg).');
            return;
        }
        setImageError(false);
        onUpdateConfig?.(id, { ...config, url, caption, mode });
        setIsEditing(false);
    };

    const isValidImageUrl = (urlString: string): boolean => {
        try {
            const urlObj = new URL(urlString);
            const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
            const hasValidExtension = validExtensions.some(ext =>
                urlObj.pathname.toLowerCase().endsWith(ext)
            );
            // Also allow URLs that look like image services (imgur, cloudinary, etc.)
            const isImageService = urlString.includes('imgur.com') ||
                urlString.includes('cloudinary.com') ||
                urlString.includes('unsplash.com') ||
                urlString.includes('pexels.com') ||
                urlString.includes('giphy.com') ||
                urlString.includes('tenor.com') ||
                urlString.includes('googleusercontent.com') ||
                urlString.includes('githubusercontent.com');
            return hasValidExtension || isImageService || urlObj.protocol === 'data:';
        } catch {
            return false;
        }
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const hasImage = !!config.url && !imageError;

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
                        {imageError ? (
                            <div className="text-center p-4">
                                <AlertTriangle size={32} className="text-red-400 mx-auto mb-2" />
                                <p className="text-red-400 text-sm font-medium">Unsupported Link</p>
                                <p className="text-white/40 text-xs mt-1">This image couldn&apos;t be loaded</p>
                                {isOwner && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="mt-3 text-blue-400 text-xs hover:underline"
                                    >
                                        Change Image
                                    </button>
                                )}
                            </div>
                        ) : config.url ? (
                            <div className="relative w-full h-full">
                                {/* Use regular img for GIFs to preserve animation */}
                                {config.url.toLowerCase().endsWith('.gif') ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={config.url}
                                        alt={config.caption || "Widget Image"}
                                        className={`w-full h-full object-${config.mode || 'cover'}`}
                                        onError={handleImageError}
                                    />
                                ) : (
                                    <Image
                                        src={config.url}
                                        alt={config.caption || "Widget Image"}
                                        fill
                                        className={`object-${config.mode || 'cover'}`}
                                        unoptimized={config.url.includes('.gif')}
                                        onError={handleImageError}
                                    />
                                )}
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
                    </>
                )}

                {/* EDIT BUTTON - Positioned above BaseWidget overlay (z-30) */}
                {!isEditing && isOwner && hasImage && isEditMode && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setUrl(config.url || '');
                            setCaption(config.caption || '');
                            setMode(config.mode || 'cover');
                            setIsEditing(true);
                        }}
                        className="absolute top-2 right-2 p-2 bg-blue-500/80 backdrop-blur rounded-lg text-white hover:bg-blue-600 transition-all z-30"
                        title="Edit Image"
                    >
                        <Edit2 size={14} />
                    </button>
                )}

                {/* EDIT MODE OVERLAY */}
                {isEditing && (
                    <div className="absolute inset-0 bg-[#090910] z-40 flex flex-col p-4 gap-3">
                        <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest">Configure Image</h4>

                        <div className="space-y-1">
                            <label className="text-[10px] text-white/40">Image URL</label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://... (.jpg, .png, .gif, .webp)"
                                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:border-blue-500/50 outline-none"
                            />
                            <p className="text-[10px] text-white/30">Supported: jpg, png, gif, webp, svg</p>
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
