"use client";

import { useState, useEffect, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Link from "next/link";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, BookMarked, PenLine, Shield, Sparkles, FolderHeart } from "lucide-react";

const kanjiElements = [
  { char: '静', meaning: 'Stillness' },
  { char: '思', meaning: 'Thought' },
  { char: '記', meaning: 'Record' },
  { char: '問', meaning: 'Question' },
  { char: '知', meaning: 'Knowledge' },
];

export default function Home() {
  const [currentKanji, setCurrentKanji] = useState(0);
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const router = useRouter();

  // 3D Tilt Setup for Hero Mockup
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-500, 500], [15, -15]);
  const rotateY = useTransform(x, [-500, 500], [-15, 15]);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user) {
      router.push(`/${user.username}`);
    }
  }, [isAuthenticated, user, router, _hasHydrated]);

  useEffect(() => {
    const k = setInterval(() => setCurrentKanji(p => (p + 1) % kanjiElements.length), 4000);
    return () => clearInterval(k);
  }, []);

  const renderSkeleton = () => (
    <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-[var(--accent-primary)] selection:text-black">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[120px] bg-[var(--accent-primary)] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[150px] bg-[var(--accent-secondary)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CgkJPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJub25lIj48L3JlY3Q+CgkJPGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiPjwvY2lyY2xlPgoJPC9zdmc+')] opacity-30" />
      </div>
      <header className="relative z-50 flex items-center justify-between px-6 md:px-12 h-20 glass-panel border-b-0 border-[var(--glass-border)] shadow-sm">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] opacity-50" />
          <span className="text-xl font-bold tracking-tighter text-white/50">minsoto</span>
        </div>
      </header>
    </div>
  );

  if (!_hasHydrated) return renderSkeleton();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden selection:bg-[var(--accent-primary)] selection:text-black">
      
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[120px] bg-[var(--accent-primary)] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[150px] bg-[var(--accent-secondary)]" />
        
        {/* Subtle grid pattern overlay */}
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

      {/* Navbar */}
      <header className="relative z-50 flex items-center justify-between px-6 md:px-12 h-20 glass-panel border-b-0 border-[var(--glass-border)] shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-lg shadow-[var(--accent-primary)]/20" />
          <span className="text-xl font-bold tracking-tighter">minsoto</span>
        </div>
        <Link
          href="/login"
          className="group flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full bg-white text-black hover:scale-105 transition-all shadow-xl shadow-white/10"
        >
          Sign In
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center pt-24 pb-32 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 shadow-sm">
            <Sparkles size={14} className="text-[var(--accent-primary)]" />
            <span className="text-xs font-semibold tracking-wide uppercase text-white/70">Minsoto 2.0 is here</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.1] mb-8 drop-shadow-sm">
            Write publicly.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]">
              Without performing.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            A minimalist sanctuary for your thoughts and a curated library for your resources. No followers, no algorithms, just a permanent record of your mind.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[var(--accent-primary)] text-black text-lg font-bold shadow-2xl shadow-[var(--accent-primary)]/30 hover:shadow-[var(--accent-primary)]/50 hover:-translate-y-1 transition-all"
          >
            Get Started Free
          </Link>
        </motion.div>

        {/* 3D Interactive Mockup */}
        <div 
          className="mt-24 w-full max-w-6xl aspect-video perspective-1000 relative"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="w-full h-full relative"
          >
            {/* The Glass Canvas */}
            <div className="absolute inset-0 rounded-[2rem] glass-panel p-8 overflow-hidden">
              
              {/* Fake UI Header */}
              <div className="flex items-center gap-4 mb-8 opacity-80" style={{ transform: "translateZ(30px)" }}>
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[var(--accent-secondary)] to-[#ffffff]/50 border-2 border-[#ffffff] shadow-md" />
                <div>
                  <div className="h-4 w-32 bg-white/20 rounded-full mb-2" />
                  <div className="h-3 w-20 bg-white/10 rounded-full" />
                </div>
              </div>

              {/* Fake UI Grid */}
              <div className="grid grid-cols-3 gap-6 h-full" style={{ transform: "translateZ(50px)" }}>
                
                {/* Journal Entry Mock */}
                <div className="col-span-2 bg-[#ffffff]/60 rounded-3xl p-6 border border-[#ffffff]/50 shadow-xl shadow-black/5 hover:bg-[#ffffff]/80 transition-colors flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-white/50 font-bold text-sm mb-4">
                    <PenLine size={16} className="text-[var(--accent-primary)]" />
                    Digital Garden
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 rounded-full bg-white/40 w-3/4" />
                    <div className="h-3 rounded-full bg-white/20 w-full" />
                    <div className="h-3 rounded-full bg-white/20 w-5/6" />
                    <div className="h-3 rounded-full bg-white/20 w-4/6" />
                  </div>
                  <div className="mt-auto flex gap-2">
                    <div className="px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-[10px] font-bold">Thoughts</div>
                    <div className="px-3 py-1 rounded-full bg-[var(--accent-secondary)]/10 text-[var(--accent-secondary)] text-[10px] font-bold">Draft</div>
                  </div>
                </div>

                {/* Resource Library / Productivity Mock */}
                <div className="col-span-1 flex flex-col gap-6">
                  {/* Resource List */}
                  <div className="flex-1 bg-gradient-to-br from-[#ffffff]/80 to-[#ffffff]/40 rounded-3xl p-6 border border-[#ffffff]/50 shadow-xl shadow-black/5 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-white/50 font-bold text-sm mb-4">
                      <BookMarked size={16} className="text-[var(--accent-primary)]" />
                      Curated Links
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-[var(--accent-primary)]/20" />
                        <div className="h-2 w-20 bg-white/40 rounded-full" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded bg-[var(--accent-secondary)]/20" />
                        <div className="h-2 w-16 bg-white/40 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Opt-in Productivity Mock */}
                  <div className="h-24 bg-[#ffffff]/60 rounded-3xl p-5 border border-[#ffffff]/50 shadow-xl shadow-black/5">
                    <div className="text-white/40 font-bold text-[10px] uppercase tracking-wider mb-2 flex items-center gap-1">
                      Opt-in Habits
                    </div>
                    <div className="flex gap-1.5 h-full items-end pb-1">
                      {[40, 60, 30, 80, 50, 90, 100].map((h, i) => (
                        <div key={i} className="flex-1 bg-[var(--accent-primary)]/20 rounded-sm hover:bg-[var(--accent-primary)] transition-colors" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 3D Floating Accents */}
            <motion.div 
              animate={{ y: [0, -15, 0] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--accent-primary)]/20 rounded-full blur-2xl"
              style={{ transform: "translateZ(80px)" }}
            />
            <motion.div 
              animate={{ y: [0, 15, 0] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 w-40 h-40 bg-[var(--accent-secondary)]/20 rounded-full blur-2xl"
              style={{ transform: "translateZ(100px)" }}
            />
          </motion.div>
        </div>
      </main>

      {/* Bento Grid Features Section */}
      <section className="relative z-10 py-32 px-4 md:px-8 max-w-[1400px] mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">A canvas built for thinking.</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Step away from the algorithms. Minsoto is your digital garden, resource library, and completely optional productivity layer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Feature 1 */}
          <div className="md:col-span-2 group relative rounded-[2.5rem] glass-panel p-10 overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[var(--accent-primary)]/10 transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--accent-primary)]/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-14 h-14 rounded-2xl bg-black shadow-md flex items-center justify-center text-[var(--accent-primary)]">
                <PenLine size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Minimalist Public Journal</h3>
                <p className="text-white/60 max-w-sm">
                  Write short entries—not blog posts, not tweets. Just dated, searchable, and permanent thinking.
                </p>
              </div>
            </div>
            {/* Abstract visual */}
            <div className="absolute -bottom-10 -right-10 w-64 h-64 border-[40px] border-[#ffffff]/40 rounded-full group-hover:scale-110 transition-transform duration-700" />
          </div>

          {/* Feature 2 */}
          <div className="group relative rounded-[2.5rem] glass-panel p-10 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-14 h-14 rounded-2xl bg-white text-black shadow-md flex items-center justify-center">
                <Shield size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Anonymity-First</h3>
                <p className="text-white/60">
                  You are accountable, but not identified. Only your @handle is visible by default.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative rounded-[2.5rem] bg-white text-black p-10 overflow-hidden shadow-2xl hover:shadow-[var(--accent-primary)]/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="w-14 h-14 rounded-2xl bg-black/10 backdrop-blur-md flex items-center justify-center">
                <FolderHeart size={24} className="text-[var(--accent-primary)]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Community Resource Library</h3>
                <p className="text-black/60">
                  Human-curated, niche-agnostic collections. Bookmark 200 tabs and actually find them again.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="md:col-span-2 group relative rounded-[2.5rem] bg-gradient-to-r from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 glass-panel p-10 overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.01] transition-all duration-500">
            <div className="relative z-10 h-full flex flex-col justify-between items-center text-center">
              <h3 className="text-3xl font-black mb-4">Ready to elevate your focus?</h3>
              <Link
                href="/login"
                className="px-8 py-4 rounded-full bg-white text-black text-lg font-bold shadow-xl shadow-black/5 hover:scale-105 transition-transform"
              >
                Join Minsoto Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--glass-border)] py-12 text-center text-white/40 text-sm">
        <p>© {new Date().getFullYear()} Minsoto. Crafted with obsession.</p>
      </footer>
    </div>
  );
}