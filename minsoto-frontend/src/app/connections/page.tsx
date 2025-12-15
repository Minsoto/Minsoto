'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useConnectionsStore } from '@/stores/connectionsStore';
import ConnectionCard from '@/components/connections/ConnectionCard';
import Navigation from '@/components/Navigation';

type TabType = 'all' | 'friends' | 'pending';

export default function ConnectionsPage() {
    const router = useRouter();
    const { isAuthenticated, user, _hasHydrated } = useAuthStore();
    const {
        connections,
        pendingReceived,
        loadingConnections,
        fetchConnections,
        fetchPendingConnections
    } = useConnectionsStore();

    const [activeTab, setActiveTab] = useState<TabType>('all');

    useEffect(() => {
        if (!_hasHydrated) return;

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchConnections();
        fetchPendingConnections();
    }, [isAuthenticated, router, fetchConnections, fetchPendingConnections, _hasHydrated]);

    const filteredConnections = activeTab === 'friends'
        ? connections.filter(c => c.connection_type === 'friend')
        : connections;

    const tabs: { id: TabType; label: string; count?: number }[] = [
        { id: 'all', label: 'All', count: connections.length },
        { id: 'friends', label: 'Friends', count: connections.filter(c => c.connection_type === 'friend').length },
        { id: 'pending', label: 'Pending', count: pendingReceived.length },
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] text-white">
            <Navigation />

            {/* Spacer for fixed nav */}
            <div className="h-16" />

            <main className="container-narrow py-8">
                {/* Header */}
                <div className="mb-8 animate-fadeIn">
                    <h1 className="heading-lg">Connections</h1>
                    <p className="text-white/50 mt-1">Manage your network</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10 mb-6">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                px-6 py-3 text-sm font-medium transition-colors relative
                ${activeTab === tab.id
                                    ? 'text-white'
                                    : 'text-white/50 hover:text-white/70'
                                }
              `}
                        >
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className="ml-2 text-white/40">({tab.count})</span>
                            )}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-px bg-white" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loadingConnections ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-2 border-white/30 rounded-full border-t-transparent" />
                    </div>
                ) : activeTab === 'pending' ? (
                    // Pending Requests
                    pendingReceived.length === 0 ? (
                        <div className="text-center py-16 glass-panel rounded-xl">
                            <p className="text-white/50 mb-2">No pending requests</p>
                            <a href="/discover" className="text-white/70 hover:text-white underline text-sm">
                                Discover new connections
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingReceived.map(connection => (
                                <ConnectionCard
                                    key={connection.id}
                                    connection={connection}
                                    currentUserId={user?.id?.toString() || ''}
                                    variant="pending"
                                />
                            ))}
                        </div>
                    )
                ) : (
                    // Connections List
                    filteredConnections.length === 0 ? (
                        <div className="text-center py-16 glass-panel rounded-xl">
                            <p className="text-white/50 mb-2">
                                {activeTab === 'friends' ? 'No friends yet' : 'No connections yet'}
                            </p>
                            <a href="/discover" className="text-white/70 hover:text-white underline text-sm">
                                Discover people to connect with
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredConnections.map(connection => (
                                <ConnectionCard
                                    key={connection.id}
                                    connection={connection}
                                    currentUserId={user?.id?.toString() || ''}
                                    variant="connected"
                                />
                            ))}
                        </div>
                    )
                )}
            </main>
        </div>
    );
}
