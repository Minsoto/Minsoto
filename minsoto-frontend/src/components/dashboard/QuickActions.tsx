'use client';

import { useState } from 'react';
import { Target, X, ListTodo, Repeat, Sparkles, Calendar, Image as ImageIcon, Coins } from 'lucide-react';
import api from '@/lib/api';
import { useDashboardStore } from '@/stores/dashboardStore';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// ENHANCED MODAL COMPONENT
// ============================================================================
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    accentColor?: string;
}

function Modal({ isOpen, onClose, title, children, accentColor = 'blue' }: ModalProps) {
    if (!isOpen) return null;

    const gradientMap: Record<string, string> = {
        blue: 'from-blue-500/20',
        purple: 'from-purple-500/20',
        green: 'from-green-500/20',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`relative w-full max-w-md bg-[#0a0a12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-10`}
            >
                {/* Gradient accent at top */}
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${gradientMap[accentColor]} to-transparent pointer-events-none`} />

                {/* Header */}
                <div className="relative flex items-center justify-between px-6 pt-6 pb-2">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={18} className="text-white/50 hover:text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="relative px-6 pb-6 pt-2">
                    {children}
                </div>
            </motion.div>
        </div>
    );
}

// ============================================================================
// HABIT COLORS
// ============================================================================
const HABIT_COLORS = [
    { name: 'blue', bg: 'bg-blue-500', ring: 'ring-blue-500' },
    { name: 'purple', bg: 'bg-purple-500', ring: 'ring-purple-500' },
    { name: 'pink', bg: 'bg-pink-500', ring: 'ring-pink-500' },
    { name: 'red', bg: 'bg-red-500', ring: 'ring-red-500' },
    { name: 'orange', bg: 'bg-orange-500', ring: 'ring-orange-500' },
    { name: 'yellow', bg: 'bg-yellow-500', ring: 'ring-yellow-500' },
    { name: 'green', bg: 'bg-green-500', ring: 'ring-green-500' },
    { name: 'cyan', bg: 'bg-cyan-500', ring: 'ring-cyan-500' },
    { name: 'indigo', bg: 'bg-indigo-500', ring: 'ring-indigo-500' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function QuickActions() {
    // Task modal state
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDueDate, setTaskDueDate] = useState('');
    const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [taskImageUrl, setTaskImageUrl] = useState('');
    const [showTaskImage, setShowTaskImage] = useState(false);
    const [taskPointValue, setTaskPointValue] = useState(0);

    // Habit modal state
    const [habitModalOpen, setHabitModalOpen] = useState(false);
    const [habitName, setHabitName] = useState('');
    const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekly'>('daily');
    const [habitColor, setHabitColor] = useState('blue');
    const [habitImageUrl, setHabitImageUrl] = useState('');
    const [showHabitIcon, setShowHabitIcon] = useState(false);
    const [habitPointValue, setHabitPointValue] = useState(0);

    // Goal modal state
    const [goalModalOpen, setGoalModalOpen] = useState(false);
    const [goalTitle, setGoalTitle] = useState('');
    const [goalTarget, setGoalTarget] = useState('');
    const [goalUnit, setGoalUnit] = useState('');
    const [goalColor, setGoalColor] = useState('cyan');
    const [goalCategory, setGoalCategory] = useState('general');

    const [loading, setLoading] = useState(false);
    const { fetchFocus, fetchStats } = useDashboardStore();

    // Reset task form
    const resetTaskForm = () => {
        setTaskTitle('');
        setTaskDueDate('');
        setTaskPriority('medium');
        setTaskImageUrl('');
        setShowTaskImage(false);
        setTaskPointValue(0);
    };

    // Reset habit form
    const resetHabitForm = () => {
        setHabitName('');
        setHabitFrequency('daily');
        setHabitColor('blue');
        setHabitImageUrl('');
        setShowHabitIcon(false);
        setHabitPointValue(0);
    };

    // Reset goal form
    const resetGoalForm = () => {
        setGoalTitle('');
        setGoalTarget('');
        setGoalUnit('');
        setGoalColor('cyan');
        setGoalCategory('general');
    };

    const handleAddTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!taskTitle.trim()) return;

        setLoading(true);
        try {
            await api.post('/tasks/', {
                title: taskTitle,
                status: 'todo',
                priority: taskPriority,
                due_date: taskDueDate || null,
                image_url: taskImageUrl || null,
                point_value: taskPointValue
            });
            resetTaskForm();
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
            await api.post('/habits/', {
                name: habitName,
                image_url: habitImageUrl || null,
                color: habitColor,
                frequency: habitFrequency,
                point_value_per_completion: habitPointValue
            });
            resetHabitForm();
            setHabitModalOpen(false);
            await Promise.all([fetchFocus(), fetchStats()]);
        } catch (error) {
            console.error('Failed to add habit:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goalTitle.trim() || !goalTarget) return;

        setLoading(true);
        try {
            await api.post('/goals/', {
                title: goalTitle,
                target_value: parseInt(goalTarget),
                current_value: 0,
                unit: goalUnit || 'units',
                color: goalColor,
                category: goalCategory
            });
            resetGoalForm();
            setGoalModalOpen(false);
        } catch (error) {
            console.error('Failed to add goal:', error);
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
            grad: 'hover:bg-blue-500/10 hover:border-blue-500/30',
            shadow: 'hover:shadow-blue-500/10'
        },
        {
            icon: Repeat,
            label: 'New Habit',
            onClick: () => setHabitModalOpen(true),
            color: 'text-purple-400',
            grad: 'hover:bg-purple-500/10 hover:border-purple-500/30',
            shadow: 'hover:shadow-purple-500/10'
        },
        {
            icon: Target,
            label: 'Set Goal',
            onClick: () => setGoalModalOpen(true),
            color: 'text-green-400',
            grad: 'hover:bg-green-500/10 hover:border-green-500/30',
            shadow: 'hover:shadow-green-500/10'
        },
        {
            icon: Sparkles,
            label: 'AI Plan',
            onClick: () => { },
            color: 'text-yellow-400',
            grad: 'hover:bg-yellow-500/10 hover:border-yellow-500/30',
            shadow: 'hover:shadow-yellow-500/10',
            disabled: true
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
                        disabled={action.disabled}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border border-white/5 bg-white/[0.02] transition-all duration-300 ${action.grad} ${action.shadow} hover:shadow-xl group ${action.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                        <div className={`p-3 rounded-xl bg-white/5 mb-3 group-hover:scale-110 transition-transform duration-300 ${action.color}`}>
                            <action.icon size={22} />
                        </div>
                        <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* ================================================================ */}
            {/* ENHANCED TASK MODAL */}
            {/* ================================================================ */}
            <AnimatePresence>
                {taskModalOpen && (
                    <Modal isOpen={taskModalOpen} onClose={() => { setTaskModalOpen(false); resetTaskForm(); }} title="Create Task" accentColor="blue">
                        <form onSubmit={handleAddTask} className="space-y-5">
                            {/* Task Title */}
                            <input
                                type="text"
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                placeholder="What needs to be done?"
                                className="w-full px-4 py-4 bg-white/5 border border-blue-500/30 rounded-xl focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 outline-none text-white placeholder-white/30 transition-all text-lg"
                                autoFocus
                            />

                            {/* Due Date */}
                            <div>
                                <label className="text-xs font-medium text-white/50 mb-2 block">Due Date</label>
                                <div className="relative">
                                    <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                    <input
                                        type="datetime-local"
                                        value={taskDueDate}
                                        onChange={(e) => setTaskDueDate(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500/50 outline-none text-white/80 transition-colors [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="text-xs font-medium text-white/50 mb-3 block">Priority</label>
                                <div className="flex gap-2">
                                    {[
                                        { value: 'low', label: 'Low', color: 'bg-green-500', ring: 'ring-green-500' },
                                        { value: 'medium', label: 'Medium', color: 'bg-yellow-500', ring: 'ring-yellow-500' },
                                        { value: 'high', label: 'High', color: 'bg-red-500', ring: 'ring-red-500' },
                                    ].map((p) => (
                                        <button
                                            key={p.value}
                                            type="button"
                                            onClick={() => setTaskPriority(p.value as 'low' | 'medium' | 'high')}
                                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${taskPriority === p.value
                                                ? `bg-white/10 border-white/30 ${p.ring} ring-2`
                                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${p.color}`} />
                                            <span className="text-sm text-white/80">{p.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Add Image Toggle */}
                            {!showTaskImage ? (
                                <button
                                    type="button"
                                    onClick={() => setShowTaskImage(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-white/60 text-sm"
                                >
                                    <ImageIcon size={16} />
                                    Add Image
                                </button>
                            ) : (
                                <div>
                                    <label className="text-xs font-medium text-white/50 mb-2 block">Image URL</label>
                                    <input
                                        type="text"
                                        value={taskImageUrl}
                                        onChange={(e) => setTaskImageUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500/50 outline-none text-white placeholder-white/20 transition-colors"
                                    />
                                </div>
                            )}

                            {/* Points Reward */}
                            <div>
                                <label className="text-xs font-medium text-white/50 mb-2 block flex items-center gap-1.5">
                                    <Coins size={12} className="text-yellow-400" />
                                    Points on Completion
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min={0}
                                        max={500}
                                        value={taskPointValue}
                                        onChange={(e) => setTaskPointValue(Math.min(500, parseInt(e.target.value) || 0))}
                                        className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-yellow-500/50 outline-none text-white text-center"
                                    />
                                    <span className="text-xs text-white/40">Max: 500 pts per task</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => { setTaskModalOpen(false); resetTaskForm(); }}
                                    className="px-5 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !taskTitle.trim()}
                                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                                >
                                    {loading ? 'Creating...' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

            {/* ================================================================ */}
            {/* ENHANCED HABIT MODAL */}
            {/* ================================================================ */}
            <AnimatePresence>
                {habitModalOpen && (
                    <Modal isOpen={habitModalOpen} onClose={() => { setHabitModalOpen(false); resetHabitForm(); }} title="New Habit" accentColor="purple">
                        <form onSubmit={handleAddHabit} className="space-y-5">
                            {/* Habit Name */}
                            <input
                                type="text"
                                value={habitName}
                                onChange={(e) => setHabitName(e.target.value)}
                                placeholder="E.g., Meditation, Reading..."
                                className="w-full px-4 py-4 bg-white/5 border border-purple-500/30 rounded-xl focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 outline-none text-white placeholder-white/30 transition-all text-lg"
                                autoFocus
                            />

                            {/* Frequency */}
                            <div>
                                <label className="text-xs font-medium text-white/50 mb-3 block">Frequency</label>
                                <div className="flex gap-2">
                                    {[
                                        { value: 'daily', label: 'Daily' },
                                        { value: 'weekly', label: 'Weekly' },
                                    ].map((f) => (
                                        <button
                                            key={f.value}
                                            type="button"
                                            onClick={() => setHabitFrequency(f.value as 'daily' | 'weekly')}
                                            className={`flex-1 px-6 py-3 rounded-xl border transition-all text-sm font-medium ${habitFrequency === f.value
                                                ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label className="text-xs font-medium text-white/50 mb-3 block">Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {HABIT_COLORS.map((c) => (
                                        <button
                                            key={c.name}
                                            type="button"
                                            onClick={() => setHabitColor(c.name)}
                                            className={`w-9 h-9 rounded-lg ${c.bg} transition-all ${habitColor === c.name
                                                ? 'ring-2 ring-offset-2 ring-offset-[#0a0a12] ' + c.ring + ' scale-110'
                                                : 'opacity-70 hover:opacity-100 hover:scale-105'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Add Icon Toggle */}
                            {!showHabitIcon ? (
                                <button
                                    type="button"
                                    onClick={() => setShowHabitIcon(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-white/60 text-sm"
                                >
                                    <ImageIcon size={16} />
                                    Add Icon
                                </button>
                            ) : (
                                <div>
                                    <label className="text-xs font-medium text-white/50 mb-2 block">Icon URL</label>
                                    <input
                                        type="text"
                                        value={habitImageUrl}
                                        onChange={(e) => setHabitImageUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-purple-500/50 outline-none text-white placeholder-white/20 transition-colors"
                                    />
                                </div>
                            )}

                            {/* Points Per Completion */}
                            <div>
                                <label className="text-xs font-medium text-white/50 mb-2 block flex items-center gap-1.5">
                                    <Coins size={12} className="text-yellow-400" />
                                    Points Per Completion
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={habitPointValue}
                                        onChange={(e) => setHabitPointValue(Math.min(100, parseInt(e.target.value) || 0))}
                                        className="w-24 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-yellow-500/50 outline-none text-white text-center"
                                    />
                                    <span className="text-xs text-white/40">+streak bonus (up to 50%)</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => { setHabitModalOpen(false); resetHabitForm(); }}
                                    className="px-5 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !habitName.trim()}
                                    className="px-8 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                                >
                                    {loading ? 'Creating...' : 'Start Habit'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>

            {/* ================================================================ */}
            {/* GOAL MODAL */}
            {/* ================================================================ */}
            <AnimatePresence>
                {goalModalOpen && (
                    <Modal isOpen={goalModalOpen} onClose={() => { setGoalModalOpen(false); resetGoalForm(); }} title="Set Goal" accentColor="green">
                        <form onSubmit={handleAddGoal} className="space-y-5">
                            {/* Goal Title */}
                            <div>
                                <label className="text-xs font-medium text-white/50 mb-2 block">Goal Title</label>
                                <input
                                    type="text"
                                    value={goalTitle}
                                    onChange={(e) => setGoalTitle(e.target.value)}
                                    placeholder="Read 20 books..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-green-500/50 outline-none text-white placeholder-white/20 transition-colors"
                                    autoFocus
                                />
                            </div>

                            {/* Target Value & Unit */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium text-white/50 mb-2 block">Target</label>
                                    <input
                                        type="number"
                                        value={goalTarget}
                                        onChange={(e) => setGoalTarget(e.target.value)}
                                        placeholder="20"
                                        min="1"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-green-500/50 outline-none text-white placeholder-white/20 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-white/50 mb-2 block">Unit</label>
                                    <input
                                        type="text"
                                        value={goalUnit}
                                        onChange={(e) => setGoalUnit(e.target.value)}
                                        placeholder="books, km, hours..."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-green-500/50 outline-none text-white placeholder-white/20 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Color Picker */}
                            <div>
                                <label className="text-xs font-medium text-white/50 mb-2 block">Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['cyan', 'green', 'blue', 'purple', 'pink', 'yellow'].map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setGoalColor(c)}
                                            className={`w-7 h-7 rounded-full bg-${c}-500 transition-all ${goalColor === c
                                                ? 'ring-2 ring-offset-2 ring-offset-[#0a0a12] ring-white scale-110'
                                                : 'opacity-60 hover:opacity-100'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="text-xs font-medium text-white/50 mb-2 block">Category</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['general', 'health', 'career', 'learning', 'finance'].map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setGoalCategory(cat)}
                                            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${goalCategory === cat
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 justify-end pt-3">
                                <button
                                    type="button"
                                    onClick={() => { setGoalModalOpen(false); resetGoalForm(); }}
                                    className="px-5 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !goalTitle.trim() || !goalTarget}
                                    className="px-8 py-2.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50"
                                >
                                    {loading ? 'Creating...' : 'Set Goal'}
                                </button>
                            </div>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}
