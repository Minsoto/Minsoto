'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface SafeImageProps {
    src: string;
    alt: string;
    className?: string;
    fill?: boolean;
    width?: number;
    height?: number;
    fallback?: React.ReactNode;
    onError?: () => void;
}

/**
 * SafeImage - A universal image component for user-generated content
 * 
 * Uses regular <img> tag instead of Next.js Image to avoid hostname configuration.
 * This is intentional for user-uploaded images that can come from any domain.
 * 
 * Features:
 * - Error handling with fallback
 * - Loading state
 * - Works with any image URL
 */
export default function SafeImage({
    src,
    alt,
    className = '',
    fill = false,
    width,
    height,
    fallback,
    onError
}: SafeImageProps) {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleError = () => {
        setError(true);
        setLoading(false);
        onError?.();
    };

    const handleLoad = () => {
        setLoading(false);
    };

    if (error) {
        return fallback || (
            <div className={`flex items-center justify-center bg-white/5 ${className}`}>
                <AlertTriangle size={20} className="text-red-400/50" />
            </div>
        );
    }

    const baseClasses = fill
        ? 'absolute inset-0 w-full h-full'
        : '';

    return (
        <>
            {loading && (
                <div className={`${baseClasses} ${className} bg-white/5 animate-pulse`} />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                onError={handleError}
                onLoad={handleLoad}
                className={`${baseClasses} ${className} ${loading ? 'invisible' : ''}`}
                loading="lazy"
            />
        </>
    );
}

// Variant for avatars
interface SafeAvatarProps {
    src?: string;
    alt: string;
    fallbackChar: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export function SafeAvatar({
    src,
    alt,
    fallbackChar,
    size = 'md',
    className = ''
}: SafeAvatarProps) {
    const [error, setError] = useState(false);

    const sizeClasses = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-12 h-12 text-lg',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-20 h-20 text-2xl'
    };

    if (!src || error) {
        return (
            <div className={`${sizeClasses[size]} rounded-full bg-white/10 flex items-center justify-center font-light text-white/60 ${className}`}>
                {fallbackChar.toUpperCase()}
            </div>
        );
    }

    return (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-white/10 ${className}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt={alt}
                onError={() => setError(true)}
                className="w-full h-full object-cover"
                loading="lazy"
            />
        </div>
    );
}

// Variant for banners
interface SafeBannerProps {
    src?: string;
    alt?: string;
    className?: string;
    onError?: () => void;
}

export function SafeBanner({
    src,
    alt = 'Banner',
    className = '',
    onError
}: SafeBannerProps) {
    const [error, setError] = useState(false);

    const handleError = () => {
        setError(true);
        onError?.();
    };

    if (!src || error) {
        return (
            <div className={`bg-gradient-to-br from-white/10 to-white/5 ${className}`}>
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <AlertTriangle size={20} className="text-red-400/50" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`relative ${className}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt={alt}
                onError={handleError}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
            />
        </div>
    );
}
