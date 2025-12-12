'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import ConnectionButton from '@/components/connections/ConnectionButton';
import Navigation from '@/components/Navigation';
import type { OrganizationDetail, OrganizationMember } from '@/types/connections';

export default function OrganizationPage() {
    const router = useRouter();
    const params = useParams();
    const domain = params.domain as string;
    const { isAuthenticated, user } = useAuthStore();

    const [organization, setOrganization] = useState<OrganizationDetail | null>(null);
    const [isMember, setIsMember] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrganization = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/organizations/${domain}/`);
            setOrganization(response.data.organization);
            setIsMember(response.data.is_member);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { error?: string } } };
            setError(error.response?.data?.error || 'Failed to load organization');
        } finally {
            setLoading(false);
        }
    }, [domain]);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchOrganization();
    }, [isAuthenticated, router, fetchOrganization]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navigation />
                <div className="flex items-center justify-center h-[50vh]">
                    <span className="text-white/50">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !organization) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Navigation />
                <div className="flex items-center justify-center h-[50vh]">
                    <div className="text-center">
                        <p className="text-white/50 mb-4">{error || 'Organization not found'}</p>
                        <a href="/discover" className="text-white underline">
                            Back to Discover
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    const orgTypeLabels: Record<string, string> = {
        college: 'College/University',
        company: 'Company',
        school: 'School',
        community: 'Community',
        other: 'Organization'
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Organization Header */}
                <div className="border border-white/10 p-8 mb-8">
                    <div className="flex items-start gap-6">
                        {/* Logo */}
                        <div className="w-20 h-20 border border-white/20 flex items-center justify-center text-2xl font-light bg-white/5 shrink-0">
                            {organization.logo_url ? (
                                <Image
                                    src={organization.logo_url}
                                    alt={organization.name}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-white/50">
                                    {organization.name[0]}
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-light tracking-wide">
                                    {organization.name}
                                </h1>
                                {organization.is_verified && (
                                    <span className="px-2 py-0.5 text-xs bg-white/10 text-white/70">
                                        ✓ Verified
                                    </span>
                                )}
                            </div>

                            <p className="text-white/50 mb-3">
                                {organization.member_count} Members · {orgTypeLabels[organization.org_type]}
                            </p>

                            {organization.description && (
                                <p className="text-white/70 mb-4">{organization.description}</p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-white/50">
                                {organization.location && (
                                    <span>📍 {organization.location}</span>
                                )}
                                {organization.website && (
                                    <a
                                        href={organization.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-white transition-colors"
                                    >
                                        🔗 Website
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Member Badge */}
                        {isMember && (
                            <div className="px-4 py-2 border border-white/20 text-white/70 text-sm">
                                ✓ Member
                            </div>
                        )}
                    </div>
                </div>

                {/* Members Section */}
                <div>
                    <h2 className="text-xl font-light mb-6 flex items-center gap-2">
                        <span className="text-white/30">人</span>
                        Members
                    </h2>

                    {organization.members && organization.members.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {organization.members.map((member: OrganizationMember) => (
                                <div
                                    key={member.id}
                                    className="border border-white/10 p-4 hover:border-white/20 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 border border-white/20 flex items-center justify-center text-sm bg-white/5">
                                                {member.user.profile_picture_url ? (
                                                    <Image
                                                        src={member.user.profile_picture_url}
                                                        alt={member.user.username}
                                                        width={40}
                                                        height={40}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="text-white/50">
                                                        {member.user.first_name?.[0] || member.user.username[0].toUpperCase()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Name */}
                                            <div>
                                                <a
                                                    href={`/profile/${member.user.username}`}
                                                    className="text-white hover:underline font-medium text-sm"
                                                >
                                                    {member.user.first_name} {member.user.last_name}
                                                </a>
                                                <p className="text-white/50 text-xs">@{member.user.username}</p>
                                            </div>
                                        </div>

                                        {/* Connect Button (hide for self) */}
                                        {member.user.id !== user?.id?.toString() && (
                                            <ConnectionButton
                                                userId={member.user.id}
                                                className="text-xs px-3 py-1"
                                            />
                                        )}
                                    </div>

                                    {/* Interests */}
                                    {member.interests && member.interests.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {member.interests.slice(0, 3).map((interest, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 text-xs bg-white/5 text-white/40"
                                                >
                                                    {interest}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border border-white/10">
                            <p className="text-white/50">No visible members</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
