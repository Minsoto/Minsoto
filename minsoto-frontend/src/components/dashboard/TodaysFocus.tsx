'use client';

import { useState } from 'react';
import { Check, Repeat } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboardStore';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function TodaysFocus() {
    const { focusTasks, focusHabits, fetchFocus, fetchStats } = useDashboardStore();
    const [loading, setLoading] = useState<string | null>(null);

    const handleTaskToggle = async (taskId: string, currentStatus: string) => {
        setLoading(taskId);
        try {
            const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
            // Optimistic update logic would go here if we had a setter, but for now we rely on re-fetch

            // Call API
            await api.patch(`/tasks/${taskId}/`, { status: newStatus });

            // Refresh
            await Promise.all([fetchFocus(), fetchStats()]);
        } catch (error) {
            console.error('Task toggle failed', error);
        } finally {
            setLoading(null);
        }
    };

    const handleHabitToggle = async (habitId: string, isCompleted: boolean) => {
        setLoading(habitId);
        try {
            if (isCompleted) {
                await api.delete(`/habits/${habitId}/log/`);
            } else {
                await api.post(`/habits/${habitId}/log/`);
            }
            await Promise.all([fetchFocus(), fetchStats()]);
        } catch (error) {
            console.error('Habit toggle failed', error);
        } finally {
            setLoading(null);
        }
    };

    // Sort: incomplete first
    const sortedTasks = [...(focusTasks || [])].sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === 'completed' ? 1 : -1;
    });

    const sortedHabits = [...(focusHabits || [])].sort((a, b) => {
        if (a.completed_today === b.completed_today) return 0;
        return a.completed_today ? 1 : -1;
    });

    return (
        <div className="glass-panel rounded-2xl h-full flex flex-col overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="p-6 pb-2 relative z-10 flex justify-between items-end border-b border-white/5">
                <div>
                    <h2 className="text-xl font-medium tracking-tight text-white">Daily Control</h2>
                    <p className="text-xs text-white/40 mt-1">Manage your active priorities</p>
                </div>
                <div className="text-right">
                    <div className="text-xs font-mono text-cyan-400">
                        {focusTasks.filter(t => t.status === 'completed').length} / {focusTasks.length}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 custom-scrollbar">

                {/* TASKS SECTION */}
                <div>
                    <div className="flex items-center gap-2 mb-3 px-2">
                        <Check size={14} className="text-blue-400" />
                        <h3 className="text-xs font-bold tracking-widest text-white/50">TASKS</h3>
                    </div>

                    <div className="space-y-2">
                        <AnimatePresence>
                            {sortedTasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${task.status === 'completed'
                                        ? 'bg-white/5 border-transparent opacity-50'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                        }`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={task.status === 'completed'}
                                            onChange={() => handleTaskToggle(task.id, task.status)}
                                            className="peer appearance-none w-5 h-5 rounded-md border-2 border-white/20 checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer checkbox-pop"
                                            disabled={loading === task.id}
                                        />
                                        <Check size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                                    </div>

                                    <span className={`flex-1 text-sm font-medium transition-colors ${task.status === 'completed' ? 'text-white/30 line-through' : 'text-white/90'
                                        }`}>
                                        {task.title}
                                    </span>

                                    {task.priority === 'high' && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {sortedTasks.length === 0 && (
                            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                                <p className="text-sm text-white/30">No active tasks</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* HABITS SECTION */}
                <div>
                    <div className="flex items-center gap-2 mb-3 px-2">
                        <Repeat size={14} className="text-purple-400" />
                        <h3 className="text-xs font-bold tracking-widest text-white/50">HABITS</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {sortedHabits.map((habit) => (
                            <button
                                key={habit.id}
                                onClick={() => handleHabitToggle(habit.id, habit.completed_today || false)}
                                disabled={loading === habit.id}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${habit.completed_today
                                    ? 'bg-purple-500/20 border-purple-500/50'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                                    }`}
                            >
                                <span className={`text-sm ${habit.completed_today ? 'text-purple-200' : 'text-white/70'}`}>
                                    {habit.name}
                                </span>
                                <div className={`w-2 h-2 rounded-full transition-all ${habit.completed_today
                                    ? 'bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)]'
                                    : 'bg-white/10'
                                    }`} />
                            </button>
                        ))}
                        {sortedHabits.length === 0 && (
                            <div className="col-span-2 text-center py-6 border border-dashed border-white/10 rounded-xl">
                                <p className="text-sm text-white/30">No habits tracked</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
