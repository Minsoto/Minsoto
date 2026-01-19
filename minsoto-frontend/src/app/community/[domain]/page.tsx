'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import UserCard from '@/components/connections/UserCard';
import Navigation from '@/components/Navigation';
import type { DiscoverUser, Organization } from '@/types/connections';
import { Building2, Users, MapPin, Globe } from 'lucide-react';

interface OrganizationDetail {
    id: string;
    name: string;
    domain: string;
    org_type: string;
    is_verified: boolean;
    logo_url?: string;
    member_count: number;
    description?: string;
    website?: string;
    location?: string;
}

export default function OrganizationDirectoryPage() {
    const router = useRouter();
    const params = useParams();
    const domain = params.domain as string;
    const { isAuthenticated, _hasHydrated } = useAuthStore();

    const [organization, setOrganization] = useState<OrganizationDetail | null>(null);
    const [members, setMembers] = useState<DiscoverUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);
    const [search, setSearch] = useState('');

    const fetchOrganization = useCallback(async () => {
        try {
            const response = await api.get(`/organizations/${domain}/`);
            setOrganization(response.data.organization);
            setIsMember(response.data.is_member);
        } catch (error) {
            console.error('Failed to fetch organization:', error);
        }
    }, [domain]);

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('organization', domain);
            if (search) params.append('search', search);

            const response = await api.get(`/discover/?${params.toString()}`);
            setMembers(response.data);
        } catch (error) {
            console.error('Failed to fetch members:', error);
        } finally {
            setLoading(false);
        }
    }, [domain, search]);

    useEffect(() => {
        if (!_hasHydrated) return;

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchOrganization();
        fetchMembers();
    }, [isAuthenticated, router, fetchOrganization, fetchMembers, _hasHydrated]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchMembers();
    };

    if (!_hasHydrated) return null;

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Organization Header */}
                {organization && (
                    <div className="border border-white/20 p-8 mb-8 relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white" />

                        <div className="flex items-start gap-6">
                            <div className="w-16 h-16 bg-white/10 flex items-center justify-center border border-white/20">
                                <Building2 size={28} className="text-white/60" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-light tracking-wide mb-1">{organization.name}</h1>
                                <p className="text-white/50 text-sm mb-4">{domain}</p>

                                <div className="flex flex-wrap gap-4 text-sm text-white/60">
                                    <div className="flex items-center gap-2">
                                        <Users size={14} />
                                        <span>{organization.member_count || members.length} members</span>
                                    </div>
                                    {organization.location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} />
                                            <span>{organization.location}</span>
                                        </div>
                                    )}
                                    {organization.website && (
                                        <a
                                            href={organization.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 hover:text-white transition-colors"
                                        >
                                            <Globe size={14} />
                                            <span>Website</span>
                                        </a>
                                    )}
                                </div>

                                {organization.description && (
                                    <p className="mt-4 text-white/70">{organization.description}</p>
                                )}
                            </div>
                            <div className="text-right">
                                {isMember && (
                                    <span className="text-xs px-3 py-1 border border-green-500/50 text-green-400">
                                        Member
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-8">
                    <div className="relative">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search members..."
                            className="w-full bg-transparent border border-white/20 px-4 py-3 text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none transition-colors"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-sm text-white/60 hover:text-white transition-colors"
                        >
                            Search
                        </button>
                    </div>
                </form>

                {/* Members Grid */}
                <div className="mb-4">
                    <h2 className="text-xs font-light tracking-widest opacity-60">MEMBERS</h2>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-white/50">
                        Loading...
                    </div>
                ) : members.length === 0 ? (
                    <div className="text-center py-12 border border-white/10">
                        <p className="text-white/50 mb-2">No members found</p>
                        <p className="text-white/30 text-sm">Try adjusting your search</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {members.map(user => (
                            <UserCard key={user.id} user={user} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
