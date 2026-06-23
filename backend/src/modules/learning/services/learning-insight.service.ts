import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export interface StudentInsight {
  id: string;
  type: 'PERFORMANCE' | 'PATTERN' | 'MILESTONE' | 'COMPARISON' | 'WARNING' | 'ENCOURAGEMENT';
  title: string;
  message: string;
  severity: 'positive' | 'neutral' | 'negative';
  createdAt: Date;
}

@Injectable()
export class LearningInsightService {
  constructor(private prisma: PrismaService) {}

  async getInsights(userId: string): Promise<StudentInsight[]> {
    const insights: StudentInsight[] = [];
    const now = new Date();

    const progressCount = await this.prisma.progress.count({ where: { userId } });
    const passedAssessments = await this.prisma.assessmentAttempt.count({
      where: { userId, passed: true },
    });

    const totalAttempts = await this.prisma.assessmentAttempt.count({
      where: { userId, completedAt: { not: null } },
    });

    const allAttempts = await this.prisma.assessmentAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      select: { score: true },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, streakCount: true, createdAt: true },
    });

    if (!user) return [];

    if (progressCount >= 10) {
      insights.push({
        id: 'milestone-10-lessons',
        type: 'MILESTONE',
        title: '10 Lessons Completed',
        message: 'You\'ve completed 10 lessons! Keep building momentum.',
        severity: 'positive',
        createdAt: now,
      });
    }

    if (totalAttempts > 0) {
      const passRate = Math.round((passedAssessments / totalAttempts) * 100);

      if (passRate >= 80) {
        insights.push({
          id: 'performance-high',
          type: 'PERFORMANCE',
          title: 'Strong Assessment Performance',
          message: `You're passing ${passRate}% of your assessments — excellent work!`,
          severity: 'positive',
          createdAt: now,
        });
      } else if (passRate < 50 && totalAttempts >= 3) {
        insights.push({
          id: 'performance-low',
          type: 'WARNING',
          title: 'Assessment Performance Needs Attention',
          message: `Your pass rate is ${passRate}%. Consider reviewing material before retaking.`,
          severity: 'negative',
          createdAt: now,
        });
      }
    }

    const avgScore = allAttempts.length > 0
      ? Math.round(allAttempts.reduce((s, a) => s + a.score, 0) / allAttempts.length)
      : 0;

    if (avgScore > 0) {
      insights.push({
        id: 'avg-score',
        type: 'PERFORMANCE',
        title: 'Average Score',
        message: `Your average assessment score is ${avgScore}% across ${allAttempts.length} attempts.`,
        severity: avgScore >= 70 ? 'positive' : 'negative',
        createdAt: now,
      });
    }

    if (user.streakCount >= 3) {
      insights.push({
        id: 'streak-positive',
        type: 'ENCOURAGEMENT',
        title: `${user.streakCount}-Day Streak`,
        message: user.streakCount >= 7
          ? `Incredible ${user.streakCount}-day streak! You're on fire!`
          : `You're on a ${user.streakCount}-day learning streak. Keep going!`,
        severity: 'positive',
        createdAt: now,
      });
    }

    const allLessonProgress = await this.prisma.progress.findMany({
      where: { userId },
      include: { lesson: { select: { moduleId: true } } },
    });

    const moduleLessonMap: Record<string, number> = {};
    for (const p of allLessonProgress) {
      moduleLessonMap[p.lesson.moduleId] = (moduleLessonMap[p.lesson.moduleId] || 0) + 1;
    }

    const modulesWithProgress = Object.entries(moduleLessonMap);
    if (modulesWithProgress.length > 0) {
      const mostActiveModule = modulesWithProgress.sort((a, b) => b[1] - a[1])[0];
      const modInfo = await this.prisma.module.findUnique({
        where: { id: mostActiveModule[0] },
        select: { title: true },
      });
      if (modInfo) {
        insights.push({
          id: 'module-focus',
          type: 'PATTERN',
          title: 'Module Focus',
          message: `You've completed ${mostActiveModule[1]} lesson(s) in "${modInfo.title}" — your most active module.`,
          severity: 'positive',
          createdAt: now,
        });
      }
    }

    return insights;
  }
}
