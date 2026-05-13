'use client';

import { useState } from 'react';
import Image from 'next/image';
import BaseWidget from './BaseWidget';
import { Circle, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useGlobalActionsStore } from '@/stores/globalActionsStore';

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
  onUpdate?: () => void;
  tasks: Task[];
}

export default function TasksWidget({
  id,
  visibility,
  isEditMode,
  isOwner,
  onVisibilityToggle,
  onDelete,
  onUpdate,
  tasks
}: TasksWidgetProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { openTaskModal } = useGlobalActionsStore();

  const handleToggle = async (taskId: string, currentStatus: string) => {
    if (!isOwner) return;
    setLoading(taskId);
    try {
      const newStatus = currentStatus === 'completed' ? 'todo' : 'completed';
      const { default: api } = await import('@/lib/api');
      await api.patch(`/tasks/${taskId}/`, { status: newStatus });
      onUpdate?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !isOwner) return;
    setIsAdding(true);
    try {
      const { default: api } = await import('@/lib/api');
      await api.post('/tasks/', { title: newTaskTitle.trim(), status: 'todo' });
      setNewTaskTitle('');
      onUpdate?.();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  // Show active and newest tasks first
  const sortedTasks = [...tasks].reverse().sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (a.status !== 'completed' && b.status === 'completed') return -1;
    return 0;
  });

  return (
    <BaseWidget
      id={id}
      title="Active Tasks"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
      headerAction={
        isOwner && (
          <button
            onClick={openTaskModal}
            className="p-1 hover:bg-white/10 rounded transition-colors text-white/50 hover:text-white"
            title="Detailed Task Creation"
          >
            <Plus size={14} />
          </button>
        )
      }
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
          {sortedTasks.slice(0, 6).map((task) => (
            <div
              key={task.id}
              onClick={() => handleToggle(task.id, task.status)}
              className={`flex flex-col gap-2 p-3 rounded-lg transition-colors ${
                isOwner ? 'cursor-pointer hover:bg-white/10' : ''
              } ${task.status === 'completed'
                ? 'opacity-40 bg-transparent'
                : 'bg-white/5 border border-white/5'
                }`}
            >
              {/* Task Image Cover */}
              {task.image_url && (
                <div className="relative w-full h-24 rounded-md overflow-hidden mb-2">
                  <Image 
                    src={task.image_url} 
                    alt="Task cover" 
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover" 
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                {loading === task.id ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin flex-shrink-0" />
                ) : task.status === 'completed' ? (
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

          {tasks.length === 0 && !isOwner && (
            <div className="text-center py-4 text-xs text-white/20">No tasks found</div>
          )}
        </div>

        {/* Add Task Input */}
        {isOwner && (
          <form onSubmit={handleAddTask} className="mt-3 relative">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-[var(--accent-primary)]/50 transition-colors"
              disabled={isAdding}
            />
            {isAdding && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            )}
          </form>
        )}
      </div>
    </BaseWidget>
  );
}
