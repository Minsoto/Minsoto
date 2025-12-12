'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useConnectionsStore } from '@/stores/connectionsStore';
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
    const { acceptConnection, rejectConnection, removeConnection, upgradeToFriend } = useConnectionsStore();

    // Determine the other user in the connection
    const otherUser = connection.from_user.id === currentUserId
        ? connection.to_user
        : connection.from_user;

    const isPending = variant === 'pending';
    const isFriend = connection.connection_type === 'friend';

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

    return (
        <div className="border border-white/10 p-4 flex items-center justify-between group hover:border-white/20 transition-colors">
            {/* User Info */}
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 border border-white/20 flex items-center justify-center text-lg font-light">
                    {otherUser.profile_picture_url ? (
                        <Image
                            src={otherUser.profile_picture_url}
                            alt={otherUser.username}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-white/50">
                            {otherUser.first_name?.[0] || otherUser.username[0].toUpperCase()}
                        </span>
                    )}
                </div>

                {/* Name & Username */}
                <div>
                    <a
                        href={`/profile/${otherUser.username}`}
                        className="text-white hover:underline font-medium"
                    >
                        {otherUser.first_name} {otherUser.last_name}
                    </a>
                    <p className="text-white/50 text-sm">@{otherUser.username}</p>
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
                        {/* Upgrade to friend (if not already) */}
                        {!isFriend && (
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
