// Guild System Types

export interface Guild {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    banner_url: string;
    logo: string | null;
    banner: string | null;
    guild_type: 'interest' | 'organization' | 'project' | 'custom';
    organization_name: string | null;
    layout: GuildLayout;
    guild_settings: GuildSettings;
    is_public: boolean;
    is_verified: boolean;
    member_count: number;
    total_xp: number;
    members?: GuildMember[];
    created_by_username: string;
    created_at: string;
    updated_at?: string;
}

export interface GuildLayout {
    widgets: GuildWidget[];
}

export interface GuildWidget {
    id: string;
    type: string;
    position: { x: number; y: number };
    size: { w: number; h: number };
    visibility: 'public' | 'members';
    config: Record<string, unknown>;
}

export interface GuildSettings {
    allow_public_join: boolean;
    require_approval: boolean;
    poll_quorum: number;
    max_members: number | null;
}

export interface GuildMember {
    id: string;
    username: string;
    first_name: string;
    role: 'owner' | 'admin' | 'member';
    xp_contributed: number;
    joined_at: string;
}

export interface GuildPoll {
    id: string;
    poll_type: 'admin_vote' | 'task_approval' | 'habit_approval' | 'change_approval' | 'points_update' | 'custom';
    title: string;
    description: string;
    options: string[];
    change_preview: Record<string, unknown> | null;
    related_id: string | null;
    status: 'active' | 'closed' | 'passed' | 'failed';
    deadline: string;
    required_quorum: number;
    vote_count: number;
    quorum_reached: boolean;
    results: Record<string, number> | null;
    user_voted: boolean;
    created_by_username: string;
    created_at: string;
    closed_at: string | null;
}

export interface GuildChangeRequest {
    id: string;
    change_type: 'layout' | 'settings' | 'info';
    title: string;
    description: string;
    proposed_changes: Record<string, unknown>;
    status: 'pending' | 'approved' | 'rejected';
    requested_by_username: string;
    reviewed_by_username: string | null;
    reviewed_at: string | null;
    review_notes: string;
    created_at: string;
}

export interface GuildTemplate {
    name: string;
    description: string;
    icon: string;
    color: string;
    default_settings: GuildSettings;
    suggested_widgets: string[];
    default_pages: string[];
    customizable_options?: string[];
}

export type GuildTemplates = Record<'interest' | 'organization' | 'project' | 'custom', GuildTemplate>;

// Forum Types

export interface GuildForumPost {
    id: string;
    title: string;
    content: string;
    author_username: string;
    author_avatar?: string;
    is_pinned: boolean;
    is_locked: boolean;
    reply_count: number;
    created_at: string;
    updated_at: string;
}

export interface GuildForumReply {
    id: string;
    content: string;
    author_username: string;
    author_avatar?: string;
    created_at: string;
    updated_at: string;
}

// Event Types

export interface GuildEvent {
    id: string;
    title: string;
    description: string;
    start_time: string;
    end_time?: string;
    is_all_day: boolean;
    location?: string;
    url?: string;
    attendee_count: number;
    is_attending: boolean;
    created_by_username: string;
    created_at: string;
}

// Gamification Types

export interface GuildTask {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    point_value: number;
    xp_reward: number;
    completion_type: 'all' | 'majority' | 'any';
    is_completed: boolean;
    assigned_to: GuildMember[];
    completed_by: GuildMember[];
    due_date: string | null;
    completed_at: string | null;
    created_by_username: string;
    created_at: string;
}

export interface GuildHabit {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    frequency: 'daily' | 'weekdays' | 'weekly';
    point_value: number;
    xp_reward: number;
    participation_goal: number;
    is_active: boolean;
    today_status: {
        completed: number;
        total: number;
        percentage: number;
        user_completed: boolean;
    };
    created_at: string;
}

export interface GuildChallenge {
    id: string;
    title: string;
    description: string;
    icon: string;
    target_type: 'tasks' | 'habits' | 'xp' | 'streak';
    target_value: number;
    current_value: number;
    xp_reward: number;
    status: 'active' | 'completed' | 'failed';
    starts_at: string;
    deadline: string;
    progress_percentage: number;
    created_at: string;
}

export interface GuildLeaderboardEntry {
    user_id: string;
    username: string;
    display_name: string;
    profile_picture: string | null;
    xp_contributed: number;
    role: string;
    rank?: number;
}

export interface GuildStats {
    level: number;
    level_progress: number;
    total_xp: number;
    leaderboard: GuildLeaderboardEntry[];
    active_challenges: GuildChallenge[];
}

// Level System Types

export interface GuildLevelInfo {
    level: number;
    name: string;
    perks: string[];
    current_xp: number;
    current_threshold: number;
    next_threshold: number;
    progress: number;
    unlocked_perks: string[];
}

// Achievement Types

export interface GuildAchievement {
    id: string;
    achievement_key: string;
    name: string;
    description: string;
    icon: string;
    xp_reward: number;
    unlocked_at: string;
}

export interface AvailableAchievement {
    key: string;
    name: string;
    description: string;
    icon: string;
    xp_reward: number;
    unlocked: false;
}

// Treasury & Rewards Types

export interface GuildTreasury {
    balance: number;
    lifetime_earned: number;
    lifetime_spent: number;
    updated_at: string;
}

export interface GuildReward {
    id: string;
    name: string;
    description: string;
    icon: string;
    cost: number;
    reward_type: 'title' | 'badge' | 'role' | 'priority' | 'physical' | 'other';
    quantity_available?: number;
    max_per_member: number;
    is_active: boolean;
    redemption_count: number;
    can_redeem: boolean;
    user_redemptions: number;
    created_at: string;
}

export interface GuildRewardRedemption {
    id: string;
    reward_name: string;
    reward_icon: string;
    username: string;
    status: 'pending' | 'fulfilled' | 'cancelled';
    redeemed_at: string;
    fulfilled_at?: string;
    notes: string;
}

// Global Leaderboard Types

export interface GlobalGuildLeaderboardEntry {
    rank: number;
    id: string;
    name: string;
    slug: string;
    icon: string;
    guild_type: string;
    member_count: number;
    total_xp: number;
    level: number;
    level_name: string;
    is_verified: boolean;
}

// Focus Session Types

export interface FocusSession {
    id: string;
    title: string;
    description: string;
    scheduled_start: string;
    scheduled_end: string;
    work_duration: number;
    break_duration: number;
    cycles: number;
    max_participants: number;
    status: 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
    current_cycle: number;
    is_on_break: boolean;
    xp_per_cycle: number;
    host_username: string;
    participant_count: number;
    is_full: boolean;
    is_participant: boolean;
    created_at: string;
}

// Accountability Partnership Types

export interface AccountabilityPartnership {
    id: string;
    partner1_username: string;
    partner2_username: string;
    status: 'pending' | 'active' | 'ended';
    shared_goal: string;
    check_in_frequency: 'daily' | 'weekly' | 'biweekly';
    streak_days: number;
    last_check_in: string | null;
    total_check_ins: number;
    created_at: string;
}

export interface AccountabilityCheckIn {
    id: string;
    username: string;
    message: string;
    mood: 'great' | 'good' | 'okay' | 'struggling';
    progress_percent: number;
    created_at: string;
}
