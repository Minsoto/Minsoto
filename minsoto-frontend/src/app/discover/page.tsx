'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import UserCard from '@/components/connections/UserCard';
import Navigation from '@/components/Navigation';
import { LoadingSpinner, ErrorState, EmptyState, CardLoading } from '@/components/ui/LoadingStates';
import type { DiscoverUser, Organization } from '@/types/connections';
import { Search, Users } from 'lucide-react';

export default function DiscoverPage() {
    const router = useRouter();
    const { isAuthenticated, _hasHydrated } = useAuthStore();

    const [users, setUsers] = useState<DiscoverUser[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
        setError(null);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (selectedOrg) params.append('organization', selectedOrg);

            const response = await api.get(`/discover/?${params.toString()}`);
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Failed to load users. Please try again.');
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
        <div className="min-h-screen bg-[var(--background)] text-white">
            <Navigation />

            {/* Spacer for fixed nav */}
            <div className="h-16" />

            <main className="container-wide py-8">
                {/* Header */}
                <div className="mb-8 animate-fadeIn">
                    <h1 className="heading-lg">Discover</h1>
                    <p className="text-white/50 mt-1">Find and connect with people</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1">
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or username..."
                                className="input pl-11"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost text-sm"
                            >
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Organization Filter */}
                    <select
                        value={selectedOrg}
                        onChange={(e) => handleOrgFilter(e.target.value)}
                        className="input min-w-[200px]"
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
                    <div className="py-20">
                        <LoadingSpinner size="lg" text="Discovering users..." className="mb-8" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <CardLoading key={i} />
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    <ErrorState
                        message={error}
                        onRetry={fetchUsers}
                        className="py-16 glass-panel rounded-xl"
                    />
                ) : users.length === 0 ? (
                    <EmptyState
                        icon={<Users size={48} />}
                        message="No users found"
                        action={{
                            label: 'Clear filters',
                            onClick: () => { setSearch(''); setSelectedOrg(''); }
                        }}
                        className="py-16 glass-panel rounded-xl"
                    />
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
