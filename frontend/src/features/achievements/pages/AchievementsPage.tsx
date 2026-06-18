"use client";

import { PageContainer } from "@/shared/components/page-container";
import { LevelProgressCard } from "../components/level-progress-card";
import { AchievementGrid } from "../components/achievement-grid";
import { useAchievements } from "../hooks/useAchievements";
import { Trophy, ShieldCheck, Zap, Star } from "lucide-react";
import { motion } from "framer-motion";

export function AchievementsPage() {
    const { stats, achievements, unlockedCount, totalCount } = useAchievements();

    return (
        <PageContainer className="py-12 space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20 mb-2">
                    <Trophy className="h-8 w-8" />
                </div>
                <h1 className="text-4xl font-black text-on-surface tracking-tight">Achievements & Ranking</h1>
                <p className="text-muted text-lg">
                    Track your progress, unlock unique badges, and climb the ranks of elite Dezai learners.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <LevelProgressCard xp={stats.xp} />

                    <div className="card-elevation p-6 space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-success" />
                            Badge Statistics
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-surface-low p-3 rounded-lg border border-border-light">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center"><Star className="h-4 w-4 text-primary" /></div>
                                    <span className="text-sm font-medium">Common</span>
                                </div>
                                <span className="font-bold">3/3</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface-low p-3 rounded-lg border border-border-light">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded bg-blue-500/10 flex items-center justify-center"><Star className="h-4 w-4 text-blue-500" /></div>
                                    <span className="text-sm font-medium">Rare</span>
                                </div>
                                <span className="font-bold">1/2</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface-low p-3 rounded-lg border border-border-light">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded bg-purple-500/10 flex items-center justify-center"><Star className="h-4 w-4 text-purple-500" /></div>
                                    <span className="text-sm font-medium">Epic</span>
                                </div>
                                <span className="font-bold">0/1</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-8">
                    <section className="space-y-6">
                        <div className="flex items-center justify-between border-b border-border-light pb-4">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Zap className="h-6 w-6 text-warning" />
                                All Achievements
                            </h2>
                            <span className="text-sm font-medium text-muted">
                                {unlockedCount} of {totalCount} Unlocked
                            </span>
                        </div>
                        <AchievementGrid achievements={achievements} />
                    </section>
                </div>
            </div>
        </PageContainer>
    );
}
