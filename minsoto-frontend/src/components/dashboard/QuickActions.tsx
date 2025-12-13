'use client';

import { Plus, BarChart3, Target, Clock } from 'lucide-react';
import Link from 'next/link';

export default function QuickActions() {
    const actions = [
        { icon: Plus, label: 'Add Task', href: '#', color: 'hover:bg-white/10' },
        { icon: Plus, label: 'Add Habit', href: '#', color: 'hover:bg-white/10' },
        { icon: BarChart3, label: 'View Stats', href: '#stats', color: 'hover:bg-white/10' },
        { icon: Target, label: 'Set Goal', href: '#', color: 'hover:bg-white/10' },
        { icon: Clock, label: 'Start Timer', href: '#', color: 'hover:bg-white/10' },
    ];

    return (
        <div className="border border-white/20 p-6 relative">
            {/* Corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white" />

            <h2 className="text-xs font-light tracking-widest opacity-70 mb-6">
                QUICK ACTIONS
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {actions.map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className={`
                            flex flex-col items-center justify-center p-4 
                            border border-white/10 ${action.color}
                            transition-all duration-200
                        `}
                    >
                        <action.icon size={20} className="mb-2 opacity-70" />
                        <span className="text-xs font-light tracking-wide">{action.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
