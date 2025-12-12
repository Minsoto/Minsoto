'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function Navigation() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="border-b border-white border-opacity-20 px-6 py-4 bg-black">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-lg tracking-widest hover:opacity-80">
            MINSOTO
          </Link>
          <span className="text-xs opacity-40">atsu</span>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/discover" className="opacity-70 hover:opacity-100 transition-opacity">
            DISCOVER
          </Link>
          <Link href="/connections" className="opacity-70 hover:opacity-100 transition-opacity">
            CONNECTIONS
          </Link>
          <Link href="/community" className="opacity-70 hover:opacity-100 transition-opacity">
            COMMUNITY
          </Link>
          <Link href="/circles" className="opacity-70 hover:opacity-100 transition-opacity">
            CIRCLES
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href={`/profile/${user?.username}`}>
            <button className="w-8 h-8 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-colors" />
          </Link>
          <button className="opacity-70 hover:opacity-100 transition-opacity">🔔</button>
          <button
            onClick={handleLogout}
            className="opacity-70 hover:opacity-100 transition-opacity text-xs"
          >
            ⋯
          </button>
        </div>
      </div>
    </nav>
  );
}
