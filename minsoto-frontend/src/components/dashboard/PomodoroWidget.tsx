'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

const DEFAULT_WORK = 25;
const DEFAULT_BREAK = 5;

export default function PomodoroWidget() {
    const [workMinutes, setWorkMinutes] = useState(DEFAULT_WORK);
    const [breakMinutes, setBreakMinutes] = useState(DEFAULT_BREAK);
    const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [sessions, setSessions] = useState(0);
    const [showSettings, setShowSettings] = useState(false);

    const totalTime = isBreak ? breakMinutes * 60 : workMinutes * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;

    // Update user status when focus mode changes
    const updateStatus = useCallback(async (status: 'focus' | 'online' | 'idle') => {
        try {
            await api.post('/user/status/', {
                status,
                status_message: status === 'focus' ? '🍅 Pomodoro session' : ''
            });
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isRunning) {
            // Timer complete
            if (!isBreak) {
                setSessions((prev) => prev + 1);
                setIsBreak(true);
                setTimeLeft(breakMinutes * 60);
                updateStatus('idle'); // Break time
            } else {
                setIsBreak(false);
                setTimeLeft(workMinutes * 60);
            }
            setIsRunning(false);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRunning, timeLeft, isBreak, updateStatus, workMinutes, breakMinutes]);

    const toggleTimer = useCallback(() => {
        setIsRunning((prev) => {
            const newState = !prev;
            if (newState && !isBreak) {
                updateStatus('focus');
            } else if (!newState) {
                updateStatus('online');
            }
            return newState;
        });
    }, [isBreak, updateStatus]);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setIsBreak(false);
        setTimeLeft(workMinutes * 60);
        updateStatus('online');
    }, [updateStatus, workMinutes]);

    const handleSettingsSave = () => {
        setTimeLeft(workMinutes * 60);
        setIsBreak(false);
        setIsRunning(false);
        setShowSettings(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {isBreak ? (
                        <Coffee size={16} className="text-emerald-400" />
                    ) : (
                        <Zap size={16} className="text-amber-400" />
                    )}
                    <h2 className="text-sm font-medium text-white/60 uppercase tracking-wide">
                        {isBreak ? 'Break' : 'Focus'}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">
                        {sessions} session{sessions !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                        title="Settings"
                    >
                        <Settings size={14} className="text-white/40 hover:text-white/60" />
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="mb-4 p-3 bg-white/5 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50">Work (min)</span>
                        <input
                            type="number"
                            value={workMinutes}
                            onChange={(e) => setWorkMinutes(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                            className="w-16 px-2 py-1 bg-white/10 rounded text-center text-sm text-white border border-white/10"
                            min={1}
                            max={60}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-white/50">Break (min)</span>
                        <input
                            type="number"
                            value={breakMinutes}
                            onChange={(e) => setBreakMinutes(Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                            className="w-16 px-2 py-1 bg-white/10 rounded text-center text-sm text-white border border-white/10"
                            min={1}
                            max={30}
                        />
                    </div>
                    <button
                        onClick={handleSettingsSave}
                        className="w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs rounded-lg transition-colors"
                    >
                        Apply
                    </button>
                </div>
            )}

            {/* Timer Circle */}
            <div className="flex-1 flex items-center justify-center">
                <div className="relative">
                    <svg width="120" height="120" className="transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            className="text-white/10"
                        />
                        {/* Progress circle */}
                        <motion.circle
                            cx="60"
                            cy="60"
                            r="45"
                            stroke="currentColor"
                            strokeWidth="6"
                            fill="none"
                            strokeLinecap="round"
                            className={isBreak ? 'text-emerald-400' : 'text-amber-400'}
                            style={{
                                strokeDasharray: circumference,
                                strokeDashoffset,
                            }}
                        />
                    </svg>
                    {/* Time display */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-mono font-bold text-white">
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mt-4">
                <button
                    onClick={resetTimer}
                    className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    title="Reset"
                >
                    <RotateCcw size={16} className="text-white/60" />
                </button>
                <button
                    onClick={toggleTimer}
                    className={`p-4 rounded-full transition-all ${isRunning
                        ? 'bg-white/10 hover:bg-white/20'
                        : isBreak
                            ? 'bg-emerald-500 hover:bg-emerald-400'
                            : 'bg-amber-500 hover:bg-amber-400'
                        }`}
                >
                    {isRunning ? (
                        <Pause size={20} className="text-white" />
                    ) : (
                        <Play size={20} className="text-white ml-0.5" />
                    )}
                </button>
                <div className="w-[38px]" /> {/* Spacer for centering */}
            </div>
        </div>
    );
}
