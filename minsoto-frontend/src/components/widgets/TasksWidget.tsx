'use client';

import BaseWidget from './BaseWidget';
import { Circle, CheckCircle, AlertCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority?: string;
  image_url?: string;
}

interface TasksWidgetProps {
  id: string;
  visibility: 'public' | 'private';
  isEditMode: boolean;
  isOwner: boolean;
  onVisibilityToggle?: () => void;
  onDelete?: () => void;
  tasks: Task[];
}

export default function TasksWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  onVisibilityToggle,
  onDelete,
  tasks
}: TasksWidgetProps) {
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <BaseWidget
      id={id}
      title="Active Tasks"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
    >
      <div className="h-full flex flex-col">
        {/* Badge Summary */}
        <div className="flex gap-2 mb-4">
          <span className="px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {todoTasks.length} To Do
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-white/50 border border-white/10">
            {completedTasks.length} Done
          </span>
        </div>

        {/* Task list */}
        <div className="space-y-2 overflow-auto flex-1 custom-scrollbar pr-1">
          {tasks.slice(0, 6).map((task) => (
            <div
              key={task.id}
              className={`flex flex-col gap-2 p-3 rounded-lg transition-colors ${task.status === 'completed'
                ? 'opacity-40 bg-transparent'
                : 'bg-white/5 border border-white/5'
                }`}
            >
              {/* Task Image Cover */}
              {task.image_url && (
                <div className="relative w-full h-24 rounded-md overflow-hidden mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={task.image_url} alt="Task cover" className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center gap-3">
                {task.status === 'completed' ? (
                  <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                ) : (
                  <Circle size={14} className="text-white/20 flex-shrink-0" />
                )}

                <span className={`text-xs flex-1 truncate ${task.status === 'completed' ? 'line-through' : 'text-white/90'}`}>
                  {task.title}
                </span>

                {task.priority === 'high' && (
                  <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
                )}
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-4 text-xs text-white/20">No tasks found</div>
          )}
        </div>
      </div>
    </BaseWidget>
  );
}
