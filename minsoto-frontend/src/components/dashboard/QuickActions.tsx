'use client';

import { Target, ListTodo, Repeat, Sparkles } from 'lucide-react';
import { useGlobalActionsStore } from '@/stores/globalActionsStore';

export default function QuickActions() {
    const { openTaskModal, openHabitModal, openGoalModal } = useGlobalActionsStore();

    const actions = [
        {
            icon: ListTodo,
            label: 'New Task',
            onClick: openTaskModal,
            color: 'text-blue-400',
            grad: 'hover:bg-blue-500/10 hover:border-blue-500/30',
            shadow: 'hover:shadow-blue-500/10'
        },
        {
            icon: Repeat,
            label: 'New Habit',
            onClick: openHabitModal,
            color: 'text-purple-400',
            grad: 'hover:bg-purple-500/10 hover:border-purple-500/30',
            shadow: 'hover:shadow-purple-500/10'
        },
        {
            icon: Target,
            label: 'Set Goal',
            onClick: openGoalModal,
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
        </div>
    );
}
