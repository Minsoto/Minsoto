'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConnectionsStore } from '@/stores/connectionsStore';
import { useAuthStore } from '@/stores/authStore';
import StatusBadge from '@/components/StatusBadge';
import type { Connection } from '@/types/connections';

interface ConnectionCardProps {
    connection: Connection;
    currentUserId: string;
    variant?: 'pending' | 'connected';
}

export default function ConnectionCard({
    connection,
    currentUserId,
    variant = 'connected'
}: ConnectionCardProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { acceptConnection, rejectConnection, removeConnection, upgradeToFriend, confirmFriendUpgrade } = useConnectionsStore();
    const { user } = useAuthStore();

    // Determine the other user in the connection
    const otherUser = connection.from_user.id === currentUserId
        ? connection.to_user
        : connection.from_user;

    const isPending = variant === 'pending';
    const isFriend = connection.connection_type === 'friend';

    // Check if there's a pending friend upgrade
    const hasPendingUpgrade = !!connection.friend_upgrade_requested_by;
    const iUpgradedThis = connection.friend_upgrade_requested_by === user?.id;

    const handleAccept = async () => {
        setLoading(true);
        await acceptConnection(connection.id);
        setLoading(false);
    };

    const handleReject = async () => {
        setLoading(true);
        await rejectConnection(connection.id);
        setLoading(false);
    };

    const handleRemove = async () => {
        if (confirm('Remove this connection?')) {
            setLoading(true);
            await removeConnection(connection.id);
            setLoading(false);
        }
    };

    const handleUpgrade = async () => {
        setLoading(true);
        await upgradeToFriend(connection.id);
        setLoading(false);
    };

    const handleConfirmUpgrade = async (action: 'accept' | 'reject') => {
        setLoading(true);
        await confirmFriendUpgrade(connection.id, action);
        setLoading(false);
    };

    return (
        <div className="border border-white/10 p-4 flex items-center justify-between group hover:border-white/20 transition-colors">
            {/* User Info - Clickable area */}
            <div
                className="flex items-center gap-4 cursor-pointer flex-1"
                onClick={() => router.push(`/profile/${otherUser.username}`)}
            >
                {/* Avatar */}
                <div className="relative">
                    <div className="w-12 h-12 border border-white/20 flex items-center justify-center text-lg font-light overflow-hidden">
                        {otherUser.profile_picture_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={otherUser.profile_picture_url}
                                alt={otherUser.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-white/50">
                                {otherUser.first_name?.[0] || otherUser.username[0].toUpperCase()}
                            </span>
                        )}
                    </div>
                    {/* Status Badge */}
                    <div className="absolute -bottom-0.5 -right-0.5">
                        <StatusBadge status={(otherUser as { status?: 'online' | 'idle' | 'focus' | 'dnd' | 'offline' }).status || 'offline'} size="sm" />
                    </div>
                </div>

                {/* Name & Username */}
                <div>
                    <span className="text-white hover:underline font-medium">
                        {otherUser.first_name} {otherUser.last_name}
                    </span>
                    <p className="text-white/50 text-sm">@{otherUser.username}</p>
                    {(otherUser as { status_message?: string }).status_message && (
                        <p className="text-white/40 text-xs italic truncate max-w-[150px]">
                            {(otherUser as { status_message?: string }).status_message}
                        </p>
                    )}
                </div>

                {/* Friend Badge */}
                {isFriend && (
                    <span className="px-2 py-0.5 text-xs border border-white/20 text-white/60">
                        👥 Friend
                    </span>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {isPending ? (
                    <>
                        {/* Pending message if exists */}
                        {connection.message && (
                            <span className="text-white/40 text-sm italic max-w-[200px] truncate mr-4">
                                &ldquo;{connection.message}&rdquo;
                            </span>
                        )}
                        <button
                            onClick={handleAccept}
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-50"
                        >
                            Accept
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={loading}
                            className="px-4 py-2 text-sm border border-white/20 text-white/70 hover:bg-white/5 transition-colors disabled:opacity-50"
                        >
                            Decline
                        </button>
                    </>
                ) : (
                    <>
                        {/* Pending friend upgrade - show confirm/reject if someone else requested */}
                        {hasPendingUpgrade && !iUpgradedThis && (
                            <>
                                <span className="text-xs text-yellow-400 mr-2">
                                    Friend request pending
                                </span>
                                <button
                                    onClick={() => handleConfirmUpgrade('accept')}
                                    disabled={loading}
                                    className="px-3 py-1.5 text-xs bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-50"
                                >
                                    Accept Friend
                                </button>
                                <button
                                    onClick={() => handleConfirmUpgrade('reject')}
                                    disabled={loading}
                                    className="px-3 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white transition-colors disabled:opacity-50"
                                >
                                    Decline
                                </button>
                            </>
                        )}

                        {/* Pending upgrade requested by me */}
                        {hasPendingUpgrade && iUpgradedThis && (
                            <span className="px-3 py-1.5 text-xs text-yellow-400/70 border border-yellow-400/30">
                                Friend request sent
                            </span>
                        )}

                        {/* Upgrade to friend (if not already and no pending) */}
                        {!isFriend && !hasPendingUpgrade && (
                            <button
                                onClick={handleUpgrade}
                                disabled={loading}
                                className="px-3 py-1.5 text-xs border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                            >
                                Upgrade to Friend
                            </button>
                        )}

                        {/* Remove */}
                        <button
                            onClick={handleRemove}
                            disabled={loading}
                            className="px-3 py-1.5 text-xs text-white/40 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        >
                            Remove
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
