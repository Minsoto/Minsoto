'use client';

import { useState, useEffect } from 'react';
import { Target, Plus, Minus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';

interface Goal {
    id: string;
    title: string;
    target_value: number;
    current_value: number;
    unit: string;
    category: string;
    color: string;
    progress_percent: number;
}

const COLOR_MAP: Record<string, { bg: string; bar: string; text: string }> = {
    pink: { bg: 'bg-pink-500/20', bar: 'bg-pink-500', text: 'text-pink-400' },
    green: { bg: 'bg-green-500/20', bar: 'bg-green-500', text: 'text-green-400' },
    yellow: { bg: 'bg-yellow-500/20', bar: 'bg-yellow-500', text: 'text-yellow-400' },
    blue: { bg: 'bg-blue-500/20', bar: 'bg-blue-500', text: 'text-blue-400' },
    purple: { bg: 'bg-purple-500/20', bar: 'bg-purple-500', text: 'text-purple-400' },
    cyan: { bg: 'bg-cyan-500/20', bar: 'bg-cyan-500', text: 'text-cyan-400' },
};

export default function GoalsWidget() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const response = await api.get('/goals/');
            setGoals(response.data);
        } catch (error) {
            console.error('Failed to fetch goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateGoalProgress = async (goalId: string, delta: number) => {
        setUpdating(goalId);
        try {
            const goal = goals.find(g => g.id === goalId);
            if (!goal) return;

            const newValue = Math.max(0, Math.min(goal.target_value, goal.current_value + delta));
            await api.patch(`/goals/${goalId}/`, { current_value: newValue });

            setGoals(prev => prev.map(g =>
                g.id === goalId
                    ? { ...g, current_value: newValue, progress_percent: Math.round((newValue / g.target_value) * 100) }
                    : g
            ));
        } catch (error) {
            console.error('Failed to update goal:', error);
        } finally {
            setUpdating(null);
        }
    };

    const deleteGoal = async (goalId: string) => {
        try {
            await api.delete(`/goals/${goalId}/`);
            setGoals(prev => prev.filter(g => g.id !== goalId));
        } catch (error) {
            console.error('Failed to delete goal:', error);
        }
    };

    // Calculate overall progress
    const overallProgress = goals.length > 0
        ? Math.round(goals.reduce((acc, g) => acc + g.progress_percent, 0) / goals.length)
        : 0;

    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (overallProgress / 100) * circumference;

    return (
        <div className="glass-panel rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <Target size={16} className="text-white/50" />
                    <h2 className="text-sm font-bold tracking-widest text-white/60 uppercase">Goals</h2>
                </div>
                <span className="text-xs font-mono text-white/50">{overallProgress}% overall</span>
            </div>

            {/* Circular Progress */}
            <div className="flex justify-center mb-6 relative z-10">
                <div className="relative">
                    <svg width="100" height="100" className="transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-white/10"
                        />
                        {/* Progress circle */}
                        <motion.circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            className="text-cyan-400"
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{
                                strokeDasharray: circumference,
                            }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{overallProgress}%</span>
                    </div>
                </div>
            </div>

            {/* Goals List */}
            <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar relative z-10">
                {loading ? (
                    <div className="text-center py-8 text-white/40 text-sm">Loading goals...</div>
                ) : goals.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-white/10 rounded-xl">
                        <p className="text-white/40 text-sm">No goals set yet</p>
                        <p className="text-white/30 text-xs mt-1">Add goals from Quick Actions</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {goals.map((goal) => {
                            const colors = COLOR_MAP[goal.color] || COLOR_MAP.cyan;
                            return (
                                <motion.div
                                    key={goal.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="group bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${colors.bar}`} />
                                            <span className="text-sm text-white/90 font-medium">{goal.title}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-white/50">{goal.progress_percent}%</span>
                                            <button
                                                onClick={() => deleteGoal(goal.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                                            >
                                                <Trash2 size={12} className="text-red-400" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateGoalProgress(goal.id, -1)}
                                            disabled={updating === goal.id || goal.current_value <= 0}
                                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
                                        >
                                            <Minus size={14} className="text-white/60" />
                                        </button>

                                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${colors.bar} rounded-full`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${goal.progress_percent}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>

                                        <button
                                            onClick={() => updateGoalProgress(goal.id, 1)}
                                            disabled={updating === goal.id || goal.current_value >= goal.target_value}
                                            className="p-1 hover:bg-white/10 rounded disabled:opacity-30 transition-colors"
                                        >
                                            <Plus size={14} className="text-white/60" />
                                        </button>
                                    </div>

                                    {/* Value display */}
                                    <div className="mt-2 text-xs text-white/40 text-center">
                                        {goal.current_value} / {goal.target_value} {goal.unit}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
