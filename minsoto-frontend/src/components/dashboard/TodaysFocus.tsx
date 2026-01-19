'use client';

import { useState } from 'react';
import { Check, Repeat, Flame, Calendar, ChevronDown, ChevronUp, Settings2, X, Coins } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useGamificationStore } from '@/stores/gamificationStore';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Habit colors
const HABIT_COLORS = [
    { name: 'blue', bg: 'bg-blue-500' },
    { name: 'purple', bg: 'bg-purple-500' },
    { name: 'pink', bg: 'bg-pink-500' },
    { name: 'red', bg: 'bg-red-500' },
    { name: 'orange', bg: 'bg-orange-500' },
    { name: 'yellow', bg: 'bg-yellow-500' },
    { name: 'green', bg: 'bg-green-500' },
    { name: 'cyan', bg: 'bg-cyan-500' },
];

interface EditingHabit {
    id: string;
    name: string;
    color: string;
    frequency: 'daily' | 'weekly';
    point_value_per_completion: number;
}

export default function TodaysFocus() {
    const { focusTasks, focusHabits, upcomingTasks, fetchFocus, fetchStats } = useDashboardStore();
    const { fetchXP, fetchPoints } = useGamificationStore();
    const [loading, setLoading] = useState<string | null>(null);
    const [showUpcoming, setShowUpcoming] = useState(false);

    // Edit modal state
    const [editingHabit, setEditingHabit] = useState<EditingHabit | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);

    const handleTaskToggle = async (taskId: string, currentStatus: string) => {
        setLoading(taskId);
        try {
            const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
            await api.patch(`/tasks/${taskId}/`, { status: newStatus });
            await Promise.all([fetchFocus(), fetchStats()]);
            // Refresh XP and points if task was completed
            if (newStatus === 'completed') {
                setTimeout(() => {
                    fetchXP();
                    fetchPoints();
                }, 500); // Small delay to let backend process
            }
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
            // Refresh XP and points if habit was logged
            if (!isCompleted) {
                setTimeout(() => {
                    fetchXP();
                    fetchPoints();
                }, 500); // Small delay to let backend process
            }
        } catch (error) {
            console.error('Habit toggle failed', error);
        } finally {
            setLoading(null);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const openEditHabit = (habit: any) => {
        setEditingHabit({
            id: habit.id,
            name: habit.name,
            color: habit.color || 'blue',
            frequency: habit.frequency || 'daily',
            point_value_per_completion: habit.point_value_per_completion || 0
        });
    };

    const saveHabitEdit = async () => {
        if (!editingHabit) return;
        setSavingEdit(true);
        try {
            await api.patch(`/habits/${editingHabit.id}/`, {
                name: editingHabit.name,
                color: editingHabit.color,
                frequency: editingHabit.frequency,
                point_value_per_completion: editingHabit.point_value_per_completion
            });
            setEditingHabit(null);
            await fetchFocus();
        } catch (error) {
            console.error('Failed to update habit:', error);
        } finally {
            setSavingEdit(false);
        }
    };

    // Sort tasks: incomplete first
    const sortedTasks = [...(focusTasks || [])].sort((a, b) => {
        if (a.status === b.status) return 0;
        return a.status === 'completed' ? 1 : -1;
    });

    // Sort habits: by streak (highest first), then incomplete first
    const sortedHabits = [...(focusHabits || [])].sort((a, b) => {
        // First by completion status (incomplete first)
        if (a.completed_today !== b.completed_today) {
            return a.completed_today ? 1 : -1;
        }
        // Then by streak (highest first)
        return (b.current_streak || 0) - (a.current_streak || 0);
    });

    // Get priority color
    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-amber-500';
            case 'low': return 'bg-emerald-500';
            default: return 'bg-white/20';
        }
    };

    // Format date for upcoming
    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    return (
        <div className="glass-panel rounded-2xl h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 pb-4 flex justify-between items-center border-b border-white/5">
                <div>
                    <h2 className="text-lg font-semibold text-white">Daily Focus</h2>
                    <p className="text-xs text-white/40 mt-0.5">Your active priorities</p>
                </div>
                <div className="text-right">
                    <div className="text-sm font-medium text-white">
                        {focusTasks.filter(t => t.status === 'completed').length}/{focusTasks.length}
                    </div>
                    <div className="text-xs text-white/40">completed</div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* TASKS SECTION */}
                <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Check size={14} className="text-white/40" />
                        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wide">Today&apos;s Tasks</h3>
                    </div>

                    <div className="space-y-2">
                        <AnimatePresence>
                            {sortedTasks.map((task) => (
                                <motion.div
                                    key={task.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`group flex items-center gap-3 p-3 rounded-xl transition-all ${task.status === 'completed'
                                        ? 'bg-white/5 opacity-50'
                                        : 'bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    {/* Checkbox */}
                                    <div className="relative flex-shrink-0">
                                        <input
                                            type="checkbox"
                                            checked={task.status === 'completed'}
                                            onChange={() => handleTaskToggle(task.id, task.status)}
                                            className="peer appearance-none w-5 h-5 rounded-md border-2 border-white/20 checked:bg-white checked:border-white transition-all cursor-pointer"
                                            disabled={loading === task.id}
                                        />
                                        <Check size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                    </div>

                                    {/* Title */}
                                    <span className={`flex-1 text-sm transition-colors ${task.status === 'completed' ? 'text-white/30 line-through' : 'text-white/90'
                                        }`}>
                                        {task.title}
                                    </span>

                                    {/* Priority indicator */}
                                    {task.priority && (
                                        <span className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {sortedTasks.length === 0 && (
                            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                                <p className="text-sm text-white/30">No tasks for today</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* UPCOMING TASKS SECTION */}
                {(upcomingTasks?.length || 0) > 0 && (
                    <div>
                        <button
                            onClick={() => setShowUpcoming(!showUpcoming)}
                            className="flex items-center gap-2 mb-3 px-1 w-full text-left group"
                        >
                            <Calendar size={14} className="text-white/40" />
                            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wide flex-1">
                                Upcoming ({upcomingTasks?.length || 0})
                            </h3>
                            {showUpcoming ? (
                                <ChevronUp size={14} className="text-white/30" />
                            ) : (
                                <ChevronDown size={14} className="text-white/30" />
                            )}
                        </button>

                        <AnimatePresence>
                            {showUpcoming && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-2 overflow-hidden"
                                >
                                    {upcomingTasks?.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5"
                                        >
                                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                                            <span className="flex-1 text-sm text-white/60">{task.title}</span>
                                            <span className="text-xs text-white/30">{formatDate(task.due_date ?? undefined)}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* HABITS SECTION */}
                <div>
                    <div className="flex items-center gap-2 mb-3 px-1">
                        <Repeat size={14} className="text-white/40" />
                        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wide">Habits</h3>
                    </div>

                    <div className="space-y-2">
                        {sortedHabits.map((habit) => (
                            <div
                                key={habit.id}
                                className={`group w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${habit.completed_today
                                    ? 'bg-white/10 border border-white/20'
                                    : 'bg-white/5 border border-transparent hover:bg-white/10'
                                    }`}
                            >
                                {/* Image or Placeholder */}
                                <div
                                    className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5 flex items-center justify-center cursor-pointer"
                                    onClick={() => handleHabitToggle(habit.id, habit.completed_today || false)}
                                >
                                    {habit.image_url ? (
                                        <Image
                                            src={habit.image_url}
                                            alt={habit.name}
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Repeat size={16} className="text-white/20" />
                                    )}
                                </div>

                                {/* Name and streak - clickable to toggle */}
                                <div
                                    className="flex-1 min-w-0 cursor-pointer"
                                    onClick={() => handleHabitToggle(habit.id, habit.completed_today || false)}
                                >
                                    <div className={`text-sm truncate ${habit.completed_today ? 'text-white' : 'text-white/70'
                                        }`}>
                                        {habit.name}
                                    </div>
                                    {(habit.current_streak || 0) > 0 && (
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <Flame size={12} className="text-amber-400" />
                                            <span className="text-xs text-amber-400/80">
                                                {habit.current_streak} day{habit.current_streak !== 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Edit button */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); openEditHabit(habit); }}
                                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                                    title="Edit habit"
                                >
                                    <Settings2 size={14} className="text-white/50" />
                                </button>

                                {/* Completion indicator */}
                                <div
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${habit.completed_today
                                        ? 'bg-white border-white'
                                        : 'border-white/20'
                                        }`}
                                    onClick={() => handleHabitToggle(habit.id, habit.completed_today || false)}
                                >
                                    {habit.completed_today && (
                                        <Check size={12} className="text-black" />
                                    )}
                                </div>
                            </div>
                        ))}

                        {sortedHabits.length === 0 && (
                            <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                                <p className="text-sm text-white/30">No habits tracked</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* HABIT EDIT MODAL */}
            <AnimatePresence>
                {editingHabit && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80"
                            onClick={() => setEditingHabit(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-sm bg-[#0a0a12] border border-white/10 rounded-2xl p-6 z-10"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">Edit Habit</h3>
                                <button onClick={() => setEditingHabit(null)} className="p-1 hover:bg-white/10 rounded">
                                    <X size={18} className="text-white/50" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="text-xs text-white/50 mb-1 block">Name</label>
                                    <input
                                        type="text"
                                        value={editingHabit.name}
                                        onChange={e => setEditingHabit({ ...editingHabit, name: e.target.value })}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-purple-500 outline-none"
                                    />
                                </div>

                                {/* Color */}
                                <div>
                                    <label className="text-xs text-white/50 mb-2 block">Color</label>
                                    <div className="flex gap-2 flex-wrap">
                                        {HABIT_COLORS.map(c => (
                                            <button
                                                key={c.name}
                                                onClick={() => setEditingHabit({ ...editingHabit, color: c.name })}
                                                className={`w-8 h-8 rounded-lg ${c.bg} transition-all ${editingHabit.color === c.name
                                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a12]'
                                                    : 'opacity-60 hover:opacity-100'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Frequency */}
                                <div>
                                    <label className="text-xs text-white/50 mb-2 block">Frequency</label>
                                    <div className="flex gap-2">
                                        {(['daily', 'weekly'] as const).map(f => (
                                            <button
                                                key={f}
                                                onClick={() => setEditingHabit({ ...editingHabit, frequency: f })}
                                                className={`flex-1 py-2 rounded-lg text-sm transition-all ${editingHabit.frequency === f
                                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                                                    : 'bg-white/5 text-white/50 border border-white/10'
                                                    }`}
                                            >
                                                {f.charAt(0).toUpperCase() + f.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Points */}
                                <div>
                                    <label className="text-xs text-white/50 mb-1 block flex items-center gap-1">
                                        <Coins size={12} className="text-yellow-400" />
                                        Points Per Completion
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={editingHabit.point_value_per_completion}
                                            onChange={e => setEditingHabit({
                                                ...editingHabit,
                                                point_value_per_completion: Math.min(100, parseInt(e.target.value) || 0)
                                            })}
                                            className="w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-center focus:border-yellow-500 outline-none"
                                        />
                                        <span className="text-xs text-white/40">+streak bonus</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 justify-end mt-6">
                                <button
                                    onClick={() => setEditingHabit(null)}
                                    className="px-4 py-2 text-white/50 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveHabitEdit}
                                    disabled={savingEdit}
                                    className="px-5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg font-medium transition-all"
                                >
                                    {savingEdit ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
