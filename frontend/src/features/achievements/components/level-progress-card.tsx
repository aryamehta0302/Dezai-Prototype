"use client";

import { motion } from "framer-motion";
import { Zap, Trophy } from "lucide-react";
import { achievementService } from "../services/achievement.service";

interface LevelProgressCardProps {
    xp: number;
}

export function LevelProgressCard({ xp }: LevelProgressCardProps) {
    const { level, progress, currentLevelXp, nextLevelXp } = achievementService.calculateLevel(xp);

    return (
        <div className="relative overflow-hidden card-elevation p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Current Level</span>
                        <div className="flex items-center gap-2">
                            <h3 className="text-3xl font-bold text-on-surface">Level {level}</h3>
                            <div className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                                PRO
                            </div>
                        </div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-surface shadow-sm border border-border-light flex items-center justify-center">
                        <Trophy className="h-6 w-6 text-primary" />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted font-medium">{currentLevelXp} / {nextLevelXp} XP</span>
                        <span className="text-primary font-bold">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 w-full bg-surface-low rounded-full overflow-hidden border border-border-light">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-primary to-primary-light relative"
                        >
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)25%,transparent 25%,transparent 50%,rgba(255,255,255,0.2)50%,rgba(255,255,255,0.2)75%,transparent 75%,transparent)] bg-[length:1rem_1rem] animate-pulse" />
                        </motion.div>
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center gap-1.5">
                        <Zap className="h-4 w-4 text-warning fill-warning/20" />
                        <span className="text-sm font-medium text-on-surface">{xp} Total XP</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-muted/40" />
                    <span className="text-sm text-muted">Next level: {nextLevelXp - currentLevelXp} XP remaining</span>
                </div>
            </div>

            {/* Decorative Background Elements */}
            <div className="absolute -right-4 -bottom-4 h-32 w-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -left-4 -top-4 h-24 w-24 bg-primary/5 rounded-full blur-2xl" />
        </div>
    );
}
