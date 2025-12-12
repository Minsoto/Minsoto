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
    const { isAuthenticated, user } = useAuthStore();
    const {
        connections,
        pendingReceived,
        loadingConnections,
        fetchConnections,
        fetchPendingConnections
    } = useConnectionsStore();

    const [activeTab, setActiveTab] = useState<TabType>('all');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchConnections();
        fetchPendingConnections();
    }, [isAuthenticated, router, fetchConnections, fetchPendingConnections]);

    const filteredConnections = activeTab === 'friends'
        ? connections.filter(c => c.connection_type === 'friend')
        : connections;

    const tabs: { id: TabType; label: string; count?: number }[] = [
        { id: 'all', label: 'All', count: connections.length },
        { id: 'friends', label: 'Friends', count: connections.filter(c => c.connection_type === 'friend').length },
        { id: 'pending', label: 'Pending', count: pendingReceived.length },
    ];

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-light tracking-wide mb-2">Connections</h1>
                    <p className="text-white/50">Manage your network</p>
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
                    <div className="text-center py-12 text-white/50">
                        Loading...
                    </div>
                ) : activeTab === 'pending' ? (
                    // Pending Requests
                    pendingReceived.length === 0 ? (
                        <div className="text-center py-12 border border-white/10">
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
                        <div className="text-center py-12 border border-white/10">
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
