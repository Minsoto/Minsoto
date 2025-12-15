'use client';

import { useState, useCallback, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Save, RotateCcw } from 'lucide-react';

import WidgetLibrary from './WidgetLibrary';
import TasksWidget from '../../components/widgets/TasksWidget';
import HabitStreakWidget from '../../components/widgets/HabitStreakWidget';
import HabitGraphWidget from '../../components/widgets/HabitGraphWidget';
import InterestsWidget from '../../components/widgets/InterestsWidget';
import ImageWidget from '../../components/widgets/ImageWidget';
import StreakShowcaseWidget from '../../components/widgets/StreakShowcaseWidget';
import TextWidget from '../../components/widgets/TextWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface Widget {
    id: string;
    type: string;
    position: { x: number; y: number };
    size: { w: number; h: number };
    visibility: 'public' | 'private';
    config: Record<string, unknown>;
}

interface LayoutEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentWidgets: Widget[];
    onSave: (widgets: Widget[]) => Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    widgetData: any;
}

export default function LayoutEditorModal({
    isOpen,
    onClose,
    currentWidgets,
    onSave,
    widgetData
}: LayoutEditorModalProps) {
    const [localWidgets, setLocalWidgets] = useState<Widget[]>([]);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // Initialize state when opening
    useEffect(() => {
        if (isOpen) {
            setLocalWidgets(JSON.parse(JSON.stringify(currentWidgets)));
        }
    }, [isOpen, currentWidgets]);

    const handleLayoutChange = useCallback((layout: Layout[]) => {
        setLocalWidgets(prev => prev.map(widget => {
            const layoutItem = layout.find(l => l.i === widget.id);
            return layoutItem ? {
                ...widget,
                position: { x: layoutItem.x, y: layoutItem.y },
                size: { w: layoutItem.w, h: layoutItem.h }
            } : widget;
        }));
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAddWidget = (template: any) => {
        const newWidget: Widget = {
            id: `widget-${Date.now()}`,
            type: template.type,
            position: { x: 0, y: Infinity }, // Grid layout handles placement
            size: template.defaultSize,
            visibility: 'public',
            config: {}
        };
        setLocalWidgets(prev => [...prev, newWidget]);
    };

    const handleRemoveWidget = (widgetId: string) => {
        setLocalWidgets(prev => prev.filter(w => w.id !== widgetId));
    };

    const handleToggleVisibility = (widgetId: string) => {
        setLocalWidgets(prev => prev.map(w =>
            w.id === widgetId ? { ...w, visibility: w.visibility === 'public' ? 'private' : 'public' } : w
        ));
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleConfigUpdate = (widgetId: string, newConfig: any) => {
        setLocalWidgets(prev => prev.map(w =>
            w.id === widgetId ? { ...w, config: newConfig } : w
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        await onSave(localWidgets);
        setSaving(false);
        onClose();
    };

    const layouts = localWidgets.map(widget => ({
        i: widget.id,
        x: widget.position.x,
        y: widget.position.y,
        w: widget.size.w,
        h: widget.size.h,
        minW: 1, minH: 1, maxW: 4, maxH: 4
    }));

    // Reuse render logic - simplified
    const renderWidget = (widget: Widget) => {
        const props = {
            id: widget.id,
            visibility: widget.visibility,
            isEditMode: true,
            isOwner: true,
            onDelete: () => handleRemoveWidget(widget.id),
            onVisibilityToggle: () => handleToggleVisibility(widget.id),
            // Pass dummy data for preview
            tasks: widgetData.tasks || [],
            habits: widgetData.habits || [],
            interests: widgetData.interests || [],
            config: widget.config || {},
            onUpdateConfig: handleConfigUpdate
        };

        switch (widget.type) {
            case 'tasks': return <TasksWidget {...props} />;
            case 'habit-streak': {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const maxCurrent = Math.max(0, ...props.habits.map((h: any) => h.current_streak || 0));
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const maxLongest = Math.max(0, ...props.habits.map((h: any) => h.longest_streak || 0));
                return <HabitStreakWidget {...props} currentStreak={maxCurrent} longestStreak={maxLongest} />;
            }
            case 'streak-showcase': {
                const handleSelectHabit = (habitId: string) => {
                    handleConfigUpdate(widget.id, { ...widget.config, selectedHabitId: habitId });
                };
                return <StreakShowcaseWidget
                    {...props}
                    selectedHabitId={widget.config?.selectedHabitId as string | undefined}
                    onSelectHabit={handleSelectHabit}
                />;
            }
            case 'habit-graph': return <HabitGraphWidget {...props} />;
            case 'interests': return <InterestsWidget {...props} />;
            case 'image': return <ImageWidget {...props} config={widget.config || {}} onUpdateConfig={handleConfigUpdate} />;
            case 'text': return <TextWidget {...props} config={widget.config || {}} onUpdateConfig={handleConfigUpdate} />;
            case 'goals': return <div className="glass-panel h-full p-4 flex items-center justify-center text-white/40 text-sm">Goals widget (edit mode)</div>;
            default: return <div className="border border-red-500 p-2 text-xs">Unknown</div>;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-[#000000] flex flex-col">
            {/* Toolbar */}
            <div className="bg-[#090910] border-b border-white/10 px-6 py-4 flex items-center justify-between z-50">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-bold text-white tracking-tight">Layout Editor</h2>
                    <div className="h-4 w-px bg-white/20" />
                    <button
                        onClick={() => setIsLibraryOpen(true)}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-sm transition-all"
                    >
                        + Add Widget
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setLocalWidgets(currentWidgets)}
                        className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors"
                        title="Reset Changes"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-white/50 hover:text-white text-sm transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-white text-black hover:bg-white/90 rounded-lg text-sm font-bold transition-all"
                    >
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save Layout'}
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-auto bg-[#050508] p-8 custom-scrollbar relative">
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

                <div className="max-w-[1400px] mx-auto min-h-[800px]">
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={{ lg: layouts }}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
                        rowHeight={160}
                        isDraggable={true}
                        isResizable={true}
                        onLayoutChange={handleLayoutChange}
                        draggableHandle=".cursor-move"
                        compactType="vertical"
                        preventCollision={false}
                        margin={[16, 16]}
                    >
                        {localWidgets.map(widget => (
                            <div key={widget.id} className="relative group">
                                {renderWidget(widget)}
                            </div>
                        ))}
                    </ResponsiveGridLayout>

                    {localWidgets.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed border-white/10 rounded-3xl">
                            <p className="text-white/30 text-lg">Empty Canvas</p>
                            <button onClick={() => setIsLibraryOpen(true)} className="mt-4 text-blue-400 hover:underline">
                                Open Widget Library
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <WidgetLibrary
                isOpen={isLibraryOpen}
                onClose={() => setIsLibraryOpen(false)}
                onAddWidget={handleAddWidget}
            />
        </div>
    );
}
