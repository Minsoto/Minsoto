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
    type: 'tasks',
    name: 'Tasks',
    description: 'View your tasks and their status',
    defaultSize: { w: 2, h: 2 },
    icon: '📋'
  },
  {
    type: 'habit-streak',
    name: 'Habit Streaks',
    description: 'Track your daily habits and streaks',
    defaultSize: { w: 1, h: 2 },
    icon: '🔥'
  },
  {
    type: 'habit-graph',
    name: 'Activity Graph',
    description: 'GitHub-style contribution graph',
    defaultSize: { w: 2, h: 1 },
    icon: '📊'
  },
  {
    type: 'interests',
    name: 'Interests',
    description: 'Display your interests',
    defaultSize: { w: 1, h: 1 },
    icon: '🏷️'
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
            className="fixed right-0 top-0 h-full w-80 md:w-96 bg-black border-l border-white/20 z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs tracking-widest">ADD WIDGET</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs opacity-40">
                Select a widget to add
              </p>
            </div>

            {/* Widget List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {WIDGET_TEMPLATES.map(template => (
                <button
                  key={template.type}
                  onClick={() => {
                    onAddWidget(template);
                    onClose();
                  }}
                  className="w-full text-left p-4 border border-white/20 hover:border-white/50 hover:bg-white/5 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{template.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-sm mb-0.5">{template.name}</h3>
                      <p className="text-xs opacity-40">{template.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
