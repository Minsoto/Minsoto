import { create } from 'zustand';
import api from '@/lib/api';
import type {
    Guild, GuildPoll, GuildChangeRequest, GuildTemplates, GuildMember,
    GuildTask, GuildHabit, GuildStats, GuildForumPost, GuildEvent,
    GuildAchievement, AvailableAchievement, GuildTreasury, GuildReward, GlobalGuildLeaderboardEntry,
    FocusSession, AccountabilityPartnership
} from '@/types/guilds';

interface GuildState {
    // Data
    guilds: Guild[];
    myGuilds: Guild[];
    currentGuild: Guild | null;
    polls: GuildPoll[];
    changeRequests: GuildChangeRequest[];
    templates: GuildTemplates | null;

    // Gamification Data
    tasks: GuildTask[];
    habits: GuildHabit[];
    stats: GuildStats | null;

    // Forum & Events Data
    forumPosts: GuildForumPost[];
    events: GuildEvent[];

    // Achievements & Rewards Data
    achievements: GuildAchievement[];
    availableAchievements: AvailableAchievement[];
    treasury: GuildTreasury | null;
    rewards: GuildReward[];
    globalLeaderboard: GlobalGuildLeaderboardEntry[];

    // Focus Sessions & Partnerships Data
    focusSessions: FocusSession[];
    partnerships: AccountabilityPartnership[];
    pendingPartnershipRequests: AccountabilityPartnership[];

    // Loading states
    loading: boolean;

    // User's role in current guild
    userRole: 'owner' | 'admin' | 'member' | null;
    isMember: boolean;

    // Actions
    fetchGuilds: (type?: string, search?: string) => Promise<void>;
    fetchMyGuilds: () => Promise<void>;
    fetchGuild: (slug: string) => Promise<void>;
    fetchTemplates: () => Promise<void>;
    createGuild: (data: { name: string; description: string; icon: string; guild_type: string; is_public: boolean }) => Promise<Guild>;
    updateGuild: (slug: string, data: Partial<Guild> | FormData) => Promise<void>;
    deleteGuild: (slug: string) => Promise<void>;
    joinGuild: (slug: string) => Promise<void>;
    leaveGuild: (slug: string) => Promise<void>;
    fetchPolls: (slug: string, status?: string) => Promise<void>;
    createPoll: (slug: string, data: Partial<GuildPoll>) => Promise<GuildPoll>;
    votePoll: (slug: string, pollId: string, optionIndex: number) => Promise<void>;
    fetchChangeRequests: (slug: string) => Promise<void>;
    suggestChange: (slug: string, data: Partial<GuildChangeRequest>) => Promise<void>;
    reviewChange: (slug: string, changeId: string, action: 'approve' | 'reject', notes?: string) => Promise<void>;

    // Gamification Actions
    fetchTasks: (slug: string) => Promise<void>;
    createTask: (slug: string, data: Partial<GuildTask>) => Promise<void>;
    completeTask: (slug: string, taskId: string) => Promise<void>;
    fetchHabits: (slug: string) => Promise<void>;
    createHabit: (slug: string, data: Partial<GuildHabit>) => Promise<void>;
    logHabit: (slug: string, habitId: string, notes?: string) => Promise<void>;
    fetchStats: (slug: string) => Promise<void>;

    // Forum Actions
    fetchForumPosts: (slug: string) => Promise<void>;
    createForumPost: (slug: string, data: { title: string; content: string }) => Promise<void>;
    replyToPost: (slug: string, postId: string, content: string) => Promise<void>;

    // Event Actions
    fetchEvents: (slug: string, upcoming?: boolean) => Promise<void>;
    createEvent: (slug: string, data: Partial<GuildEvent>) => Promise<void>;
    rsvpEvent: (slug: string, eventId: string, action?: 'attend' | 'cancel' | 'toggle') => Promise<void>;

    // Achievement & Rewards Actions
    fetchAchievements: (slug: string) => Promise<void>;
    fetchTreasury: (slug: string) => Promise<void>;
    fetchRewards: (slug: string) => Promise<void>;
    createReward: (slug: string, data: Partial<GuildReward>) => Promise<void>;
    redeemReward: (slug: string, rewardId: string) => Promise<void>;
    fetchGlobalLeaderboard: (category?: string, limit?: number) => Promise<void>;

    // Focus Session Actions
    fetchFocusSessions: (slug: string) => Promise<void>;
    createFocusSession: (slug: string, data: Partial<FocusSession>) => Promise<void>;
    joinFocusSession: (slug: string, sessionId: string) => Promise<void>;
    controlFocusSession: (slug: string, sessionId: string, action: 'start' | 'end') => Promise<void>;

    // Partnership Actions
    fetchPartnerships: (slug: string) => Promise<void>;
    requestPartnership: (slug: string, partnerUsername: string, goal?: string) => Promise<void>;
    respondToPartnership: (slug: string, partnershipId: string, action: 'accept' | 'decline' | 'end') => Promise<void>;
    checkInPartnership: (slug: string, partnershipId: string, data: { message?: string; mood?: string; progress_percent?: number }) => Promise<void>;
}

export const useGuildStore = create<GuildState>((set, get) => ({
    guilds: [],
    myGuilds: [],
    currentGuild: null,
    polls: [],
    changeRequests: [],
    templates: null,
    tasks: [],
    habits: [],
    stats: null,
    forumPosts: [],
    events: [],
    achievements: [],
    availableAchievements: [],
    treasury: null,
    rewards: [],
    globalLeaderboard: [],
    focusSessions: [],
    partnerships: [],
    pendingPartnershipRequests: [],
    loading: false,
    userRole: null,
    isMember: false,

    fetchGuilds: async (type?: string, search?: string) => {
        set({ loading: true });
        try {
            const params = new URLSearchParams();
            if (type) params.append('type', type);
            if (search) params.append('search', search);
            const response = await api.get(`/guilds/?${params}`);
            set({ guilds: response.data });
        } catch (error) {
            console.error('Failed to fetch guilds:', error);
        } finally {
            set({ loading: false });
        }
    },

    fetchMyGuilds: async () => {
        try {
            const response = await api.get('/guilds/?my=true');
            set({ myGuilds: response.data });
        } catch (error) {
            console.error('Failed to fetch my guilds:', error);
        }
    },

    fetchGuild: async (slug: string) => {
        set({ loading: true });
        try {
            const response = await api.get(`/guilds/${slug}/`);
            set({
                currentGuild: response.data.guild,
                userRole: response.data.user_role,
                isMember: response.data.is_member
            });
        } catch (error) {
            console.error('Failed to fetch guild:', error);
            set({ currentGuild: null });
        } finally {
            set({ loading: false });
        }
    },

    fetchTemplates: async () => {
        try {
            const response = await api.get('/guilds/templates/');
            set({ templates: response.data });
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    },

    createGuild: async (data) => {
        const response = await api.post('/guilds/', data);
        const newGuild = response.data;
        set({ myGuilds: [...get().myGuilds, newGuild] });
        return newGuild;
    },

    updateGuild: async (slug, data) => {
        let headers = {};
        let payload = data;

        if (data instanceof FormData) {
            headers = { 'Content-Type': 'multipart/form-data' };
        }

        const response = await api.patch(`/guilds/${slug}/`, payload, { headers });
        set({ currentGuild: response.data });
    },

    deleteGuild: async (slug) => {
        await api.delete(`/guilds/${slug}/`);
        set({
            myGuilds: get().myGuilds.filter(g => g.slug !== slug),
            currentGuild: null
        });
    },

    joinGuild: async (slug) => {
        await api.post(`/guilds/${slug}/join/`);
        set({ isMember: true, userRole: 'member' });
        get().fetchMyGuilds();
    },

    leaveGuild: async (slug) => {
        await api.post(`/guilds/${slug}/leave/`);
        set({ isMember: false, userRole: null });
        set({ myGuilds: get().myGuilds.filter(g => g.slug !== slug) });
    },

    fetchPolls: async (slug, status = 'active') => {
        try {
            const response = await api.get(`/guilds/${slug}/polls/?status=${status}`);
            set({ polls: response.data });
        } catch (error) {
            console.error('Failed to fetch polls:', error);
        }
    },

    createPoll: async (slug, data) => {
        const response = await api.post(`/guilds/${slug}/polls/`, data);
        set({ polls: [response.data, ...get().polls] });
        return response.data;
    },

    votePoll: async (slug, pollId, optionIndex) => {
        const response = await api.post(`/guilds/${slug}/polls/${pollId}/vote/`, { option_index: optionIndex });
        set({ polls: get().polls.map(p => p.id === pollId ? response.data.poll : p) });
    },

    fetchChangeRequests: async (slug) => {
        try {
            const response = await api.get(`/guilds/${slug}/changes/`);
            set({ changeRequests: response.data });
        } catch (error) {
            console.error('Failed to fetch change requests:', error);
        }
    },

    suggestChange: async (slug, data) => {
        const response = await api.post(`/guilds/${slug}/changes/`, data);
        set({ changeRequests: [response.data, ...get().changeRequests] });
    },

    reviewChange: async (slug, changeId, action, notes = '') => {
        const response = await api.post(`/guilds/${slug}/changes/${changeId}/review/`, { action, notes });
        set({ changeRequests: get().changeRequests.map(c => c.id === changeId ? response.data.change : c) });
    },

    // Gamification Actions
    fetchTasks: async (slug) => {
        try {
            const response = await api.get(`/guilds/${slug}/tasks/`);
            set({ tasks: response.data });
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        }
    },

    createTask: async (slug, data) => {
        const response = await api.post(`/guilds/${slug}/tasks/`, data);
        set({ tasks: [response.data, ...get().tasks] });
    },

    completeTask: async (slug, taskId) => {
        const response = await api.post(`/guilds/${slug}/tasks/${taskId}/complete/`);
        set({ tasks: get().tasks.map(t => t.id === taskId ? response.data.task : t) });
    },

    fetchHabits: async (slug) => {
        try {
            const response = await api.get(`/guilds/${slug}/habits/`);
            set({ habits: response.data });
        } catch (error) {
            console.error('Failed to fetch habits:', error);
        }
    },

    createHabit: async (slug, data) => {
        const response = await api.post(`/guilds/${slug}/habits/`, data);
        set({ habits: [...get().habits, response.data] });
    },

    logHabit: async (slug, habitId, notes) => {
        const response = await api.post(`/guilds/${slug}/habits/${habitId}/log/`, { notes });
        set({ habits: get().habits.map(h => h.id === habitId ? response.data.habit : h) });
    },

    fetchStats: async (slug) => {
        try {
            const response = await api.get(`/guilds/${slug}/stats/`);
            set({ stats: response.data });
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    },

    // Forum Actions
    fetchForumPosts: async (slug) => {
        try {
            const response = await api.get(`/guilds/${slug}/forums/`);
            set({ forumPosts: response.data });
        } catch (error) {
            console.error('Failed to fetch forum posts:', error);
        }
    },

    createForumPost: async (slug, data) => {
        const response = await api.post(`/guilds/${slug}/forums/`, data);
        set({ forumPosts: [response.data, ...get().forumPosts] });
    },

    replyToPost: async (slug, postId, content) => {
        await api.post(`/guilds/${slug}/forums/${postId}/reply/`, { content });
        // Refetch posts to update reply counts
        get().fetchForumPosts(slug);
    },

    // Event Actions
    fetchEvents: async (slug, upcoming = true) => {
        try {
            const response = await api.get(`/guilds/${slug}/events/?upcoming=${upcoming}`);
            set({ events: response.data });
        } catch (error) {
            console.error('Failed to fetch events:', error);
        }
    },

    createEvent: async (slug, data) => {
        const response = await api.post(`/guilds/${slug}/events/`, data);
        set({ events: [response.data, ...get().events] });
    },

    rsvpEvent: async (slug, eventId, action = 'toggle') => {
        const response = await api.post(`/guilds/${slug}/events/${eventId}/rsvp/`, { action });
        set({
            events: get().events.map(e =>
                e.id === eventId
                    ? { ...e, is_attending: response.data.is_attending }
                    : e
            )
        });
    },

    // Achievement & Rewards Actions
    fetchAchievements: async (slug) => {
        try {
            const response = await api.get(`/guilds/${slug}/achievements/`);
            set({
                achievements: response.data.unlocked,
                availableAchievements: response.data.available
            });
        } catch (error) {
            console.error('Failed to fetch achievements:', error);
        }
    },

    fetchTreasury: async (slug) => {
        try {
            const response = await api.get(`/guilds/${slug}/treasury/`);
            if (response.data.enabled) {
                set({ treasury: response.data.treasury });
            } else {
                set({ treasury: null });
            }
        } catch (error) {
            console.error('Failed to fetch treasury:', error);
        }
    },

    fetchRewards: async (slug) => {
        try {
            const response = await api.get(`/guilds/${slug}/rewards/`);
            set({ rewards: response.data.rewards });
        } catch (error) {
            console.error('Failed to fetch rewards:', error);
        }
    },

    createReward: async (slug, data) => {
        const response = await api.post(`/guilds/${slug}/rewards/`, data);
        set({ rewards: [...get().rewards, response.data] });
    },

    redeemReward: async (slug, rewardId) => {
        await api.post(`/guilds/${slug}/rewards/${rewardId}/redeem/`);
        // Refresh rewards and treasury after redemption
        get().fetchRewards(slug);
        get().fetchTreasury(slug);
    },

    fetchGlobalLeaderboard: async (category = 'all', limit = 20) => {
        try {
            const response = await api.get(`/guilds/leaderboard/?category=${category}&limit=${limit}`);
            set({ globalLeaderboard: response.data.leaderboard });
        } catch (error) {
            console.error('Failed to fetch global leaderboard:', error);
        }
    },

    // Focus Session Actions
    fetchFocusSessions: async (slug) => {
        try {
            const response = await api.get(`/guilds/${slug}/focus-sessions/`);
            set({ focusSessions: response.data });
        } catch (error) {
            console.error('Failed to fetch focus sessions:', error);
        }
    },

    createFocusSession: async (slug, data) => {
        const response = await api.post(`/guilds/${slug}/focus-sessions/`, data);
        set({ focusSessions: [...get().focusSessions, response.data] });
    },

    joinFocusSession: async (slug, sessionId) => {
        await api.post(`/guilds/${slug}/focus-sessions/${sessionId}/join/`);
        get().fetchFocusSessions(slug);
    },

    controlFocusSession: async (slug, sessionId, action) => {
        await api.post(`/guilds/${slug}/focus-sessions/${sessionId}/action/`, { action });
        get().fetchFocusSessions(slug);
    },

    // Partnership Actions
    fetchPartnerships: async (slug) => {
        try {
            const response = await api.get(`/guilds/${slug}/partnerships/`);
            set({
                partnerships: response.data.active,
                pendingPartnershipRequests: response.data.pending_requests
            });
        } catch (error) {
            console.error('Failed to fetch partnerships:', error);
        }
    },

    requestPartnership: async (slug, partnerUsername, goal = '') => {
        await api.post(`/guilds/${slug}/partnerships/`, {
            partner_username: partnerUsername,
            shared_goal: goal
        });
        get().fetchPartnerships(slug);
    },

    respondToPartnership: async (slug, partnershipId, action) => {
        await api.post(`/guilds/${slug}/partnerships/${partnershipId}/action/`, { action });
        get().fetchPartnerships(slug);
    },

    checkInPartnership: async (slug, partnershipId, data) => {
        await api.post(`/guilds/${slug}/partnerships/${partnershipId}/checkin/`, data);
        get().fetchPartnerships(slug);
    },
}));
