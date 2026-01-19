'use client';

import { useState } from 'react';
import BaseWidget from './BaseWidget';
import { Type, ChevronDown } from 'lucide-react';

interface TextWidgetProps {
    id: string;
    visibility: 'public' | 'private';
    isEditMode: boolean;
    isOwner: boolean;
    onVisibilityToggle?: () => void;
    onDelete?: () => void;
    config: {
        text?: string;
        fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
        fontStyle?: 'normal' | 'italic';
        fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
        textAlign?: 'left' | 'center' | 'right';
    };
    onUpdateConfig?: (id: string, config: TextWidgetProps['config']) => void;
}

const FONT_SIZES = [
    { value: 'sm', label: 'Small' },
    { value: 'base', label: 'Normal' },
    { value: 'lg', label: 'Large' },
    { value: 'xl', label: 'Extra Large' },
    { value: '2xl', label: 'Huge' }
];

const FONT_WEIGHTS = [
    { value: 'normal', label: 'Regular' },
    { value: 'medium', label: 'Medium' },
    { value: 'semibold', label: 'Semibold' },
    { value: 'bold', label: 'Bold' }
];

export default function TextWidget({
    id,
    visibility,
    isEditMode,
    isOwner,
    onVisibilityToggle,
    onDelete,
    config,
    onUpdateConfig
}: TextWidgetProps) {
    const [showOptions, setShowOptions] = useState(false);

    const text = config.text || 'Click to add your text...';
    const fontSize = config.fontSize || 'base';
    const fontStyle = config.fontStyle || 'normal';
    const fontWeight = config.fontWeight || 'normal';
    const textAlign = config.textAlign || 'center';

    const updateConfig = (updates: Partial<TextWidgetProps['config']>) => {
        onUpdateConfig?.(id, { ...config, ...updates });
    };

    const fontSizeClass = {
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl'
    }[fontSize];

    const fontWeightClass = {
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold'
    }[fontWeight];

    const textAlignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
    }[textAlign];

    return (
        <BaseWidget
            id={id}
            title="Text"
            visibility={visibility}
            isEditMode={isEditMode}
            isOwner={isOwner}
            onVisibilityToggle={onVisibilityToggle}
            onDelete={onDelete}
        >
            <div className="h-full flex flex-col">
                {/* Options toggle in edit mode */}
                {isEditMode && isOwner && (
                    <button
                        onClick={() => setShowOptions(!showOptions)}
                        className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 mb-2 self-start"
                    >
                        <Type size={12} />
                        Options
                        <ChevronDown size={12} className={`transition-transform ${showOptions ? 'rotate-180' : ''}`} />
                    </button>
                )}

                {/* Options panel */}
                {showOptions && isEditMode && (
                    <div className="mb-3 p-3 bg-white/5 rounded-lg space-y-3 text-xs">
                        {/* Font Size */}
                        <div className="flex items-center gap-2">
                            <span className="text-white/40 w-16">Size:</span>
                            <div className="flex gap-1 flex-wrap">
                                {FONT_SIZES.map(size => (
                                    <button
                                        key={size.value}
                                        onClick={() => updateConfig({ fontSize: size.value as TextWidgetProps['config']['fontSize'] })}
                                        className={`px-2 py-1 rounded ${fontSize === size.value ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'}`}
                                    >
                                        {size.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Font Weight */}
                        <div className="flex items-center gap-2">
                            <span className="text-white/40 w-16">Weight:</span>
                            <div className="flex gap-1 flex-wrap">
                                {FONT_WEIGHTS.map(weight => (
                                    <button
                                        key={weight.value}
                                        onClick={() => updateConfig({ fontWeight: weight.value as TextWidgetProps['config']['fontWeight'] })}
                                        className={`px-2 py-1 rounded ${fontWeight === weight.value ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'}`}
                                    >
                                        {weight.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Italic + Align */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => updateConfig({ fontStyle: fontStyle === 'italic' ? 'normal' : 'italic' })}
                                className={`px-2 py-1 rounded italic ${fontStyle === 'italic' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'}`}
                            >
                                Italic
                            </button>
                            <div className="flex gap-1">
                                {(['left', 'center', 'right'] as const).map(align => (
                                    <button
                                        key={align}
                                        onClick={() => updateConfig({ textAlign: align })}
                                        className={`px-2 py-1 rounded ${textAlign === align ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'}`}
                                    >
                                        {align.charAt(0).toUpperCase() + align.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Text content */}
                <div className="flex-1 flex items-center justify-center">
                    {isEditMode ? (
                        <textarea
                            value={config.text || ''}
                            onChange={(e) => updateConfig({ text: e.target.value })}
                            placeholder="Enter your quote or text..."
                            className={`w-full h-full bg-transparent resize-none outline-none text-white/90 placeholder:text-white/30 ${fontSizeClass} ${fontWeightClass} ${textAlignClass} ${fontStyle === 'italic' ? 'italic' : ''}`}
                        />
                    ) : (
                        <p className={`text-white/90 leading-relaxed ${fontSizeClass} ${fontWeightClass} ${textAlignClass} ${fontStyle === 'italic' ? 'italic' : ''} whitespace-pre-wrap`}>
                            {text}
                        </p>
                    )}
                </div>
            </div>
        </BaseWidget>
    );
}
