'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Compass,
  PenLine,
  BookMarked,
  LayoutGrid,
} from 'lucide-react';
import GlobalModals from '@/components/GlobalModals';

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
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/write', label: 'Write', icon: PenLine },
    { href: '/resources', label: 'Resources', icon: BookMarked },
    { href: '/discover', label: 'Discover', icon: Compass },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  // Avatar initial: only use username (anonymity-first — no real name in nav)
  const avatarInitial = user?.username?.[0]?.toUpperCase() || '?';

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 px-4 md:px-6">
      <div className="flex items-center justify-between h-16 max-w-7xl mx-auto">

        {/* Logo → links to user's own journal page */}
        <Link
          href={user ? `/${user.username}` : '/'}
          className="flex items-center gap-2 group"
        >
          <span className="text-lg font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors">
            minsoto
          </span>
        </Link>

        {/* Desktop Nav — centered */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                <span>{link.label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: avatar + dropdown */}
        <div className="flex items-center gap-2">
          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Avatar — shows @handle only, no real name */}
          <Link
            href={user ? `/${user.username}` : '/login'}
            className={`hidden md:flex items-center gap-2 p-1.5 rounded-lg transition-all ${
              pathname?.includes(`/${user?.username}`) ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f45b69]/80 to-[#f13030]/80 flex items-center justify-center text-sm font-semibold text-white">
              {avatarInitial}
            </div>
          </Link>

          {/* Dropdown */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Account menu"
            >
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 glass-panel rounded-xl overflow-hidden shadow-lg"
                >
                  {/* Identity — @handle only */}
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white/90 truncate">
                      @{user?.username}
                    </p>
                  </div>

                  <div className="p-1">
                    <Link
                      href={user ? `/${user.username}` : '/login'}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <span className="text-xs opacity-60">●</span>
                      My Page
                    </Link>
                    <Link
                      href="/board"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <LayoutGrid size={14} />
                      My Board
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings size={14} />
                      Settings
                    </Link>
                  </div>

                  <div className="p-1 border-t border-white/10">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-white/10 overflow-hidden"
          >
            <div className="py-4 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors ${
                      isActive(link.href)
                        ? 'text-white bg-white/10'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}

              <div className="h-px bg-white/10 my-3" />

              <Link
                href={user ? `/${user.username}` : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <span className="text-xs opacity-60">●</span>
                @{user?.username}
              </Link>

              <Link
                href="/board"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <LayoutGrid size={18} />
                My Board
              </Link>

              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Settings size={18} />
                Settings
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <GlobalModals />
    </nav>
  );
}
