'use client';

import { useState } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { CheckCircle, Circle, Clock, AlertTriangle, CalendarDays, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function TodaysFocus() {
    const { focusTasks, focusHabits, fetchFocus, fetchStats } = useDashboardStore();
    const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
    const [updatingHabitId, setUpdatingHabitId] = useState<string | null>(null);

    const hasItems = focusTasks.length > 0 || focusHabits.length > 0;
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    const handleToggleTask = async (taskId: string, currentStatus: string) => {
        setUpdatingTaskId(taskId);
        try {
            const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
            await api.patch(`/tasks/${taskId}/`, { status: newStatus });
            await Promise.all([fetchFocus(), fetchStats()]);
        } catch (error) {
            console.error('Failed to update task:', error);
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const handleToggleHabit = async (habitId: string, completedToday: boolean) => {
        setUpdatingHabitId(habitId);
        try {
            if (completedToday) {
                await api.delete(`/habits/${habitId}/log/`);
            } else {
                await api.post(`/habits/${habitId}/log/`);
            }
            await Promise.all([fetchFocus(), fetchStats()]);
        } catch (error) {
            console.error('Failed to update habit:', error);
        } finally {
            setUpdatingHabitId(null);
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-900/5 border border-purple-500/20 rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-medium tracking-wider text-white/60 uppercase">
                    Today&apos;s Focus
                </h2>
                <div className="flex items-center gap-2 text-sm text-white/50">
                    <CalendarDays size={14} />
                    {dateStr}
                </div>
            </div>

            {!hasItems ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                        <CheckCircle size={28} className="text-white/20" />
                    </div>
                    <p className="text-white/50 mb-1">All caught up!</p>
                    <p className="text-sm text-white/30">No items for today. Add tasks or habits to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tasks Due */}
                    {focusTasks.length > 0 && (
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                                <AlertTriangle size={14} className="text-orange-400" />
                                Tasks Due
                                <span className="ml-auto text-xs text-white/40">{focusTasks.length}</span>
                            </h3>
                            <ul className="space-y-2">
                                {focusTasks.slice(0, 5).map((task) => (
                                    <li
                                        key={task.id}
                                        onClick={() => handleToggleTask(task.id, task.status)}
                                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${task.status === 'completed'
                                                ? 'bg-green-500/10 border border-green-500/20'
                                                : 'hover:bg-white/5'
                                            }`}
                                    >
                                        {updatingTaskId === task.id ? (
                                            <Loader2 size={14} className="text-purple-400 animate-spin flex-shrink-0" />
                                        ) : task.status === 'completed' ? (
                                            <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                                        ) : (
                                            <Circle size={14} className="text-white/30 flex-shrink-0" />
                                        )}
                                        <span className={`text-sm flex-1 truncate ${task.status === 'completed' ? 'line-through text-white/50' : ''}`}>
                                            {task.title}
                                        </span>
                                        {task.priority === 'high' && (
                                            <span className="text-[10px] px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded">HIGH</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Habits */}
                    {focusHabits.length > 0 && (
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
                                <Clock size={14} className="text-purple-400" />
                                Daily Habits
                                <span className="ml-auto text-xs text-white/40">
                                    {focusHabits.filter(h => h.completed_today).length}/{focusHabits.length}
                                </span>
                            </h3>
                            <ul className="space-y-2">
                                {focusHabits.map((habit) => (
                                    <li
                                        key={habit.id}
                                        onClick={() => handleToggleHabit(habit.id, habit.completed_today)}
                                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer ${habit.completed_today
                                                ? 'bg-green-500/10 border border-green-500/20'
                                                : 'hover:bg-white/5'
                                            }`}
                                    >
                                        {updatingHabitId === habit.id ? (
                                            <Loader2 size={14} className="text-purple-400 animate-spin flex-shrink-0" />
                                        ) : habit.completed_today ? (
                                            <CheckCircle size={14} className="text-green-400 flex-shrink-0" />
                                        ) : (
                                            <Circle size={14} className="text-white/30 flex-shrink-0" />
                                        )}
                                        <span className={`text-sm flex-1 truncate ${habit.completed_today ? 'line-through text-white/50' : ''}`}>
                                            {habit.name}
                                        </span>
                                        {habit.time && (
                                            <span className="text-xs text-white/40">{habit.time}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
