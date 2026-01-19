'use client';

import { useState, useEffect } from 'react';
import { useConnectionsStore } from '@/stores/connectionsStore';
import type { ConnectionStatus } from '@/types/connections';

interface ConnectionButtonProps {
    userId: string;
    initialStatus?: ConnectionStatus;
    onStatusChange?: (status: ConnectionStatus) => void;
    className?: string;
}

export default function ConnectionButton({
    userId,
    initialStatus = 'none',
    onStatusChange,
    className = ''
}: ConnectionButtonProps) {
    const [status, setStatus] = useState<ConnectionStatus>(initialStatus);
    const [loading, setLoading] = useState(false);
    const [connectionId, setConnectionId] = useState<string | null>(null);

    const {
        sendConnectionRequest,
        acceptConnection,
        getConnectionStatus
    } = useConnectionsStore();

    useEffect(() => {
        // Fetch current status if not provided
        if (initialStatus === 'none') {
            getConnectionStatus(userId).then(result => {
                setStatus(result.status);
                if (result.connection) {
                    setConnectionId(result.connection.id);
                }
            });
        }
    }, [userId, initialStatus, getConnectionStatus]);

    const handleConnect = async () => {
        setLoading(true);
        const success = await sendConnectionRequest(userId);
        if (success) {
            setStatus('pending_sent');
            onStatusChange?.('pending_sent');
        }
        setLoading(false);
    };

    const handleAccept = async () => {
        if (!connectionId) return;
        setLoading(true);
        const success = await acceptConnection(connectionId);
        if (success) {
            setStatus('connected');
            onStatusChange?.('connected');
        }
        setLoading(false);
    };

    const buttonBaseClass = `
    px-4 py-2 text-sm font-medium border transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${className}
  `;

    if (status === 'connected' || status === 'friends') {
        return (
            <button
                className={`${buttonBaseClass} border-white/20 text-white/70 bg-white/5`}
                disabled
            >
                {status === 'friends' ? '👥 Friends' : '✓ Connected'}
            </button>
        );
    }

    if (status === 'pending_sent') {
        return (
            <button
                className={`${buttonBaseClass} border-white/20 text-white/50 bg-transparent cursor-default`}
                disabled
            >
                Pending...
            </button>
        );
    }

    if (status === 'pending_received') {
        return (
            <button
                onClick={handleAccept}
                disabled={loading}
                className={`${buttonBaseClass} border-white bg-white text-black hover:bg-white/90`}
            >
                {loading ? '...' : 'Accept'}
            </button>
        );
    }

    // Default: not connected
    return (
        <button
            onClick={handleConnect}
            disabled={loading}
            className={`${buttonBaseClass} border-white/30 text-white hover:bg-white/10`}
        >
            {loading ? '...' : 'Connect'}
        </button>
    );
}
