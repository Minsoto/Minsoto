'use client';
import type { AxiosError } from 'axios';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';

export default function SetupUsernamePage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentKanji, setCurrentKanji] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { user, updateUser, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Japanese elements for rotation - focused on identity/name
  const kanjiElements = [
    { char: '名', meaning: 'Name', reading: 'na' },
    { char: '身', meaning: 'Identity', reading: 'mi' },
    { char: '個', meaning: 'Individual', reading: 'ko' },
    { char: '選', meaning: 'Choose', reading: 'sen' },
    { char: '創', meaning: 'Create', reading: 'sō' }
  ];

  // Handle redirects in useEffect
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.is_setup_complete) {
      router.push('/coming-soon');
      return;
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKanji((prev) => (prev + 1) % kanjiElements.length);
    }, 3500);

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

  // Don't render if not authenticated or setup is complete
  if (!isAuthenticated || user?.is_setup_complete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div
          className="w-16 h-16 border-2 border-white animate-spin"
          style={{ borderRadius: '50% 0 50% 0' }}
        />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  }
  
try {
  const response = await api.post('/auth/setup-username/', { username });
  updateUser(response.data.user);
  // The useEffect will handle the redirect
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


  return (
    <div ref={containerRef} className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background Effects */}
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
        
        {/* Animated Kanji Background */}
        <div className="absolute right-10 top-20 text-9xl font-thin opacity-8 transition-all duration-1000">
          {kanjiElements[currentKanji].char}
        </div>
        
        {/* Secondary kanji */}
        <div className="absolute left-10 bottom-20 text-6xl font-thin opacity-10 transition-all duration-1000">
          {kanjiElements[(currentKanji + 2) % kanjiElements.length].char}
        </div>
        
        {/* Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-5">
          <defs>
            <pattern id="setupGrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" opacity="0.15"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#setupGrid)" />
        </svg>

        {/* Floating Elements */}
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-white opacity-20 animate-pulse" />
        <div className="absolute bottom-1/4 left-1/5 w-1 h-1 bg-white opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-white opacity-25 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full space-y-12">
          
          {/* Header Section */}
          <div className="text-center space-y-8">
            {/* Animated Kanji Display */}
            <div className="relative inline-block">
              <div className="text-7xl font-thin transition-all duration-1000 transform hover:scale-110">
                {kanjiElements[currentKanji].char}
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs opacity-50 whitespace-nowrap">
                {kanjiElements[currentKanji].reading} · {kanjiElements[currentKanji].meaning}
              </div>
            </div>
            
            {/* Welcome Text */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <div className="h-px bg-white w-12 opacity-20" />
                <span className="text-2xl font-light tracking-widest">MINSOTO</span>
                <div className="h-px bg-white w-12 opacity-20" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-thin tracking-wide">
                Choose Your Identity
              </h1>
              
              <p className="text-sm font-light opacity-60 max-w-md mx-auto leading-relaxed">
                Create your unique presence in the mindful digital space
              </p>
            </div>
          </div>

          {/* Setup Form Section */}
          <div className="relative">
            <div className="border border-white p-8 md:p-10">
              <form className="space-y-8" onSubmit={handleSubmit}>
                
                {/* Error Display */}
                {error && (
                  <div className="border border-red-400 bg-red-900 bg-opacity-20 text-red-300 px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400">⚠</span>
                      {error}
                    </div>
                  </div>
                )}
                
                {/* Username Input Section */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-sm font-light tracking-wide opacity-70">
                      YOUR USERNAME
                    </p>
                    <div className="h-px bg-white opacity-10 w-full" />
                  </div>
                  
                  {/* Custom Input */}
                  <div className="relative">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="w-full bg-transparent border-b border-white border-opacity-30 py-3 px-0 text-lg font-light tracking-wide placeholder-white placeholder-opacity-40 focus:outline-none focus:border-opacity-100 transition-all duration-300 text-white"
                      placeholder="enter your chosen name"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={30}
                    />
                    {/* Character count */}
                    <div className="absolute -bottom-6 right-0 text-xs opacity-40">
                      {username.length}/30
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={loading || !username.trim()}
                    className="group relative w-full px-8 py-4 overflow-hidden transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="relative z-10 text-sm font-light tracking-widest group-hover:text-black group-disabled:group-hover:text-white transition-colors duration-500">
                      {loading ? 'CREATING IDENTITY...' : 'CONTINUE JOURNEY'}
                    </span>
                    <div className="absolute inset-0 bg-white transform -translate-x-full group-hover:translate-x-0 group-disabled:group-hover:-translate-x-full transition-transform duration-500" />
                    <div className="absolute inset-0 border border-white opacity-40 group-hover:opacity-0 group-disabled:opacity-20 transition-opacity duration-500" />
                    
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border border-current border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Zen Quote */}
                <div className="text-center pt-6 space-y-2 border-t border-white border-opacity-10">
                  <p className="text-lg font-thin">自分</p>
                  <p className="text-xs opacity-40">Jibun · Be yourself</p>
                </div>
              </form>
              
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white" />
            </div>
          </div>

          {/* Footer Philosophy */}
          <div className="text-center space-y-2 pt-4">
            <div className="flex items-center justify-center gap-4">
              <span className="text-xs opacity-30">独</span>
              <span className="text-xs opacity-30">·</span>
              <span className="text-xs opacity-30">特</span>
            </div>
            <p className="text-xs opacity-20">Doku-toku · Unique · Special</p>
          </div>
        </div>
      </div>

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
