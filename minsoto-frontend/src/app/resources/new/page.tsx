'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Navigation from '@/components/Navigation';
import { Hash } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface NicheTag { niche: string; count: number; }

export default function NewResourceListPage() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    description: '',
    niche_tag: '',
    is_public: true,
    is_community: false,
  });
  const [customNiche, setCustomNiche] = useState('');
  const [existingNiches, setExistingNiches] = useState<NicheTag[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) router.push('/login');
  }, [_hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    api.get('/resources/niches/').then(res => setExistingNiches(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required.'); return; }

    const niche = customNiche.trim() || form.niche_tag;
    setSubmitting(true);
    try {
      const res = await api.post('/resources/lists/', {
        ...form,
        niche_tag: niche,
      });
      toast.success('List created!');
      router.push(`/resources/${res.data.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.title?.[0] || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <Navigation />
      <div className="h-16" />

      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-sm text-white/30 tracking-widest uppercase mb-8">New Resource List</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="text-xs text-white/40 block mb-2">Title <span className="text-red-400/60">*</span></label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder="e.g. Indie Hacker Toolkit"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/25 placeholder:text-white/20"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-white/40 block mb-2">Description</label>
            <textarea
              maxLength={500}
              placeholder="What is this list for? Who is it for?"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/25 placeholder:text-white/20 resize-none"
            />
          </div>

          {/* Niche */}
          <div>
            <label className="text-xs text-white/40 block mb-2 flex items-center gap-1.5">
              <Hash size={10} /> Niche tag
            </label>
            {existingNiches.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {existingNiches.slice(0, 12).map(n => (
                  <button
                    key={n.niche}
                    type="button"
                    onClick={() => {
                      setForm(p => ({ ...p, niche_tag: n.niche === form.niche_tag ? '' : n.niche }));
                      setCustomNiche('');
                    }}
                    className={`px-3 py-1 rounded-full text-xs transition-all ${
                      form.niche_tag === n.niche && !customNiche
                        ? 'bg-white/15 text-white/80'
                        : 'bg-white/5 text-white/35 hover:bg-white/10'
                    }`}
                  >
                    {n.niche}
                  </button>
                ))}
              </div>
            )}
            <input
              type="text"
              placeholder="Or type your own niche…"
              value={customNiche}
              maxLength={50}
              onChange={e => {
                setCustomNiche(e.target.value);
                if (e.target.value) setForm(p => ({ ...p, niche_tag: '' }));
              }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-white/25 placeholder:text-white/20"
            />
          </div>

          {/* Visibility toggles */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_public}
                onChange={e => setForm(p => ({ ...p, is_public: e.target.checked }))}
                className="accent-white/60"
              />
              <div>
                <p className="text-sm text-white/70">Make public</p>
                <p className="text-xs text-white/30">Others can view and save this list</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_community}
                disabled={!form.is_public}
                onChange={e => setForm(p => ({ ...p, is_community: e.target.checked }))}
                className="accent-white/60 disabled:opacity-30"
              />
              <div>
                <p className={`text-sm ${!form.is_public ? 'text-white/30' : 'text-white/70'}`}>
                  Add to community directory
                </p>
                <p className="text-xs text-white/30">Appears in /resources browse for everyone</p>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-white/25 hover:text-white/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !form.title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm text-white/80 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating…' : 'Create list'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
