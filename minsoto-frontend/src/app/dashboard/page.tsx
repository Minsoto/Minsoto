'use client';

import { useAuthStore } from '@/stores/authStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import TodaysFocus from '@/components/dashboard/TodaysFocus';
import StatsWidget from '@/components/dashboard/StatsWidget';
import GoalsWidget from '@/components/dashboard/GoalsWidget';
import PomodoroWidget from '@/components/dashboard/PomodoroWidget';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PenLine, BookMarked, FileText, ChevronRight,
  Settings2, X, Check, Plus,
} from 'lucide-react';
import api from '@/lib/api';

interface JournalEntry {
  id: string;
  title: string;
  preview: string;
  slug: string;
  word_count: number;
  created_at: string;
  visibility: string;
}

interface ResourceList {
  id: string;
  title: string;
  niche_tag: string;
  resource_count: number;
  save_count: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type ProductivityWidget = 'todays-focus' | 'stats' | 'goals' | 'pomodoro';
const PROD_WIDGETS: { type: ProductivityWidget; name: string; icon: string }[] = [
  { type: 'todays-focus', name: 'Daily Focus',  icon: '📋' },
  { type: 'stats',        name: 'Stats',         icon: '📊' },
  { type: 'goals',        name: 'Goals',         icon: '🎯' },
  { type: 'pomodoro',     name: 'Pomodoro',      icon: '⏱️' },
];
const DEFAULT_PROD: ProductivityWidget[] = ['todays-focus', 'stats', 'goals'];

export default function DashboardPage() {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const { fetchFocus, fetchStats } = useDashboardStore();
  const router = useRouter();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [drafts, setDrafts] = useState<JournalEntry[]>([]);
  const [myLists, setMyLists] = useState<ResourceList[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);

  const [enabledWidgets, setEnabledWidgets] = useState<ProductivityWidget[]>(DEFAULT_PROD);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Auth guard
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) router.push('/login');
  }, [_hasHydrated, isAuthenticated, router]);

  // Load productivity widgets preference
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-widgets-v2');
    if (saved) {
      try { setEnabledWidgets(JSON.parse(saved)); } catch { /* keep default */ }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFocus();
      fetchStats();
    }
  }, [isAuthenticated, fetchFocus, fetchStats]);

  // Load journal entries + resource lists
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setLoadingEntries(true);
    Promise.allSettled([
      api.get(`/journal/me/entries/`),
      api.get(`/journal/me/drafts/`),
      api.get(`/resources/my/`),
    ]).then(([entriesRes, draftsRes, listsRes]) => {
      if (entriesRes.status === 'fulfilled') setEntries(entriesRes.value.data.slice(0, 5));
      if (draftsRes.status === 'fulfilled') setDrafts(draftsRes.value.data.slice(0, 3));
      if (listsRes.status === 'fulfilled') setMyLists(listsRes.value.data.created?.slice(0, 4) || []);
      setLoadingEntries(false);
    });
  }, [isAuthenticated, user]);

  const toggleWidget = (type: ProductivityWidget) => {
    setEnabledWidgets(prev =>
      prev.includes(type) ? prev.filter(w => w !== type) : [...prev, type]
    );
  };

  const saveWidgets = () => {
    localStorage.setItem('dashboard-widgets-v2', JSON.stringify(enabledWidgets));
    setIsCustomizing(false);
  };

  const renderSkeleton = () => (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <Navigation />
      <div className="h-16" />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <section className="mb-12">
          <div className="h-4 w-24 bg-white/5 rounded animate-pulse mb-5" />
          <div className="h-[52px] bg-white/5 rounded-xl animate-pulse mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/3 rounded-xl animate-pulse" />)}
          </div>
        </section>
        <section className="mb-12">
          <div className="h-4 w-24 bg-white/5 rounded animate-pulse mb-5" />
          <div className="grid sm:grid-cols-2 gap-3">
            {[1, 2].map(i => <div key={i} className="h-[88px] bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        </section>
        <section>
          <div className="h-4 w-24 bg-white/5 rounded animate-pulse mb-5" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 h-[380px] bg-white/5 rounded-xl animate-pulse" />
            <div className="h-[380px] bg-white/5 rounded-xl animate-pulse" />
          </div>
        </section>
      </main>
    </div>
  );

  if (!_hasHydrated) return renderSkeleton();

  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <Navigation />
      <div className="h-16" />

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* === WRITING SECTION === */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs text-white/30 tracking-widest uppercase">Journal</h2>
            <Link
              href="/write"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/60 hover:text-white transition-all"
            >
              <PenLine size={12} />
              New entry
            </Link>
          </div>

          {/* Quick compose shortcut */}
          <Link
            href="/write"
            className="block w-full mb-6 px-4 py-3.5 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 hover:bg-white/5 text-sm text-white/25 hover:text-white/40 transition-all text-left"
          >
            What are you thinking about?
          </Link>

          {loadingEntries ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-white/3 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {/* Drafts (shown first) */}
              {drafts.map(entry => (
                <Link
                  key={entry.id}
                  href={`/write?edit=${entry.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 group transition-all"
                >
                  <FileText size={13} className="text-white/25 shrink-0" />
                  <span className="text-sm text-white/40 flex-1 truncate italic">
                    {entry.title || entry.preview?.slice(0, 50) || 'Untitled draft'}
                  </span>
                  <span className="text-xs text-white/20">draft</span>
                </Link>
              ))}

              {/* Published entries */}
              {entries.map(entry => (
                <Link
                  key={entry.id}
                  href={`/${user?.username}#${entry.slug}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 group transition-all"
                >
                  <span className="text-xs text-white/25 w-14 shrink-0">{formatDate(entry.created_at)}</span>
                  <span className="text-sm text-white/65 flex-1 truncate">
                    {entry.title || entry.preview?.slice(0, 50) || 'Untitled'}
                  </span>
                  <span className="text-xs text-white/20">{entry.word_count}w</span>
                  <ChevronRight size={12} className="text-white/10 group-hover:text-white/30 transition-colors" />
                </Link>
              ))}

              {entries.length === 0 && drafts.length === 0 && (
                <p className="text-xs text-white/20 px-3 py-4">No entries yet. Start writing.</p>
              )}

              {entries.length > 0 && (
                <Link
                  href={`/${user?.username}`}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs text-white/25 hover:text-white/50 transition-colors"
                >
                  View all on my page
                  <ChevronRight size={11} />
                </Link>
              )}
            </div>
          )}
        </section>

        {/* === RESOURCES SECTION === */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs text-white/30 tracking-widest uppercase">Resources</h2>
            <Link
              href="/resources/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/60 hover:text-white transition-all"
            >
              <Plus size={12} />
              New list
            </Link>
          </div>

          {myLists.length === 0 ? (
            <p className="text-xs text-white/20 px-3">No resource lists yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {myLists.map(list => (
                <Link
                  key={list.id}
                  href={`/resources/${list.id}`}
                  className="p-4 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-sm text-white/70 font-medium truncate">{list.title}</span>
                    <ChevronRight size={13} className="text-white/15 group-hover:text-white/40 shrink-0 mt-0.5 transition-colors" />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/30">
                    {list.niche_tag && <span>#{list.niche_tag}</span>}
                    <span>{list.resource_count} resources</span>
                    <span>{list.save_count} saves</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link href="/resources/my" className="inline-flex items-center gap-1 mt-3 px-3 text-xs text-white/25 hover:text-white/50 transition-colors">
            <BookMarked size={11} />
            All my lists
          </Link>
        </section>

        {/* === PRODUCTIVITY SECTION === */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs text-white/30 tracking-widest uppercase">Productivity</h2>
            <button
              onClick={() => setIsCustomizing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/5 text-xs text-white/30 hover:text-white/60 transition-all"
            >
              <Settings2 size={12} />
              Customize
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enabledWidgets.includes('todays-focus') && (
              <div className="lg:col-span-2 min-h-[380px]"><TodaysFocus /></div>
            )}
            {enabledWidgets.includes('stats') && (
              <div className="min-h-[180px]"><StatsWidget /></div>
            )}
            {enabledWidgets.includes('goals') && (
              <div className="min-h-[280px]"><GoalsWidget /></div>
            )}
            {enabledWidgets.includes('pomodoro') && (
              <div className="min-h-[280px]"><PomodoroWidget /></div>
            )}
          </div>

          {enabledWidgets.length === 0 && (
            <div className="text-center py-10">
              <p className="text-xs text-white/20 mb-3">No productivity widgets enabled.</p>
              <button onClick={() => setIsCustomizing(true)} className="text-xs text-white/35 hover:text-white/60 transition-colors">
                Add some →
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Customize Modal */}
      <AnimatePresence>
        {isCustomizing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
            onClick={() => setIsCustomizing(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel rounded-2xl p-6 w-full max-w-sm"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-medium text-white">Productivity Widgets</h2>
                <button onClick={() => setIsCustomizing(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={16} className="text-white/60" />
                </button>
              </div>
              <div className="space-y-2 mb-5">
                {PROD_WIDGETS.map(w => (
                  <button
                    key={w.type}
                    onClick={() => toggleWidget(w.type)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      enabledWidgets.includes(w.type)
                        ? 'border-white/20 bg-white/8'
                        : 'border-white/8 bg-white/3 hover:bg-white/6'
                    }`}
                  >
                    <span>{w.icon}</span>
                    <span className="text-sm text-white/70 flex-1 text-left">{w.name}</span>
                    {enabledWidgets.includes(w.type)
                      ? <Check size={14} className="text-white/60" />
                      : <Plus size={14} className="text-white/30" />
                    }
                  </button>
                ))}
              </div>
              <button
                onClick={saveWidgets}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm text-white/80 transition-all"
              >
                Save
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
