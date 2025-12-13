'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import GoogleAuthButton from '@/components/GoogleAuthButton';

export default function LoginPage() {
  const [error, setError] = useState<string>('');
  const [currentKanji, setCurrentKanji] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Japanese kanji elements for background animation
  const kanjiElements = [
    { char: '始', meaning: 'Beginning', reading: 'hajimari' },
    { char: '門', meaning: 'Gate', reading: 'mon' },
    { char: '入', meaning: 'Enter', reading: 'hairu' },
    { char: '歓', meaning: 'Welcome', reading: 'kan' },
    { char: '新', meaning: 'New', reading: 'atarashii' }
  ];

  // Redirect based on authentication inside useEffect (fix jitter/refresh)
  useEffect(() => {
    if (_hasHydrated && isAuthenticated && user) {
      router.push(`/profile/${user.username}`);
    }
    // Dependencies forced to only run on auth or user change
  }, [isAuthenticated, user, router, _hasHydrated]);

  // Cycle through kanji elements every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKanji(prev => (prev + 1) % kanjiElements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [kanjiElements.length]);

  // Track mouse position relative to container for background effects
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

  // Show loading spinner if checking auth or already authenticated
  if (!_hasHydrated || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div
          className="w-16 h-16 border-2 border-white animate-spin"
          style={{ borderRadius: '50% 0 50% 0' }}
        />
      </div>
    );
  }

  // Called when Google OAuth completes successfully
  const handleAuthSuccess = () => {
    setError('');
  };

  // Called when auth fails, show error message
  const handleAuthError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background Animated Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Radial gradient softly following mouse */}
        <div
          className="absolute w-96 h-96 opacity-8 transition-all duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, white 0%, transparent 70%)',
            left: `${mousePosition.x - 192}px`,
            top: `${mousePosition.y - 192}px`,
            transform: 'translate(-50%, -50%)'
          }}
        />
        {/* Kanji Background */}
        <div className="absolute left-10 bottom-20 text-9xl font-thin opacity-8 transition-all duration-1000">
          {kanjiElements[currentKanji].char}
        </div>
        {/* Faint grid */}
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <defs>
            <pattern id="loginGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loginGrid)" />
        </svg>
        {/* Floating dots */}
        <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-white opacity-20 animate-pulse" />
        <div className="absolute bottom-1/3 left-1/5 w-1 h-1 bg-white opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/5 w-1 h-1 bg-white opacity-25 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      {/* Main Login Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full space-y-12">
          {/* Header */}
          <div className="text-center space-y-8">
            <div className="relative inline-block">
              <div className="text-7xl font-thin transition-all duration-1000 transform hover:scale-110">
                {kanjiElements[currentKanji].char}
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs opacity-50 whitespace-nowrap">
                {kanjiElements[currentKanji].reading} · {kanjiElements[currentKanji].meaning}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className="h-px bg-white w-12 opacity-20" />
                <span className="text-2xl font-light tracking-widest">MINSOTO</span>
                <div className="h-px bg-white w-12 opacity-20" />
              </div>
              <h1 className="text-3xl md:text-4xl font-thin tracking-wide">
                Welcome Back
              </h1>
              <p className="text-sm font-light opacity-60 max-w-md mx-auto leading-relaxed">
                Enter the space of mindful connection and purposeful growth
              </p>
            </div>
          </div>
          {/* Login Box */}
          <div className="relative">
            <div className="border border-white p-8 md:p-10">
              <div className="space-y-8">
                {/* Error Message */}
                {error && (
                  <div className="border border-red-400 bg-red-900 bg-opacity-20 text-red-300 px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">⚠</span>
                      {error}
                    </div>
                  </div>
                )}
                {/* Google Sign In */}
                <div className="text-center space-y-6">
                  <div className="space-y-3">
                    <p className="text-sm font-light tracking-wide opacity-70">
                      SIGN IN TO CONTINUE
                    </p>
                    <div className="h-px bg-white opacity-10 w-full" />
                  </div>
                  <div className="flex justify-center pt-4">
                    <GoogleAuthButton
                      onSuccess={handleAuthSuccess}
                      onError={handleAuthError}
                    />
                  </div>
                </div>
                {/* Zen Quote */}
                <div className="text-center pt-6 space-y-2 border-t border-white border-opacity-10">
                  <p className="text-lg font-thin">正念</p>
                  <p className="text-xs opacity-40">Mindfulness in each moment</p>
                </div>
              </div>
              {/* Decorative Corners */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white" />
            </div>
          </div>
          {/* Footer Philosophy */}
          <div className="text-center space-y-2 pt-4">
            <div className="flex items-center justify-center gap-4">
              <span className="text-xs opacity-30">静</span>
              <span className="text-xs opacity-30">·</span>
              <span className="text-xs opacity-30">寂</span>
            </div>
            <p className="text-xs opacity-20">Stillness · Solitude · Serenity</p>
          </div>
        </div>
      </div>
      {/* Add floating animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }          
      `}</style>
    </div>
  );
}
