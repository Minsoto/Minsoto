'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGuildStore } from '@/stores/guildStore';
import { useAuthStore } from '@/stores/authStore';
import {
    ArrowLeft, Save, Trash2, Users, Crown, Shield, UserMinus,
    Settings, FileEdit, Check, X, Bell, Vote, Eye
} from 'lucide-react';
import type { GuildMember, GuildChangeRequest } from '@/types/guilds';

export default function GuildManagePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const { user } = useAuthStore();
    const {
        currentGuild, userRole, loading,
        fetchGuild, updateGuild, deleteGuild,
        changeRequests, fetchChangeRequests, reviewChange
    } = useGuildStore();

    const [activeTab, setActiveTab] = useState<'settings' | 'members' | 'changes'>('settings');
    const [saving, setSaving] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        icon: '',
        is_public: true,
        guild_settings: {
            allow_public_join: true,
            require_approval: false,
            poll_quorum: 0.5,
            max_members: null as number | null
        }
    });

    useEffect(() => {
        if (slug) {
            fetchGuild(slug);
            fetchChangeRequests(slug);
        }
    }, [slug, fetchGuild, fetchChangeRequests]);

    useEffect(() => {
        if (currentGuild) {
            setEditForm({
                name: currentGuild.name,
                description: currentGuild.description,
                icon: currentGuild.icon,
                is_public: currentGuild.is_public,
                guild_settings: currentGuild.guild_settings || {
                    allow_public_join: true,
                    require_approval: false,
                    poll_quorum: 0.5,
                    max_members: null
                }
            });
        }
    }, [currentGuild]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateGuild(slug, editForm);
            fetchGuild(slug);
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this guild? This cannot be undone.')) {
            try {
                await deleteGuild(slug);
                router.push('/guilds');
            } catch (error) {
                console.error('Failed to delete:', error);
            }
        }
    };

    const handleReviewChange = async (changeId: string, action: 'approve' | 'reject') => {
        try {
            await reviewChange(slug, changeId, action);
        } catch (error) {
            console.error('Failed to review:', error);
        }
    };

    if (loading || !currentGuild) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 pt-20 flex items-center justify-center">
                <div className="text-white/60">Loading...</div>
            </div>
        );
    }

    // Redirect if not admin
    if (userRole !== 'owner' && userRole !== 'admin') {
        router.push(`/guilds/${slug}`);
        return null;
    }

    const isOwner = userRole === 'owner';
    const pendingChanges = changeRequests.filter(c => c.status === 'pending');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 pt-20 px-4 pb-10">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push(`/guilds/${slug}`)}
                        className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-white">Manage Guild</h1>
                        <p className="text-white/60">{currentGuild.name}</p>
                    </div>
                    {isOwner && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                            <Trash2 size={18} />
                            Delete Guild
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-white/10 mb-6">
                    {[
                        { id: 'settings', label: 'Settings', icon: Settings },
                        { id: 'members', label: 'Members', icon: Users },
                        { id: 'changes', label: 'Change Requests', icon: FileEdit, badge: pendingChanges.length }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-2 px-4 py-2 transition-colors relative ${activeTab === tab.id ? 'text-white' : 'text-white/60 hover:text-white'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {tab.badge && tab.badge > 0 && (
                                <span className="px-1.5 py-0.5 bg-cyan-500 text-xs rounded-full">{tab.badge}</span>
                            )}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="manage-tab-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-500"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Basic Info</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Guild Name</label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-white/60 mb-2">Icon</label>
                                    <input
                                        type="text"
                                        value={editForm.icon}
                                        onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl focus:outline-none focus:border-cyan-500/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-white/60 mb-2">Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                                />
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                            <h3 className="text-lg font-semibold text-white mb-4">Guild Settings</h3>

                            <div className="space-y-4">
                                {/* Public Toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-white font-medium">Public Guild</div>
                                        <div className="text-sm text-white/60">Visible in guild discovery</div>
                                    </div>
                                    <button
                                        onClick={() => setEditForm({ ...editForm, is_public: !editForm.is_public })}
                                        className={`w-12 h-6 rounded-full transition-colors ${editForm.is_public ? 'bg-cyan-500' : 'bg-white/20'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${editForm.is_public ? 'translate-x-6' : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                </div>

                                {/* Allow Public Join */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-white font-medium">Allow Public Join</div>
                                        <div className="text-sm text-white/60">Anyone can join without invitation</div>
                                    </div>
                                    <button
                                        onClick={() => setEditForm({
                                            ...editForm,
                                            guild_settings: { ...editForm.guild_settings, allow_public_join: !editForm.guild_settings.allow_public_join }
                                        })}
                                        className={`w-12 h-6 rounded-full transition-colors ${editForm.guild_settings.allow_public_join ? 'bg-cyan-500' : 'bg-white/20'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full transition-transform ${editForm.guild_settings.allow_public_join ? 'translate-x-6' : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                </div>

                                {/* Poll Quorum */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-white font-medium">Poll Quorum</div>
                                        <div className="text-sm text-white/60">Minimum participation required</div>
                                    </div>
                                    <select
                                        value={editForm.guild_settings.poll_quorum}
                                        onChange={(e) => setEditForm({
                                            ...editForm,
                                            guild_settings: { ...editForm.guild_settings, poll_quorum: parseFloat(e.target.value) }
                                        })}
                                        className="px-3 py-1 bg-white/10 border border-white/10 rounded-lg text-white"
                                    >
                                        <option value="0.25">25%</option>
                                        <option value="0.5">50%</option>
                                        <option value="0.6">60%</option>
                                        <option value="0.75">75%</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                            <Save size={18} />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}

                {/* Members Tab */}
                {activeTab === 'members' && (
                    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        {currentGuild.members?.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-4 p-4 border-b border-white/5 last:border-0"
                            >
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                    {member.first_name?.[0] || member.username[0].toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-medium">{member.username}</div>
                                    <div className="text-sm text-white/60">{member.xp_contributed} XP contributed</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {member.role === 'owner' && <Crown size={16} className="text-yellow-400" />}
                                    {member.role === 'admin' && <Shield size={16} className="text-cyan-400" />}
                                    <span className="text-sm text-white/60 capitalize px-2 py-1 bg-white/5 rounded">
                                        {member.role}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Change Requests Tab */}
                {activeTab === 'changes' && (
                    <div className="space-y-4">
                        {pendingChanges.length === 0 ? (
                            <div className="text-center py-12 bg-white/5 border border-white/10 rounded-xl">
                                <FileEdit size={48} className="mx-auto text-white/20 mb-4" />
                                <p className="text-white/40">No pending change requests</p>
                            </div>
                        ) : (
                            pendingChanges.map((change) => (
                                <div key={change.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white">{change.title}</h3>
                                            <p className="text-sm text-white/60">
                                                By {change.requested_by_username} • {change.change_type} change
                                            </p>
                                        </div>
                                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                                            Pending
                                        </span>
                                    </div>

                                    {change.description && (
                                        <p className="text-white/70 mb-4">{change.description}</p>
                                    )}

                                    <div className="bg-black/20 rounded-lg p-4 mb-4">
                                        <div className="text-xs text-white/40 mb-2">Proposed Changes</div>
                                        <pre className="text-sm text-white/80 whitespace-pre-wrap">
                                            {JSON.stringify(change.proposed_changes, null, 2)}
                                        </pre>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleReviewChange(change.id, 'approve')}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                                        >
                                            <Check size={18} />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReviewChange(change.id, 'reject')}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                        >
                                            <X size={18} />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
