"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { TrendingUp, Award, Target, Zap, Trophy, Users } from "lucide-react";
import type { DashboardStats } from "../../types/employee-learning.types";
import { employeeLearningService } from "../../services/employee-learning.service";

interface Props {
  stats: DashboardStats;
}

export function EmployeeStatsWidget({ stats }: Props) {
  const level = employeeLearningService.calculateLevel(stats.totalXpEarned);

  const cards = [
    {
      title: "Assessments Passed",
      value: stats.assessmentsPassed,
      subtitle: `of ${stats.totalAssessmentsAvailable} available`,
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Credentials Earned",
      value: stats.credentialsEarned,
      subtitle: "compliance certifications",
      icon: Award,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Total XP",
      value: stats.totalXpEarned.toLocaleString(),
      subtitle: `Level ${level.level}`,
      icon: Zap,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Current Streak",
      value: `${stats.currentStreak}`,
      subtitle: "consecutive days",
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Org Rank",
      value: stats.orgRank ? `#${stats.orgRank}` : "—",
      subtitle: "in your organization",
      icon: Users,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Tracks Completed",
      value: stats.trackProgress.filter((t) => t.completionPercentage === 100).length,
      subtitle: `of ${stats.trackProgress.length} tracks`,
      icon: Trophy,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-1.5 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
