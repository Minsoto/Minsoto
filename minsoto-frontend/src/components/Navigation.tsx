'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  Users,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  Bell
} from 'lucide-react';

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
    { href: '/discover', label: 'Discover', icon: Compass },
    { href: '/connections', label: 'Connections', icon: Users },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <nav className="glass-nav fixed top-0 left-0 right-0 z-50 px-4 md:px-6">
      <div className="flex items-center justify-between h-16 max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 group"
        >
          <div className="relative w-8 h-8 transition-transform group-hover:scale-105">
            <Image
              src="/favicon.ico"
              alt="Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
        </Link>

        {/* Desktop Nav Links - Centered */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${active
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
              >
                <Icon size={18} />
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

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Notifications */}
          <button className="hidden md:flex p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          </button>

          {/* Profile Avatar */}
          <Link
            href={`/profile/${user?.username}`}
            className={`hidden md:flex items-center gap-2 p-1.5 rounded-lg transition-all ${pathname?.includes('/profile/')
                ? 'bg-white/10'
                : 'hover:bg-white/5'
              }`}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-sm font-medium text-white">
              {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || '?'}
            </div>
          </Link>

          {/* Dropdown Trigger */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
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
                  className="absolute right-0 top-full mt-2 w-56 glass-panel rounded-xl overflow-hidden shadow-lg"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-white/10">
                    <p className="text-sm font-medium truncate">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-white/50 truncate">@{user?.username}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1">
                    <Link
                      href={`/profile/${user?.username}`}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User size={16} />
                      Your Profile
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings size={16} />
                      Settings
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="p-1 border-t border-white/10">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut size={16} />
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
                    className={`flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-colors ${isActive(link.href)
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
                href={`/profile/${user?.username}`}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <User size={18} />
                Profile
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
    </nav>
  );
}
