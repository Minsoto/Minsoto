'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import Navigation from '@/components/Navigation';
import { useConnectionsStore } from '@/stores/connectionsStore';
import { handleApiError, showSuccess } from '@/lib/toast';
import {
  Settings, LogOut, User, Shield, Edit2, Check, X, Eye, EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

// Toggle row used in the Identity section
function ToggleRow({
  label, description, value, onToggle,
}: {
  label: string; description: string; value: boolean; onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-white/8 last:border-0">
      <div>
        <p className="text-sm text-white/70">{label}</p>
        <p className="text-xs text-white/35 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onToggle}
        className={`shrink-0 ml-4 w-10 h-5.5 rounded-full transition-all relative ${
          value ? 'bg-white/25' : 'bg-white/8'
        }`}
        aria-pressed={value}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

interface IdentitySettings {
  display_name: string;
  show_display_name: boolean;
  show_avatar: boolean;
  show_bio: boolean;
  show_organization: boolean;
  show_interests: boolean;
  show_connections_count: boolean;
  bio: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, logout, updateUser, _hasHydrated } = useAuthStore();

  // Username
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);

  // Identity / anonymity settings
  const [identity, setIdentity] = useState<IdentitySettings>({
    display_name: '',
    show_display_name: false,
    show_avatar: false,
    show_bio: false,
    show_organization: false,
    show_interests: false,
    show_connections_count: false,
    bio: '',
  });
  const [identityLoading, setIdentityLoading] = useState(false);
  const [identityDirty, setIdentityDirty] = useState(false);

  // Orgs
  const {
    myOrganizations, loadingOrganizations, fetchMyOrganizations,
    verifyOrganization, leaveOrganization,
  } = useConnectionsStore();
  const [joinOrgEmail, setJoinOrgEmail] = useState('');
  const [joiningOrg, setJoiningOrg] = useState(false);

  // Sign out
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    fetchMyOrganizations();
    // Load existing profile identity fields
    api.get(`/profile/${user?.username}/`).then(res => {
      const d = res.data;
      setIdentity({
        display_name: d.display_name || '',
        show_display_name: d.show_display_name ?? false,
        show_avatar: d.show_avatar ?? false,
        show_bio: d.show_bio ?? false,
        show_organization: d.show_organization ?? false,
        show_interests: d.show_interests ?? false,
        show_connections_count: d.show_connections_count ?? false,
        bio: d.bio || '',
      });
    }).catch(() => {});
  }, [_hasHydrated, isAuthenticated, router, fetchMyOrganizations, user?.username]);

  const updateIdentityField = <K extends keyof IdentitySettings>(key: K, val: IdentitySettings[K]) => {
    setIdentity(prev => ({ ...prev, [key]: val }));
    setIdentityDirty(true);
  };

  const saveIdentity = async () => {
    setIdentityLoading(true);
    try {
      await api.patch(`/profile/update/`, {
        display_name: identity.display_name,
        show_display_name: identity.show_display_name,
        show_avatar: identity.show_avatar,
        show_bio: identity.show_bio,
        show_organization: identity.show_organization,
        show_interests: identity.show_interests,
        show_connections_count: identity.show_connections_count,
        bio: identity.bio,
      });
      toast.success('Identity settings saved.');
      setIdentityDirty(false);
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setIdentityLoading(false);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername === user?.username) {
      setIsEditingUsername(false);
      return;
    }
    setUsernameLoading(true);
    setUsernameError('');
    try {
      await api.post('/user/username/change/', { username: newUsername });
      if (user) updateUser({ ...user, username: newUsername });
      setIsEditingUsername(false);
      setNewUsername('');
    } catch (error: any) {
      const data = error.response?.data;
      let msg = 'Failed to update username';
      if (data?.username) msg = Array.isArray(data.username) ? data.username[0] : data.username;
      else if (data?.error) msg = data.error;
      setUsernameError(msg);
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleSignOut = () => { logout(); router.push('/login'); };

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-white/20 rounded-full border-t-white/60" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-[var(--accent-primary)] selection:text-black">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-30 blur-[120px] bg-[var(--accent-primary)] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[150px] bg-[var(--accent-secondary)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CgkJPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJub25lIj48L3JlY3Q+CgkJPGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiPjwvY2lyY2xlPgoJPC9zdmc+')] opacity-30" />
      </div>

      <div className="relative z-10">
        <Navigation />
        <div className="h-16" />

        <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
          <div className="flex items-center gap-3 mb-10 glass-panel rounded-[2rem] p-8 md:p-10 shadow-lg shadow-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--accent-primary)]/10 to-transparent rounded-bl-full pointer-events-none" />
            <div className="relative z-10">
              <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <Settings size={28} className="text-white/60" /> Settings
              </h1>
              <p className="text-sm font-medium text-white/60 mt-2">Manage your account and preferences.</p>
            </div>
          </div>

          {/* ── ACCOUNT ─────────────────────────────────── */}
          <section className="glass-panel rounded-[2rem] p-8 shadow-xl shadow-white/5 relative overflow-hidden">
            <h2 className="text-xs font-bold text-white/40 tracking-widest uppercase mb-6 flex items-center gap-2">
              <User size={14} /> Account
            </h2>
            <div className="space-y-6">
              {/* Username */}
              <div className="border-b border-[var(--glass-border)] pb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white/50 uppercase tracking-wider">Username</span>
                  {isEditingUsername ? (
                    <div className="flex items-center gap-2">
                      <button onClick={handleUpdateUsername} disabled={usernameLoading} className="p-2 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-40 border border-[var(--glass-border)]">
                        <Check size={14} className="text-[var(--accent-primary)]" />
                      </button>
                      <button onClick={() => { setIsEditingUsername(false); setUsernameError(''); }} className="p-2 hover:bg-white/10 rounded-xl transition-colors border border-[var(--glass-border)]">
                        <X size={14} className="text-white/50" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setNewUsername(user?.username || ''); setIsEditingUsername(true); }}
                      className="text-xs font-bold text-white/40 hover:text-white flex items-center gap-1.5 transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-[var(--glass-border)]"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                  )}
                </div>
                {isEditingUsername ? (
                  <div>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      className="w-full bg-black/20 border border-[var(--glass-border)] rounded-xl px-4 py-3 text-base text-white outline-none focus:border-[var(--accent-primary)]/50 focus:bg-white/5 transition-all shadow-inner"
                      placeholder="New username"
                    />
                    <p className="text-xs font-medium text-white/40 mt-2">Can only be changed once every 30 days.</p>
                    {usernameError && <p className="text-xs font-bold text-red-400 mt-2">{usernameError}</p>}
                  </div>
                ) : (
                  <span className="text-lg font-bold text-white">@{user?.username}</span>
                )}
              </div>
              {/* Email */}
              <div className="flex items-center justify-between pb-2">
                <span className="text-sm font-bold text-white/50 uppercase tracking-wider">Email</span>
                <span className="text-base font-medium text-white/80">{user?.email}</span>
              </div>
            </div>
          </section>

          {/* ── IDENTITY / ANONYMITY ─────────────────────── */}
          <section className="glass-panel rounded-[2rem] p-8 shadow-xl shadow-white/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-white/40 tracking-widest uppercase flex items-center gap-2">
                <Eye size={14} /> Public Identity
              </h2>
              <span className="text-xs font-bold px-3 py-1 bg-white/5 border border-[var(--glass-border)] rounded-full text-white/40 uppercase tracking-wider">anonymous by default</span>
            </div>
            <p className="text-sm font-medium text-white/50 mb-8 leading-relaxed">
              Your public page shows only <strong className="text-white">@{user?.username}</strong> by default.
              Opt in below to reveal more.
            </p>

            {/* Display name input */}
            <div className="mb-6 pb-6 border-b border-[var(--glass-border)]">
              <label className="text-xs font-bold text-white/50 block mb-3 uppercase tracking-wider">Display name (optional)</label>
              <input
                type="text"
                maxLength={80}
                value={identity.display_name}
                onChange={e => updateIdentityField('display_name', e.target.value)}
                placeholder="e.g. Jordan"
                className="w-full bg-black/20 border border-[var(--glass-border)] rounded-xl px-4 py-3 text-base text-white outline-none focus:border-[var(--accent-primary)]/50 focus:bg-white/5 transition-all shadow-inner placeholder:text-white/20"
              />
              <p className="text-xs font-medium text-white/40 mt-2">
                Separate from your Google account name. Only shown if "Show display name" is on.
              </p>
            </div>

            {/* Bio */}
            <div className="mb-6 pb-6 border-b border-[var(--glass-border)]">
              <label className="text-xs font-bold text-white/50 block mb-3 uppercase tracking-wider">Bio (optional)</label>
              <textarea
                maxLength={500}
                value={identity.bio}
                onChange={e => updateIdentityField('bio', e.target.value)}
                placeholder="A sentence or two..."
                rows={3}
                className="w-full bg-black/20 border border-[var(--glass-border)] rounded-xl px-4 py-3 text-base text-white outline-none focus:border-[var(--accent-primary)]/50 focus:bg-white/5 transition-all shadow-inner placeholder:text-white/20 resize-none"
              />
            </div>

            {/* Toggle rows */}
          <ToggleRow
            label="Show display name"
            description="Shows your chosen display name on your public page"
            value={identity.show_display_name}
            onToggle={() => updateIdentityField('show_display_name', !identity.show_display_name)}
          />
          <ToggleRow
            label="Show avatar initial"
            description="Shows a colored avatar circle with your initial"
            value={identity.show_avatar}
            onToggle={() => updateIdentityField('show_avatar', !identity.show_avatar)}
          />
          <ToggleRow
            label="Show bio"
            description="Shows your bio below your handle"
            value={identity.show_bio}
            onToggle={() => updateIdentityField('show_bio', !identity.show_bio)}
          />
          <ToggleRow
            label="Show organization"
            description="Shows your verified organization badge"
            value={identity.show_organization}
            onToggle={() => updateIdentityField('show_organization', !identity.show_organization)}
          />
          <ToggleRow
            label="Show interests"
            description="Shows your interest tags"
            value={identity.show_interests}
            onToggle={() => updateIdentityField('show_interests', !identity.show_interests)}
          />
          <ToggleRow
            label="Show connection count"
            description="Shows how many people you are connected with"
            value={identity.show_connections_count}
            onToggle={() => updateIdentityField('show_connections_count', !identity.show_connections_count)}
          />

            <div className="mt-8 pt-6 border-t border-[var(--glass-border)]">
              <button
                onClick={saveIdentity}
                disabled={!identityDirty || identityLoading}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-white text-black font-bold text-sm shadow-xl shadow-black/5 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {identityLoading ? 'Saving…' : 'Save identity settings'}
              </button>
            </div>
          </section>

          {/* ── ORGANIZATIONS ───────────────────────────── */}
          <section className="glass-panel rounded-[2rem] p-8 shadow-xl shadow-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CgkJPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSJub25lIj48L3JlY3Q+CgkJPGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMCwgMCwgMCwgMC4wNSkiPjwvY2lyY2xlPgoJPC9zdmc+')] opacity-20 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-[var(--glass-border)] flex items-center justify-center mb-4">
                <Shield size={24} className="text-[var(--accent-primary)] opacity-50" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-2">Organizations</h2>
              <p className="text-sm font-medium text-white/50 max-w-sm">
                Join verified organizations, universities, and teams to discover members and share exclusive resources.
              </p>
              <div className="mt-6 px-4 py-1.5 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider">
                Coming Soon
              </div>
            </div>
          </section>

          {/* ── SIGN OUT ─────────────────────────────────── */}
          <section className="glass-panel rounded-[2rem] border border-red-500/30 p-8 shadow-xl shadow-red-500/5 relative overflow-hidden bg-red-950/20">
            <h2 className="text-xs font-bold text-red-400/80 tracking-widest uppercase mb-6 flex items-center gap-2">
              <LogOut size={14} /> Danger Zone
            </h2>
            {!showSignOutConfirm ? (
              <button
                onClick={() => setShowSignOutConfirm(true)}
                className="px-6 py-3 text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 hover:text-red-300 transition-all shadow-inner"
              >
                Sign out of Minsoto
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-4 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                <span className="text-sm font-bold text-red-300 uppercase tracking-wider">Are you sure?</span>
                <button onClick={handleSignOut} className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-xl transition-all shadow-lg hover:scale-105 active:scale-95">
                  Yes, sign out
                </button>
                <button onClick={() => setShowSignOutConfirm(false)} className="px-5 py-2.5 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-colors border border-transparent">
                  Cancel
                </button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
