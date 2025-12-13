'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import { Settings, LogOut, User, Shield, Bell, Palette, Edit2, Check, X } from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();
    const { isAuthenticated, user, logout, updateUser, _hasHydrated } = useAuthStore();
    const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

    // Username editing state
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!_hasHydrated) return;
        if (!isAuthenticated) {
            router.push('/login');
        }
    }, [isAuthenticated, router, _hasHydrated]);

    const handleSignOut = () => {
        logout();
        router.push('/login');
    };

    const handleUpdateUsername = async () => {
        if (!newUsername.trim() || newUsername === user?.username) {
            setIsEditingUsername(false);
            return;
        }

        setLoading(true);
        setUsernameError('');

        try {
            await api.post('/user/username/change/', { username: newUsername });
            if (user) {
                updateUser({ ...user, username: newUsername });
            }
            setIsEditingUsername(false);
            setNewUsername('');
        } catch (error: any) {
            console.error('Failed to change username:', error);
            const data = error.response?.data;
            let msg = 'Failed to update username';
            if (data?.username) {
                msg = Array.isArray(data.username) ? data.username[0] : data.username;
            } else if (data?.error) {
                msg = data.error;
            }
            setUsernameError(msg);
        } finally {
            setLoading(false);
        }
    };

    if (!_hasHydrated) {
        // ... (loading state same as before)
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div
                    className="w-16 h-16 border-2 border-white animate-spin"
                    style={{ borderRadius: '50% 0 50% 0' }}
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />

            <main className="max-w-2xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <Settings size={24} className="text-white/70" />
                    <h1 className="text-2xl font-light tracking-wide">Settings</h1>
                </div>

                {/* Account Section */}
                <section className="border border-white/20 p-6 mb-6 relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white" />

                    <h2 className="text-xs font-light tracking-widest opacity-70 mb-6 flex items-center gap-2">
                        <User size={14} />
                        ACCOUNT
                    </h2>

                    <div className="space-y-4">
                        <div className="py-2 border-b border-white/10">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-white/60">Username</span>
                                {isEditingUsername ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleUpdateUsername}
                                            disabled={loading}
                                            className="p-1 hover:bg-white/10 disabled:opacity-50"
                                        >
                                            <Check size={16} className="text-green-500" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingUsername(false);
                                                setUsernameError('');
                                            }}
                                            className="p-1 hover:bg-white/10"
                                        >
                                            <X size={16} className="text-red-500" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setNewUsername(user?.username || '');
                                            setIsEditingUsername(true);
                                        }}
                                        className="text-white/40 hover:text-white transition-colors flex items-center gap-2 text-xs"
                                    >
                                        <Edit2 size={12} />
                                        EDIT
                                    </button>
                                )}
                            </div>

                            {isEditingUsername ? (
                                <div className="mt-2">
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="w-full bg-white/5 border border-white/20 p-2 text-white outline-none focus:border-white/50 text-sm"
                                        placeholder="New username"
                                    />
                                    <p className="text-[10px] text-white/40 mt-1">
                                        Note: Can only be changed once every 30 days.
                                    </p>
                                    {usernameError && (
                                        <p className="text-xs text-red-500 mt-1">{usernameError}</p>
                                    )}
                                </div>
                            ) : (
                                <span className="text-white">@{user?.username}</span>
                            )}
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-white/60">Email</span>
                            <span className="text-white">{user?.email}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-white/10">
                            <span className="text-white/60">Name</span>
                            <span className="text-white">{user?.first_name} {user?.last_name}</span>
                        </div>
                    </div>
                </section>

                {/* Coming Soon Sections */}
                <section className="border border-white/10 p-6 mb-6 opacity-50">
                    <h2 className="text-xs font-light tracking-widest opacity-70 mb-4 flex items-center gap-2">
                        <Bell size={14} />
                        NOTIFICATIONS
                    </h2>
                    <p className="text-sm text-white/40">Coming soon</p>
                </section>

                <section className="border border-white/10 p-6 mb-6 opacity-50">
                    <h2 className="text-xs font-light tracking-widest opacity-70 mb-4 flex items-center gap-2">
                        <Shield size={14} />
                        PRIVACY
                    </h2>
                    <p className="text-sm text-white/40">Coming soon</p>
                </section>

                <section className="border border-white/10 p-6 mb-6 opacity-50">
                    <h2 className="text-xs font-light tracking-widest opacity-70 mb-4 flex items-center gap-2">
                        <Palette size={14} />
                        APPEARANCE
                    </h2>
                    <p className="text-sm text-white/40">Coming soon</p>
                </section>

                {/* Sign Out Section */}
                <section className="border border-red-500/30 p-6 relative">
                    <h2 className="text-xs font-light tracking-widest text-red-400/70 mb-4 flex items-center gap-2">
                        <LogOut size={14} />
                        SIGN OUT
                    </h2>

                    {!showSignOutConfirm ? (
                        <button
                            onClick={() => setShowSignOutConfirm(true)}
                            className="px-6 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                            Sign Out
                        </button>
                    ) : (
                        <div className="flex items-center gap-4">
                            <span className="text-white/60 text-sm">Are you sure?</span>
                            <button
                                onClick={handleSignOut}
                                className="px-6 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                                Yes, Sign Out
                            </button>
                            <button
                                onClick={() => setShowSignOutConfirm(false)}
                                className="px-6 py-2 border border-white/20 text-white/60 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
