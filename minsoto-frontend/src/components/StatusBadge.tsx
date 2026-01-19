'use client';

interface StatusBadgeProps {
    status: 'online' | 'idle' | 'focus' | 'dnd' | 'offline';
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

const STATUS_CONFIG = {
    online: {
        color: 'bg-emerald-500',
        ring: 'ring-emerald-500/30',
        label: 'Online',
        pulse: true
    },
    idle: {
        color: 'bg-amber-500',
        ring: 'ring-amber-500/30',
        label: 'Idle',
        pulse: false
    },
    focus: {
        color: 'bg-purple-500',
        ring: 'ring-purple-500/30',
        label: 'Focusing',
        pulse: true
    },
    dnd: {
        color: 'bg-red-500',
        ring: 'ring-red-500/30',
        label: 'Do Not Disturb',
        pulse: false
    },
    offline: {
        color: 'bg-gray-500',
        ring: 'ring-gray-500/30',
        label: 'Offline',
        pulse: false
    }
};

const SIZE_MAP = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
};

export default function StatusBadge({
    status,
    size = 'md',
    showLabel = false,
    className = ''
}: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.offline;
    const sizeClass = SIZE_MAP[size];

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative">
                <div
                    className={`${sizeClass} rounded-full ${config.color} ring-2 ${config.ring}`}
                />
                {config.pulse && (
                    <div
                        className={`absolute inset-0 ${sizeClass} rounded-full ${config.color} animate-ping opacity-75`}
                    />
                )}
            </div>
            {showLabel && (
                <span className="text-xs text-white/60">{config.label}</span>
            )}
        </div>
    );
}
