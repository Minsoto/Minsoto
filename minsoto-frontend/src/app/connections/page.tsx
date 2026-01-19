'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useConnectionsStore } from '@/stores/connectionsStore';
import ConnectionCard from '@/components/connections/ConnectionCard';
import Navigation from '@/components/Navigation';
import { LoadingSpinner, ErrorState, EmptyState, CardLoading } from '@/components/ui/LoadingStates';
import { Users, UserPlus, Clock } from 'lucide-react';

type TabType = 'all' | 'friends' | 'pending';

export default function ConnectionsPage() {
    const router = useRouter();
    const { isAuthenticated, user, _hasHydrated } = useAuthStore();
    const {
        connections,
        pendingReceived,
        loadingConnections,
        error,
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

    const handleRetry = () => {
        fetchConnections();
        fetchPendingConnections();
    };

    const filteredConnections = activeTab === 'friends'
        ? connections.filter(c => c.connection_type === 'friend')
        : connections;

    const tabs: { id: TabType; label: string; count?: number; icon: React.ReactNode }[] = [
        { id: 'all', label: 'All', count: connections.length, icon: <Users size={14} /> },
        { id: 'friends', label: 'Friends', count: connections.filter(c => c.connection_type === 'friend').length, icon: <UserPlus size={14} /> },
        { id: 'pending', label: 'Pending', count: pendingReceived.length, icon: <Clock size={14} /> },
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
                                flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative
                                ${activeTab === tab.id
                                    ? 'text-white'
                                    : 'text-white/50 hover:text-white/70'
                                }
                            `}
                        >
                            {tab.icon}
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-white/10'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-px bg-white" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loadingConnections ? (
                    <div className="py-12">
                        <LoadingSpinner size="lg" text="Loading connections..." className="mb-8" />
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <CardLoading key={i} />
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    <ErrorState
                        message="Failed to load connections"
                        onRetry={handleRetry}
                        className="py-16 glass-panel rounded-xl"
                    />
                ) : activeTab === 'pending' ? (
                    // Pending Requests
                    pendingReceived.length === 0 ? (
                        <EmptyState
                            icon={<Clock size={48} />}
                            message="No pending requests"
                            action={{
                                label: 'Discover new connections',
                                onClick: () => router.push('/discover')
                            }}
                            className="py-16 glass-panel rounded-xl"
                        />
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
                        <EmptyState
                            icon={<Users size={48} />}
                            message={activeTab === 'friends' ? 'No friends yet' : 'No connections yet'}
                            action={{
                                label: 'Discover people to connect with',
                                onClick: () => router.push('/discover')
                            }}
                            className="py-16 glass-panel rounded-xl"
                        />
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
