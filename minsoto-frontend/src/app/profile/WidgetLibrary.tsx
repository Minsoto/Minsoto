'use client';

import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WidgetTemplate {
  type: string;
  name: string;
  description: string;
  defaultSize: { w: number; h: number };
  icon: string;
}

interface WidgetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (template: WidgetTemplate) => void;
}

// Only functional widgets
const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    type: 'xp-progress',
    name: 'XP Progress',
    description: 'Show your level, XP, and streak multiplier',
    defaultSize: { w: 2, h: 2 },
    icon: '⭐'
  },
  {
    type: 'points',
    name: 'Points Balance',
    description: 'Display your spendable points and rewards',
    defaultSize: { w: 1, h: 2 },
    icon: '🪙'
  },
  {
    type: 'streak-showcase',
    name: 'Streak Showcase',
    description: 'Feature a single habit streak with big fire emoji',
    defaultSize: { w: 1, h: 2 },
    icon: '🔥'
  },
  {
    type: 'tasks',
    name: 'Tasks',
    description: 'View your tasks and their status',
    defaultSize: { w: 2, h: 2 },
    icon: '📋'
  },
  {
    type: 'habit-streak',
    name: 'Habit Tracker',
    description: 'Track your daily habits and streaks',
    defaultSize: { w: 1, h: 2 },
    icon: '✅'
  },
  {
    type: 'habit-graph',
    name: 'Activity Graph',
    description: 'GitHub-style contribution graph',
    defaultSize: { w: 2, h: 1 },
    icon: '📊'
  },
  {
    type: 'goals',
    name: 'Goals Progress',
    description: 'Track your goals with progress bars',
    defaultSize: { w: 2, h: 2 },
    icon: '🎯'
  },
  {
    type: 'interests',
    name: 'Interests',
    description: 'Display your interests',
    defaultSize: { w: 1, h: 1 },
    icon: '🏷️'
  },
  {
    type: 'text',
    name: 'Text / Quote',
    description: 'Custom text with font options',
    defaultSize: { w: 2, h: 1 },
    icon: '✍️'
  },
  {
    type: 'image',
    name: 'Image Frame',
    description: 'Display an image with caption',
    defaultSize: { w: 2, h: 2 },
    icon: '🖼️'
  }
];

export default function WidgetLibrary({
  isOpen,
  onClose,
  onAddWidget
}: WidgetLibraryProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-80 md:w-[420px] bg-[var(--background)] border-l border-white/10 z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Add Widget</h2>
                  <p className="text-xs text-white/40 mt-1">Customize your profile</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={18} className="text-white/60" />
                </button>
              </div>
            </div>

            {/* Widget Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {WIDGET_TEMPLATES.map((template, index) => (
                  <motion.button
                    key={template.type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      onAddWidget(template);
                      onClose();
                    }}
                    className="group text-left p-4 rounded-xl glass-panel hover:bg-white/10 transition-all duration-200 hover:scale-[1.02] hover:border-white/20"
                  >
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-3 group-hover:bg-white/10 transition-colors">
                      <span className="text-xl">{template.icon}</span>
                    </div>

                    {/* Info */}
                    <h3 className="text-sm font-medium text-white mb-1">{template.name}</h3>
                    <p className="text-xs text-white/40 leading-relaxed line-clamp-2">{template.description}</p>

                    {/* Size indicator */}
                    <div className="flex gap-1 mt-3">
                      {Array.from({ length: template.defaultSize.w }).map((_, i) => (
                        <div key={i} className="w-3 h-1 rounded-full bg-white/20" />
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
