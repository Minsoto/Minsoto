'use client';

import BaseWidget from './BaseWidget';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'completed';
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

  return (
    <BaseWidget
      id={id}
      title="TASKS & PROJECTS"
      visibility={visibility}
      isEditMode={isEditMode}
      isOwner={isOwner}
      onVisibilityToggle={onVisibilityToggle}
      onDelete={onDelete}
    >
      <div className="grid grid-cols-3 gap-2 h-full overflow-hidden">
        {/* To Do Column */}
        <div className="border border-gray-800 p-2">
          <div className="text-xs opacity-50 mb-2">To Do</div>
          <div className="space-y-1">
            {categorizedTasks.todo.slice(0, 4).map(task => (
              <div key={task.id} className="text-xs opacity-70 truncate">
                {task.title}
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="border border-gray-800 p-2">
          <div className="text-xs opacity-50 mb-2">In Progress</div>
          <div className="space-y-1">
            {categorizedTasks.in_progress.slice(0, 4).map(task => (
              <div key={task.id} className="text-xs opacity-70 truncate">
                {task.title}
              </div>
            ))}
          </div>
        </div>

        {/* Completed Column */}
        <div className="border border-gray-800 p-2">
          <div className="text-xs opacity-50 mb-2">Completed</div>
          <div className="space-y-1">
            {categorizedTasks.completed.slice(0, 4).map(task => (
              <div key={task.id} className="text-xs opacity-70 line-through truncate">
                {task.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseWidget>
  );
}
