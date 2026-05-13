'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PenLine, Calendar, Hash, LayoutGrid } from 'lucide-react';
import api from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import ProfileSidebar from '@/app/profile/ProfileSidebar';
import { toast } from 'sonner';

interface JournalEntry {
  id: string;
  title: string;
  preview: string;
  content?: string;
  slug: string;
  word_count: number;
  created_at: string;
  tags: { id: string; name: string }[];
  author_username: string;
}

interface Profile {
  bio: string;
  display_name: string;
  show_display_name: boolean;
  show_avatar: boolean;
  show_bio: boolean;
  show_interests: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user?: any;
  profile_picture_url?: string;
  banner_url?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interests?: any;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function JournalPage() {
  const params = useParams();
  const rawUsername = params?.username as string || '';
  const decodedUsername = decodeURIComponent(rawUsername);
  const username = decodedUsername.startsWith('@') ? decodedUsername.slice(1) : decodedUsername;
  const { user } = useAuthStore();
  const isOwner = user?.username === username;

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fullEntry, setFullEntry] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!username) return;
    setLoading(true);

    Promise.allSettled([
      api.get(`/journal/${username}/`),
      api.get(`/profile/${username}/`),
    ]).then(([entriesRes, profileRes]) => {
      if (entriesRes.status === 'fulfilled') {
        setEntries(entriesRes.value.data.results || []);
      }
      if (profileRes.status === 'fulfilled') {
        const profileData = profileRes.value.data.profile || profileRes.value.data;
        setProfile(profileData);
      }
      setLoading(false);
    });
  }, [username]);

  const handleExpand = async (entry: JournalEntry) => {
    if (expandedId === entry.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(entry.id);
    if (!fullEntry[entry.id]) {
      try {
        const res = await api.get(`/journal/${username}/${entry.slug}/`);
        setFullEntry(prev => ({ ...prev, [entry.id]: res.data.content }));
      } catch {
        setFullEntry(prev => ({ ...prev, [entry.id]: entry.preview }));
      }
    }
  };

  const showName = profile?.show_display_name && profile?.display_name;
  const showBio = profile?.show_bio && profile?.bio;

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

        <main className="max-w-[1800px] mx-auto px-4 md:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:sticky lg:top-24 h-fit">
              {profile && (
                <ProfileSidebar
                  user={{
                    ...profile.user,
                    profile_picture_url: profile.profile_picture_url,
                    status: 'online',
                  }}
                  stats={profile.stats || { connections: 0, friends: 0 }}
                  interests={profile.interests || []}
                  isOwner={isOwner}
                  bannerUrl={profile.banner_url}
                  onUpdateBanner={async (url) => {
                    try {
                      await api.patch('/profile/me/', { banner_url: url });
                      setProfile(prev => prev ? { ...prev, banner_url: url } : prev);
                    } catch (e) {
                      toast.error('Failed to update banner');
                    }
                  }}
                  onUpdateAvatar={async (url) => {
                    try {
                      await api.patch('/profile/me/', { profile_picture_url: url });
                      setProfile(prev => prev ? { ...prev, profile_picture_url: url } : prev);
                    } catch (e) {
                      toast.error('Failed to update avatar');
                    }
                  }}
                />
              )}
            </div>

            {/* Main Area - Journal Entries */}
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-8 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center">
                    <PenLine size={20} className="text-[var(--accent-primary)]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">Digital Garden</h1>
                    <p className="text-sm text-white/50 mt-0.5">
                      Public thoughts, essays, and notes.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/${username}/board`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-bold text-sm shadow-xl shadow-black/5 hover:scale-105 transition-transform"
                  >
                    <LayoutGrid size={16} />
                    View Board
                  </Link>
                  {isOwner && (
                    <Link
                      href="/write"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black/5 text-white/60 hover:text-black hover:bg-white border border-[var(--glass-border)] transition-all text-sm font-bold shadow-sm hover:shadow-lg"
                    >
                      <PenLine size={16} />
                      Write
                    </Link>
                  )}
                </div>
              </div>
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-white/5 rounded w-20 mb-3" />
                <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/5 rounded w-full mb-1" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/20 text-sm">
              {isOwner ? 'Nothing here yet. Write your first entry.' : 'No public entries yet.'}
            </p>
            {isOwner && (
              <Link
                href="/write"
                className="mt-4 inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                <PenLine size={14} />
                Start writing
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry, i) => (
              <motion.article
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                className="glass-panel rounded-3xl p-8 hover:shadow-xl hover:shadow-[var(--accent-primary)]/5 transition-shadow"
              >
                {/* Date */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/50 border border-[var(--glass-border)] flex items-center justify-center">
                    <Calendar size={14} className="text-white/40" />
                  </div>
                  <time className="text-xs font-bold text-white/40 uppercase tracking-wider">
                    {formatDate(entry.created_at)}
                  </time>
                  {entry.word_count > 0 && (
                    <>
                      <span className="text-xs text-white/20">·</span>
                      <span className="text-xs font-bold text-white/30">{entry.word_count} words</span>
                    </>
                  )}
                </div>

                {/* Title (optional) */}
                {entry.title && (
                  <h2 className="text-2xl font-black text-white/90 mb-4 leading-snug">
                    {entry.title}
                  </h2>
                )}

                {/* Content — collapsed preview or full markdown */}
                <div
                  className="cursor-pointer group"
                  onClick={() => handleExpand(entry)}
                >
                  <AnimatePresence mode="wait">
                    {expandedId === entry.id ? (
                      <motion.div
                        key="full"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="prose prose-invert max-w-none text-white/70 leading-relaxed font-medium"
                      >
                        <ReactMarkdown>
                          {fullEntry[entry.id] || entry.preview}
                        </ReactMarkdown>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative"
                      >
                        <p className="text-base text-white/60 leading-relaxed font-medium">
                          {entry.preview}
                          {entry.preview?.length >= 280 && (
                            <span className="text-[var(--accent-primary)] ml-2 font-bold group-hover:underline">Read full entry</span>
                          )}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tags */}
                {entry.tags.length > 0 && (
                  <div className="flex gap-2 mt-6 flex-wrap">
                    {entry.tags.map(tag => (
                      <span
                        key={tag.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 text-xs font-bold text-white/60 border border-[var(--glass-border)] hover:bg-white/60 hover:text-black transition-colors"
                      >
                        <Hash size={12} className="opacity-50" />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </motion.article>
            ))}
          </div>
            )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
