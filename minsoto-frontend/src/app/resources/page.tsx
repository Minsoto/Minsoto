'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Hash, Bookmark, BookmarkCheck, Plus, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ResourceList {
  id: string;
  title: string;
  description: string;
  niche_tag: string;
  creator_username: string;
  save_count: number;
  resource_count: number;
  is_saved: boolean;
  forked_from: string | null;
  created_at: string;
}

interface NicheTag { niche: string; count: number; }

export default function ResourcesPage() {
  const { isAuthenticated } = useAuthStore();

  const [lists, setLists] = useState<ResourceList[]>([]);
  const [niches, setNiches] = useState<NicheTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeNiche, setActiveNiche] = useState('');
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const fetchLists = useCallback(async (niche = activeNiche, q = search, off = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ offset: String(off), limit: String(LIMIT) });
      if (niche) params.set('niche', niche);
      if (q) params.set('q', q);
      const res = await api.get(`/resources/?${params}`);
      if (off === 0) setLists(res.data.results);
      else setLists(prev => [...prev, ...res.data.results]);
      setTotal(res.data.count);
      setOffset(off);
    } catch { /* silent */ }
    setLoading(false);
  }, [activeNiche, search]);

  useEffect(() => {
    api.get('/resources/niches/').then(res => setNiches(res.data)).catch(() => {});
    fetchLists('', '', 0);
  }, []); // eslint-disable-line

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchLists(activeNiche, search, 0), 350);
    return () => clearTimeout(t);
  }, [search, activeNiche]); // eslint-disable-line

  const handleNiche = (niche: string) => {
    const next = niche === activeNiche ? '' : niche;
    setActiveNiche(next);
  };

  const toggleSave = async (list: ResourceList, e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Sign in to save lists.'); return; }
    try {
      if (list.is_saved) {
        await api.delete(`/resources/lists/${list.id}/unsave/`);
        toast.success('Removed from saved.');
      } else {
        await api.post(`/resources/lists/${list.id}/save/`);
        toast.success('Saved!');
      }
      setLists(prev => prev.map(l =>
        l.id === list.id
          ? { ...l, is_saved: !l.is_saved, save_count: l.save_count + (l.is_saved ? -1 : 1) }
          : l
      ));
    } catch { toast.error('Something went wrong.'); }
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

        <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 glass-panel rounded-[2rem] p-8 md:p-10 shadow-lg shadow-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--accent-primary)]/10 to-transparent rounded-bl-full pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-3xl font-black text-white tracking-tight">Resource Library</h1>
            <p className="text-sm font-medium text-white/60 mt-2">Community-curated lists for every niche.</p>
          </div>
          {isAuthenticated && (
            <div className="relative z-10">
              <Link
                href="/resources/new"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold shadow-xl shadow-black/5 hover:scale-[1.02] transition-transform w-full md:w-auto"
              >
                <Plus size={16} />
                Create List
              </Link>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-xl mx-auto">
          <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search libraries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-black/5 border border-[var(--glass-border)] text-base font-medium text-white placeholder:text-white/30 outline-none focus:border-[var(--accent-primary)]/50 focus:bg-white/5 transition-all shadow-lg shadow-black/5"
          />
        </div>

        {/* Niche tag pills */}
        {niches.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {niches.map(n => (
              <button
                key={n.niche}
                onClick={() => handleNiche(n.niche)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  activeNiche === n.niche
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-white/5 text-white/60 border-[var(--glass-border)] hover:bg-white/10 hover:text-white'
                }`}
              >
                <Hash size={12} className={activeNiche === n.niche ? "opacity-50" : "opacity-30"} />
                {n.niche}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${activeNiche === n.niche ? 'bg-black/10 text-black' : 'bg-white/10 text-white/40'}`}>{n.count}</span>
              </button>
            ))}
          </div>
        )}

        {/* List grid */}
        {loading && lists.length === 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 glass-panel rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-20 glass-panel rounded-[2rem] border border-[var(--glass-border)] border-dashed">
            <p className="text-sm font-medium text-white/40">No libraries found.</p>
            {isAuthenticated && (
              <Link href="/resources/new" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--accent-primary)] hover:scale-105 transition-transform">
                <Plus size={16} /> Create the first one
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list, i) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
                >
                  <Link
                    href={`/resources/${list.id}`}
                    className="block h-full p-6 rounded-3xl glass-panel hover:shadow-xl hover:shadow-[var(--accent-primary)]/5 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <h3 className="text-xl font-bold text-white leading-snug">
                          {list.title}
                        </h3>
                        <button
                          onClick={e => toggleSave(list, e)}
                          className={`shrink-0 p-2 rounded-xl transition-colors ${list.is_saved ? 'bg-white text-black shadow-md' : 'bg-white/5 text-white/40 hover:bg-white/20'}`}
                          aria-label={list.is_saved ? 'Unsave' : 'Save'}
                        >
                          {list.is_saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        </button>
                      </div>

                      {list.description && (
                        <p className="text-sm text-white/50 mb-6 leading-relaxed font-medium line-clamp-2">
                          {list.description}
                        </p>
                      )}

                      <div className="mt-auto pt-4 border-t border-[var(--glass-border)] flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-xs font-bold text-white/40">
                          {list.niche_tag && (
                            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-[var(--glass-border)]">
                              <Hash size={10} />{list.niche_tag}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            {list.resource_count} <span className="opacity-50">items</span>
                          </span>
                          <span className="flex items-center gap-1">
                            {list.save_count} <span className="opacity-50">saves</span>
                          </span>
                        </div>
                        <span className="text-xs font-bold text-white/20 uppercase tracking-wider">
                          @{list.creator_username}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Load more */}
            {lists.length < total && (
              <div className="text-center mt-12">
                <button
                  onClick={() => fetchLists(activeNiche, search, offset + LIMIT)}
                  disabled={loading}
                  className="px-8 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-sm font-bold text-white/60 hover:text-white border border-[var(--glass-border)] transition-all disabled:opacity-40"
                >
                  {loading ? 'Loading…' : `Load More (${total - lists.length})`}
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
