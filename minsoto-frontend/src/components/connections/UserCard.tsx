'use client';

import { useState } from 'react';
import ConnectionButton from './ConnectionButton';
import type { DiscoverUser } from '@/types/connections';

interface UserCardProps {
    user: DiscoverUser;
}

export default function UserCard({ user }: UserCardProps) {
    const [connectionStatus, setConnectionStatus] = useState(user.connection_status);

    return (
        <div className="border border-white/10 p-6 hover:border-white/20 transition-all duration-200 group">
            {/* Header with Avatar */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 border border-white/20 flex items-center justify-center text-xl font-light bg-white/5 overflow-hidden">
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
                    </div>

                    {/* Name */}
                    <div>
                        <a
                            href={`/profile/${user.username}`}
                            className="text-white hover:underline font-medium text-lg"
                        >
                            {user.first_name} {user.last_name}
                        </a>
                        <p className="text-white/50 text-sm">@{user.username}</p>
                    </div>
                </div>

                {/* Connection Button */}
                <ConnectionButton
                    userId={user.id}
                    initialStatus={connectionStatus}
                    onStatusChange={setConnectionStatus}
                />
            </div>

            {/* Organizations */}
            {user.organizations && user.organizations.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {user.organizations.map((org, i) => (
                        <span
                            key={i}
                            className="px-2 py-0.5 text-xs border border-white/20 text-white/60"
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
                            className="px-2 py-0.5 text-xs bg-white/5 text-white/50"
                        >
                            {interest}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
