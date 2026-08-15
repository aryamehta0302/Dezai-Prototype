import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import type { AchievementCriteria, EvaluationResult } from '../types/achievement.types';

@Injectable()
export class RulesEngineService {
  constructor(private prisma: PrismaService) {}

  async evaluate(userId: string, criteria: AchievementCriteria): Promise<EvaluationResult> {
    switch (criteria.type) {
      case 'lessons_completed':
        return this.evaluateCount(
          criteria,
          () => this.prisma.progress.count({ where: { userId } }),
        );
      case 'modules_completed':
        return this.evaluateModulesCompleted(userId, criteria);
      case 'programs_completed':
        return this.evaluateCount(
          criteria,
          () => this.prisma.enrollment.count({ where: { userId, progress: 100 } }),
        );
      case 'xp_earned':
        return this.evaluateSum(
          criteria,
          () =>
            this.prisma.xpTransaction
              .aggregate({ where: { userId }, _sum: { amount: true } })
              .then((r) => r._sum.amount ?? 0),
        );
      case 'streak_days':
        return this.evaluateValue(
          criteria,
          () =>
            this.prisma.user
              .findUnique({ where: { id: userId }, select: { streakCount: true } })
              .then((u) => u?.streakCount ?? 0),
        );
      case 'assessments_passed':
        return this.evaluateCount(
          criteria,
          () => this.prisma.assessmentAttempt.count({ where: { userId, passed: true } }),
        );
      case 'perfect_scores':
        return this.evaluateCount(
          criteria,
          () => this.prisma.assessmentAttempt.count({ where: { userId, score: 100 } }),
        );
      case 'notes_created':
        return this.evaluateCount(
          criteria,
          () => this.prisma.note.count({ where: { userId } }),
        );
      case 'bookmarks_added':
        return this.evaluateCount(
          criteria,
          () => this.prisma.bookmark.count({ where: { userId } }),
        );
    }
  }

  private async evaluateModulesCompleted(userId: string, criteria: AchievementCriteria): Promise<EvaluationResult> {
    const modules = await this.prisma.module.findMany({
      select: {
        id: true,
        lessons: { select: { id: true } },
      },
    });

    const completedLessonIds = new Set(
      (await this.prisma.progress.findMany({
        where: { userId },
        select: { lessonId: true },
      })).map((p) => p.lessonId),
    );

    let completedModules = 0;
    for (const mod of modules) {
      if (mod.lessons.length === 0) continue;
      const allCompleted = mod.lessons.every((l) => completedLessonIds.has(l.id));
      if (allCompleted) completedModules++;
    }

    const current = completedModules;
    return {
      current,
      target: criteria.target,
      progress: this.calculateProgress(current, criteria.target),
      isUnlocked: current >= criteria.target,
    };
  }

  private async evaluateCount(
    criteria: AchievementCriteria,
    countFn: () => Promise<number>,
  ): Promise<EvaluationResult> {
    const current = await countFn();
    return {
      current,
      target: criteria.target,
      progress: this.calculateProgress(current, criteria.target),
      isUnlocked: current >= criteria.target,
    };
  }

  private async evaluateSum(
    criteria: AchievementCriteria,
    sumFn: () => Promise<number>,
  ): Promise<EvaluationResult> {
    const current = await sumFn();
    return {
      current,
      target: criteria.target,
      progress: this.calculateProgress(current, criteria.target),
      isUnlocked: current >= criteria.target,
    };
  }

  private async evaluateValue(
    criteria: AchievementCriteria,
    valueFn: () => Promise<number>,
  ): Promise<EvaluationResult> {
    const current = await valueFn();
    return {
      current,
      target: criteria.target,
      progress: this.calculateProgress(current, criteria.target),
      isUnlocked: current >= criteria.target,
    };
  }

  private calculateProgress(current: number, target: number): number {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  }
}
