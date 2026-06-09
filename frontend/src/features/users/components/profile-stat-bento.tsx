"use client";

import { StatCard } from "@/shared/components/stat-card";
import { BookOpen, Trophy, Award, Zap, Flame, Clock } from "lucide-react";
import type { DashboardStats } from "@/features/learning/types/learning.types";

interface ProfileStatBentoProps {
  stats: DashboardStats;
}

export function ProfileStatBento({ stats }: ProfileStatBentoProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard title="Enrolled" value={stats.enrolledCourses} icon={BookOpen} />
      <StatCard title="Completed" value={stats.completedCourses} icon={Trophy} />
      <StatCard title="Certificates" value={stats.certificatesEarned} icon={Award} />
      <StatCard title="XP Earned" value={stats.xpEarned} icon={Zap} />
      <StatCard title="Streak" value={`${stats.learningStreak}d`} icon={Flame} />
      <StatCard title="Hours" value={stats.hoursLearned} icon={Clock} />
    </div>
  );
}
