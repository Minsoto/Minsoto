"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

const Link = ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
  <a href={href} className={className}>
    {children}
  </a>
);

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [currentKanji, setCurrentKanji] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Japanese elements for rotation - focused on community and harmony
  const kanjiElements = [
    { char: '和', meaning: 'Harmony', reading: 'wa' },
    { char: '集', meaning: 'Gather', reading: 'atsu' },
    { char: '繋', meaning: 'Connect', reading: 'tsuna' },
    { char: '静', meaning: 'Tranquil', reading: 'sei' },
    { char: '美', meaning: 'Beauty', reading: 'bi' }
  ];

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const handleScroll = () => setScrollY(window.scrollY);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Kanji rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKanji((prev) => (prev + 1) % kanjiElements.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [kanjiElements.length]);

  const { isAuthenticated, user } = useAuthStore();
const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.is_setup_complete) {
        router.push("/setup-username");
      } else {
        router.push(`/profile/${user.username}`);
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-white overflow-x-hidden relative"
    >
      {/* === Japanese Minimalist Background === */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Subtle moving gradient that follows mouse */}
        <div 
          className="absolute w-96 h-96 opacity-8 transition-all duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, white 0%, transparent 70%)',
            left: `${mousePosition.x - 192}px`,
            top: `${mousePosition.y - 192}px`,
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Large Kanji Background */}
        <div 
          className="absolute text-[20rem] font-thin opacity-5 transition-all duration-1000 select-none"
          style={{
            right: '10%',
            top: `${20 + scrollY * 0.1}%`,
            transform: `translateY(${scrollY * 0.2}px)`
          }}
        >
          {kanjiElements[currentKanji].char}
        </div>
        
        {/* Secondary smaller kanji */}
        <div 
          className="absolute text-6xl font-thin opacity-10 transition-all duration-1000 select-none"
          style={{
            left: '5%',
            bottom: `${30 - scrollY * 0.05}%`,
            transform: `translateY(${-scrollY * 0.1}px)`
          }}
        >
          {kanjiElements[(currentKanji + 2) % kanjiElements.length].char}
        </div>
        
        {/* Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-3">
          <defs>
            <pattern id="landingGrid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#landingGrid)" />
        </svg>

        {/* Floating minimal elements */}
        <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-white opacity-20 animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-white opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-2/3 right-1/5 w-1 h-1 bg-white opacity-25 animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* === Navbar === */}
      <nav className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-thin tracking-widest">MINSOTO</div>
            <div className="h-4 w-px bg-white opacity-20" />
            <div className="text-sm font-thin opacity-60">{kanjiElements[currentKanji].reading}</div>
          </div>
          <div className="flex items-center space-x-8">
            <Link href="#features" className="text-sm font-light tracking-wide opacity-70 hover:opacity-100 transition-opacity hidden md:block">
              FEATURES
            </Link>
            <Link href="#philosophy" className="text-sm font-light tracking-wide opacity-70 hover:opacity-100 transition-opacity hidden md:block">
              PHILOSOPHY
            </Link>
            <Link
              href="/login"
              className="group relative px-6 py-2 overflow-hidden transition-all duration-500"
            >
              <span className="relative z-10 text-sm font-light tracking-widest group-hover:text-black transition-colors duration-500">ENTER</span>
              <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              <div className="absolute inset-0 border border-white opacity-40 group-hover:opacity-0 transition-opacity duration-500" />
            </Link>
          </div>
        </div>
      </nav>

      {/* === Hero Section === */}
      <section className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-12">
            {/* Kanji Display */}
            <div className="relative">
              <div className="text-8xl font-thin transition-all duration-1000 mb-4">
                {kanjiElements[currentKanji].char}
              </div>
              <div className="text-sm opacity-60">
                {kanjiElements[currentKanji].reading} · {kanjiElements[currentKanji].meaning}
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="h-px bg-white w-12 opacity-20" />
                <span className="text-sm font-light tracking-widest opacity-60">THE MINDFUL NETWORK</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-thin leading-tight tracking-wide">
                <span className="block mb-2">Community,</span>
                <span className="block opacity-80">Without the Chaos</span>
              </h1>
              
              <p className="text-lg font-light opacity-70 leading-relaxed max-w-lg">
                Where focus meets growth through purposeful connection. 
                Experience the harmony of minimalist social interaction, 
                inspired by Japanese principles of mindful simplicity.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="group relative px-10 py-4 overflow-hidden transition-all duration-500"
              >
                <span className="relative z-10 text-sm font-light tracking-widest group-hover:text-black transition-colors duration-500">BEGIN JOURNEY</span>
                <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <div className="absolute inset-0 border border-white opacity-60 group-hover:opacity-0 transition-opacity duration-500" />
                {/* Corner accents */}
                <div className="absolute top-0 right-0 w-0 h-0 border-t-4 border-r-4 border-t-transparent border-r-white opacity-40 group-hover:border-r-black transition-colors duration-500" />
              </Link>
              
              <Link
                href="#philosophy"
                className="group relative px-10 py-4 transition-all duration-500"
              >
                <span className="relative z-10 text-sm font-light tracking-widest opacity-70 group-hover:opacity-100 transition-opacity duration-500">LEARN MORE</span>
                <div className="absolute inset-0 border border-white opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              </Link>
            </div>
          </div>

          {/* Right Column - Abstract Zen Element */}
          <div className="relative flex items-center justify-center">
            <div className="relative group">
              {/* Large rotating kanji */}
              <div className="text-[12rem] font-thin opacity-10 group-hover:opacity-20 transition-all duration-1000 select-none">
                {kanjiElements[(currentKanji + 1) % kanjiElements.length].char}
              </div>
              
              {/* Floating elements around the kanji */}
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white opacity-20 rounded-full animate-pulse" />
              <div className="absolute bottom-1/3 right-1/4 w-1 h-1 bg-white opacity-30 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-2/3 left-1/3 w-1.5 h-1.5 bg-white opacity-25 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
              
              {/* Geometric accents */}
              <div className="absolute top-0 right-0 w-16 h-16 border-t border-r border-white opacity-10 group-hover:opacity-30 transition-opacity duration-1000" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-b border-l border-white opacity-10 group-hover:opacity-30 transition-opacity duration-1000" />
            </div>
          </div>
        </div>
      </section>

      {/* === Philosophy Section === */}
      <section id="philosophy" className="relative z-10 py-24 border-t border-white border-opacity-10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-4xl font-thin mb-4">三つの道</div>
            <div className="text-sm opacity-60 mb-8">Mittsu no Michi · Three Paths</div>
            <div className="h-px bg-white opacity-10 w-24 mx-auto" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { kanji: '簡', title: 'Simplicity', subtitle: 'Kan', desc: 'Remove the unnecessary to focus on what truly matters in your digital connections.' },
              { kanji: '念', title: 'Mindfulness', subtitle: 'Nen', desc: 'Every interaction is intentional, every connection meaningful and purposeful.' },
              { kanji: '調', title: 'Harmony', subtitle: 'Chō', desc: 'Balance between digital presence and real-world experiences, creating perfect equilibrium.' }
            ].map((item, i) => (
              <div key={i} className="group text-center space-y-6 p-8 border border-white border-opacity-10 hover:border-opacity-30 transition-all duration-500">
                <div className="text-6xl font-thin group-hover:scale-110 transition-transform duration-500">
                  {item.kanji}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-light tracking-wide">{item.title}</h3>
                  <div className="text-sm opacity-60">{item.subtitle}</div>
                </div>
                <div className="h-px bg-white opacity-10 w-12 mx-auto group-hover:w-16 transition-all duration-500" />
                <p className="text-sm font-light opacity-60 leading-relaxed">
                  {item.desc}
                </p>
                
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-0 h-0 border-t-6 border-r-6 border-t-transparent border-r-white opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Final CTA Section === */}
      <section className="relative z-10 py-24 border-t border-white border-opacity-10">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-8">
          <div className="text-3xl font-thin">一期一会</div>
          <div className="text-sm opacity-60">Ichi-go ichi-e</div>
          <p className="text-lg font-light opacity-70 leading-relaxed">
            One time, one meeting. Treasure every encounter in our mindful digital space.
          </p>
          
          <div className="pt-8">
            <Link
              href="/login"
              className="group relative px-12 py-4 overflow-hidden transition-all duration-500 inline-block"
            >
              <span className="relative z-10 text-sm font-light tracking-widest group-hover:text-black transition-colors duration-500">JOIN THE JOURNEY</span>
              <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              <div className="absolute inset-0 border border-white opacity-40 group-hover:opacity-0 transition-opacity duration-500" />
            </Link>
          </div>
        </div>
      </section>

      {/* === Footer === */}
      <footer className="relative z-10 py-12 text-center border-t border-white border-opacity-10">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-6">
            <span className="text-xs opacity-30">侘</span>
            <span className="text-xs opacity-30">·</span>
            <span className="text-xs opacity-30">寂</span>
          </div>
          <p className="text-xs opacity-20">Wabi-Sabi · Finding beauty in imperfection</p>
          <p className="text-xs opacity-40">
            © {new Date().getFullYear()} Minsoto. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}