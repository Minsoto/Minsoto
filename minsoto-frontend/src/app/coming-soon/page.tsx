'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export default function ComingSoonPage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [currentKanji, setCurrentKanji] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Japanese elements for rotation
  const kanjiElements = [
    { char: '心', meaning: 'Mind', reading: 'kokoro' },
    { char: '静', meaning: 'Quiet', reading: 'shizu' },
    { char: '和', meaning: 'Harmony', reading: 'wa' },
    { char: '禅', meaning: 'Zen', reading: 'zen' },
    { char: '道', meaning: 'Path', reading: 'michi' }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!user?.is_setup_complete) {
      router.push('/setup-username');
      return;
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKanji((prev) => (prev + 1) % kanjiElements.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [kanjiElements.length]);

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

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSignOut = () => {
    logout();
  };

  const createRipple = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ripple: Ripple = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setRipples((prev) => [...prev, ripple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
    }, 1000);
  };

  if (!isAuthenticated || !user?.is_setup_complete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div
          className="w-16 h-16 border-2 border-white animate-spin"
          style={{ borderRadius: '50% 0 50% 0' }}
        />
      </div>
    );
  }

  const features = [
    { icon: '人', title: 'Personal Connections', desc: 'Meaningful two-tier relationships' },
    { icon: '界', title: 'Smart Feeds', desc: 'Global & interest-based discovery' },
    { icon: '美', title: 'Dynamic Profiles', desc: 'Customizable widgets & themes' },
    { icon: '共', title: 'Collaboration Circles', desc: 'Work together on shared goals' },
    { icon: '工', title: 'Extension Store', desc: 'Community-built tools' },
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Ink Wash Background Effect */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Subtle moving gradient that follows mouse */}
        <div 
          className="absolute w-96 h-96 opacity-10 transition-all duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, white 0%, transparent 70%)',
            left: `${mousePosition.x - 192}px`,
            top: `${mousePosition.y - 192}px`,
            transform: 'translate(-50%, -50%)'
          }}
        />
        
        {/* Animated Kanji Background */}
        <div className="absolute right-10 top-20 text-9xl font-thin opacity-10 transition-all duration-1000">
          {kanjiElements[currentKanji].char}
        </div>
        
        {/* Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-5xl w-full space-y-16">
          
          {/* Hero Section */}
          <div className="text-center space-y-8">
            {/* Animated Kanji Display */}
            <div className="relative inline-block mb-8">
              <div className="text-8xl font-thin transition-all duration-1000 transform hover:scale-110">
                {kanjiElements[currentKanji].char}
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-sm opacity-60 whitespace-nowrap">
                {kanjiElements[currentKanji].reading} · {kanjiElements[currentKanji].meaning}
              </div>
            </div>
            
            {/* Welcome Text */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-thin tracking-wider">
                Welcome, {user?.first_name}
              </h1>
              
              <div className="flex items-center justify-center gap-4">
                <div className="h-px bg-white w-16 opacity-20" />
                <span className="text-xl font-light tracking-widest">MINSOTO</span>
                <div className="h-px bg-white w-16 opacity-20" />
              </div>
              
              <p className="text-lg font-light opacity-70 max-w-2xl mx-auto leading-relaxed mt-6">
                A mindful social network inspired by Japanese minimalism and the Soto philosophy of quiet intention.
                Where focus meets growth through purposeful connection.
              </p>
            </div>
          </div>

          {/* Interactive Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-1">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative border border-white p-6 hover:bg-white hover:text-black transition-all duration-500 cursor-pointer overflow-hidden"
                onClick={createRipple}
              >
                {/* Ripple Effects */}
                {ripples.map(ripple => (
                  <div
                    key={ripple.id}
                    className="absolute pointer-events-none animate-ripple"
                    style={{
                      left: ripple.x,
                      top: ripple.y,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div className="w-20 h-20 border border-current rounded-full" />
                  </div>
                ))}
                
                <div className="relative z-10 text-center space-y-3">
                  <div className="text-4xl font-thin mb-2 group-hover:transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-medium tracking-wider">
                    {feature.title}
                  </h3>
                  <p className="text-xs opacity-60 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
                
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-0 h-0 border-t-8 border-r-8 border-t-transparent border-r-white group-hover:border-r-black transition-colors duration-500" />
              </div>
            ))}
          </div>

          {/* Status Section */}
          <div className="relative">
            <div className="border border-white p-8 md:p-12">
              <div className="max-w-2xl mx-auto text-center space-y-6">
                {/* Status Indicator */}
                <div className="inline-flex items-center gap-3">
                  <div className="relative">
                    <div className="w-2 h-2 bg-white rounded-full" />
                    <div className="absolute inset-0 w-2 h-2 bg-white rounded-full animate-ping" />
                  </div>
                  <span className="text-sm tracking-widest font-light">LAUNCHING SOON</span>
                </div>
                
                {/* Japanese Quote */}
                <div className="py-6 space-y-2">
                  <p className="text-2xl font-thin">一期一会</p>
                  <p className="text-sm opacity-60">Ichi-go ichi-e</p>
                  <p className="text-xs opacity-40 italic">One time, one meeting - treasure every encounter</p>
                </div>
                
                {/* Notification Status */}
                <div className="pt-4">
                  <p className="text-sm opacity-70">
                    You are on the early access list. We will notify you when Minsoto launches.
                  </p>
                </div>
              </div>
              
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white" />
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="text-center">
            <button
              onClick={handleSignOut}
              className="group relative px-12 py-3 border border-white overflow-hidden transition-all duration-500 hover:text-black"
            >
              <span className="relative z-10 text-sm tracking-widest font-light">SIGN OUT</span>
              <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            </button>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2 pt-8">
            <div className="flex items-center justify-center gap-4">
              <span className="text-xs opacity-40">侘</span>
              <span className="text-xs opacity-40">·</span>
              <span className="text-xs opacity-40">寂</span>
            </div>
            <p className="text-xs opacity-30">Wabi-Sabi · Finding beauty in imperfection</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ripple {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }

        .animate-ripple {
          animation: ripple 1s ease-out;
        }
      `}</style>
    </div>
  );
}