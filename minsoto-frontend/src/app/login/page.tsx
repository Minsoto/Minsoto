'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Leaf } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [error, setError] = useState<string>('');
  const [currentKanji, setCurrentKanji] = useState(0);
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const router = useRouter();

  // Japanese kanji elements for background animation
  const kanjiElements = [
    { char: '静', meaning: 'Stillness' },
    { char: '思', meaning: 'Thought' },
    { char: '記', meaning: 'Record' },
  ];

  // Redirect based on authentication
  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user) {
      if (!user.is_setup_complete) {
        router.push('/setup-username');
      } else {
        router.push(`/${user.username}`);
      }
    }
  }, [isAuthenticated, user, router, _hasHydrated]);

  // Cycle through kanji elements every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKanji(prev => (prev + 1) % kanjiElements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [kanjiElements.length]);

  if (!_hasHydrated || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAuthSuccess = () => setError('');
  const handleAuthError = (errorMessage: string) => setError(errorMessage);

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
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-lg shadow-[var(--accent-primary)]/20" />
          <span className="text-xl font-bold tracking-tighter">minsoto</span>
        </Link>
      </header>

      {/* Main Login Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass-panel rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-white/5 relative overflow-hidden"
        >
          {/* Subtle Inner Glow */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

          <div className="relative z-10 text-center space-y-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white shadow-lg mb-2 text-[var(--accent-primary)]">
              <Leaf size={28} />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tight">
                Enter your garden
              </h1>
              <p className="text-white/60 font-medium text-sm">
                A sanctuary for your thoughts and resources. No performing required.
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-red-500/20 bg-red-500/10 text-red-600 px-4 py-3 text-sm font-medium"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>⚠</span>
                  {error}
                </div>
              </motion.div>
            )}

            <div className="pt-4">
              <GoogleAuthButton
                onSuccess={handleAuthSuccess}
                onError={handleAuthError}
              />
            </div>
            
            <div className="pt-6 border-t border-[var(--glass-border)]">
              <p className="text-xs text-white/40 font-medium">
                By signing in, you agree to step away from algorithmic noise.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
