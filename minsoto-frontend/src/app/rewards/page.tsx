'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import { Plus, Gift, Coins, History, Trash2, Check, X } from 'lucide-react';
import type { Reward } from '@/types/gamification';

// Default reward templates
const REWARD_TEMPLATES = [
    { name: 'Snack break', icon: '🍿', cost: 50, description: '15 min snack time' },
    { name: '1 hour gaming', icon: '🎮', cost: 100, description: 'Play your favorite game' },
    { name: '1 Netflix episode', icon: '📺', cost: 75, description: 'Watch one episode' },
    { name: 'Coffee break', icon: '☕', cost: 25, description: 'Grab a coffee' },
    { name: '30 min music', icon: '🎵', cost: 30, description: 'Listen to music guilt-free' },
    { name: 'Social media break', icon: '📱', cost: 40, description: '15 min scroll time' },
];

export default function RewardsPage() {
    const router = useRouter();
    const { isAuthenticated, _hasHydrated } = useAuthStore();
    const {
        points, rewards, redemptions,
        fetchPoints, fetchRewards, createReward, deleteReward, redeemReward
    } = useGamificationStore();

    const [isCreating, setIsCreating] = useState(false);
    const [newReward, setNewReward] = useState({ name: '', description: '', cost: 50, icon: '🎁' });
    const [redeemingId, setRedeemingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        if (_hasHydrated && !isAuthenticated) {
            router.push('/login');
        }
    }, [_hasHydrated, isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchPoints();
            fetchRewards();
        }
    }, [isAuthenticated, fetchPoints, fetchRewards]);

    const handleCreateReward = async () => {
        if (!newReward.name || newReward.cost < 1) return;

        try {
            await createReward(newReward);
            setNewReward({ name: '', description: '', cost: 50, icon: '🎁' });
            setIsCreating(false);
            setMessage({ type: 'success', text: 'Reward created!' });
            setTimeout(() => setMessage(null), 3000);
        } catch {
            setMessage({ type: 'error', text: 'Failed to create reward' });
        }
    };

    const handleRedeem = async (reward: Reward) => {
        setRedeemingId(reward.id);
        const result = await redeemReward(reward.id);
        setRedeemingId(null);

        if (result.success) {
            setMessage({ type: 'success', text: `🎉 ${result.message}` });
        } else {
            setMessage({ type: 'error', text: result.message });
        }
        setTimeout(() => setMessage(null), 4000);
    };

    const handleUseTemplate = (template: typeof REWARD_TEMPLATES[0]) => {
        setNewReward({
            name: template.name,
            description: template.description,
            cost: template.cost,
            icon: template.icon
        });
        setIsCreating(true);
    };

    if (!_hasHydrated || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-white/30 rounded-full border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] text-white">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/20">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-3">
                                <Gift className="text-purple-400" />
                                Reward Store
                            </h1>
                            <p className="text-white/50 text-sm mt-1">Spend your hard-earned points on rewards</p>
                        </div>

                        {/* Points Balance */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                            <Coins className="text-yellow-400" size={20} />
                            <span className="text-2xl font-bold text-yellow-400">
                                {points?.balance.toLocaleString() || 0}
                            </span>
                            <span className="text-yellow-400/60 text-sm">pts</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Toast */}
            {message && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${message.type === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'
                    }`}>
                    <p className="text-white text-sm font-medium">{message.text}</p>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Quick Templates (if no rewards yet) */}
                {rewards.length === 0 && !isCreating && (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold mb-4">Quick Start Templates</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {REWARD_TEMPLATES.map((template, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleUseTemplate(template)}
                                    className="p-4 glass-panel hover:bg-white/10 transition-all text-left"
                                >
                                    <span className="text-2xl">{template.icon}</span>
                                    <h3 className="font-medium mt-2">{template.name}</h3>
                                    <p className="text-xs text-white/40 mt-1">{template.cost} pts</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create Reward Modal/Form */}
                {isCreating && (
                    <div className="mb-8 p-6 glass-panel border border-white/10">
                        <h2 className="text-lg font-semibold mb-4">Create New Reward</h2>

                        <div className="grid gap-4">
                            <div className="flex gap-4">
                                {/* Icon Picker */}
                                <div>
                                    <label className="text-xs text-white/50 block mb-1">Icon</label>
                                    <div className="flex gap-1 flex-wrap max-w-[150px]">
                                        {['🎁', '🍿', '🎮', '📺', '☕', '🎵', '📱', '🍕', '🎬', '🛋️', '🎨', '🏃'].map(emoji => (
                                            <button
                                                key={emoji}
                                                onClick={() => setNewReward({ ...newReward, icon: emoji })}
                                                className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${newReward.icon === emoji
                                                        ? 'bg-purple-500/30 border border-purple-500'
                                                        : 'bg-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-3">
                                    <div>
                                        <label className="text-xs text-white/50 block mb-1">Name</label>
                                        <input
                                            type="text"
                                            value={newReward.name}
                                            onChange={e => setNewReward({ ...newReward, name: e.target.value })}
                                            placeholder="e.g., 1 hour gaming"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-white/50 block mb-1">Description (optional)</label>
                                        <input
                                            type="text"
                                            value={newReward.description}
                                            onChange={e => setNewReward({ ...newReward, description: e.target.value })}
                                            placeholder="e.g., Play your favorite game"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs text-white/50 block mb-1">Cost (points)</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={newReward.cost}
                                            onChange={e => setNewReward({ ...newReward, cost: parseInt(e.target.value) || 1 })}
                                            className="w-32 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 justify-end mt-2">
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="px-4 py-2 text-white/50 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateReward}
                                    disabled={!newReward.name || newReward.cost < 1}
                                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                                >
                                    Create Reward
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Rewards Grid */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Your Rewards</h2>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <Plus size={16} />
                        Add Reward
                    </button>
                </div>

                {rewards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rewards.map(reward => {
                            const canAfford = (points?.balance || 0) >= reward.cost;
                            const isRedeeming = redeemingId === reward.id;

                            return (
                                <div
                                    key={reward.id}
                                    className={`p-5 glass-panel relative group transition-all ${canAfford ? 'hover:border-green-500/30' : 'opacity-60'
                                        }`}
                                >
                                    {/* Delete button */}
                                    <button
                                        onClick={() => deleteReward(reward.id)}
                                        className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all"
                                    >
                                        <Trash2 size={14} className="text-red-400" />
                                    </button>

                                    <div className="flex items-start gap-3">
                                        <span className="text-3xl">{reward.icon}</span>
                                        <div className="flex-1">
                                            <h3 className="font-medium">{reward.name}</h3>
                                            {reward.description && (
                                                <p className="text-xs text-white/40 mt-0.5">{reward.description}</p>
                                            )}
                                            <p className="text-sm text-yellow-400 font-medium mt-2">
                                                {reward.cost} pts
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRedeem(reward)}
                                        disabled={!canAfford || isRedeeming}
                                        className={`w-full mt-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${canAfford
                                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30'
                                                : 'bg-white/5 text-white/30 cursor-not-allowed'
                                            }`}
                                    >
                                        {isRedeeming ? (
                                            <div className="animate-spin w-4 h-4 border-2 border-current rounded-full border-t-transparent" />
                                        ) : canAfford ? (
                                            <>
                                                <Check size={16} />
                                                Redeem
                                            </>
                                        ) : (
                                            <>
                                                <X size={16} />
                                                Not enough pts
                                            </>
                                        )}
                                    </button>

                                    {reward.times_redeemed > 0 && (
                                        <p className="text-xs text-white/30 text-center mt-2">
                                            Redeemed {reward.times_redeemed} time{reward.times_redeemed > 1 ? 's' : ''}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : !isCreating && (
                    <div className="p-12 glass-panel text-center">
                        <Gift size={48} className="text-white/20 mx-auto mb-4" />
                        <p className="text-white/40">No rewards yet. Create your first one above!</p>
                    </div>
                )}

                {/* Recent Redemptions */}
                {redemptions && redemptions.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <History size={18} className="text-white/50" />
                            Recent Redemptions
                        </h2>
                        <div className="space-y-2">
                            {redemptions.slice(0, 10).map(r => (
                                <div key={r.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                    <span>{r.reward_name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-yellow-400">-{r.points_spent} pts</span>
                                        <span className="text-xs text-white/30">
                                            {new Date(r.redeemed_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
