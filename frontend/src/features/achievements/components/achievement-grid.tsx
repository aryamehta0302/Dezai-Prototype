"use client";

import { motion } from "framer-motion";
import { Achievement } from "../types/achievement.types";
import {
    Flame,
    Zap,
    Star,
    Trophy,
    GraduationCap,
    Lock,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

const ICON_MAP: Record<string, any> = {
    Flame,
    Zap,
    Star,
    Trophy,
    GraduationCap,
};

interface AchievementGridProps {
    achievements: Achievement[];
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => {
                const Icon = ICON_MAP[achievement.icon] || Trophy;

                return (
                    <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                            "group relative card-elevation p-5 transition-all duration-300",
                            achievement.isUnlocked
                                ? "bg-surface border-success/20 hover:border-success/40"
                                : "bg-surface-low border-border-light grayscale"
                        )}
                    >
                        <div className="flex gap-4">
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                                achievement.isUnlocked
                                    ? "bg-success/10 text-success"
                                    : "bg-muted/10 text-muted"
                            )}>
                                {achievement.isUnlocked ? (
                                    <Icon className="h-6 w-6" />
                                ) : (
                                    <Lock className="h-5 w-5" />
                                )}
                            </div>

                            <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-bold text-on-surface truncate">
                                        {achievement.title}
                                    </h4>
                                    {achievement.isUnlocked && (
                                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                    )}
                                </div>
                                <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                                    {achievement.description}
                                </p>

                                <div className="pt-2 space-y-1.5">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                        <span className="text-muted">
                                            {achievement.current} / {achievement.target}
                                        </span>
                                        <span className="text-primary-light">
                                            +{achievement.xpValue} XP
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-surface-low rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${achievement.progress}%` }}
                                            className={cn(
                                                "h-full rounded-full",
                                                achievement.isUnlocked ? "bg-success" : "bg-primary/30"
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rarity Label */}
                        <div className={cn(
                            "absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter",
                            achievement.rarity === "LEGENDARY" ? "bg-yellow-500/20 text-yellow-600" :
                                achievement.rarity === "EPIC" ? "bg-purple-500/20 text-purple-600" :
                                    achievement.rarity === "RARE" ? "bg-blue-500/20 text-blue-600" :
                                        "bg-slate-500/20 text-slate-600"
                        )}>
                            {achievement.rarity}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
