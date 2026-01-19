'use client';

import { RefreshCw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    className?: string;
}

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-2',
        lg: 'w-12 h-12 border-3'
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div className={`${sizeClasses[size]} border-white/30 rounded-full border-t-white animate-spin`} />
            {text && <p className="text-white/40 text-sm">{text}</p>}
        </div>
    );
}

interface LoadingSkeletonProps {
    className?: string;
    lines?: number;
}

export function LoadingSkeleton({ className = '', lines = 3 }: LoadingSkeletonProps) {
    return (
        <div className={`animate-pulse space-y-3 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-white/10 rounded"
                    style={{ width: `${70 + Math.random() * 30}%` }}
                />
            ))}
        </div>
    );
}

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
    compact?: boolean;
    className?: string;
}

export function ErrorState({
    message = 'Something went wrong',
    onRetry,
    compact = false,
    className = ''
}: ErrorStateProps) {
    if (compact) {
        return (
            <div className={`flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg ${className}`}>
                <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm flex-1">{message}</span>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="text-red-400 hover:text-red-300 transition-colors p-1"
                        title="Retry"
                    >
                        <RefreshCw size={14} />
                    </button>
                )}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
        >
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <AlertTriangle size={24} className="text-red-400" />
            </div>
            <p className="text-white/70 mb-2">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors mt-2"
                >
                    <RefreshCw size={14} />
                    Try Again
                </button>
            )}
        </motion.div>
    );
}

interface EmptyStateProps {
    icon?: React.ReactNode;
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    className?: string;
}

export function EmptyState({ icon, message, action, className = '' }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
        >
            {icon && <div className="mb-4 text-white/20">{icon}</div>}
            <p className="text-white/40 mb-3">{message}</p>
            {action && (
                <button
                    onClick={action.onClick}
                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors hover:underline"
                >
                    {action.label}
                </button>
            )}
        </motion.div>
    );
}

// Widget-specific loading state
export function WidgetLoading({ className = '' }: { className?: string }) {
    return (
        <div className={`glass-panel rounded-2xl p-6 h-full animate-pulse ${className}`}>
            <div className="h-4 w-24 bg-white/10 rounded mb-4" />
            <div className="space-y-3">
                <div className="h-8 bg-white/5 rounded" />
                <div className="h-8 bg-white/5 rounded w-3/4" />
                <div className="h-8 bg-white/5 rounded w-1/2" />
            </div>
        </div>
    );
}

// Card loading state
export function CardLoading({ className = '' }: { className?: string }) {
    return (
        <div className={`glass-panel rounded-xl p-4 animate-pulse ${className}`}>
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
            </div>
        </div>
    );
}
