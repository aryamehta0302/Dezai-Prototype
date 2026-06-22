import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

export type ActivityType =
  | 'LESSON_COMPLETED'
  | 'ASSESSMENT_STARTED'
  | 'ASSESSMENT_COMPLETED'
  | 'ASSESSMENT_PASSED'
  | 'ASSESSMENT_FAILED'
  | 'MODULE_COMPLETED'
  | 'PROGRAM_COMPLETED'
  | 'ENROLLMENT'
  | 'STREAK_MILESTONE'
  | 'XP_MILESTONE'
  | 'BOOKMARK_ADDED'
  | 'NOTE_CREATED';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  timestamp: Date;
  description: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class LearningActivityService {
  constructor(private prisma: PrismaService) {}

  async getActivityTimeline(
    userId: string,
    options?: { limit?: number; offset?: number; types?: ActivityType[] },
  ): Promise<ActivityEvent[]> {
    const limit = options?.limit ?? 20;
    const offset = options?.offset ?? 0;
    const activities: ActivityEvent[] = [];

    const lessonProgresses = await this.prisma.progress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: { title: true, module: { select: { title: true } } },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    for (const p of lessonProgresses) {
      activities.push({
        id: `lesson-${p.id}`,
        type: 'LESSON_COMPLETED',
        timestamp: p.completedAt,
        description: `Completed lesson "${p.lesson.title}" in ${p.lesson.module.title}`,
        metadata: { lessonId: p.lessonId },
      });
    }

    const assessmentAttempts = await this.prisma.assessmentAttempt.findMany({
      where: { userId, completedAt: { not: null } },
      include: {
        assessment: { select: { title: true, module: { select: { title: true } } } },
      },
      orderBy: { completedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    for (const a of assessmentAttempts) {
      const passedType: ActivityType = a.passed ? 'ASSESSMENT_PASSED' : 'ASSESSMENT_FAILED';
      activities.push({
        id: `assessment-${a.id}`,
        type: passedType,
        timestamp: a.completedAt!,
        description: a.passed
          ? `Passed assessment "${a.assessment.title}" (Score: ${a.score}%)`
          : `Failed assessment "${a.assessment.title}" (Score: ${a.score}%)`,
        metadata: {
          assessmentId: a.assessmentId,
          score: a.score,
          passed: a.passed,
        },
      });
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: { program: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    for (const e of enrollments) {
      activities.push({
        id: `enrollment-${e.id}`,
        type: 'ENROLLMENT',
        timestamp: e.createdAt,
        description: `Enrolled in program "${e.program.title}"`,
        metadata: { programId: e.programId },
      });

      if (e.completedAt) {
        activities.push({
          id: `completion-${e.id}`,
          type: 'PROGRAM_COMPLETED',
          timestamp: e.completedAt,
          description: `Completed program "${e.program.title}"`,
          metadata: { programId: e.programId },
        });
      }
    }

    const xpTransactions = await this.prisma.xpTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    let xpAccumulated = 0;
    const xpMilestones = [100, 500, 1000, 2500, 5000, 10000];
    for (const t of xpTransactions) {
      xpAccumulated += t.amount;
      if (xpMilestones.includes(xpAccumulated)) {
        activities.push({
          id: `xp-${t.id}`,
          type: 'XP_MILESTONE',
          timestamp: t.createdAt,
          description: `Reached ${xpAccumulated} total XP!`,
          metadata: { xp: xpAccumulated },
        });
      }
    }

    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      include: { lesson: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    for (const b of bookmarks) {
      activities.push({
        id: `bookmark-${b.id}`,
        type: 'BOOKMARK_ADDED',
        timestamp: b.createdAt,
        description: `Bookmarked lesson "${b.lesson.title}"`,
        metadata: { lessonId: b.lessonId },
      });
    }

    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (options?.types && options.types.length > 0) {
      return activities.filter((a) => options.types!.includes(a.type)).slice(0, limit);
    }

    return activities.slice(0, limit);
  }
}
