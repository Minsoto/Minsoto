'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import type { Organization } from '@/types/connections';

export default function CommunityPage() {
    const router = useRouter();
    const { isAuthenticated, _hasHydrated } = useAuthStore();

    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!_hasHydrated) return;

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchOrganizations();
    }, [isAuthenticated, router, _hasHydrated]);

    const fetchOrganizations = async () => {
        try {
            const response = await api.get('/organizations/');
            setOrganizations(response.data);
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
        } finally {
            setLoading(false);
        }
    };

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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-light tracking-wide mb-2">Community</h1>
                    <p className="text-white/50">Browse organizations and communities</p>
                </div>

                {/* Organizations Grid */}
                {loading ? (
                    <div className="text-center py-12 text-white/50">
                        Loading...
                    </div>
                ) : organizations.length === 0 ? (
                    <div className="text-center py-12 border border-white/10">
                        <p className="text-white/50 mb-2">No organizations yet</p>
                        <p className="text-white/30 text-sm">Organizations are created when users verify their email domains</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {organizations.map(org => (
                            <a
                                key={org.id}
                                href={`/community/${org.domain}`}
                                className="border border-white/10 p-6 hover:border-white/30 transition-all duration-200 group"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Logo */}
                                    <div className="w-14 h-14 border border-white/20 flex items-center justify-center text-xl font-light bg-white/5 shrink-0 group-hover:border-white/40 transition-colors">
                                        {org.logo_url ? (
                                            <Image
                                                src={org.logo_url}
                                                alt={org.name}
                                                width={56}
                                                height={56}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white/50">
                                                {org.name[0]}
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-medium truncate group-hover:text-white transition-colors">
                                                {org.name}
                                            </h3>
                                            {org.is_verified && (
                                                <span className="text-white/50 text-xs">✓</span>
                                            )}
                                        </div>

                                        <p className="text-white/50 text-sm mb-2">
                                            {org.member_count} Members
                                        </p>

                                        <span className="text-xs text-white/40">
                                            {orgTypeLabels[org.org_type]}
                                        </span>
                                    </div>
                                </div>

                                {org.description && (
                                    <p className="text-white/40 text-sm mt-4 line-clamp-2">
                                        {org.description}
                                    </p>
                                )}
                            </a>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
