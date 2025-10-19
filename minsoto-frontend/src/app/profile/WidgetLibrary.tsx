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

const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    type: 'tasks',
    name: 'Tasks & Projects',
    description: 'Kanban board for task management',
    defaultSize: { w: 2, h: 2 },
    icon: '📋'
  },
  {
    type: 'habit-streak',
    name: 'Habit Streaks',
    description: 'Daily schedule with checkboxes',
    defaultSize: { w: 1, h: 2 },
    icon: '✓'
  },
  {
    type: 'habit-graph',
    name: 'Habit Graph',
    description: 'GitHub-style contribution graph',
    defaultSize: { w: 1, h: 1 },
    icon: '📊'
  },
  {
    type: 'interests',
    name: 'Interests',
    description: 'Display your interests and extensions',
    defaultSize: { w: 1, h: 2 },
    icon: '🏷️'
  },
  {
    type: 'stats',
    name: 'Stats',
    description: 'Numerical progress display',
    defaultSize: { w: 1, h: 1 },
    icon: '📈'
  },
  {
    type: 'schedule',
    name: "Today's Schedule",
    description: 'Time-based task list',
    defaultSize: { w: 1, h: 2 },
    icon: '🕐'
  },
  {
    type: 'activity',
    name: 'Daily Activity',
    description: 'Engagement visualization',
    defaultSize: { w: 1, h: 2 },
    icon: '🎯'
  },
  {
    type: 'post',
    name: 'Highlighted Post',
    description: 'Featured content with image',
    defaultSize: { w: 1, h: 1 },
    icon: '📝'
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
            className="fixed inset-0 bg-black bg-opacity-80 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-black border-l border-white z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white border-opacity-20">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm tracking-widest">WIDGET LIBRARY</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white hover:bg-opacity-10 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs opacity-50">
                Click on a widget to add it to your profile
              </p>
            </div>

            {/* Widget List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {WIDGET_TEMPLATES.map(template => (
                <button
                  key={template.type}
                  onClick={() => {
                    onAddWidget(template);
                    onClose();
                  }}
                  className="w-full text-left p-4 border border-white border-opacity-20 hover:border-opacity-60 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium mb-1 group-hover:opacity-100 opacity-80">
                        {template.name}
                      </h3>
                      <p className="text-xs opacity-50 group-hover:opacity-70">
                        {template.description}
                      </p>
                      <div className="text-[10px] opacity-30 mt-2">
                        Size: {template.defaultSize.w}x{template.defaultSize.h}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-1/4 right-8 text-6xl opacity-5 pointer-events-none">
              格
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
