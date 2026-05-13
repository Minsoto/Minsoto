'use client';

import { useState } from 'react';
import Link from 'next/link';
import ConnectionButton from './ConnectionButton';
import type { DiscoverUser } from '@/types/connections';

interface UserCardProps {
    user: DiscoverUser;
}

export default function UserCard({ user }: UserCardProps) {
    const [connectionStatus, setConnectionStatus] = useState(user.connection_status);

    const displayName = user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username;

    return (
        <div className="border border-white/10 p-6 hover:border-white/20 transition-all duration-200 group flex flex-col h-full bg-black/40 rounded-xl">
            {/* Header with Avatar */}
            <div className="flex items-start justify-between mb-4 gap-2">
                <div className="flex items-center gap-4 flex-1 min-w-0 mr-2">
                    {/* Avatar */}
                    <Link href={`/profile/${user.username}`} className="shrink-0 w-14 h-14 border border-white/20 flex items-center justify-center text-xl font-light bg-white/5 overflow-hidden rounded-full hover:border-[var(--accent-primary)]/50 transition-colors">
                        {user.profile_picture_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={user.profile_picture_url}
                                alt={user.username}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-white/50">
                                {user.first_name?.[0] || user.username[0].toUpperCase()}
                            </span>
                        )}
                    </Link>

                    {/* Name */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[3.5rem]">
                        <Link
                            href={`/profile/${user.username}`}
                            className="text-white hover:text-[var(--accent-primary)] font-medium text-lg block truncate transition-colors"
                        >
                            {displayName}
                        </Link>
                        {user.first_name && (
                            <p className="text-white/50 text-sm truncate">@{user.username}</p>
                        )}
                    </div>
                </div>

                {/* Connection Button */}
                <div className="shrink-0 mt-2">
                    <ConnectionButton
                        userId={user.id}
                        initialStatus={connectionStatus}
                        onStatusChange={setConnectionStatus}
                    />
                </div>
            </div>

            {/* Organizations */}
            {user.organizations && user.organizations.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 mt-auto pt-2">
                    {user.organizations.map((org, i) => (
                        <span
                            key={i}
                            className="px-2 py-0.5 text-xs border border-white/20 text-white/60 rounded-md"
                        >
                            {org}
                        </span>
                    ))}
                </div>
            )}

            {/* Interests */}
            {user.interests && user.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {user.interests.map((interest, i) => (
                        <span
                            key={i}
                            className="px-2 py-0.5 text-xs bg-white/5 text-white/50 rounded-md"
                        >
                            {interest}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
