// Gamification Types

export interface UserXP {
    total_xp: number;
    level: number;
    xp_to_next_level: number;
    progress_percent: number;
    current_streak_days: number;
    longest_streak_days: number;
    xp_multiplier: number;
    tasks_xp: number;
    habits_xp: number;
    social_xp: number;
    guild_xp: number;
    username: string;
}

export interface XPTransaction {
    id: string;
    amount: number;
    source_type: string;
    description: string;
    new_total_xp: number;
    new_level: number;
    leveled_up: boolean;
    created_at: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    category: 'productivity' | 'habits' | 'social' | 'guild' | 'mastery' | 'secret';
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    xp_reward: number;
    icon: string;
    unlocks_title: string;
    is_hidden: boolean;
}

export interface UserAchievement {
    achievement: Achievement;
    progress: number;
    target: number;
    unlocked: boolean;
    unlocked_at: string | null;
}

export interface UserPoints {
    balance: number;
    total_earned: number;
    total_spent: number;
    username: string;
}

export interface PointTransaction {
    id: string;
    amount: number;
    transaction_type: 'earn' | 'spend';
    source_type: string;
    description: string;
    new_balance: number;
    created_at: string;
}

export interface Reward {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: string;
    is_active: boolean;
    times_redeemed: number;
    created_at: string;
}

export interface RewardRedemption {
    id: string;
    reward_name: string;
    points_spent: number;
    redeemed_at: string;
}

export interface LeaderboardEntry {
    rank: number;
    username: string;
    level: number;
    total_xp: number;
    is_you: boolean;
}

export interface Leaderboard {
    leaderboard: LeaderboardEntry[];
    your_rank: number | null;
}
