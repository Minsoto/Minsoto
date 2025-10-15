'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function ComingSoonPage() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!user?.is_setup_complete) {
      router.push('/setup-username');
      return;
    }

    // Redirect to profile after 2 seconds
    const timer = setTimeout(() => {
      router.push(`/profile/${user.username}`);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router]);

  const handleSignOut = () => {
    logout();
  };

  const goToProfile = () => {
    if (user?.username) {
      router.push(`/profile/${user.username}`);
    }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
      <div className="max-w-2xl w-full px-6 py-12 bg-black border border-white">
        {/* Decorative corners */}
        <div className="relative">
          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white" />
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white" />

          <div className="text-center p-8">
            <h1 className="text-4xl font-thin mb-4 tracking-wider">
              Welcome to Minsoto, {user?.first_name}!
            </h1>
            
            <div className="text-6xl mb-6">🚀</div>
            
            <h2 className="text-2xl font-thin mb-6 opacity-70">
              Your Profile is Ready
            </h2>
            
            <p className="text-lg opacity-60 mb-8 leading-relaxed">
              Redirecting you to your profile page...
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={goToProfile}
                className="px-8 py-3 border border-white text-sm tracking-widest hover:bg-white hover:text-black transition-colors"
              >
                GO TO PROFILE NOW
              </button>
              
              <button
                onClick={handleSignOut}
                className="px-6 py-3 border border-gray-600 text-gray-400 text-sm tracking-widest hover:border-white hover:text-white transition-colors"
              >
                SIGN OUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
