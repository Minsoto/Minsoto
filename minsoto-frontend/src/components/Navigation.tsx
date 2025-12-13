'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Settings, LogOut, User, ChevronDown } from 'lucide-react';

export default function Navigation() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navLinks = [
    { href: '/dashboard', label: 'DASHBOARD' },
    { href: '/discover', label: 'DISCOVER' },
    { href: '/connections', label: 'CONNECTIONS' },
    { href: '/community', label: 'COMMUNITY' },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <nav className="border-b border-white border-opacity-20 px-6 py-4 bg-black sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-lg tracking-widest hover:opacity-80 transition-opacity">
            MINSOTO
          </Link>
          <span className="text-xs opacity-40 hidden sm:inline">atsu</span>
        </div>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-opacity ${isActive(link.href)
                  ? 'opacity-100 border-b border-white pb-1'
                  : 'opacity-50 hover:opacity-80'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {/* Profile Link */}
          <Link
            href={`/profile/${user?.username}`}
            className={`transition-opacity ${pathname?.includes('/profile/') ? 'opacity-100' : 'opacity-70 hover:opacity-100'
              }`}
          >
            <div className="w-8 h-8 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-colors flex items-center justify-center text-sm">
              {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || '?'}
            </div>
          </Link>

          {/* Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-black border border-white/20 shadow-xl z-50">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm text-white truncate">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-white/50 truncate">@{user?.username}</p>
                </div>

                <Link
                  href={`/profile/${user?.username}`}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <User size={16} />
                  Profile
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <Settings size={16} />
                  Settings
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors border-t border-white/10"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
