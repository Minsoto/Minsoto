'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import UserCard from '@/components/connections/UserCard';
import Navigation from '@/components/Navigation';
import type { DiscoverUser, Organization } from '@/types/connections';

export default function DiscoverPage() {
    const router = useRouter();
    const { isAuthenticated, _hasHydrated } = useAuthStore();

    const [users, setUsers] = useState<DiscoverUser[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedOrg, setSelectedOrg] = useState('');

    const fetchOrganizations = useCallback(async () => {
        try {
            const response = await api.get('/organizations/');
            setOrganizations(response.data);
        } catch (error) {
            console.error('Failed to fetch organizations:', error);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (selectedOrg) params.append('organization', selectedOrg);

            const response = await api.get(`/discover/?${params.toString()}`);
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    }, [search, selectedOrg]);

    useEffect(() => {
        if (!_hasHydrated) return;

        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchOrganizations();
        fetchUsers();
    }, [isAuthenticated, router, fetchOrganizations, fetchUsers, _hasHydrated]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers();
    };

    const handleOrgFilter = (domain: string) => {
        setSelectedOrg(domain);
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <Navigation />

            <main className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-light tracking-wide mb-2">Discover</h1>
                    <p className="text-white/50">Find and connect with people</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or username..."
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

                    {/* Organization Filter */}
                    <select
                        value={selectedOrg}
                        onChange={(e) => handleOrgFilter(e.target.value)}
                        className="bg-black border border-white/20 px-4 py-3 text-white focus:border-white/40 focus:outline-none transition-colors min-w-[200px]"
                    >
                        <option value="">All Organizations</option>
                        {organizations.map(org => (
                            <option key={org.id} value={org.domain}>
                                {org.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="text-center py-12 text-white/50">
                        Loading...
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 border border-white/10">
                        <p className="text-white/50 mb-2">No users found</p>
                        <p className="text-white/30 text-sm">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {users.map(user => (
                            <UserCard key={user.id} user={user} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
