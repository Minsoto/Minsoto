import { create } from 'zustand';
import api from '@/lib/api';
import type {
    Connection,
    ConnectionStatus,
    Organization,
    OrganizationMembership
} from '@/types/connections';

interface ConnectionsState {
    // Connections
    connections: Connection[];
    pendingReceived: Connection[];
    pendingSent: Connection[];
    loadingConnections: boolean;
    error: string | null;

    // Organizations
    myOrganizations: OrganizationMembership[];
    loadingOrganizations: boolean;

    // Actions - Connections
    fetchConnections: () => Promise<void>;
    fetchPendingConnections: () => Promise<void>;
    sendConnectionRequest: (toUserId: string, message?: string) => Promise<boolean>;
    acceptConnection: (connectionId: string) => Promise<boolean>;
    rejectConnection: (connectionId: string) => Promise<boolean>;
    removeConnection: (connectionId: string) => Promise<boolean>;
    upgradeToFriend: (connectionId: string) => Promise<boolean>;
    confirmFriendUpgrade: (connectionId: string, action: 'accept' | 'reject') => Promise<boolean>;
    getConnectionStatus: (userId: string) => Promise<{ status: ConnectionStatus; connection: Connection | null }>;

    // Actions - Organizations
    fetchMyOrganizations: () => Promise<void>;
    verifyOrganization: (credential: string) => Promise<{ success: boolean; organization?: Organization }>;
    leaveOrganization: (orgId: string) => Promise<boolean>;
}

export const useConnectionsStore = create<ConnectionsState>()((set) => ({
    connections: [],
    pendingReceived: [],
    pendingSent: [],
    loadingConnections: false,
    error: null,
    myOrganizations: [],
    loadingOrganizations: false,

    fetchConnections: async () => {
        set({ loadingConnections: true, error: null });
        try {
            const response = await api.get('/connections/');
            set({ connections: response.data });
        } catch (error) {
            console.error('Failed to fetch connections:', error);
            set({ error: 'Failed to load connections' });
        } finally {
            set({ loadingConnections: false });
        }
    },

    fetchPendingConnections: async () => {
        try {
            const [received, sent] = await Promise.all([
                api.get('/connections/pending/'),
                api.get('/connections/sent/')
            ]);
            set({
                pendingReceived: received.data,
                pendingSent: sent.data
            });
        } catch (error) {
            console.error('Failed to fetch pending connections:', error);
        }
    },

    sendConnectionRequest: async (toUserId: string, message?: string) => {
        try {
            const response = await api.post('/connections/request/', {
                to_user_id: toUserId,
                message: message || ''
            });
            // Add to pending sent
            set(state => ({
                pendingSent: [...state.pendingSent, response.data]
            }));
            return true;
        } catch (error) {
            console.error('Failed to send connection request:', error);
            return false;
        }
    },

    acceptConnection: async (connectionId: string) => {
        try {
            const response = await api.post('/connections/accept/', {
                connection_id: connectionId
            });
            // Move from pending to connections
            set(state => ({
                pendingReceived: state.pendingReceived.filter(c => c.id !== connectionId),
                connections: [...state.connections, response.data]
            }));
            return true;
        } catch (error) {
            console.error('Failed to accept connection:', error);
            return false;
        }
    },

    rejectConnection: async (connectionId: string) => {
        try {
            await api.post('/connections/reject/', {
                connection_id: connectionId
            });
            // Remove from pending
            set(state => ({
                pendingReceived: state.pendingReceived.filter(c => c.id !== connectionId)
            }));
            return true;
        } catch (error) {
            console.error('Failed to reject connection:', error);
            return false;
        }
    },

    removeConnection: async (connectionId: string) => {
        try {
            await api.delete(`/connections/${connectionId}/remove/`);
            set(state => ({
                connections: state.connections.filter(c => c.id !== connectionId)
            }));
            return true;
        } catch (error) {
            console.error('Failed to remove connection:', error);
            return false;
        }
    },

    upgradeToFriend: async (connectionId: string) => {
        try {
            const response = await api.post('/connections/upgrade/', {
                connection_id: connectionId
            });
            // Update connection in list
            set(state => ({
                connections: state.connections.map(c =>
                    c.id === connectionId ? response.data.connection : c
                )
            }));
            return true;
        } catch (error) {
            console.error('Failed to upgrade to friend:', error);
            return false;
        }
    },

    confirmFriendUpgrade: async (connectionId: string, action: 'accept' | 'reject') => {
        try {
            const response = await api.post('/connections/upgrade/confirm/', {
                connection_id: connectionId,
                action
            });
            // Update connection in list
            if (action === 'accept') {
                set(state => ({
                    connections: state.connections.map(c =>
                        c.id === connectionId ? response.data.connection : c
                    )
                }));
            } else {
                // Remove upgrade request flag
                set(state => ({
                    connections: state.connections.map(c =>
                        c.id === connectionId
                            ? { ...c, friend_upgrade_requested_by: undefined, friend_upgrade_requested_at: undefined }
                            : c
                    )
                }));
            }
            return true;
        } catch (error) {
            console.error('Failed to confirm friend upgrade:', error);
            return false;
        }
    },

    getConnectionStatus: async (userId: string) => {
        try {
            const response = await api.get(`/connections/status/${userId}/`);
            return response.data;
        } catch (error) {
            console.error('Failed to get connection status:', error);
            return { status: 'none' as ConnectionStatus, connection: null };
        }
    },

    fetchMyOrganizations: async () => {
        set({ loadingOrganizations: true });
        try {
            const response = await api.get('/organizations/my/');
            set({ myOrganizations: response.data });
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
        } finally {
            set({ loadingOrganizations: false });
        }
    },

    verifyOrganization: async (credential: string) => {
        try {
            const response = await api.post('/organizations/verify/', { credential });
            // Add to my organizations
            set(state => ({
                myOrganizations: [...state.myOrganizations, response.data.membership]
            }));
            return { success: true, organization: response.data.organization };
        } catch (error) {
            console.error('Failed to verify organization:', error);
            return { success: false };
        }
    },

    leaveOrganization: async (orgId: string) => {
        try {
            await api.delete(`/organizations/${orgId}/leave/`);
            set(state => ({
                myOrganizations: state.myOrganizations.filter(m => m.organization.id !== orgId)
            }));
            return true;
        } catch (error) {
            console.error('Failed to leave organization:', error);
            return false;
        }
    },
}));
