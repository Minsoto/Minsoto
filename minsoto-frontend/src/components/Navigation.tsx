'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Settings, LogOut, User, ChevronDown, Menu, X } from 'lucide-react';

export default function Navigation() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <nav className="border-b border-white/20 px-4 md:px-6 py-4 bg-black sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/dashboard" className="text-lg tracking-widest hover:opacity-80 transition-opacity">
            MINSOTO
          </Link>
        </div>

        {/* Desktop Nav Links */}
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

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 opacity-70 hover:opacity-100"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Profile Link */}
          <Link
            href={`/profile/${user?.username}`}
            className={`hidden md:flex transition-opacity ${pathname?.includes('/profile/') ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
          >
            <div className="w-8 h-8 border border-white/30 flex items-center justify-center text-sm">
              {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || '?'}
            </div>
          </Link>

          {/* Dropdown */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-black border border-white/20 z-50">
                <div className="px-4 py-3 border-b border-white/10">
                  <p className="text-sm truncate">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs opacity-50 truncate">@{user?.username}</p>
                </div>

                <Link
                  href={`/profile/${user?.username}`}
                  className="flex items-center gap-3 px-4 py-3 text-sm opacity-70 hover:opacity-100 hover:bg-white/5 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <User size={16} />
                  Profile
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-sm opacity-70 hover:opacity-100 hover:bg-white/5 transition-colors"
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/10">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm ${isActive(link.href) ? 'opacity-100' : 'opacity-50'}`}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-white/10 my-2" />
            <Link
              href={`/profile/${user?.username}`}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm opacity-50 flex items-center gap-2"
            >
              <User size={14} />
              Profile
            </Link>
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm opacity-50 flex items-center gap-2"
            >
              <Settings size={14} />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-400/70 text-left flex items-center gap-2"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
