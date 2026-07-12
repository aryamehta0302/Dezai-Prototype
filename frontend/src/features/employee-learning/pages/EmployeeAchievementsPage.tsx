"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Trophy, Loader2 } from "lucide-react";
import { employeeLearningApi } from "../services/employee-learning-api.service";
import { LevelProgressCard } from "@/features/achievements/components/level-progress-card";
import { employeeLearningService } from "../services/employee-learning.service";

export default function EmployeeAchievementsPage() {
  const [stats, setStats] = useState<{ xp: number; currentStreak: number; assessmentsPassed: number; credentialsEarned: number; orgRank: number | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeLearningApi.getStats().then((res) => {
      setStats(res as unknown as typeof stats);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">Failed to load achievements</p>
      </div>
    );
  }

  const level = employeeLearningService.calculateLevel(stats.xp);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Achievements</h1>
        <p className="text-sm text-muted-foreground">Your compliance training milestones</p>
      </div>

      <LevelProgressCard
        xp={stats.xp}
        levelInfo={{
          level: level.level,
          currentLevelXp: level.currentXp,
          nextLevelXp: level.nextLevelXp,
          progress: level.progress,
        }}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card className="p-4 text-center">
          <Trophy className="mx-auto mb-2 h-6 w-6 text-amber-500" />
          <div className="text-2xl font-bold">{stats.credentialsEarned}</div>
          <div className="text-xs text-muted-foreground">Credentials</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{stats.assessmentsPassed}</div>
          <div className="text-xs text-muted-foreground">Assessments Passed</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{stats.currentStreak}</div>
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{stats.orgRank ? `#${stats.orgRank}` : "—"}</div>
          <div className="text-xs text-muted-foreground">Org Rank</div>
        </Card>
      </div>
    </div>
  );
}
