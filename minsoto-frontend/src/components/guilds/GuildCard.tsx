'use client';

import { motion } from 'framer-motion';
import { Users, Shield, Trophy, Zap, Crown, Star } from 'lucide-react';
import { Guild } from '@/types/guilds';
import { getMediaUrl } from '@/lib/media';
import { useRouter } from 'next/navigation';

interface GuildCardProps {
    guild: Guild;
    gradientClass?: string;
    TypeIcon?: any;
    compact?: boolean;
}

// Calculate level from XP
function getGuildLevel(xp: number): { level: number; name: string; progress: number } {
    const thresholds = [0, 500, 1500, 3000, 6000, 10000, 15000, 22000, 30000, 40000];
    const names = ['Starter', 'Growing', 'Active', 'Thriving', 'Established', 'Popular', 'Elite', 'Legendary', 'Mythic', 'Transcendent'];

    let level = 1;
    for (let i = 1; i < thresholds.length; i++) {
        if (xp >= thresholds[i]) level = i + 1;
        else break;
    }

    const currentThreshold = thresholds[level - 1] || 0;
    const nextThreshold = thresholds[level] || thresholds[thresholds.length - 1];
    const progress = nextThreshold > currentThreshold
        ? ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100
        : 100;

    return { level, name: names[level - 1] || 'Max', progress };
}

const LEVEL_COLORS: Record<number, string> = {
    1: 'from-gray-400 to-gray-500',
    2: 'from-green-400 to-emerald-500',
    3: 'from-blue-400 to-cyan-500',
    4: 'from-purple-400 to-violet-500',
    5: 'from-yellow-400 to-orange-500',
    6: 'from-pink-400 to-rose-500',
    7: 'from-cyan-400 to-blue-500',
    8: 'from-amber-400 to-yellow-500',
    9: 'from-fuchsia-400 to-purple-500',
    10: 'from-red-400 to-orange-500',
};

export default function GuildCard({ guild, gradientClass, TypeIcon, compact = false }: GuildCardProps) {
    const router = useRouter();
    const bannerUrl = getMediaUrl(guild.banner) || guild.banner_url;
    const logoUrl = getMediaUrl(guild.logo);
    const levelInfo = getGuildLevel(guild.total_xp || 0);
    const levelGradient = LEVEL_COLORS[levelInfo.level] || LEVEL_COLORS[1];

    if (compact) {
        return (
            <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => router.push(`/guilds/${guild.slug}`)}
                className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all"
            >
                <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-2xl overflow-hidden">
                    {logoUrl ? (
                        <img src={logoUrl} alt={guild.name} className="w-full h-full object-cover" />
                    ) : (
                        guild.icon || '🏰'
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{guild.name}</h3>
                    <p className="text-sm text-white/50">{guild.member_count} members</p>
                </div>
                <div className={`px-2 py-1 rounded-lg bg-gradient-to-r ${levelGradient} text-xs font-bold text-white`}>
                    Lv.{levelInfo.level}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            onClick={() => router.push(`/guilds/${guild.slug}`)}
            className="group bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-cyan-500/40 transition-all duration-300 relative shadow-xl hover:shadow-cyan-500/10"
        >
            {/* Banner */}
            <div className={`h-28 relative bg-gradient-to-r ${gradientClass || 'from-gray-800 to-gray-900'} overflow-hidden`}>
                {bannerUrl ? (
                    <motion.img
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        src={bannerUrl}
                        alt={`${guild.name} banner`}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

                {/* Level Badge */}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r ${levelGradient} text-xs font-bold text-white shadow-lg flex items-center gap-1`}>
                    <Zap size={12} />
                    Level {levelInfo.level}
                </div>

                {/* Verified Badge */}
                {guild.is_verified && (
                    <div className="absolute top-3 right-3 bg-cyan-500/90 backdrop-blur-md px-2 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 shadow-lg">
                        <Shield size={12} fill="currentColor" />
                        Verified
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 pt-10 relative">
                {/* Logo with Level Ring */}
                <div className="absolute -top-8 left-4">
                    <div className="relative">
                        {/* Level Progress Ring */}
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-white/10"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke="url(#levelGradient)"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={`${levelInfo.progress * 1.76} 176`}
                            />
                            <defs>
                                <linearGradient id="levelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#06b6d4" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                        </svg>
                        {/* Logo */}
                        <div className="absolute inset-2 rounded-full bg-gray-900 border-2 border-gray-800 overflow-hidden flex items-center justify-center group-hover:scale-105 transition-transform">
                            {logoUrl ? (
                                <img src={logoUrl} alt={guild.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-2xl">{guild.icon || '🏰'}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Type Icon */}
                {TypeIcon && (
                    <div className="absolute top-2 right-4 text-white/20 group-hover:text-cyan-400/50 transition-colors">
                        <TypeIcon size={20} />
                    </div>
                )}

                {/* Name & Description */}
                <div className="pl-14">
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                        {guild.name}
                    </h3>
                    <p className="text-sm text-white/50 line-clamp-2 mt-1 leading-relaxed h-10">
                        {guild.description || 'No description provided.'}
                    </p>
                </div>

                {/* Stats Row */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-1.5 text-sm text-white/60 bg-white/5 px-3 py-1.5 rounded-lg">
                        <Users size={14} className="text-cyan-400" />
                        <span>{guild.member_count}</span>
                    </div>
                    {(guild.total_xp || 0) > 0 && (
                        <div className="flex items-center gap-1.5 text-sm text-white/60 bg-white/5 px-3 py-1.5 rounded-lg">
                            <Trophy size={14} className="text-yellow-400" />
                            <span>{guild.total_xp?.toLocaleString()} XP</span>
                        </div>
                    )}
                    <div className="ml-auto text-xs text-white/40 capitalize">{guild.guild_type}</div>
                </div>
            </div>
        </motion.div>
    );
}
