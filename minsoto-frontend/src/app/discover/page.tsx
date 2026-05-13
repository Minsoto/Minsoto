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

    const fetchUsers = useCallback(async (q = search, org = selectedOrg) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (q) params.append('search', q);
            if (org) params.append('organization', org);

            const response = await api.get(`/discover/?${params.toString()}`);
            setUsers(response.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [search, selectedOrg]);

    // Initial load
    useEffect(() => {
        if (!_hasHydrated) return;
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        fetchOrganizations();
    }, [isAuthenticated, router, fetchOrganizations, _hasHydrated]);

    // Debounced search
    useEffect(() => {
        if (!_hasHydrated || !isAuthenticated) return;
        const t = setTimeout(() => fetchUsers(search, selectedOrg), 350);
        return () => clearTimeout(t);
    }, [search, selectedOrg, fetchUsers, _hasHydrated, isAuthenticated]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(search, selectedOrg);
    };

    const handleOrgFilter = (domain: string) => {
        setSelectedOrg(domain);
    };

    return (
        <div className="min-h-screen bg-black text-white relative selection:bg-[var(--accent-primary)] selection:text-black">
            {/* Dynamic Background Mesh */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[120px] bg-[var(--accent-primary)] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[150px] bg-[var(--accent-secondary)]" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CgkJPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJub25lIj48L3JlY3Q+CgkJPGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiPjwvY2lyY2xlPgoJPC9zdmc+')] opacity-30" />
            </div>

            <div className="relative z-10">
                <Navigation />
                <div className="h-16" />

                <main className="max-w-5xl mx-auto px-4 py-10">
                    {/* Header */}
                    <div className="mb-12 glass-panel rounded-[2rem] p-8 md:p-10 shadow-lg shadow-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--accent-primary)]/10 to-transparent rounded-bl-full pointer-events-none" />
                        <div className="relative z-10">
                            <h1 className="text-3xl font-black text-white tracking-tight">Discover</h1>
                            <p className="text-sm font-medium text-white/60 mt-2">Find and connect with people.</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-12 max-w-2xl mx-auto">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name or username..."
                                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-black/5 border border-[var(--glass-border)] text-base font-medium text-white placeholder:text-white/30 outline-none focus:border-[var(--accent-primary)]/50 focus:bg-white/5 transition-all shadow-lg shadow-black/5"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-black font-bold text-sm shadow-md hover:scale-105 transition-transform"
                                >
                                    Search
                                </button>
                            </div>
                        </form>

                        {/* Organization Filter */}
                        <div className="relative md:w-48 shrink-0">
                            <select
                                value={selectedOrg}
                                onChange={(e) => handleOrgFilter(e.target.value)}
                                className="w-full appearance-none pl-4 pr-10 py-4 rounded-2xl bg-black/5 border border-[var(--glass-border)] text-sm font-bold text-white/80 outline-none focus:border-white transition-all shadow-lg shadow-black/5 cursor-pointer"
                            >
                                <option value="" className="bg-black text-white">All Organizations</option>
                                {organizations.map(org => (
                                    <option key={org.id} value={org.domain} className="bg-black text-white">
                                        {org.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                ▼
                            </div>
                        </div>
                    </div>

                    {/* Results */}
                    {loading && users.length === 0 ? (
                        <div className="py-20">
                            <LoadingSpinner size="lg" text="Discovering users..." className="mb-8" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <CardLoading key={i} />
                                ))}
                            </div>
                        </div>
                    ) : error ? (
                        <ErrorState
                            message={error}
                            onRetry={fetchUsers}
                            className="py-16 glass-panel rounded-3xl"
                        />
                    ) : users.length === 0 ? (
                        <EmptyState
                            icon={<Users size={48} />}
                            message="No users found"
                            action={{
                                label: 'Clear filters',
                                onClick: () => { setSearch(''); setSelectedOrg(''); }
                            }}
                            className="py-16 glass-panel rounded-3xl border-dashed"
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.map(user => (
                                <UserCard key={user.id} user={user} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
