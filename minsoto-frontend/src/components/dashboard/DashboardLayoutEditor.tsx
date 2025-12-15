'use client';

import { useState, useCallback, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Save, RotateCcw, X, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardWidgetConfig {
    id: string;
    type: string;
    position: { x: number; y: number };
    size: { w: number; h: number };
}

interface DashboardLayoutEditorProps {
    isOpen: boolean;
    onClose: () => void;
    currentWidgets: DashboardWidgetConfig[];
    onSave: (widgets: DashboardWidgetConfig[]) => Promise<void>;
}

const WIDGET_TEMPLATES = [
    { type: 'todays-focus', name: "Today's Focus", icon: '📋', defaultSize: { w: 2, h: 2 } },
    { type: 'stats', name: 'Stats Overview', icon: '📊', defaultSize: { w: 1, h: 1 } },
    { type: 'quick-actions', name: 'Quick Actions', icon: '⚡', defaultSize: { w: 1, h: 1 } },
    { type: 'goals', name: 'Goals', icon: '🎯', defaultSize: { w: 1, h: 2 } },
    { type: 'pomodoro', name: 'Pomodoro Timer', icon: '⏱️', defaultSize: { w: 1, h: 2 } },
];

export default function DashboardLayoutEditor({
    isOpen,
    onClose,
    currentWidgets,
    onSave
}: DashboardLayoutEditorProps) {
    const [localWidgets, setLocalWidgets] = useState<DashboardWidgetConfig[]>([]);
    const [showWidgetPicker, setShowWidgetPicker] = useState(false);
    const [saving, setSaving] = useState(false);

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

    const handleAddWidget = (template: typeof WIDGET_TEMPLATES[0]) => {
        const newWidget: DashboardWidgetConfig = {
            id: `widget-${Date.now()}`,
            type: template.type,
            position: { x: 0, y: Infinity },
            size: template.defaultSize
        };
        setLocalWidgets(prev => [...prev, newWidget]);
        setShowWidgetPicker(false);
    };

    const handleRemoveWidget = (widgetId: string) => {
        setLocalWidgets(prev => prev.filter(w => w.id !== widgetId));
    };

    const handleSave = async () => {
        setSaving(true);
        await onSave(localWidgets);
        setSaving(false);
        onClose();
    };

    const handleReset = () => {
        // Reset to default layout
        setLocalWidgets([
            { id: 'default-focus', type: 'todays-focus', position: { x: 0, y: 0 }, size: { w: 2, h: 2 } },
            { id: 'default-stats', type: 'stats', position: { x: 2, y: 0 }, size: { w: 1, h: 1 } },
            { id: 'default-actions', type: 'quick-actions', position: { x: 2, y: 1 }, size: { w: 1, h: 1 } },
            { id: 'default-goals', type: 'goals', position: { x: 3, y: 0 }, size: { w: 1, h: 2 } },
        ]);
    };

    const layouts = localWidgets.map(widget => ({
        i: widget.id,
        x: widget.position.x,
        y: widget.position.y,
        w: widget.size.w,
        h: widget.size.h,
        minW: 1, minH: 1, maxW: 4, maxH: 4
    }));

    const getWidgetName = (type: string) => {
        return WIDGET_TEMPLATES.find(t => t.type === type)?.name || type;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-[var(--background)] flex flex-col">
            {/* Toolbar */}
            <div className="glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-white">Customize Dashboard</h2>
                    <div className="h-4 w-px bg-white/20" />
                    <button
                        onClick={() => setShowWidgetPicker(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70 hover:text-white transition-all"
                    >
                        <Plus size={16} />
                        Add Widget
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg text-sm text-white/50 hover:text-white transition-all"
                    >
                        <RotateCcw size={14} />
                        Reset
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-white/50 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 btn-primary rounded-lg text-sm"
                    >
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save Layout'}
                    </button>
                </div>
            </div>

            {/* Grid Editor */}
            <div className="flex-1 overflow-auto p-6">
                {localWidgets.length > 0 ? (
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={{ lg: layouts }}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                        cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
                        rowHeight={180}
                        isDraggable={true}
                        isResizable={true}
                        margin={[16, 16]}
                        onLayoutChange={handleLayoutChange}
                    >
                        {localWidgets.map((widget) => (
                            <div key={widget.id} className="relative group">
                                <div className="glass-panel rounded-xl h-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-white/20 hover:border-white/40 transition-colors">
                                    <span className="text-2xl mb-2">
                                        {WIDGET_TEMPLATES.find(t => t.type === widget.type)?.icon || '📦'}
                                    </span>
                                    <span className="text-sm text-white/60">{getWidgetName(widget.type)}</span>
                                    <span className="text-xs text-white/30 mt-1">{widget.size.w}×{widget.size.h}</span>
                                </div>
                                {/* Delete button */}
                                <button
                                    onClick={() => handleRemoveWidget(widget.id)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={14} className="text-white" />
                                </button>
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-center border-2 border-dashed border-white/10 rounded-2xl">
                        <p className="text-white/40 mb-4">No widgets added</p>
                        <button
                            onClick={() => setShowWidgetPicker(true)}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white/70"
                        >
                            Add Your First Widget
                        </button>
                    </div>
                )}
            </div>

            {/* Widget Picker Modal */}
            <AnimatePresence>
                {showWidgetPicker && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 z-50"
                            onClick={() => setShowWidgetPicker(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md glass-panel rounded-2xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">Add Widget</h3>
                                <button onClick={() => setShowWidgetPicker(false)} className="p-2 hover:bg-white/10 rounded-lg">
                                    <X size={18} className="text-white/60" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {WIDGET_TEMPLATES.map((template) => (
                                    <button
                                        key={template.type}
                                        onClick={() => handleAddWidget(template)}
                                        className="p-4 glass-panel rounded-xl hover:bg-white/10 transition-all text-left"
                                    >
                                        <span className="text-2xl mb-2 block">{template.icon}</span>
                                        <span className="text-sm text-white">{template.name}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
