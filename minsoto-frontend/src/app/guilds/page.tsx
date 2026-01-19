'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuildStore } from '@/stores/guildStore';
import { useAuthStore } from '@/stores/authStore';
import GuildCard from '@/components/guilds/GuildCard';
import {
    Users, Plus, Search, Castle, Briefcase, Target, Sparkles,
    ChevronRight, Crown, Shield, X, Trophy, TrendingUp, Star,
    Zap, ArrowRight
} from 'lucide-react';

const GUILD_TYPE_ICONS = {
    interest: Castle,
    organization: Briefcase,
    project: Target,
    custom: Sparkles,
};

const GUILD_TYPE_COLORS = {
    interest: 'from-purple-500 to-pink-500',
    organization: 'from-blue-500 to-cyan-500',
    project: 'from-orange-500 to-yellow-500',
    custom: 'from-green-500 to-emerald-500',
};

const GUILD_TYPE_INFO = {
    interest: { name: 'Interest', color: 'purple', desc: 'Communities & hobbies' },
    organization: { name: 'Organization', color: 'blue', desc: 'Companies & colleges' },
    project: { name: 'Project', color: 'orange', desc: 'Goal-oriented teams' },
    custom: { name: 'Custom', color: 'green', desc: 'Fully customizable' },
};

export default function GuildsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const {
        guilds, myGuilds, templates, loading,
        fetchGuilds, fetchMyGuilds, fetchTemplates, createGuild,
        globalLeaderboard, fetchGlobalLeaderboard
    } = useGuildStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'discover' | 'my' | 'leaderboard'>('discover');

    // Create guild form
    const [newGuild, setNewGuild] = useState({
        name: '',
        description: '',
        icon: '🏰',
        guild_type: 'interest',
        is_public: true
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchGuilds();
        fetchMyGuilds();
        fetchTemplates();
        fetchGlobalLeaderboard('all', 5);
    }, [fetchGuilds, fetchMyGuilds, fetchTemplates, fetchGlobalLeaderboard]);

    useEffect(() => {
        fetchGuilds(selectedType || undefined, searchQuery || undefined);
    }, [selectedType, searchQuery, fetchGuilds]);

    const handleCreateGuild = async () => {
        if (!newGuild.name.trim()) return;
        setCreating(true);
        try {
            const guild = await createGuild(newGuild);
            setShowCreateModal(false);
            router.push(`/guilds/${guild.slug}`);
        } catch (error) {
            console.error('Failed to create guild:', error);
        } finally {
            setCreating(false);
        }
    };

    const displayGuilds = activeTab === 'my' ? myGuilds : guilds;
    const featuredGuilds = guilds.filter(g => g.is_verified).slice(0, 4);

    return (
        <div className="min-h-screen bg-gray-950">
            {/* Animated Hero Section */}
            <div className="relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-gray-950 to-cyan-900/30" />
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full blur-3xl" />
                </div>

                <div className="relative pt-24 pb-16 px-4">
                    <div className="max-w-7xl mx-auto">
                        {/* Hero Content */}
                        <div className="text-center mb-12">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 mb-6"
                            >
                                <Zap size={16} className="text-yellow-400" />
                                <span className="text-sm text-white/80">Join {guilds.length}+ active communities</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-5xl md:text-7xl font-bold text-white mb-6"
                            >
                                Discover{' '}
                                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Guilds
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl text-white/60 max-w-2xl mx-auto mb-8"
                            >
                                Join communities, organizations, and project teams. Collaborate, compete, and grow together.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap justify-center gap-4"
                            >
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-cyan-500/25"
                                >
                                    <Plus size={20} />
                                    Create Guild
                                </button>
                                <button
                                    onClick={() => setActiveTab('leaderboard')}
                                    className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/10 hover:bg-white/20 transition-all"
                                >
                                    <Trophy size={20} className="text-yellow-400" />
                                    Leaderboard
                                </button>
                            </motion.div>
                        </div>

                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
                        >
                            {[
                                { label: 'Total Guilds', value: guilds.length, icon: Castle, color: 'cyan' },
                                { label: 'My Guilds', value: myGuilds.length, icon: Crown, color: 'yellow' },
                                { label: 'Verified', value: featuredGuilds.length, icon: Shield, color: 'green' },
                                { label: 'This Week', value: Math.floor(guilds.length * 0.3), icon: TrendingUp, color: 'purple' },
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center"
                                >
                                    <stat.icon size={24} className={`mx-auto mb-2 text-${stat.color}-400`} />
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-sm text-white/50">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 pb-20">
                {/* Navigation Tabs */}
                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-1">
                    <div className="flex gap-6">
                        {[
                            { key: 'discover', label: 'Discover', icon: Search },
                            { key: 'my', label: `My Guilds (${myGuilds.length})`, icon: Crown },
                            { key: 'leaderboard', label: 'Leaderboard', icon: Trophy },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`flex items-center gap-2 py-4 text-sm font-medium transition-colors relative ${activeTab === tab.key ? 'text-white' : 'text-white/50 hover:text-white/80'
                                    }`}
                            >
                                <tab.icon size={16} />
                                {tab.label}
                                {activeTab === tab.key && (
                                    <motion.div
                                        layoutId="tab-underline"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Discover Tab Content */}
                {activeTab === 'discover' && (
                    <>
                        {/* Featured Guilds */}
                        {featuredGuilds.length > 0 && (
                            <div className="mb-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Star className="text-yellow-400" size={20} />
                                        Featured Guilds
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {featuredGuilds.map((guild) => {
                                        const TypeIcon = GUILD_TYPE_ICONS[guild.guild_type as keyof typeof GUILD_TYPE_ICONS] || Castle;
                                        const gradientClass = GUILD_TYPE_COLORS[guild.guild_type as keyof typeof GUILD_TYPE_COLORS] || 'from-gray-500 to-gray-600';
                                        return (
                                            <GuildCard
                                                key={guild.id}
                                                guild={guild}
                                                gradientClass={gradientClass}
                                                TypeIcon={TypeIcon}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Search & Filters */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search guilds by name, description..."
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                />
                            </div>
                            <div className="flex gap-2">
                                {Object.entries(GUILD_TYPE_INFO).map(([type, info]) => {
                                    const Icon = GUILD_TYPE_ICONS[type as keyof typeof GUILD_TYPE_ICONS];
                                    return (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(selectedType === type ? null : type)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${selectedType === type
                                                    ? 'bg-white/20 text-white border-2 border-cyan-500'
                                                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                                                }`}
                                        >
                                            <Icon size={16} />
                                            <span className="hidden md:inline">{info.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* All Guilds */}
                        <h2 className="text-xl font-bold text-white mb-4">All Guilds</h2>
                    </>
                )}

                {/* Leaderboard Tab Content */}
                {activeTab === 'leaderboard' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                <Trophy className="text-yellow-400" size={28} />
                                Global Guild Leaderboard
                            </h2>
                        </div>

                        {globalLeaderboard.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                                <Trophy size={48} className="mx-auto text-white/20 mb-4" />
                                <p className="text-white/50">Loading leaderboard...</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {globalLeaderboard.map((entry, index) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => router.push(`/guilds/${entry.slug}`)}
                                        className="group flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 cursor-pointer transition-all"
                                    >
                                        {/* Rank */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                                entry.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                                                    entry.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                                                        'bg-white/5 text-white/50'
                                            }`}>
                                            #{entry.rank}
                                        </div>

                                        {/* Icon */}
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-3xl">
                                            {entry.icon}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                    {entry.name}
                                                </h3>
                                                {entry.is_verified && (
                                                    <Shield size={16} className="text-cyan-400" fill="currentColor" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-white/50">
                                                <span className="flex items-center gap-1">
                                                    <Users size={14} /> {entry.member_count} members
                                                </span>
                                                <span className="capitalize">{entry.guild_type}</span>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-white">{entry.total_xp.toLocaleString()} XP</div>
                                            <div className="text-sm text-cyan-400">Level {entry.level} • {entry.level_name}</div>
                                        </div>

                                        <ChevronRight size={20} className="text-white/20 group-hover:text-white/50 transition-colors" />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Guild Grid (for Discover and My Guilds) */}
                {(activeTab === 'discover' || activeTab === 'my') && (
                    <>
                        {loading ? (
                            <div className="text-center py-20">
                                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-white/40">Loading guilds...</p>
                            </div>
                        ) : displayGuilds.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                                <Castle size={48} className="mx-auto text-white/20 mb-4" />
                                <p className="text-white/40 mb-4">
                                    {activeTab === 'my' ? "You haven't joined any guilds yet" : "No guilds found"}
                                </p>
                                {activeTab === 'my' && (
                                    <button
                                        onClick={() => setActiveTab('discover')}
                                        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                                    >
                                        Discover Guilds
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayGuilds.map((guild) => {
                                    const TypeIcon = GUILD_TYPE_ICONS[guild.guild_type as keyof typeof GUILD_TYPE_ICONS] || Castle;
                                    const gradientClass = GUILD_TYPE_COLORS[guild.guild_type as keyof typeof GUILD_TYPE_COLORS] || 'from-gray-500 to-gray-600';
                                    return (
                                        <GuildCard
                                            key={guild.id}
                                            guild={guild}
                                            gradientClass={gradientClass}
                                            TypeIcon={TypeIcon}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create Guild Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Create Guild</h2>
                                        <p className="text-white/50 text-sm mt-1">Start your own community</p>
                                    </div>
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="p-2 bg-white/5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Guild Type Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-3">Guild Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {templates && Object.entries(templates).map(([type, template]) => {
                                            const Icon = GUILD_TYPE_ICONS[type as keyof typeof GUILD_TYPE_ICONS];
                                            const info = GUILD_TYPE_INFO[type as keyof typeof GUILD_TYPE_INFO];
                                            return (
                                                <button
                                                    key={type}
                                                    onClick={() => setNewGuild({ ...newGuild, guild_type: type, icon: template.icon })}
                                                    className={`p-4 rounded-xl border-2 text-left transition-all ${newGuild.guild_type === type
                                                            ? 'border-cyan-500 bg-cyan-500/10'
                                                            : 'border-white/10 hover:border-white/20 bg-white/5'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="text-2xl">{template.icon}</span>
                                                        <Icon size={16} className="text-white/40" />
                                                    </div>
                                                    <div className="font-semibold text-white">{template.name}</div>
                                                    <div className="text-xs text-white/40 mt-1">{info?.desc}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Guild Name</label>
                                    <input
                                        type="text"
                                        value={newGuild.name}
                                        onChange={(e) => setNewGuild({ ...newGuild, name: e.target.value })}
                                        placeholder="Enter guild name..."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 transition-colors"
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Description</label>
                                    <textarea
                                        value={newGuild.description}
                                        onChange={(e) => setNewGuild({ ...newGuild, description: e.target.value })}
                                        placeholder="What's this guild about?"
                                        rows={3}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
                                    />
                                </div>

                                {/* Visibility Toggle */}
                                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                                    <div>
                                        <span className="text-white font-medium">Public Guild</span>
                                        <p className="text-xs text-white/40">Anyone can discover and join</p>
                                    </div>
                                    <button
                                        onClick={() => setNewGuild({ ...newGuild, is_public: !newGuild.is_public })}
                                        className={`w-14 h-7 rounded-full transition-colors relative ${newGuild.is_public ? 'bg-cyan-500' : 'bg-white/20'
                                            }`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${newGuild.is_public ? 'left-8' : 'left-1'
                                            }`} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-white/10 flex gap-3">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 border border-white/20 rounded-xl text-white/60 hover:text-white hover:border-white/40 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateGuild}
                                    disabled={!newGuild.name.trim() || creating}
                                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all font-semibold flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={18} />
                                            Create Guild
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
