import { create } from 'zustand';
import api from '@/lib/api';
import type {
    UserXP, XPTransaction, UserPoints, PointTransaction,
    Reward, RewardRedemption, Achievement, UserAchievement,
    Leaderboard
} from '@/types/gamification';

interface GamificationState {
    // XP
    xp: UserXP | null;
    xpTransactions: XPTransaction[];
    leaderboard: Leaderboard | null;

    // Points
    points: UserPoints | null;
    pointTransactions: PointTransaction[];

    // Rewards
    rewards: Reward[];
    redemptions: RewardRedemption[];

    // Achievements
    achievements: Achievement[];
    userAchievements: UserAchievement[];

    // Loading states
    loading: boolean;

    // Actions
    fetchXP: () => Promise<void>;
    fetchXPTransactions: () => Promise<void>;
    fetchLeaderboard: (scope?: 'global' | 'weekly') => Promise<void>;
    fetchPoints: () => Promise<void>;
    fetchRewards: () => Promise<void>;
    createReward: (data: { name: string; description: string; cost: number; icon: string }) => Promise<Reward>;
    updateReward: (id: string, data: Partial<Reward>) => Promise<void>;
    deleteReward: (id: string) => Promise<void>;
    redeemReward: (id: string) => Promise<{ success: boolean; message: string; new_balance?: number }>;
    fetchAchievements: () => Promise<void>;
    fetchUserAchievements: () => Promise<void>;
    fetchRedemptions: () => Promise<void>;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
    xp: null,
    xpTransactions: [],
    leaderboard: null,
    points: null,
    pointTransactions: [],
    rewards: [],
    redemptions: [],
    achievements: [],
    userAchievements: [],
    loading: false,

    fetchXP: async () => {
        try {
            const response = await api.get('/xp/me/');
            set({ xp: response.data });
        } catch (error) {
            console.error('Failed to fetch XP:', error);
        }
    },

    fetchXPTransactions: async () => {
        try {
            const response = await api.get('/xp/transactions/');
            set({ xpTransactions: response.data });
        } catch (error) {
            console.error('Failed to fetch XP transactions:', error);
        }
    },

    fetchLeaderboard: async (scope = 'global') => {
        try {
            const response = await api.get(`/xp/leaderboard/?scope=${scope}`);
            set({ leaderboard: response.data });
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        }
    },

    fetchPoints: async () => {
        try {
            const response = await api.get('/points/me/');
            set({ points: response.data });
        } catch (error) {
            console.error('Failed to fetch points:', error);
        }
    },

    fetchRewards: async () => {
        try {
            const response = await api.get('/rewards/');
            set({ rewards: response.data });
        } catch (error) {
            console.error('Failed to fetch rewards:', error);
        }
    },

    createReward: async (data) => {
        const response = await api.post('/rewards/', data);
        const newReward = response.data;
        set({ rewards: [...get().rewards, newReward] });
        return newReward;
    },

    updateReward: async (id, data) => {
        await api.patch(`/rewards/${id}/`, data);
        set({
            rewards: get().rewards.map(r => r.id === id ? { ...r, ...data } : r)
        });
    },

    deleteReward: async (id) => {
        await api.delete(`/rewards/${id}/`);
        set({ rewards: get().rewards.filter(r => r.id !== id) });
    },

    redeemReward: async (id) => {
        try {
            const response = await api.post(`/rewards/${id}/redeem/`);
            // Update points balance
            if (response.data.new_balance !== undefined) {
                set({
                    points: get().points ? { ...get().points!, balance: response.data.new_balance } : null
                });
            }
            // Refresh rewards to update times_redeemed
            get().fetchRewards();
            return { success: true, message: response.data.message, new_balance: response.data.new_balance };
        } catch (error: unknown) {
            const err = error as { response?: { data?: { error?: string } } };
            return { success: false, message: err.response?.data?.error || 'Failed to redeem reward' };
        }
    },

    fetchAchievements: async () => {
        try {
            const response = await api.get('/achievements/');
            set({ achievements: response.data });
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
        }
    },

    fetchUserAchievements: async () => {
        try {
            const response = await api.get('/achievements/me/');
            set({ userAchievements: response.data });
        } catch (error) {
            console.error('Failed to fetch user achievements:', error);
        }
    },

    fetchRedemptions: async () => {
        try {
            const response = await api.get('/rewards/history/');
            set({ redemptions: response.data });
        } catch (error) {
            console.error('Failed to fetch redemptions:', error);
        }
    },
}));
