'use client';

import { useEffect } from 'react';
import { useGamificationStore } from '@/stores/gamificationStore';
import BaseWidget from './BaseWidget';
import { Coins, Gift } from 'lucide-react';

interface PointsWidgetProps {
    id: string;
    visibility: 'public' | 'private';
    isEditMode: boolean;
    isOwner: boolean;
    onDelete?: () => void;
    onVisibilityToggle?: () => void;
}

export default function PointsWidget({
    id,
    visibility,
    isEditMode,
    isOwner,
    onDelete,
    onVisibilityToggle,
}: PointsWidgetProps) {
    const { points, rewards, fetchPoints, fetchRewards } = useGamificationStore();

    useEffect(() => {
        if (!points) fetchPoints();
        if (rewards.length === 0) fetchRewards();
    }, [points, rewards, fetchPoints, fetchRewards]);

    if (!points) {
        return (
            <BaseWidget
                id={id}
                title="Points"
                visibility={visibility}
                isEditMode={isEditMode}
                isOwner={isOwner}
                onDelete={onDelete}
                onVisibilityToggle={onVisibilityToggle}
            >
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin w-6 h-6 border-2 border-white/30 rounded-full border-t-transparent" />
                </div>
            </BaseWidget>
        );
    }

    return (
        <BaseWidget
            id={id}
            title="Points"
            visibility={visibility}
            isEditMode={isEditMode}
            isOwner={isOwner}
            onDelete={onDelete}
            onVisibilityToggle={onVisibilityToggle}
        >
            <div className="flex flex-col h-full justify-between">
                {/* Balance Display */}
                <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2">
                        <Coins size={20} className="text-yellow-400" />
                        <span className="text-3xl font-bold text-white">
                            {points.balance.toLocaleString()}
                        </span>
                    </div>
                    <p className="text-xs text-white/40 mt-1">Available Points</p>
                </div>

                {/* Stats */}
                <div className="flex justify-center gap-6 text-xs mb-4">
                    <div className="text-center">
                        <p className="text-white/70 font-medium">{points.total_earned.toLocaleString()}</p>
                        <p className="text-white/40">Earned</p>
                    </div>
                    <div className="text-center">
                        <p className="text-white/70 font-medium">{points.total_spent.toLocaleString()}</p>
                        <p className="text-white/40">Spent</p>
                    </div>
                </div>

                {/* Quick Rewards Preview */}
                {rewards.length > 0 && (
                    <div className="mt-auto pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-xs text-white/40 mb-2">
                            <Gift size={12} />
                            <span>Rewards</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {rewards.slice(0, 3).map(reward => (
                                <div
                                    key={reward.id}
                                    className={`px-2 py-1 text-xs rounded border ${points.balance >= reward.cost
                                            ? 'border-green-500/30 bg-green-500/10 text-green-300'
                                            : 'border-white/10 bg-white/5 text-white/40'
                                        }`}
                                >
                                    {reward.icon} {reward.cost}
                                </div>
                            ))}
                            {rewards.length > 3 && (
                                <span className="text-xs text-white/30">+{rewards.length - 3} more</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Link to Store */}
                {isOwner && (
                    <a
                        href="/rewards"
                        className="mt-3 text-center text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        Open Reward Store →
                    </a>
                )}
            </div>
        </BaseWidget>
    );
}
