'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuildStore } from '@/stores/guildStore';
import { useAuthStore } from '@/stores/authStore';
import { getMediaUrl } from '@/lib/media';
import {
    Users, Crown, Shield, Settings, LogOut, UserPlus, Vote,
    CheckCircle, Plus, X, Trophy, Zap, Layout, MessageSquare,
    Calendar, MapPin, Send, Gift, Star, Lock, Unlock,
    TrendingUp, Share2, MoreVertical, Clock, ExternalLink,
    Timer, Handshake, Play, Square, Target, Minus, Pencil, Trash2
} from 'lucide-react';

// Level calculation helper
function getGuildLevel(xp: number): { level: number; name: string; progress: number; nextXp: number } {
    const thresholds = [0, 500, 1500, 3000, 6000, 10000, 15000, 22000, 30000, 40000];
    const names = ['Starter', 'Growing', 'Active', 'Thriving', 'Established', 'Popular', 'Elite', 'Legendary', 'Mythic', 'Transcendent'];

    let level = 1;
    for (let i = 1; i < thresholds.length; i++) {
        if (xp >= thresholds[i]) level = i + 1;
        else break;
    }

    const currentThreshold = thresholds[level - 1] || 0;
    const nextThreshold = thresholds[level] || thresholds[thresholds.length - 1];
    const progress = nextThreshold > currentThreshold
        ? ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100
        : 100;

    return { level, name: names[level - 1] || 'Max', progress, nextXp: nextThreshold };
}

type TabType = 'overview' | 'tasks' | 'goals' | 'members' | 'polls' | 'forums' | 'events' | 'achievements' | 'rewards' | 'focus' | 'partners';

export default function GuildProfilePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const { user } = useAuthStore();
    const {
        currentGuild, userRole, isMember, loading,
        fetchGuild, joinGuild, leaveGuild,
        polls, fetchPolls, createPoll, votePoll,
        tasks, fetchTasks, createTask, completeTask,
        habits, fetchHabits, createHabit, logHabit,
        stats, fetchStats,
        forumPosts, fetchForumPosts, createForumPost,
        events, fetchEvents, rsvpEvent, createEvent,
        achievements, availableAchievements, fetchAchievements,
        treasury, fetchTreasury,
        rewards, fetchRewards, redeemReward,
        focusSessions, fetchFocusSessions, createFocusSession, joinFocusSession, controlFocusSession,
        partnerships, pendingPartnershipRequests, fetchPartnerships, requestPartnership, respondToPartnership, checkInPartnership
    } = useGuildStore();

    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [showCreatePoll, setShowCreatePoll] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showCreateEvent, setShowCreateEvent] = useState(false);
    const [showCreateSession, setShowCreateSession] = useState(false);
    const [joining, setJoining] = useState(false);

    // Form States
    const [newPost, setNewPost] = useState({ title: '', content: '' });
    const [newPoll, setNewPoll] = useState({
        title: '',
        description: '',
        poll_type: 'custom',
        options: ['Yes', 'No'],
    });
    const [newSession, setNewSession] = useState({
        title: '',
        description: '',
        work_duration: 25,
        break_duration: 5,
        cycles: 4,
        xp_per_cycle: 10,
    });
    const [newEvent, setNewEvent] = useState({
        title: '',
        description: '',
        location: '',
        start_time: '',
        end_time: '',
    });
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [showCreateGoal, setShowCreateGoal] = useState(false);
    const [taskFilter, setTaskFilter] = useState<'all' | 'mine' | 'pending' | 'completed'>('all');
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        point_value: 10,
        due_date: '',
        priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
        assignment_type: 'all' as 'all' | 'specific',
        assigned_to: [] as string[],
    });
    const [newGoal, setNewGoal] = useState({
        title: '',
        description: '',
        frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
        target_per_frequency: 1,
        point_value: 5,
        assignment_type: 'all' as 'all' | 'specific',
        assigned_to: [] as string[],
    });
    const [showEditGoal, setShowEditGoal] = useState(false);
    const [editGoal, setEditGoal] = useState<any>(null);

    useEffect(() => {
        if (slug) {
            fetchGuild(slug);
            fetchPolls(slug);
            if (isMember) {
                fetchTasks(slug);
                fetchHabits(slug);
                fetchStats(slug);
                fetchForumPosts(slug);
                fetchEvents(slug);
                fetchAchievements(slug);
                fetchTreasury(slug);
                fetchRewards(slug);
                fetchFocusSessions(slug);
                fetchPartnerships(slug);
            }
        }
    }, [slug, isMember]);

    const handleJoin = async () => {
        setJoining(true);
        try {
            await joinGuild(slug);
            fetchGuild(slug);
        } catch (error) {
            console.error('Failed to join:', error);
        } finally {
            setJoining(false);
        }
    };

    const handleLeave = async () => {
        if (confirm('Are you sure you want to leave this guild?')) {
            await leaveGuild(slug);
            router.push('/guilds');
        }
    };

    const handleCreatePoll = async () => {
        if (!newPoll.title.trim()) return;
        try {
            await createPoll(slug, {
                ...newPoll,
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            } as any);
            setShowCreatePoll(false);
            setNewPoll({ title: '', description: '', poll_type: 'custom', options: ['Yes', 'No'] });
        } catch (error) {
            console.error('Failed to create poll:', error);
        }
    };

    const handleVote = async (pollId: string, optionIndex: number) => {
        try {
            await votePoll(slug, pollId, optionIndex);
        } catch (error) {
            console.error('Failed to vote:', error);
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.title.trim() || !newPost.content.trim()) return;
        try {
            await createForumPost(slug, newPost);
            setShowCreatePost(false);
            setNewPost({ title: '', content: '' });
        } catch (error) {
            console.error('Failed to create post:', error);
        }
    };

    const handleRsvp = async (eventId: string) => {
        try {
            await rsvpEvent(slug, eventId);
        } catch (error) {
            console.error('Failed to RSVP:', error);
        }
    };

    const handleRedeemReward = async (rewardId: string) => {
        try {
            await redeemReward(slug, rewardId);
        } catch (error) {
            console.error('Failed to redeem:', error);
        }
    };

    const handleCreateSession = async () => {
        if (!newSession.title.trim()) return;
        try {
            const now = new Date();
            await createFocusSession(slug, {
                ...newSession,
                scheduled_start: now.toISOString(),
                scheduled_end: new Date(now.getTime() + (newSession.work_duration + newSession.break_duration) * newSession.cycles * 60 * 1000).toISOString(),
            } as any);
            setShowCreateSession(false);
            setNewSession({ title: '', description: '', work_duration: 25, break_duration: 5, cycles: 4, xp_per_cycle: 10 });
        } catch (error) {
            console.error('Failed to create session:', error);
        }
    };

    const handleCreateEvent = async () => {
        if (!newEvent.title.trim() || !newEvent.start_time) return;
        try {
            await createEvent(slug, {
                ...newEvent,
                start_time: new Date(newEvent.start_time).toISOString(),
                end_time: newEvent.end_time ? new Date(newEvent.end_time).toISOString() : new Date(newEvent.start_time).toISOString(),
            } as any);
            setShowCreateEvent(false);
            setNewEvent({ title: '', description: '', location: '', start_time: '', end_time: '' });
        } catch (error) {
            console.error('Failed to create event:', error);
        }
    };

    const handleCreateTask = async () => {
        if (!newTask.title.trim()) return;
        try {
            await createTask(slug, {
                title: newTask.title,
                description: newTask.description,
                point_value: newTask.point_value,
                due_date: newTask.due_date ? new Date(newTask.due_date).toISOString() : null,
                priority: newTask.priority,
                assigned_to: newTask.assignment_type === 'all' ? [] : newTask.assigned_to,
            } as any);
            setShowCreateTask(false);
            setNewTask({
                title: '',
                description: '',
                point_value: 10,
                due_date: '',
                priority: 'medium',
                assignment_type: 'all',
                assigned_to: [],
            });
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    const handleCreateGoal = async () => {
        if (!newGoal.title.trim()) return;
        try {
            await createHabit(slug, {
                name: newGoal.title,
                description: newGoal.description,
                frequency: newGoal.frequency,
                point_value: newGoal.point_value,
                xp_reward: newGoal.point_value,
                participation_goal: newGoal.target_per_frequency,
            } as any);
            setShowCreateGoal(false);
            setNewGoal({
                title: '',
                description: '',
                frequency: 'daily',
                target_per_frequency: 1,
                point_value: 5,
                assignment_type: 'all',
                assigned_to: [],
            });
        } catch (error) {
            console.error('Failed to create goal:', error);
        }
    };

    const handleCompleteTask = async (taskId: string) => {
        try {
            await completeTask(slug, taskId);
        } catch (error) {
            console.error('Failed to complete task:', error);
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        if (!confirm('Are you sure you want to delete this task?')) return;
        try {
            // TODO: Add deleteTask to store
            console.log('Delete task:', taskId);
            // await deleteTask(slug, taskId);
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;
        try {
            // TODO: Add deleteHabit to store
            console.log('Delete goal:', goalId);
            // await deleteHabit(slug, goalId);
        } catch (error) {
            console.error('Failed to delete goal:', error);
        }
    };

    if (loading || !currentGuild) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/40">Loading guild...</p>
                </div>
            </div>
        );
    }

    const isAdmin = userRole === 'owner' || userRole === 'admin';
    const bannerUrl = getMediaUrl(currentGuild.banner) || currentGuild.banner_url;
    const logoUrl = getMediaUrl(currentGuild.logo);
    const levelInfo = getGuildLevel(currentGuild.total_xp || 0);

    const TABS: { key: TabType; label: string; icon: any; memberOnly?: boolean }[] = [
        { key: 'overview', label: 'Overview', icon: Layout },
        { key: 'tasks', label: 'Tasks', icon: CheckCircle, memberOnly: true },
        { key: 'goals', label: 'Goals', icon: Target, memberOnly: true },
        { key: 'focus', label: 'Focus', icon: Timer, memberOnly: true },
        { key: 'partners', label: 'Partners', icon: Handshake, memberOnly: true },
        { key: 'members', label: 'Members', icon: Users },
        { key: 'polls', label: 'Polls', icon: Vote },
        { key: 'forums', label: 'Forums', icon: MessageSquare, memberOnly: true },
        { key: 'events', label: 'Events', icon: Calendar, memberOnly: true },
        { key: 'achievements', label: 'Achievements', icon: Trophy, memberOnly: true },
        { key: 'rewards', label: 'Rewards', icon: Gift, memberOnly: true },
    ];

    return (
        <div className="min-h-screen bg-gray-950 pb-20">
            {/* Hero Banner */}
            <div className="relative h-64 md:h-72 overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-gray-900 to-cyan-900/50">
                    {bannerUrl && (
                        <motion.img
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.8 }}
                            src={bannerUrl}
                            alt="Banner"
                            className="w-full h-full object-cover opacity-60"
                        />
                    )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
            </div>

            {/* Guild Header Card - Below Banner */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-20 relative z-10">
                <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Logo with Level Ring */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative flex-shrink-0"
                        >
                            <svg className="w-24 h-24 md:w-28 md:h-28 -rotate-90" viewBox="0 0 160 160">
                                <circle cx="80" cy="80" r="72" fill="none" stroke="currentColor" strokeWidth="8" className="text-white/10" />
                                <circle
                                    cx="80" cy="80" r="72"
                                    fill="none"
                                    stroke="url(#guildLevel)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${levelInfo.progress * 4.52} 452`}
                                />
                                <defs>
                                    <linearGradient id="guildLevel" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#06b6d4" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-3 md:inset-4 rounded-full bg-gray-900 border-4 border-gray-800 overflow-hidden flex items-center justify-center shadow-xl">
                                {logoUrl ? (
                                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-4xl md:text-5xl">{currentGuild.icon}</span>
                                )}
                            </div>
                            {/* Level Badge */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-xs font-bold text-white shadow-lg whitespace-nowrap">
                                Lv.{levelInfo.level} • {levelInfo.name}
                            </div>
                        </motion.div>

                        {/* Guild Info */}
                        <div className="flex-1 min-w-0">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="text-2xl md:text-3xl font-bold text-white truncate">{currentGuild.name}</h1>
                                    {currentGuild.is_verified && (
                                        <Shield size={22} className="text-cyan-400 flex-shrink-0" fill="currentColor" />
                                    )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                    <span className="px-3 py-1.5 bg-white/10 rounded-lg text-white/70 flex items-center gap-1.5">
                                        <Users size={14} /> {currentGuild.member_count} Members
                                    </span>
                                    <span className="px-3 py-1.5 bg-white/10 rounded-lg text-white/70 flex items-center gap-1.5">
                                        <Trophy size={14} className="text-yellow-400" /> {currentGuild.total_xp?.toLocaleString()} XP
                                    </span>
                                    <span className="px-3 py-1.5 bg-purple-500/20 rounded-lg text-purple-300 capitalize">
                                        {currentGuild.guild_type}
                                    </span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Actions */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex gap-2 flex-shrink-0"
                        >
                            {isMember ? (
                                <>
                                    {isAdmin && (
                                        <button
                                            onClick={() => router.push(`/guilds/${slug}/manage`)}
                                            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 transition-colors"
                                            title="Manage"
                                        >
                                            <Settings size={18} />
                                        </button>
                                    )}
                                    <button className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/10 transition-colors" title="Share">
                                        <Share2 size={18} />
                                    </button>
                                    <button
                                        onClick={handleLeave}
                                        className="p-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/20 transition-colors"
                                        title="Leave"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={handleJoin}
                                    disabled={joining}
                                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-lg transition-all"
                                >
                                    <UserPlus size={18} />
                                    {joining ? 'Joining...' : 'Join Guild'}
                                </button>
                            )}
                        </motion.div>
                    </div>

                    {/* Level Progress Bar - Inside Card */}
                    <div className="mt-5 pt-5 border-t border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/60">Level Progress</span>
                            <span className="text-sm text-cyan-400">{currentGuild.total_xp?.toLocaleString()} / {levelInfo.nextXp.toLocaleString()} XP</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${levelInfo.progress}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="sticky top-16 z-40 bg-gray-950/90 backdrop-blur-xl border-b border-white/5 mt-6">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
                        {TABS.map((tab) => {
                            if (tab.memberOnly && !isMember) return null;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === tab.key
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    {/* About */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <h3 className="text-xl font-bold text-white mb-4">About</h3>
                                        <p className="text-white/70 whitespace-pre-wrap leading-relaxed">
                                            {currentGuild.description || "Welcome to the guild! No description provided yet."}
                                        </p>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Members', value: currentGuild.member_count, icon: Users, color: 'cyan' },
                                            { label: 'Total XP', value: currentGuild.total_xp?.toLocaleString(), icon: Trophy, color: 'yellow' },
                                            { label: 'Level', value: levelInfo.level, icon: TrendingUp, color: 'purple' },
                                            { label: 'Polls', value: polls.length, icon: Vote, color: 'green' },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                                                <stat.icon size={24} className={`mx-auto mb-2 text-${stat.color}-400`} />
                                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                                <div className="text-sm text-white/50">{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-4">Your Status</h3>
                                        {isMember ? (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userRole === 'owner' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        userRole === 'admin' ? 'bg-cyan-500/20 text-cyan-400' :
                                                            'bg-white/10 text-white/60'
                                                        }`}>
                                                        {userRole === 'owner' ? <Crown size={20} /> : userRole === 'admin' ? <Shield size={20} /> : <UserPlus size={20} />}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-medium capitalize">{userRole}</div>
                                                        <div className="text-xs text-white/50">Member</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-white/60 text-sm mb-4">Join to participate!</p>
                                                <button
                                                    onClick={handleJoin}
                                                    className="w-full py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-white font-medium"
                                                >
                                                    Join Now
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ACHIEVEMENTS TAB */}
                        {activeTab === 'achievements' && (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Guild Achievements</h2>
                                        <p className="text-white/50">Unlock achievements to earn bonus XP</p>
                                    </div>
                                    <div className="px-4 py-2 bg-white/5 rounded-xl text-white/60">
                                        {achievements.length} / {achievements.length + availableAchievements.length} Unlocked
                                    </div>
                                </div>

                                {/* Unlocked */}
                                {achievements.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <Unlock size={20} className="text-green-400" />
                                            Unlocked
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {achievements.map((ach) => (
                                                <motion.div
                                                    key={ach.id}
                                                    whileHover={{ scale: 1.05 }}
                                                    className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-2xl p-4 text-center"
                                                >
                                                    <div className="text-4xl mb-2">{ach.icon}</div>
                                                    <div className="font-semibold text-white text-sm">{ach.name}</div>
                                                    <div className="text-xs text-white/50 mt-1">{ach.description}</div>
                                                    {ach.xp_reward > 0 && (
                                                        <div className="mt-2 text-xs text-cyan-400">+{ach.xp_reward} XP</div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Locked */}
                                {availableAchievements.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                            <Lock size={20} className="text-white/40" />
                                            Locked ({availableAchievements.length})
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {availableAchievements.map((ach) => (
                                                <div
                                                    key={ach.key}
                                                    className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center opacity-60"
                                                >
                                                    <div className="text-4xl mb-2 grayscale">{ach.icon}</div>
                                                    <div className="font-semibold text-white text-sm">{ach.name}</div>
                                                    <div className="text-xs text-white/50 mt-1">{ach.description}</div>
                                                    {ach.xp_reward > 0 && (
                                                        <div className="mt-2 text-xs text-white/40">+{ach.xp_reward} XP</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* REWARDS TAB */}
                        {activeTab === 'rewards' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Rewards Store</h2>
                                        <p className="text-white/50">Redeem rewards using guild treasury points</p>
                                    </div>
                                    {treasury && (
                                        <div className="px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl">
                                            <span className="text-yellow-400 font-bold">{treasury.balance.toLocaleString()}</span>
                                            <span className="text-white/60 ml-1">Treasury Points</span>
                                        </div>
                                    )}
                                </div>

                                {levelInfo.level < 7 ? (
                                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                                        <Lock size={48} className="mx-auto text-white/20 mb-4" />
                                        <p className="text-white/60 mb-2">Rewards Store unlocks at Level 7</p>
                                        <p className="text-sm text-white/40">Current Level: {levelInfo.level}</p>
                                    </div>
                                ) : rewards.length === 0 ? (
                                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                                        <Gift size={48} className="mx-auto text-white/20 mb-4" />
                                        <p className="text-white/50">No rewards available yet</p>
                                        {isAdmin && (
                                            <button className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg">
                                                Add Reward
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {rewards.map((reward) => (
                                            <div key={reward.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                                <div className="flex items-start justify-between mb-3">
                                                    <span className="text-3xl">{reward.icon}</span>
                                                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-bold">
                                                        {reward.cost} pts
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-white">{reward.name}</h3>
                                                <p className="text-sm text-white/50 mt-1">{reward.description}</p>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <span className="text-xs text-white/40">
                                                        {reward.quantity_available ? `${reward.quantity_available - reward.redemption_count} left` : 'Unlimited'}
                                                    </span>
                                                    <button
                                                        onClick={() => handleRedeemReward(reward.id)}
                                                        disabled={!reward.can_redeem}
                                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${reward.can_redeem
                                                            ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                                            : 'bg-white/10 text-white/40 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        {reward.user_redemptions >= reward.max_per_member ? 'Claimed' : 'Redeem'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ... Other tabs (tasks, habits, members, polls, forums, events) remain similar but with improved styling */}

                        {/* MEMBERS TAB */}
                        {activeTab === 'members' && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white mb-6">Members ({currentGuild.member_count})</h2>
                                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                    {currentGuild.members?.map((member) => (
                                        <div key={member.id} className="flex items-center gap-4 p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                                {member.first_name?.[0] || member.username[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-white font-medium">{member.username}</div>
                                                <div className="text-sm text-white/50">{member.xp_contributed} XP contributed</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {member.role === 'owner' && <Crown size={18} className="text-yellow-400" />}
                                                {member.role === 'admin' && <Shield size={18} className="text-cyan-400" />}
                                                <span className="text-sm text-white/60 capitalize px-2 py-1 bg-white/5 rounded">{member.role}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* POLLS TAB */}
                        {activeTab === 'polls' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Vote className="text-cyan-400" size={28} />
                                        Polls & Voting
                                    </h2>
                                    {isMember && (
                                        <button
                                            onClick={() => setShowCreatePoll(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                                        >
                                            <Plus size={18} /> Create Poll
                                        </button>
                                    )}
                                </div>

                                {/* Stats Bar */}
                                <div className="flex gap-4 text-sm">
                                    <span className="text-white/50">
                                        <span className="text-cyan-400 font-bold">{polls.filter(p => p.status === 'active').length}</span> active
                                    </span>
                                    <span className="text-white/50">
                                        <span className="text-green-400 font-bold">{polls.filter(p => p.status === 'closed').length}</span> closed
                                    </span>
                                </div>

                                {polls.length === 0 ? (
                                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                                        <Vote size={48} className="mx-auto text-white/20 mb-4" />
                                        <p className="text-white/60 mb-2">No polls yet</p>
                                        <p className="text-sm text-white/40">Create a poll to gather community decisions!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {polls.map((poll) => {
                                            const isExpired = poll.deadline && new Date(poll.deadline) < new Date();
                                            const timeLeft = poll.deadline ? Math.max(0, Math.floor((new Date(poll.deadline).getTime() - Date.now()) / (1000 * 60 * 60))) : null;

                                            return (
                                                <div key={poll.id} className={`border rounded-2xl p-6 ${poll.status !== 'active'
                                                    ? 'bg-gray-800/50 border-gray-700'
                                                    : 'bg-white/5 border-white/10'
                                                    }`}>
                                                    {/* Poll Header */}
                                                    <div className="flex items-start justify-between gap-4 mb-4">
                                                        <div>
                                                            <h3 className="text-lg font-semibold text-white">{poll.title}</h3>
                                                            {poll.description && (
                                                                <p className="text-sm text-white/50 mt-1">{poll.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            {/* Poll Type Badge */}
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${poll.poll_type === 'admin_vote' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                poll.poll_type === 'task_approval' ? 'bg-purple-500/20 text-purple-400' :
                                                                    'bg-white/10 text-white/60'
                                                                }`}>
                                                                {poll.poll_type === 'admin_vote' ? '👑 Admin Vote' :
                                                                    poll.poll_type === 'task_approval' ? '📋 Task Approval' :
                                                                        '📊 Poll'}
                                                            </span>
                                                            {/* Status Badge */}
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${poll.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                                'bg-gray-500/20 text-gray-400'
                                                                }`}>
                                                                {poll.status === 'active' ? '● Active' : '○ Closed'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Deadline Info */}
                                                    {poll.deadline && poll.status === 'active' && (
                                                        <div className={`text-sm mb-3 flex items-center gap-1 ${isExpired ? 'text-red-400' : timeLeft && timeLeft < 24 ? 'text-yellow-400' : 'text-white/50'
                                                            }`}>
                                                            <Clock size={14} />
                                                            {isExpired
                                                                ? 'Voting ended'
                                                                : timeLeft !== null
                                                                    ? `${timeLeft}h remaining`
                                                                    : `Ends: ${new Date(poll.deadline).toLocaleDateString()}`
                                                            }
                                                        </div>
                                                    )}

                                                    {/* Voting Options */}
                                                    <div className="space-y-2">
                                                        {poll.options.map((option, idx) => {
                                                            const votes = poll.results?.[option] || 0;
                                                            const totalVotes = poll.vote_count || 1;
                                                            const percent = Math.round((votes / totalVotes) * 100) || 0;
                                                            const isUserVote = false; // TODO: track user's actual vote index

                                                            return (
                                                                <button
                                                                    key={idx}
                                                                    onClick={() => !poll.user_voted && poll.status === 'active' && isMember && handleVote(poll.id, idx)}
                                                                    disabled={poll.user_voted || poll.status !== 'active' || !isMember}
                                                                    className={`w-full p-3 rounded-lg border text-left relative overflow-hidden transition-all ${isUserVote
                                                                        ? 'border-cyan-500 bg-cyan-500/10'
                                                                        : 'border-white/10 hover:border-cyan-500/50'
                                                                        } disabled:cursor-default`}
                                                                >
                                                                    {(poll.user_voted || poll.status !== 'active') && (
                                                                        <div className="absolute inset-y-0 left-0 bg-cyan-500/20" style={{ width: `${percent}%` }} />
                                                                    )}
                                                                    <div className="relative flex justify-between">
                                                                        <span className={`${isUserVote ? 'text-cyan-400 font-medium' : 'text-white'}`}>
                                                                            {option} {isUserVote && '✓'}
                                                                        </span>
                                                                        {(poll.user_voted || poll.status !== 'active') && (
                                                                            <span className="text-white/60">{votes} ({percent}%)</span>
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
                                                        <span className="text-sm text-white/40">{poll.vote_count} votes</span>
                                                        {/* Close Poll Button (Admin/Creator only) */}
                                                        {isAdmin && poll.status === 'active' && (
                                                            <button
                                                                onClick={async () => {
                                                                    // TODO: Add closePoll to store
                                                                    console.log('Close poll:', poll.id);
                                                                }}
                                                                className="text-sm text-red-400 hover:text-red-300 transition-colors"
                                                            >
                                                                Close Poll
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* FORUMS TAB */}
                        {activeTab === 'forums' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white">Discussions</h2>
                                    {isMember && (
                                        <button
                                            onClick={() => setShowCreatePost(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                                        >
                                            <Plus size={18} /> New Post
                                        </button>
                                    )}
                                </div>
                                {forumPosts.length === 0 ? (
                                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                                        <MessageSquare size={48} className="mx-auto text-white/20 mb-4" />
                                        <p className="text-white/50">No discussions yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {forumPosts.map((post) => (
                                            <div key={post.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.07] transition-colors">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex-shrink-0 flex items-center justify-center text-white font-medium">
                                                        {post.author_username[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-white">{post.title}</h3>
                                                        <p className="text-white/60 text-sm line-clamp-2 mt-1">{post.content}</p>
                                                        <div className="flex items-center gap-4 mt-3 text-sm text-white/40">
                                                            <span>@{post.author_username}</span>
                                                            <span>•</span>
                                                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <MessageSquare size={14} /> {post.reply_count} replies
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* EVENTS TAB */}
                        {activeTab === 'events' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
                                    {isAdmin && (
                                        <button
                                            onClick={() => setShowCreateEvent(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                                        >
                                            <Plus size={18} /> New Event
                                        </button>
                                    )}
                                </div>
                                {events.length === 0 ? (
                                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                                        <Calendar size={48} className="mx-auto text-white/20 mb-4" />
                                        <p className="text-white/50">No upcoming events</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {events.map((event) => (
                                            <div key={event.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                                <div className="flex items-center gap-2 text-cyan-400 text-sm mb-2">
                                                    <Calendar size={14} />
                                                    <span>{new Date(event.start_time).toLocaleString()}</span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-white mb-2">{event.title}</h3>
                                                {event.location && (
                                                    <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
                                                        <MapPin size={14} />
                                                        <span>{event.location}</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                                    <span className="text-sm text-white/40">{event.attendee_count} attending</span>
                                                    <button
                                                        onClick={() => handleRsvp(event.id)}
                                                        className={`px-4 py-1.5 rounded-lg text-sm font-medium ${event.is_attending
                                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                            : 'bg-white/10 text-white hover:bg-white/20'
                                                            }`}
                                                    >
                                                        {event.is_attending ? '✓ Going' : 'RSVP'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TASKS TAB */}
                        {activeTab === 'tasks' && (
                            <div className="space-y-4">
                                {/* Header with title and create button */}
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <CheckCircle className="text-cyan-400" size={28} />
                                        Guild Tasks
                                    </h2>
                                    {isAdmin && (
                                        <button
                                            onClick={() => setShowCreateTask(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                                        >
                                            <Plus size={18} /> New Task
                                        </button>
                                    )}
                                </div>

                                {/* Filter Tabs */}
                                <div className="flex gap-2 mb-4 flex-wrap">
                                    {['all', 'mine', 'pending', 'completed'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => setTaskFilter(filter as any)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${taskFilter === filter
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            {filter === 'all' && 'All Tasks'}
                                            {filter === 'mine' && 'My Tasks'}
                                            {filter === 'pending' && 'Pending'}
                                            {filter === 'completed' && 'Completed'}
                                        </button>
                                    ))}
                                </div>

                                {/* Stats Bar */}
                                <div className="flex gap-4 mb-4 text-sm">
                                    <span className="text-white/50">
                                        <span className="text-cyan-400 font-bold">{tasks.filter(t => !t.is_completed).length}</span> pending
                                    </span>
                                    <span className="text-white/50">
                                        <span className="text-green-400 font-bold">{tasks.filter(t => t.is_completed).length}</span> completed
                                    </span>
                                </div>

                                {/* Task List */}
                                {(() => {
                                    const filteredTasks = tasks.filter(task => {
                                        if (taskFilter === 'pending') return !task.is_completed;
                                        if (taskFilter === 'completed') return task.is_completed;
                                        if (taskFilter === 'mine') return task.assigned_to?.some((u: any) => u.id === user?.id);
                                        return true;
                                    });

                                    if (filteredTasks.length === 0) {
                                        return (
                                            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                                                <CheckCircle size={48} className="mx-auto text-white/20 mb-4" />
                                                <p className="text-white/60 mb-2">
                                                    {taskFilter === 'completed' ? 'No completed tasks yet' :
                                                        taskFilter === 'pending' ? 'All tasks completed! 🎉' :
                                                            taskFilter === 'mine' ? 'No tasks assigned to you' :
                                                                'No tasks yet'}
                                                </p>
                                                {isAdmin && taskFilter !== 'completed' && (
                                                    <button
                                                        onClick={() => setShowCreateTask(true)}
                                                        className="mt-3 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                                                    >
                                                        Create First Task
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-3">
                                            {filteredTasks.map((task) => {
                                                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.is_completed;
                                                return (
                                                    <div
                                                        key={task.id}
                                                        className={`p-4 border rounded-xl transition-all hover:border-white/20 ${task.is_completed
                                                            ? 'bg-green-500/10 border-green-500/30'
                                                            : isOverdue
                                                                ? 'bg-red-500/10 border-red-500/30'
                                                                : 'bg-white/5 border-white/10'
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            {/* Completion Checkbox */}
                                                            <button
                                                                onClick={() => !task.is_completed && handleCompleteTask(task.id)}
                                                                disabled={task.is_completed}
                                                                className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${task.is_completed
                                                                    ? 'bg-green-500 border-green-500'
                                                                    : 'border-white/30 hover:border-cyan-400 hover:bg-cyan-400/10'
                                                                    }`}
                                                            >
                                                                {task.is_completed && <CheckCircle size={14} className="text-white" />}
                                                            </button>

                                                            {/* Task Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className={`font-medium ${task.is_completed ? 'text-white/50 line-through' : 'text-white'}`}>
                                                                    {task.title}
                                                                </div>
                                                                {task.description && (
                                                                    <div className="text-sm text-white/40 mt-1 line-clamp-2">{task.description}</div>
                                                                )}

                                                                {/* Meta Row */}
                                                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                                    {/* Due Date */}
                                                                    {task.due_date && (
                                                                        <span className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-white/40'
                                                                            }`}>
                                                                            <Clock size={12} />
                                                                            {isOverdue ? 'Overdue: ' : 'Due: '}
                                                                            {new Date(task.due_date).toLocaleDateString()}
                                                                        </span>
                                                                    )}

                                                                    {/* Assignees */}
                                                                    {task.assigned_to && task.assigned_to.length > 0 && (
                                                                        <span className="text-xs text-white/40">
                                                                            👥 {task.assigned_to.length} assigned
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Right Side: Priority + XP + Actions */}
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <span className={`px-2 py-1 rounded text-xs font-medium ${task.priority === 'high' || task.priority === 'urgent'
                                                                    ? 'bg-red-500/20 text-red-400'
                                                                    : task.priority === 'medium'
                                                                        ? 'bg-yellow-500/20 text-yellow-400'
                                                                        : 'bg-white/10 text-white/50'
                                                                    }`}>
                                                                    {task.priority}
                                                                </span>
                                                                <span className="text-sm text-amber-400 font-mono">🪙 {task.point_value}</span>

                                                                {/* Delete Button (Admin only) */}
                                                                {isAdmin && (
                                                                    <button
                                                                        onClick={() => handleDeleteTask(task.id)}
                                                                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                                        title="Delete task"
                                                                    >
                                                                        <X size={14} className="text-red-400" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}

                        {/* GOALS TAB */}
                        {activeTab === 'goals' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <Target className="text-cyan-400" size={28} />
                                        Guild Goals
                                    </h2>
                                    {isAdmin && (
                                        <button
                                            onClick={() => setShowCreateGoal(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                                        >
                                            <Plus size={18} /> New Goal
                                        </button>
                                    )}
                                </div>

                                {/* Stats Bar */}
                                <div className="flex gap-4 text-sm">
                                    <span className="text-white/50">
                                        <span className="text-cyan-400 font-bold">{habits.length}</span> active goals
                                    </span>
                                    <span className="text-white/50">
                                        <span className="text-green-400 font-bold">
                                            {habits.filter(h => h.today_status?.user_completed).length}
                                        </span> logged today
                                    </span>
                                </div>

                                {habits.length === 0 ? (
                                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                                        <Target size={48} className="mx-auto text-white/20 mb-4" />
                                        <p className="text-white/60 mb-2">No guild goals yet</p>
                                        <p className="text-sm text-white/40">Set collective goals for the guild to work towards!</p>
                                        {isAdmin && (
                                            <button
                                                onClick={() => setShowCreateGoal(true)}
                                                className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                                            >
                                                Create First Goal
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {habits.map((habit) => {
                                            const userCompleted = habit.today_status?.user_completed;
                                            return (
                                                <div key={habit.id} className={`group p-5 border rounded-2xl transition-all ${userCompleted
                                                    ? 'bg-green-500/10 border-green-500/30'
                                                    : 'bg-white/5 border-white/10 hover:border-white/20'
                                                    }`}>
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">{habit.icon || '🎯'}</span>
                                                            <div>
                                                                <div className={`font-semibold ${userCompleted ? 'text-green-400' : 'text-white'}`}>
                                                                    {habit.name}
                                                                    {userCompleted && <span className="ml-2 text-xs">✓ Logged</span>}
                                                                </div>
                                                                {habit.description && (
                                                                    <div className="text-sm text-white/50 mt-0.5">{habit.description}</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            {/* Frequency Badge */}
                                                            <span className="px-2 py-0.5 bg-white/10 text-white/50 rounded text-xs">
                                                                {habit.frequency || 'daily'}
                                                            </span>

                                                            {/* XP Badge */}
                                                            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-medium">
                                                                +{habit.xp_reward} XP
                                                            </span>

                                                            {/* Log Today Button */}
                                                            {!userCompleted && (
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            await logHabit(slug, habit.id);
                                                                            fetchHabits(slug);
                                                                        } catch (e) {
                                                                            console.error('Failed to log habit:', e);
                                                                        }
                                                                    }}
                                                                    className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center gap-1"
                                                                >
                                                                    <CheckCircle size={14} /> Log Today
                                                                </button>
                                                            )}

                                                            {/* Edit/Delete (Admin only) */}
                                                            {isAdmin && (
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditGoal(habit);
                                                                            setShowEditGoal(true);
                                                                        }}
                                                                        className="p-1.5 hover:bg-white/10 rounded-lg"
                                                                        title="Edit goal"
                                                                    >
                                                                        <Pencil size={14} className="text-cyan-400" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteGoal(habit.id)}
                                                                        className="p-1.5 hover:bg-red-500/20 rounded-lg"
                                                                        title="Delete goal"
                                                                    >
                                                                        <X size={14} className="text-red-400" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    {habit.today_status && (
                                                        <div className="mt-4">
                                                            <div className="flex items-center justify-between text-sm mb-1">
                                                                <span className="text-white/50">Team Progress Today</span>
                                                                <span className="text-cyan-400 font-mono">
                                                                    {habit.today_status.completed}/{habit.today_status.total} members ({Math.round(habit.today_status.percentage)}%)
                                                                </span>
                                                            </div>
                                                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                                                                    style={{ width: `${habit.today_status.percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* FOCUS SESSIONS TAB */}
                        {activeTab === 'focus' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <Timer className="text-cyan-400" size={28} />
                                            Focus Sessions
                                        </h2>
                                        <p className="text-white/50">Synchronized co-working Pomodoro sessions</p>
                                    </div>
                                    <button
                                        onClick={() => setShowCreateSession(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                                    >
                                        <Plus size={18} /> Schedule Session
                                    </button>
                                </div>

                                {focusSessions.length === 0 ? (
                                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                                        <Timer size={48} className="mx-auto text-white/20 mb-4" />
                                        <p className="text-white/60 mb-2">No focus sessions scheduled</p>
                                        <p className="text-sm text-white/40">Schedule a session to co-work with guild members!</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {focusSessions.map((session) => (
                                            <div key={session.id} className={`p-5 border rounded-2xl ${session.status === 'active'
                                                ? 'bg-cyan-500/10 border-cyan-500/30'
                                                : 'bg-white/5 border-white/10'
                                                }`}>
                                                {/* Status Badge */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                        session.status === 'scheduled' ? 'bg-cyan-500/20 text-cyan-400' :
                                                            'bg-white/10 text-white/50'
                                                        }`}>
                                                        {session.status === 'active' ? '🟢 Live' : session.status}
                                                    </span>
                                                    <span className="text-xs text-white/40">
                                                        {session.participant_count}/{session.max_participants}
                                                    </span>
                                                </div>

                                                <h3 className="text-lg font-semibold text-white mb-2">{session.title}</h3>

                                                {/* Time & Settings */}
                                                <div className="flex items-center gap-4 text-sm text-white/50 mb-3">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={14} />
                                                        {new Date(session.scheduled_start).toLocaleString()}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-white/40 mb-4">
                                                    <span className="px-2 py-1 bg-white/5 rounded">{session.work_duration}m work</span>
                                                    <span className="px-2 py-1 bg-white/5 rounded">{session.break_duration}m break</span>
                                                    <span className="px-2 py-1 bg-white/5 rounded">{session.cycles} cycles</span>
                                                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">+{session.xp_per_cycle * session.cycles} XP</span>
                                                </div>

                                                {/* Live Session Info */}
                                                {session.status === 'active' && (
                                                    <div className="mb-4 p-3 bg-white/5 rounded-lg">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm text-white/60">
                                                                {session.is_on_break ? '☕ Break' : '🎯 Focus'} - Cycle {session.current_cycle}/{session.cycles}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    {!session.is_participant && session.status === 'scheduled' && !session.is_full && (
                                                        <button
                                                            onClick={() => joinFocusSession(slug, session.id)}
                                                            className="flex-1 py-2 bg-cyan-500 text-white rounded-lg font-medium"
                                                        >
                                                            Join Session
                                                        </button>
                                                    )}
                                                    {session.is_participant && session.status === 'scheduled' && (
                                                        <span className="flex-1 py-2 text-center text-cyan-400 bg-cyan-500/10 rounded-lg">
                                                            ✓ Joined
                                                        </span>
                                                    )}
                                                    {session.is_participant && session.status === 'active' && (
                                                        <button className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg font-medium flex items-center justify-center gap-2">
                                                            <Play size={16} /> In Progress
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PARTNERS TAB */}
                        {activeTab === 'partners' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                            <Handshake className="text-purple-400" size={28} />
                                            Accountability Partners
                                        </h2>
                                        <p className="text-white/50">Pair up with members for mutual accountability</p>
                                    </div>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
                                        <Plus size={18} /> Find Partner
                                    </button>
                                </div>

                                {/* Pending Requests */}
                                {pendingPartnershipRequests.length > 0 && (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
                                        <h3 className="text-lg font-semibold text-yellow-400 mb-3">Pending Requests</h3>
                                        <div className="space-y-2">
                                            {pendingPartnershipRequests.map((req) => (
                                                <div key={req.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                    <div>
                                                        <span className="text-white font-medium">{req.partner1_username}</span>
                                                        <span className="text-white/40"> wants to partner with you</span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => respondToPartnership(slug, req.id, 'accept')}
                                                            className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm"
                                                        >
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => respondToPartnership(slug, req.id, 'decline')}
                                                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm"
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Active Partnerships */}
                                {partnerships.length === 0 ? (
                                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                                        <Handshake size={48} className="mx-auto text-white/20 mb-4" />
                                        <p className="text-white/60 mb-2">No accountability partners yet</p>
                                        <p className="text-sm text-white/40">Find a partner to keep each other motivated!</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        {partnerships.map((partnership) => (
                                            <div key={partnership.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="flex -space-x-2">
                                                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium border-2 border-gray-900">
                                                            {partnership.partner1_username[0].toUpperCase()}
                                                        </div>
                                                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium border-2 border-gray-900">
                                                            {partnership.partner2_username[0].toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-medium">
                                                            {partnership.partner1_username} & {partnership.partner2_username}
                                                        </div>
                                                        <div className="text-sm text-white/50 capitalize">{partnership.check_in_frequency} check-ins</div>
                                                    </div>
                                                </div>

                                                {partnership.shared_goal && (
                                                    <div className="p-3 bg-white/5 rounded-lg mb-4">
                                                        <div className="text-xs text-white/40 mb-1">Shared Goal</div>
                                                        <div className="text-sm text-white/80">{partnership.shared_goal}</div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 text-sm mb-4">
                                                    <div className="flex items-center gap-1 text-orange-400">
                                                        <span className="text-lg">🔥</span>
                                                        <span>{partnership.streak_days} day streak</span>
                                                    </div>
                                                    <div className="text-white/40">
                                                        {partnership.total_check_ins} total check-ins
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => checkInPartnership(slug, partnership.id, { mood: 'good', progress_percent: 50 })}
                                                    className="w-full py-2 bg-purple-500/20 text-purple-400 rounded-lg font-medium border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                                                >
                                                    Check In
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {/* Create Poll Modal */}
                {showCreatePoll && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreatePoll(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-white">Create Poll</h2>
                                <button onClick={() => setShowCreatePoll(false)} className="text-white/60 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <input
                                    type="text"
                                    value={newPoll.title}
                                    onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
                                    placeholder="Poll question..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
                                />
                                <div className="flex gap-2">
                                    <button onClick={handleCreatePoll} className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl font-medium">Create</button>
                                    <button onClick={() => setShowCreatePoll(false)} className="flex-1 py-2.5 bg-white/10 text-white rounded-xl">Cancel</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Create Post Modal */}
                {showCreatePost && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreatePost(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-white">New Discussion</h2>
                                <button onClick={() => setShowCreatePost(false)} className="text-white/60 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <input
                                    type="text"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    placeholder="Discussion title..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
                                />
                                <textarea
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    placeholder="Share your thoughts..."
                                    rows={4}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 resize-none"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreatePost}
                                        disabled={!newPost.title.trim() || !newPost.content.trim()}
                                        className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Send size={16} /> Post
                                    </button>
                                    <button onClick={() => setShowCreatePost(false)} className="flex-1 py-2.5 bg-white/10 text-white rounded-xl">Cancel</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Session Modal */}
            <AnimatePresence>
                {showCreateSession && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateSession(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Timer size={20} className="text-cyan-400" /> Schedule Focus Session
                                </h3>
                                <button onClick={() => setShowCreateSession(false)} className="text-white/60 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <input
                                    type="text"
                                    value={newSession.title}
                                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                                    placeholder="Session title (e.g., Study Sprint)"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
                                />
                                <textarea
                                    value={newSession.description}
                                    onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                                    placeholder="Session description (optional)"
                                    rows={2}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 resize-none"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-white/50 mb-1 block">Work (min)</label>
                                        <input
                                            type="number"
                                            value={newSession.work_duration}
                                            onChange={(e) => setNewSession({ ...newSession, work_duration: parseInt(e.target.value) || 25 })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/50 mb-1 block">Break (min)</label>
                                        <input
                                            type="number"
                                            value={newSession.break_duration}
                                            onChange={(e) => setNewSession({ ...newSession, break_duration: parseInt(e.target.value) || 5 })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/50 mb-1 block">Cycles</label>
                                        <input
                                            type="number"
                                            value={newSession.cycles}
                                            onChange={(e) => setNewSession({ ...newSession, cycles: parseInt(e.target.value) || 4 })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/50 mb-1 block">XP/Cycle</label>
                                        <input
                                            type="number"
                                            value={newSession.xp_per_cycle}
                                            onChange={(e) => setNewSession({ ...newSession, xp_per_cycle: parseInt(e.target.value) || 10 })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2 flex gap-2">
                                    <button
                                        onClick={handleCreateSession}
                                        disabled={!newSession.title.trim()}
                                        className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Play size={16} /> Start Session
                                    </button>
                                    <button onClick={() => setShowCreateSession(false)} className="flex-1 py-2.5 bg-white/10 text-white rounded-xl">Cancel</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Event Modal */}
            <AnimatePresence>
                {showCreateEvent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateEvent(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Calendar size={20} className="text-cyan-400" /> Create Event
                                </h3>
                                <button onClick={() => setShowCreateEvent(false)} className="text-white/60 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Event title"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
                                />
                                <textarea
                                    value={newEvent.description}
                                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                                    placeholder="Event description (optional)"
                                    rows={2}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 resize-none"
                                />
                                <input
                                    type="text"
                                    value={newEvent.location}
                                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                                    placeholder="Location (optional)"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-white/50 mb-1 block">Start Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={newEvent.start_time}
                                            onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/50 mb-1 block">End Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={newEvent.end_time}
                                            onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2 flex gap-2">
                                    <button
                                        onClick={handleCreateEvent}
                                        disabled={!newEvent.title.trim() || !newEvent.start_time}
                                        className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Calendar size={16} /> Create Event
                                    </button>
                                    <button onClick={() => setShowCreateEvent(false)} className="flex-1 py-2.5 bg-white/10 text-white rounded-xl">Cancel</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Task Modal */}
            <AnimatePresence>
                {showCreateTask && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateTask(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <CheckCircle size={20} className="text-cyan-400" /> Create Task
                                </h3>
                                <button onClick={() => setShowCreateTask(false)} className="text-white/60 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="Task title"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
                                />
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    placeholder="Task description (optional)"
                                    rows={2}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 resize-none"
                                />

                                {/* Priority Selector */}
                                <div>
                                    <label className="text-xs text-white/50 mb-2 block">Priority</label>
                                    <div className="flex gap-2">
                                        {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                                            <button
                                                key={priority}
                                                type="button"
                                                onClick={() => setNewTask({ ...newTask, priority })}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${newTask.priority === priority
                                                    ? priority === 'urgent' || priority === 'high'
                                                        ? 'bg-red-500 text-white'
                                                        : priority === 'medium'
                                                            ? 'bg-yellow-500 text-black'
                                                            : 'bg-green-500 text-white'
                                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                    }`}
                                            >
                                                {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Assignment Selector */}
                                <div>
                                    <label className="text-xs text-white/50 mb-2 block">Assign To</label>
                                    <div className="flex gap-2 mb-2">
                                        <button
                                            type="button"
                                            onClick={() => setNewTask({ ...newTask, assignment_type: 'all', assigned_to: [] })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${newTask.assignment_type === 'all'
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            👥 All Members
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewTask({ ...newTask, assignment_type: 'specific' })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${newTask.assignment_type === 'specific'
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            👤 Specific Members
                                        </button>
                                    </div>

                                    {/* Member Selection */}
                                    {newTask.assignment_type === 'specific' && currentGuild?.members && (
                                        <div className="bg-white/5 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                                            {currentGuild.members.map((member) => (
                                                <label
                                                    key={member.id}
                                                    className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={newTask.assigned_to.includes(member.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setNewTask({ ...newTask, assigned_to: [...newTask.assigned_to, member.id] });
                                                            } else {
                                                                setNewTask({ ...newTask, assigned_to: newTask.assigned_to.filter(id => id !== member.id) });
                                                            }
                                                        }}
                                                        className="rounded"
                                                    />
                                                    <span className="text-white text-sm">{member.username}</span>
                                                    <span className="text-white/40 text-xs capitalize">({member.role})</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-white/50 mb-1 block">🪙 Coins</label>
                                        <input
                                            type="number"
                                            value={newTask.point_value}
                                            onChange={(e) => setNewTask({ ...newTask, point_value: parseInt(e.target.value) || 10 })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/50 mb-1 block">Due Date</label>
                                        <input
                                            type="datetime-local"
                                            value={newTask.due_date}
                                            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2 flex gap-2">
                                    <button
                                        onClick={handleCreateTask}
                                        disabled={!newTask.title.trim()}
                                        className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={16} /> Create Task
                                    </button>
                                    <button onClick={() => setShowCreateTask(false)} className="flex-1 py-2.5 bg-white/10 text-white rounded-xl">Cancel</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Goal Modal */}
            <AnimatePresence>
                {showCreateGoal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateGoal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Target size={20} className="text-cyan-400" /> Create Goal
                                </h3>
                                <button onClick={() => setShowCreateGoal(false)} className="text-white/60 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <input
                                    type="text"
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                    placeholder="Goal title (e.g., Daily Meditation)"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
                                />
                                <textarea
                                    value={newGoal.description}
                                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                    placeholder="Description (optional)"
                                    rows={2}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 resize-none"
                                />

                                {/* Frequency Selector */}
                                <div>
                                    <label className="text-xs text-white/50 mb-2 block">Frequency</label>
                                    <div className="flex gap-2">
                                        {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                                            <button
                                                key={freq}
                                                type="button"
                                                onClick={() => setNewGoal({ ...newGoal, frequency: freq })}
                                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${newGoal.frequency === freq
                                                        ? 'bg-cyan-500 text-white'
                                                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                    }`}
                                            >
                                                {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Target per Frequency & Coins */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-white/50 mb-1 block">
                                            Times per {newGoal.frequency === 'daily' ? 'day' : newGoal.frequency === 'weekly' ? 'week' : 'month'}
                                        </label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={newGoal.target_per_frequency}
                                            onChange={(e) => setNewGoal({ ...newGoal, target_per_frequency: parseInt(e.target.value) || 1 })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-white/50 mb-1 block">🪙 Coins per completion</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={newGoal.point_value}
                                            onChange={(e) => setNewGoal({ ...newGoal, point_value: parseInt(e.target.value) || 5 })}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                                        />
                                    </div>
                                </div>

                                {/* Assignment Selector */}
                                <div>
                                    <label className="text-xs text-white/50 mb-2 block">Assign To</label>
                                    <div className="flex gap-2 mb-2">
                                        <button
                                            type="button"
                                            onClick={() => setNewGoal({ ...newGoal, assignment_type: 'all', assigned_to: [] })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${newGoal.assignment_type === 'all'
                                                    ? 'bg-cyan-500 text-white'
                                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            👥 All Members
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewGoal({ ...newGoal, assignment_type: 'specific' })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${newGoal.assignment_type === 'specific'
                                                    ? 'bg-cyan-500 text-white'
                                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            👤 Specific Members
                                        </button>
                                    </div>

                                    {/* Member Selection */}
                                    {newGoal.assignment_type === 'specific' && currentGuild?.members && (
                                        <div className="bg-white/5 rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
                                            {currentGuild.members.map((member) => (
                                                <label
                                                    key={member.id}
                                                    className="flex items-center gap-2 p-2 rounded hover:bg-white/5 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={newGoal.assigned_to.includes(member.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setNewGoal({ ...newGoal, assigned_to: [...newGoal.assigned_to, member.id] });
                                                            } else {
                                                                setNewGoal({ ...newGoal, assigned_to: newGoal.assigned_to.filter(id => id !== member.id) });
                                                            }
                                                        }}
                                                        className="rounded"
                                                    />
                                                    <span className="text-white text-sm">{member.username}</span>
                                                    <span className="text-white/40 text-xs capitalize">({member.role})</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2 flex gap-2">
                                    <button
                                        onClick={handleCreateGoal}
                                        disabled={!newGoal.title.trim()}
                                        className="flex-1 py-2.5 bg-cyan-500 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Target size={16} /> Create Goal
                                    </button>
                                    <button onClick={() => setShowCreateGoal(false)} className="flex-1 py-2.5 bg-white/10 text-white rounded-xl">Cancel</button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
