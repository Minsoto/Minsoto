'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink, Bookmark, BookmarkCheck, GitFork, ArrowLeft,
  Plus, Hash, Check, X, Trash2, GripVertical, ThumbsUp,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  resource_type: string;
  is_free: boolean;
  position: number;
  upvote_count: number;
  added_by_username: string;
}

interface ResourceList {
  id: string;
  title: string;
  description: string;
  niche_tag: string;
  creator_username: string;
  save_count: number;
  resource_count: number;
  is_saved: boolean;
  is_community: boolean;
  forked_from: string | null;
  forked_from_title: string | null;
  resources: Resource[];
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  tool: 'Tool', reference: 'Ref', community: 'Community',
  tutorial: 'Tutorial', other: 'Other',
};

export default function ResourceListPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [list, setList] = useState<ResourceList | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Add resource form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '', url: '', description: '', resource_type: 'tool', is_free: true,
  });
  const [adding, setAdding] = useState(false);

  // Upvoted set for this session
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!id) return;
    api.get(`/resources/lists/${id}/`)
      .then(res => { setList(res.data); setLoading(false); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  const isOwner = isAuthenticated && list?.creator_username === user?.username;

  const handleSave = async () => {
    if (!isAuthenticated) { toast.error('Sign in to save.'); return; }
    if (!list) return;
    try {
      if (list.is_saved) {
        await api.delete(`/resources/lists/${id}/unsave/`);
        setList(l => l ? { ...l, is_saved: false, save_count: l.save_count - 1 } : l);
        toast.success('Removed from saved.');
      } else {
        await api.post(`/resources/lists/${id}/save/`);
        setList(l => l ? { ...l, is_saved: true, save_count: l.save_count + 1 } : l);
        toast.success('Saved!');
      }
    } catch { toast.error('Something went wrong.'); }
  };

  const handleFork = async () => {
    if (!isAuthenticated) { toast.error('Sign in to fork.'); return; }
    try {
      const res = await api.post(`/resources/lists/${id}/fork/`);
      toast.success('Forked! Check your dashboard.');
      router.push(`/resources/${res.data.id}`);
    } catch { toast.error('Could not fork.'); }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResource.title.trim() || !newResource.url.trim()) return;
    setAdding(true);
    try {
      const res = await api.post(`/resources/lists/${id}/items/`, newResource);
      setList(l => l ? { ...l, resources: [...l.resources, res.data], resource_count: l.resource_count + 1 } : l);
      setNewResource({ title: '', url: '', description: '', resource_type: 'tool', is_free: true });
      setShowAddForm(false);
      toast.success('Resource added.');
    } catch (err: any) {
      toast.error(err?.response?.data?.url?.[0] || 'Failed to add resource.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await api.delete(`/resources/items/${resourceId}/`);
      setList(l => l ? {
        ...l,
        resources: l.resources.filter(r => r.id !== resourceId),
        resource_count: l.resource_count - 1,
      } : l);
      toast.success('Removed.');
    } catch { toast.error('Failed to remove.'); }
  };

  const handleUpvote = async (resource: Resource) => {
    if (!isAuthenticated) { toast.error('Sign in to upvote.'); return; }
    try {
      const res = await api.post(`/resources/items/${resource.id}/upvote/`);
      const wasUpvoted = upvoted.has(resource.id);
      setUpvoted(prev => {
        const next = new Set(prev);
        wasUpvoted ? next.delete(resource.id) : next.add(resource.id);
        return next;
      });
      setList(l => l ? {
        ...l,
        resources: l.resources.map(r =>
          r.id === resource.id ? { ...r, upvote_count: res.data.upvote_count } : r
        ),
      } : l);
    } catch { toast.error('Failed.'); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--background)] text-white flex items-center justify-center">
      <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
    </div>
  );

  if (notFound || !list) return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <Navigation />
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <p className="text-white/30 text-sm mb-4">List not found.</p>
        <Link href="/resources" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1.5 transition-colors">
          <ArrowLeft size={12} /> Back to Resources
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <Navigation />
      <div className="h-16" />

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Back */}
        <Link href="/resources" className="inline-flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 mb-8 transition-colors">
          <ArrowLeft size={12} /> Resources
        </Link>

        {/* Header */}
        <div className="mb-8">
          {list.forked_from_title && (
            <p className="text-xs text-white/25 mb-2 flex items-center gap-1">
              <GitFork size={10} /> Forked from "{list.forked_from_title}"
            </p>
          )}
          <h1 className="text-xl font-medium text-white/85 mb-2">{list.title}</h1>
          {list.description && (
            <p className="text-sm text-white/40 leading-relaxed mb-4">{list.description}</p>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            {list.niche_tag && (
              <span className="flex items-center gap-1 text-xs text-white/30">
                <Hash size={10} />{list.niche_tag}
              </span>
            )}
            <span className="text-xs text-white/25">@{list.creator_username}</span>
            <span className="text-xs text-white/20">·</span>
            <span className="text-xs text-white/25">{list.resource_count} resources</span>
            <span className="text-xs text-white/25">·</span>
            <span className="text-xs text-white/25">{list.save_count} saves</span>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/50 hover:text-white/80 transition-all"
              >
                {list.is_saved
                  ? <><BookmarkCheck size={12} /> Saved</>
                  : <><Bookmark size={12} /> Save</>
                }
              </button>
              {!isOwner && (
                <button
                  onClick={handleFork}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/50 hover:text-white/80 transition-all"
                >
                  <GitFork size={12} /> Fork
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Resources list */}
        <div className="space-y-3 mb-8">
          {list.resources.length === 0 && !isOwner && (
            <p className="text-sm text-white/25 py-6 text-center">No resources yet.</p>
          )}
          {list.resources.map((resource, i) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group p-4 rounded-xl bg-white/3 border border-white/6 hover:border-white/10 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-white/80 hover:text-white transition-colors flex items-center gap-1.5"
                      onClick={e => e.stopPropagation()}
                    >
                      {resource.title}
                      <ExternalLink size={11} className="opacity-40" />
                    </a>
                    <span className="text-xs text-white/25 px-1.5 py-0.5 rounded bg-white/5">
                      {TYPE_LABELS[resource.resource_type] || resource.resource_type}
                    </span>
                    {resource.is_free && (
                      <span className="text-xs text-white/25 px-1.5 py-0.5 rounded bg-white/5">Free</span>
                    )}
                  </div>
                  {resource.description && (
                    <p className="text-xs text-white/40 leading-relaxed">{resource.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Upvote */}
                  <button
                    onClick={() => handleUpvote(resource)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all ${
                      upvoted.has(resource.id)
                        ? 'text-white/70 bg-white/10'
                        : 'text-white/25 hover:text-white/50 hover:bg-white/6'
                    }`}
                  >
                    <ThumbsUp size={11} />
                    {resource.upvote_count > 0 && resource.upvote_count}
                  </button>
                  {/* Owner delete */}
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/20 hover:text-red-400/70 hover:bg-red-500/8 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Add resource form (owner only) */}
        {isOwner && (
          <AnimatePresence>
            {showAddForm ? (
              <motion.form
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                onSubmit={handleAddResource}
                className="p-5 rounded-xl border border-white/10 bg-white/3 space-y-3"
              >
                <input
                  type="text"
                  required
                  placeholder="Title"
                  value={newResource.title}
                  onChange={e => setNewResource(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/25 placeholder:text-white/20"
                />
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={newResource.url}
                  onChange={e => setNewResource(p => ({ ...p, url: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/25 placeholder:text-white/20"
                />
                <textarea
                  placeholder="Why is this useful? (optional)"
                  value={newResource.description}
                  onChange={e => setNewResource(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-white/25 placeholder:text-white/20 resize-none"
                />
                <div className="flex gap-3">
                  <select
                    value={newResource.resource_type}
                    onChange={e => setNewResource(p => ({ ...p, resource_type: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 outline-none"
                  >
                    {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newResource.is_free}
                      onChange={e => setNewResource(p => ({ ...p, is_free: e.target.checked }))}
                      className="accent-white/60"
                    />
                    Free
                  </label>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="submit" disabled={adding} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm text-white/80 transition-all disabled:opacity-40">
                    <Check size={13} /> {adding ? 'Adding…' : 'Add'}
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 rounded-lg text-sm text-white/35 hover:text-white/60 transition-colors">
                    <X size={13} />
                  </button>
                </div>
              </motion.form>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white/50 hover:text-white/80 transition-all w-full"
              >
                <Plus size={14} /> Add resource
              </button>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
