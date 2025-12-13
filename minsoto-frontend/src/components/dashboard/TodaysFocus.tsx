'use client';

import { useDashboardStore } from '@/stores/dashboardStore';
import { CheckCircle, Circle, Clock, AlertTriangle } from 'lucide-react';

export default function TodaysFocus() {
    const { focusTasks, focusHabits } = useDashboardStore();

    const hasItems = focusTasks.length > 0 || focusHabits.length > 0;

    return (
        <div className="border border-white/20 p-6 relative">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white" />

            <h2 className="text-xs font-light tracking-widest opacity-70 mb-6">
                TODAY&apos;S FOCUS
            </h2>

            {!hasItems ? (
                <div className="text-center py-8 text-white/50">
                    <p className="mb-2">No items for today</p>
                    <p className="text-sm">Add tasks or habits to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tasks */}
                    {focusTasks.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <AlertTriangle size={14} className="text-yellow-400" />
                                Tasks Due
                            </h3>
                            <ul className="space-y-2">
                                {focusTasks.slice(0, 5).map((task) => (
                                    <li key={task.id} className="flex items-center gap-3 text-sm">
                                        <Circle size={14} className="text-white/40" />
                                        <span className={task.status === 'completed' ? 'line-through opacity-50' : ''}>
                                            {task.title}
                                        </span>
                                        {task.priority === 'high' && (
                                            <span className="text-xs text-red-400">!</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Habits */}
                    {focusHabits.length > 0 && (
                        <div>
                            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <Clock size={14} className="text-blue-400" />
                                Habits
                            </h3>
                            <ul className="space-y-2">
                                {focusHabits.map((habit) => (
                                    <li key={habit.id} className="flex items-center gap-3 text-sm">
                                        {habit.completed_today ? (
                                            <CheckCircle size={14} className="text-green-400" />
                                        ) : (
                                            <Circle size={14} className="text-white/40" />
                                        )}
                                        <span className={habit.completed_today ? 'line-through opacity-50' : ''}>
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
