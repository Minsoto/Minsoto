'use client';

import axios from 'axios';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Fingerprint, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SetupUsernamePage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentKanji, setCurrentKanji] = useState(0);
  const { user, updateUser, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  const kanjiElements = [
    { char: '名', meaning: 'Name' },
    { char: '身', meaning: 'Identity' },
    { char: '個', meaning: 'Individual' }
  ];

  useEffect(() => {
    if (_hasHydrated) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.is_setup_complete) {
        router.push(`/${user.username}`);
      }
    }
  }, [isAuthenticated, user, router, _hasHydrated]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKanji((prev) => (prev + 1) % kanjiElements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [kanjiElements.length]);

  if (!_hasHydrated || !isAuthenticated || user?.is_setup_complete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/setup-username/', { username });
      updateUser(response.data.user);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.username?.[0] || 'Failed to set username';
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden flex items-center justify-center relative selection:bg-[var(--accent-primary)] selection:text-black">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[120px] bg-[var(--accent-primary)] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[150px] bg-[var(--accent-secondary)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CgkJPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJub25lIj48L3JlY3Q+CgkJPGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiPjwvY2lyY2xlPgoJPC9zdmc+')] opacity-30" />
      </div>

      {/* Floating Background Kanji */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentKanji}
            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.2, opacity: 0, rotate: 5 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="text-[40vw] font-black leading-none select-none"
          >
            {kanjiElements[currentKanji].char}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Header Logo */}
      <header className="absolute top-0 left-0 w-full p-6 md:px-12 z-50 flex items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-lg shadow-[var(--accent-primary)]/20" />
          <span className="text-xl font-bold tracking-tighter">minsoto</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass-panel rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

          <div className="relative z-10 text-center space-y-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white shadow-lg mb-2 text-[var(--foreground)]">
              <Fingerprint size={28} />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight">
                Choose your alias
              </h1>
              <p className="text-white/60 font-medium text-sm">
                You are accountable, but not identified.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-left">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-red-500/20 bg-red-500/10 text-red-600 px-4 py-3 text-sm font-medium"
                >
                  <div className="flex items-center gap-2">
                    <span>⚠</span>
                    {error}
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <label htmlFor="username" className="text-xs font-bold text-white/50 uppercase tracking-wider pl-4">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-medium">@</span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    maxLength={30}
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full bg-black/5 border border-[var(--glass-border)] rounded-2xl py-4 pl-10 pr-4 text-white font-medium focus:outline-none focus:border-[var(--accent-primary)]/50 focus:bg-white transition-all"
                    placeholder="digital_gardener"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30">
                    {username.length}/30
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="group relative w-full flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-bold shadow-xl shadow-black/5 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
