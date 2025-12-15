"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Users, Target, Zap } from "lucide-react";

export default function Home() {
  const [currentKanji, setCurrentKanji] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Japanese elements for rotation
  const kanjiElements = [
    { char: '和', meaning: 'Harmony', reading: 'wa' },
    { char: '集', meaning: 'Gather', reading: 'atsu' },
    { char: '繋', meaning: 'Connect', reading: 'tsuna' },
    { char: '静', meaning: 'Tranquil', reading: 'sei' },
    { char: '美', meaning: 'Beauty', reading: 'bi' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKanji((prev) => (prev + 1) % kanjiElements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [kanjiElements.length]);

  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user) {
      router.push(`/profile/${user.username}`);
    }
  }, [isAuthenticated, user, router, _hasHydrated]);

  const features = [
    { icon: Target, title: 'Track Goals', desc: 'Set and achieve your goals with visual progress tracking' },
    { icon: Users, title: 'Connect', desc: 'Build meaningful connections with like-minded people' },
    { icon: Zap, title: 'Stay Focused', desc: 'Minimize distractions with mindful design' },
    { icon: Sparkles, title: 'Grow Together', desc: 'Level up alongside your community' },
  ];

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[var(--background)] text-white overflow-x-hidden relative"
    >
      {/* === Animated Background === */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient mesh */}
        <div
          className="absolute inset-0 opacity-50"
          style={{ background: 'var(--gradient-mesh)' }}
        />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
            top: '10%',
            left: '20%',
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
            bottom: '10%',
            right: '10%',
          }}
          animate={{
            x: [0, -40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Large kanji background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentKanji}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 0.03, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 1 }}
            className="absolute text-[25rem] font-thin select-none"
            style={{
              right: '-5%',
              top: '10%',
            }}
          >
            {kanjiElements[currentKanji].char}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* === Navbar === */}
      <nav className="relative z-10 px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/favicon.ico"
              alt="Logo"
              width={36}
              height={36}
              className="w-9 h-9"
            />
            <div className="h-5 w-px bg-white/10" />
            <AnimatePresence mode="wait">
              <motion.span
                key={currentKanji}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.5, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm tracking-wide"
              >
                {kanjiElements[currentKanji].reading}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          <motion.div
            className="flex items-center gap-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="#features"
              className="hidden md:block text-sm text-white/50 hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#philosophy"
              className="hidden md:block text-sm text-white/50 hover:text-white transition-colors"
            >
              Philosophy
            </Link>
            <Link
              href="/login"
              className="btn btn-primary"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* === Hero Section === */}
      <section className="relative z-10 min-h-[85vh] flex items-center pt-12">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-10">
            {/* Kanji Display */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentKanji}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.8 }}
                  className="text-8xl md:text-9xl font-thin text-white mb-3"
                >
                  {kanjiElements[currentKanji].char}
                </motion.div>
              </AnimatePresence>
              <div className="flex items-center gap-3 text-sm text-white/40">
                <span>{kanjiElements[currentKanji].reading}</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>{kanjiElements[currentKanji].meaning}</span>
              </div>
            </motion.div>

            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center gap-4">
                <div className="h-px w-12 bg-gradient-to-r from-cyan-400 to-transparent" />
                <span className="text-sm text-white/60/80 tracking-wide">THE MINDFUL NETWORK</span>
              </div>

              <h1 className="heading-xl">
                <span className="block text-white">Community,</span>
                <span className="block text-white/70">Without the Chaos</span>
              </h1>

              <p className="text-lg text-white/50 leading-relaxed max-w-lg">
                Where focus meets growth through purposeful connection.
                Experience the harmony of minimalist social interaction,
                inspired by Japanese principles of mindful simplicity.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Link href="/login" className="btn btn-primary text-base py-3 px-8">
                Begin Your Journey
                <ArrowRight size={18} />
              </Link>
              <Link
                href="#philosophy"
                className="btn btn-secondary text-base py-3 px-8"
              >
                Learn More
              </Link>
            </motion.div>
          </div>

          {/* Right Column - Visual Element */}
          <motion.div
            className="relative hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Floating cards preview */}
            <div className="relative w-full max-w-md">
              {/* Main card */}
              <motion.div
                className="glass-card p-6 rounded-2xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-lg font-medium">
                    C
                  </div>
                  <div>
                    <div className="font-medium">Chaitanya Anand</div>
                    <div className="text-sm text-white/50">@chaitanya-anand</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold text-white/60">42</div>
                    <div className="text-xs text-white/40">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white/80">12</div>
                    <div className="text-xs text-white/40">Goals</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white/60">28</div>
                    <div className="text-xs text-white/40">Connections</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating accent cards */}
              <motion.div
                className="absolute -top-6 -right-6 glass-card p-4 rounded-xl"
                animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Target size={16} className="text-white/70" />
                  </div>
                  <div className="text-sm">
                    <div className="text-white/80">Goal Complete</div>
                    <div className="text-xs text-white/40">+50 XP</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-8 glass-card p-4 rounded-xl"
                animate={{ y: [0, -6, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Users size={16} className="text-white/70" />
                  </div>
                  <div className="text-sm">
                    <div className="text-white/80">New Connection</div>
                    <div className="text-xs text-white/40">Alex joined</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* === Features Section === */}
      <section id="features" className="relative z-10 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm text-white/60/80 tracking-wide">FEATURES</span>
            <h2 className="heading-lg mt-3">Everything you need</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="glass-card group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon size={24} className="text-white/60" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/50">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* === Philosophy Section === */}
      <section id="philosophy" className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-5xl font-thin text-white mb-3">三つの道</div>
            <div className="text-sm text-white/40">Mittsu no Michi · Three Paths</div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { kanji: '簡', title: 'Simplicity', subtitle: 'Kan', desc: 'Remove the unnecessary to focus on what truly matters in your digital connections.' },
              { kanji: '念', title: 'Mindfulness', subtitle: 'Nen', desc: 'Every interaction is intentional, every connection meaningful and purposeful.' },
              { kanji: '調', title: 'Harmony', subtitle: 'Chō', desc: 'Balance between digital presence and real-world experiences, creating perfect equilibrium.' }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="glass-card text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -4 }}
              >
                <div className="text-6xl font-thin text-white mb-4 group-hover:scale-110 transition-transform">
                  {item.kanji}
                </div>
                <h3 className="text-lg font-medium mb-1">{item.title}</h3>
                <div className="text-sm text-white/40 mb-4">{item.subtitle}</div>
                <div className="h-px w-12 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent mb-4" />
                <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* === Final CTA === */}
      <section className="relative z-10 py-24 border-t border-white/5">
        <motion.div
          className="max-w-3xl mx-auto px-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-4xl font-thin text-gradient mb-2">一期一会</div>
          <div className="text-sm text-white/40 mb-6">Ichi-go ichi-e · One time, one meeting</div>
          <p className="text-lg text-white/50 mb-8 leading-relaxed">
            Treasure every encounter in our mindful digital space.
          </p>
          <Link href="/login" className="btn btn-primary text-base py-3 px-8 inline-flex">
            Join the Journey
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* === Footer === */}
      <footer className="relative z-10 py-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/favicon.ico"
              alt="Logo"
              width={24}
              height={24}
              className="w-6 h-6 opacity-50"
            />
            <span className="text-sm text-white/30">© {new Date().getFullYear()} All rights reserved</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <span>侘</span>
            <span>·</span>
            <span>寂</span>
            <span className="ml-2">Wabi-Sabi</span>
          </div>
        </div>
      </footer>
    </div>
  );
}