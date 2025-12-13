'use client';

import { useState } from 'react';
import { Target, X, ListTodo, Repeat, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { useDashboardStore } from '@/stores/dashboardStore';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-full max-w-md bg-[#090910] border border-white/10 rounded-2xl shadow-2xl p-6 z-10"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium text-white">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X size={18} className="text-white/50" />
                    </button>
                </div>
                {children}
            </motion.div>
        </div>
    );
}

export default function QuickActions() {
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [habitModalOpen, setHabitModalOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [habitName, setHabitName] = useState('');
    const [loading, setLoading] = useState(false);

    const { fetchFocus, fetchStats } = useDashboardStore();

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle.trim()) return;

        setLoading(true);
        try {
            await api.post('/tasks/', { title: taskTitle, status: 'todo' });
            setTaskTitle('');
            setTaskModalOpen(false);
            await Promise.all([fetchFocus(), fetchStats()]);
        } catch (error) {
            console.error('Failed to add task:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddHabit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!habitName.trim()) return;

        setLoading(true);
        try {
            await api.post('/habits/', { name: habitName });
            setHabitName('');
            setHabitModalOpen(false);
            await Promise.all([fetchFocus(), fetchStats()]);
        } catch (error) {
            console.error('Failed to add habit:', error);
        } finally {
            setLoading(false);
        }
    };

    const actions = [
        {
            icon: ListTodo,
            label: 'New Task',
            onClick: () => setTaskModalOpen(true),
            color: 'text-blue-400',
            grad: 'hover:bg-blue-500/10 hover:border-blue-500/20'
        },
        {
            icon: Repeat,
            label: 'New Habit',
            onClick: () => setHabitModalOpen(true),
            color: 'text-purple-400',
            grad: 'hover:bg-purple-500/10 hover:border-purple-500/20'
        },
        {
            icon: Target,
            label: 'Set Goal',
            onClick: () => { },
            color: 'text-green-400',
            grad: 'hover:bg-green-500/10 hover:border-green-500/20'
        },
        {
            icon: Sparkles,
            label: 'AI Plan',
            onClick: () => { },
            color: 'text-yellow-400',
            grad: 'hover:bg-yellow-500/10 hover:border-yellow-500/20'
        },
    ];

    return (
        <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
            <h2 className="text-xs font-bold tracking-widest text-white/40 mb-4 uppercase">
                Direct Actions
            </h2>

            <div className="grid grid-cols-2 gap-3 flex-1">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={action.onClick}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border border-white/5 bg-white/[0.02] transition-all duration-300 ${action.grad} group`}
                    >
                        <div className={`p-2 rounded-lg bg-white/5 mb-2 group-hover:scale-110 transition-transform ${action.color}`}>
                            <action.icon size={20} />
                        </div>
                        <span className="text-xs font-medium text-white/70 group-hover:text-white">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {taskModalOpen && (
                    <Modal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="Create Task">
                        <form onSubmit={handleAddTask} className="space-y-4">
                            <input
                                type="text"
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500/50 outline-none text-white placeholder-white/20 transition-colors"
                                autoFocus
                            />
                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setTaskModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !taskTitle.trim()}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Create Task
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}

                {habitModalOpen && (
                    <Modal isOpen={habitModalOpen} onClose={() => setHabitModalOpen(false)} title="New Habit">
                        <form onSubmit={handleAddHabit} className="space-y-4">
                            <input
                                type="text"
                                value={habitName}
                                onChange={(e) => setHabitName(e.target.value)}
                                placeholder="E.g., Meditation, Reading..."
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500/50 outline-none text-white placeholder-white/20 transition-colors"
                                autoFocus
                            />
                            <div className="flex gap-3 justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setHabitModalOpen(false)}
                                    className="px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !habitName.trim()}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-purple-500/20"
                                >
                                    Start Habit
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}
