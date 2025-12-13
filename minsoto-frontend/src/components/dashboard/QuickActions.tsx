'use client';

import { useState } from 'react';
import { Plus, BarChart3, Target, X, ListTodo, Repeat } from 'lucide-react';
import api from '@/lib/api';
import { useDashboardStore } from '@/stores/dashboardStore';

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
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[#1a1625] border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
                {children}
            </div>
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
            // Refresh dashboard data
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
            // Refresh dashboard data
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
            label: 'Add Task',
            onClick: () => setTaskModalOpen(true),
            gradient: 'from-orange-500/20 to-orange-900/20 border-orange-500/30 hover:border-orange-500/50'
        },
        {
            icon: Repeat,
            label: 'Add Habit',
            onClick: () => setHabitModalOpen(true),
            gradient: 'from-purple-500/20 to-purple-900/20 border-purple-500/30 hover:border-purple-500/50'
        },
        {
            icon: BarChart3,
            label: 'View Stats',
            onClick: () => { },
            gradient: 'from-blue-500/20 to-blue-900/20 border-blue-500/30 hover:border-blue-500/50'
        },
        {
            icon: Target,
            label: 'Set Goal',
            onClick: () => { },
            gradient: 'from-green-500/20 to-green-900/20 border-green-500/30 hover:border-green-500/50'
        },
    ];

    return (
        <>
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-900/5 border border-purple-500/20 rounded-2xl p-6">
                <h2 className="text-xs font-medium tracking-wider text-white/60 uppercase mb-5">
                    Quick Actions
                </h2>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {actions.map((action) => (
                        <button
                            key={action.label}
                            onClick={action.onClick}
                            className={`
                                flex flex-col items-center justify-center p-5 
                                bg-gradient-to-br ${action.gradient}
                                rounded-xl border transition-all duration-300
                                hover:scale-[1.02] active:scale-[0.98]
                            `}
                        >
                            <action.icon size={22} className="mb-2.5 opacity-80" />
                            <span className="text-xs font-medium tracking-wide">{action.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Add Task Modal */}
            <Modal isOpen={taskModalOpen} onClose={() => setTaskModalOpen(false)} title="Add New Task">
                <form onSubmit={handleAddTask} className="space-y-4">
                    <div>
                        <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">
                            Task Title
                        </label>
                        <input
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="Enter task title..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-orange-500/50 focus:outline-none transition-colors"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setTaskModalOpen(false)}
                            className="flex-1 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !taskTitle.trim()}
                            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Plus size={16} />
                            Add Task
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Add Habit Modal */}
            <Modal isOpen={habitModalOpen} onClose={() => setHabitModalOpen(false)} title="Add New Habit">
                <form onSubmit={handleAddHabit} className="space-y-4">
                    <div>
                        <label className="text-xs text-white/50 uppercase tracking-wider mb-2 block">
                            Habit Name
                        </label>
                        <input
                            type="text"
                            value={habitName}
                            onChange={(e) => setHabitName(e.target.value)}
                            placeholder="Enter habit name..."
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500/50 focus:outline-none transition-colors"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setHabitModalOpen(false)}
                            className="flex-1 py-3 border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !habitName.trim()}
                            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Plus size={16} />
                            Add Habit
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
