'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import Navigation from '@/components/Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Hash, Send, FileText } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import ReactMarkdown from 'react-markdown';

interface Tag {
  id: string;
  name: string;
}

export default function WritePage() {
  const { user, _hasHydrated, isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'draft'>('public');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [_hasHydrated, isAuthenticated, router]);

  // Load available tags
  useEffect(() => {
    api.get('/interests/').then(res => {
      setAvailableTags(res.data || []);
    }).catch(() => {});
  }, []);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Write something first.');
      return;
    }
    if (charCount > 5000) {
      toast.error('Entry exceeds 5000 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/journal/', {
        title: title.trim() || undefined,
        content: content.trim(),
        visibility,
        tag_ids: selectedTags,
      });
      toast.success(visibility === 'public' ? 'Published.' : 'Saved as draft.');
      router.push(`/${user?.username}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.content?.[0] || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTag = (id: string) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

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

        <div className="max-w-3xl mx-auto px-4 pt-28 pb-24">
          <div className="glass-panel rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[var(--accent-primary)]/10 to-transparent rounded-bl-full pointer-events-none" />
            <div className="relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-sm font-bold text-white/40 tracking-widest uppercase">New Entry</h1>
          <div className="flex items-center gap-2">
            {/* Preview toggle */}
            <button
              onClick={() => setShowPreview(p => !p)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-[var(--glass-border)]"
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPreview ? 'Edit Mode' : 'Preview'}
            </button>

            {/* Visibility toggle */}
            <button
              onClick={() => setVisibility(v => v === 'public' ? 'draft' : 'public')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                visibility === 'public'
                  ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border-[var(--accent-primary)]/20 hover:bg-[var(--accent-primary)]/20'
                  : 'bg-black/20 text-white/40 border-[var(--glass-border)] hover:bg-black/40 hover:text-white/60'
              }`}
            >
              <FileText size={14} />
              {visibility === 'public' ? 'Public' : 'Draft'}
            </button>
          </div>
        </div>

        {/* Title */}
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={120}
          className="w-full bg-transparent text-3xl md:text-4xl font-black text-white placeholder:text-white/20 border-none outline-none mb-8 tracking-tight"
        />

        {/* Editor / Preview */}
        <AnimatePresence mode="wait">
          {showPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[300px] prose prose-invert max-w-none text-white/80 leading-relaxed font-medium"
            >
              {content.trim() ? (
                <ReactMarkdown>{content}</ReactMarkdown>
              ) : (
                <p className="text-white/30 italic">Nothing to preview yet.</p>
              )}
            </motion.div>
          ) : (
            <motion.textarea
              key="editor"
              ref={textareaRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              placeholder="What are you thinking about?"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-transparent text-lg text-white/90 placeholder:text-white/20 border-none outline-none resize-none leading-relaxed font-medium min-h-[300px]"
            />
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="h-px bg-[var(--glass-border)] my-8" />

        {/* Character / word count */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 text-xs font-bold text-white/40 uppercase tracking-wider">
            <span>{wordCount} words</span>
            <span>·</span>
            <span className={charCount > 4800 ? 'text-red-400' : ''}>{charCount}/5000</span>
          </div>
        </div>

        {/* Tags */}
        {availableTags.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-bold text-white/40 mb-4 flex items-center gap-1.5 uppercase tracking-wider">
              <Hash size={14} />
              Tags (optional)
            </p>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    selectedTags.includes(tag.id)
                      ? 'bg-white text-black border-white shadow-md'
                      : 'bg-white/5 text-white/60 border-[var(--glass-border)] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)]">
          <button
            onClick={() => router.back()}
            className="text-sm font-bold text-white/40 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-white text-black font-bold text-sm shadow-xl shadow-black/5 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            <Send size={16} className={submitting ? "animate-pulse" : ""} />
            {submitting ? 'Publishing…' : visibility === 'public' ? 'Publish Entry' : 'Save Draft'}
          </button>
        </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
