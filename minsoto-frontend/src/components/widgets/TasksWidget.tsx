'use client';

import BaseWidget from './BaseWidget';
import { CheckCircle, Circle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
}

interface TasksWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  tasks: Task[];
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
}

export default function TasksWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  tasks,
  onVisibilityToggle,
  onDelete
}: TasksWidgetProps) {
  const categorizedTasks = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed')
  };

  const totalTasks = tasks.length;
  const completedCount = categorizedTasks.completed.length;

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500'
  };

  return (
    <BaseWidget
      id={id}
      title="Tasks & Projects"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
      accent="orange"
    >
      <div className="h-full flex flex-col">
        {/* Progress Summary */}
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
          <div className="text-2xl font-light">{completedCount}/{totalTasks}</div>
          <div className="text-xs text-white/50">completed</div>
        </div>

        {/* Task Columns */}
        <div className="grid grid-cols-3 gap-2 flex-1 overflow-hidden">
          {/* To Do */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2 flex items-center gap-1">
              <Circle size={8} />
              To Do ({categorizedTasks.todo.length})
            </div>
            <div className="space-y-1.5">
              {categorizedTasks.todo.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className={`text-xs py-1.5 px-2 bg-white/5 rounded border-l-2 ${task.priority ? priorityColors[task.priority] : 'border-l-white/20'
                    } truncate`}
                >
                  {task.title}
                </div>
              ))}
            </div>
          </div>

          {/* In Progress */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-orange-400/70 mb-2 flex items-center gap-1">
              <Circle size={8} className="animate-pulse" />
              Active ({categorizedTasks.in_progress.length})
            </div>
            <div className="space-y-1.5">
              {categorizedTasks.in_progress.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className={`text-xs py-1.5 px-2 bg-orange-500/10 rounded border-l-2 border-l-orange-500 truncate`}
                >
                  {task.title}
                </div>
              ))}
            </div>
          </div>

          {/* Completed */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-green-400/70 mb-2 flex items-center gap-1">
              <CheckCircle size={8} />
              Done ({categorizedTasks.completed.length})
            </div>
            <div className="space-y-1.5">
              {categorizedTasks.completed.slice(0, 3).map(task => (
                <div
                  key={task.id}
                  className="text-xs py-1.5 px-2 bg-green-500/10 rounded text-white/50 line-through truncate"
                >
                  {task.title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
}
