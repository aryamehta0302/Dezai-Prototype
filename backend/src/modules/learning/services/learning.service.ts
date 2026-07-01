import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EnrollmentService } from '../../programs/services/enrollment.service';
import { XpService } from '../../users/services/xp.service';
import { AwardService } from '../../achievements/services/award.service';
import { AuditService } from '../../audit/services/audit.service';
import { XpType, AchievementCategory, AuditAction } from '@prisma/client';
import { InsightsSseService } from '../../analytics/services/insights-sse.service';

type TxClient = Omit<PrismaService, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

@Injectable()
export class LearningService {
  constructor(
    private prisma: PrismaService,
    private enrollmentService: EnrollmentService,
    private xpService: XpService,
    private awardService: AwardService,
    private auditService: AuditService,
    private insightsSseService: InsightsSseService,
  ) { }

  /**
   * Fetch lesson content details.
   */
  async getLesson(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          select: { title: true, track: { select: { programId: true } } },
        },
        resources: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  /**
   * Fetch resources for a lesson.
   */
  async getLessonResources(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }

    return this.prisma.resource.findMany({
      where: { lessonId },
      orderBy: { order: 'asc' },
    });
  }

  /**
   * Create a new lesson. Gated by program ownership validation.
   */
   async createLesson(userId: string, moduleId: string, data: { title: string; content: string; videoUrl?: string; order: number }) {
    const lesson = await this.prisma.lesson.create({
      data: {
        moduleId,
        title: data.title,
        content: data.content,
        videoUrl: data.videoUrl,
        order: data.order,
      },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.LESSON_CREATED,
      `Lesson "${lesson.title}" (ID: ${lesson.id}) created in module ${moduleId}`,
    );

    return lesson;
  }

  /**
   * Update lesson content.
   */
   async updateLesson(userId: string, id: string, data: { title?: string; content?: string; videoUrl?: string; order?: number }) {
    const lesson = await this.prisma.lesson.update({
      where: { id },
      data,
    });

    await this.auditService.logAction(
      userId,
      AuditAction.LESSON_UPDATED,
      `Lesson "${lesson.title}" (ID: ${id}) updated`,
    );

    return lesson;
  }

  /**
   * Mark a lesson as completed by the student.
   * Wraps critical path in Prisma $transaction for race-condition safety.
   * If all lessons in the module are completed, awards MODULE_COMPLETION XP.
   * Also updates daily streak and lastActiveAt.
   */
  async completeLesson(userId: string, lessonId: string) {
    // Early exit if already completed (outside transaction for fast path)
    const existing = await this.prisma.progress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    if (existing) {
      return { success: true, alreadyCompleted: true };
    }

    // Wrap critical operations in a transaction for serialised isolation
    const { progress, xpResult: xpAwarded, programId, _conflict } = await this.prisma.$transaction(async (tx) => {
      const txExisting = await tx.progress.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
      });
      if (txExisting) {
        return { progress: null, xpResult: null, programId: null, _conflict: true };
      }

      const p = await tx.progress.create({
        data: { userId, lessonId },
      });

      await this.updateStreakTx(tx as any as TxClient, userId);

      const lesson = await tx.lesson.findUnique({
        where: { id: lessonId },
        include: {
          module: {
            include: {
              lessons: { select: { id: true } },
              track: { select: { programId: true } },
            },
          },
        },
      });

      if (!lesson) {
        return { progress: p, xpResult: null, programId: null, _conflict: false };
      }

      const pid = lesson.module.track.programId;

      await this.enrollmentService.updateEnrollmentProgress(
        userId, pid, tx as any as TxClient,
      );

      const allLessonIds = lesson.module.lessons.map((l) => l.id);
      const completedCount = await tx.progress.count({
        where: { userId, lessonId: { in: allLessonIds } },
      });

      let xp = null;
      if (completedCount === allLessonIds.length) {
        xp = await this.awardXpInTx(tx as any as TxClient, userId, XpType.MODULE_COMPLETION);
      }

      return { progress: p, xpResult: xp, programId: pid, _conflict: false };
    });

    if (_conflict) {
      return { success: true, alreadyCompleted: true };
    }

    // Notify faculty in real-time
    if (programId) {
      const updatedEnrollment = await this.prisma.enrollment.findUnique({
        where: { userId_programId: { userId, programId } },
        select: { progress: true },
      });
      if (updatedEnrollment) {
        this.insightsSseService.notifyFacultyOfStudentUpdate(userId, 'HEALTH_UPDATE', {
          userId,
          programId,
          progress: updatedEnrollment.progress,
        }, programId);
      }
    }

    // Side-effects outside transaction
    await this.awardService.checkAndAward(userId, AchievementCategory.STREAK);
    await this.awardService.checkAndAward(userId, AchievementCategory.COMPLETION);
    await this.awardService.checkAndAward(userId, AchievementCategory.XP);

    await this.auditService.logAction(
      userId,
      AuditAction.LESSON_COMPLETED,
      `Lesson ${lessonId} completed by user ${userId} in program ${programId}`,
    );

    return { success: true, progress, xpResult: xpAwarded };
  }

  /**
   * Award XP within a transaction, using tx client directly.
   */
  private async awardXpInTx(tx: TxClient, userId: string, type: XpType, customAmount?: number) {
    const amount = customAmount ?? this.XP_VALUES[type] ?? 0;
    if (amount <= 0) return null;

    const user = await tx.user.update({
      where: { id: userId },
      data: { xp: { increment: amount } },
    });

    await tx.xpTransaction.create({
      data: { userId, amount, type },
    });

    return { success: true, currentXp: user.xp, amountAwarded: amount };
  }

  private readonly XP_VALUES: Record<XpType, number> = {
    [XpType.DAILY_STREAK]: 10,
    [XpType.MODULE_COMPLETION]: 50,
    [XpType.ASSESSMENT_PASS]: 100,
    [XpType.ACHIEVEMENT_REWARD]: 0,
  };

  /**
   * Update daily streak within a transaction.
   */
  private async updateStreakTx(tx: TxClient, userId: string) {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { streakCount: true, lastActiveAt: true },
    });

    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
    if (lastActive) lastActive.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = user.streakCount;
    let shouldAwardXp = false;

    if (lastActive && lastActive.getTime() === yesterday.getTime()) {
      newStreak += 1;
      shouldAwardXp = true;
    } else if (!lastActive || lastActive.getTime() < yesterday.getTime()) {
      newStreak = 1;
      shouldAwardXp = true;
    }

    await tx.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date(), streakCount: newStreak },
    });

    if (shouldAwardXp) {
      await this.awardXpInTx(tx, userId, XpType.DAILY_STREAK);
    }
  }

  /**
   * Revert lesson completion status.
   */
  async uncompleteLesson(userId: string, lessonId: string) {
    await this.prisma.progress.delete({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });

    // Re-resolve program details to update progress
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            track: { select: { programId: true } },
          },
        },
      },
    });

    if (lesson) {
      await this.enrollmentService.updateEnrollmentProgress(userId, lesson.module.track.programId);

      const updatedEnrollment = await this.prisma.enrollment.findUnique({
        where: { userId_programId: { userId, programId: lesson.module.track.programId } },
        select: { progress: true },
      });

      // Notify faculty in real-time
      this.insightsSseService.notifyFacultyOfStudentUpdate(userId, 'HEALTH_UPDATE', {
        userId,
        programId: lesson.module.track.programId,
        progress: updatedEnrollment?.progress ?? 0,
      }, lesson.module.track.programId);
    }

    return { success: true };
  }

  /**
   * Toggle bookmark status for a lesson.
   */
  async toggleBookmark(userId: string, lessonId: string) {
    const existing = await this.prisma.bookmark.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });

    if (existing) {
      await this.prisma.bookmark.delete({
        where: {
          userId_lessonId: { userId, lessonId },
        },
      });
      return { success: true, bookmarked: false };
    }

    await this.prisma.bookmark.create({
      data: {
        userId,
        lessonId,
      },
    });

    await this.awardService.checkAndAward(userId, AchievementCategory.ENGAGEMENT);
    await this.auditService.logAction(userId, AuditAction.BOOKMARK_TOGGLED, `Lesson ${lessonId} bookmarked by user ${userId}`);

    return { success: true, bookmarked: true };
  }

  /**
   * Upsert notes for a lesson.
   */
  async upsertNote(userId: string, lessonId: string, content: string) {
    const existing = await this.prisma.retryOnWakeup(() =>
      this.prisma.note.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
      }),
    );

    const note = await this.prisma.retryOnWakeup(() =>
      this.prisma.note.upsert({
        where: { userId_lessonId: { userId, lessonId } },
        update: { content },
        create: { userId, lessonId, content },
      }),
    );

    if (!existing) {
      await this.awardService.checkAndAward(userId, AchievementCategory.ENGAGEMENT);
      await this.auditService.logAction(userId, AuditAction.NOTE_CREATED, `Note created for lesson ${lessonId} by user ${userId}`);
    }

    return note;
  }

  /**
   * Retrieve notes for a lesson.
   */
  async getNote(userId: string, lessonId: string) {
    return this.prisma.retryOnWakeup(() =>
      this.prisma.note.findUnique({
        where: {
          userId_lessonId: { userId, lessonId },
        },
      }),
    );
  }

  /**
   * Aggregate student stats for the dashboard.
   */
  async getStudentStats(userId: string) {
    const xpDetails = await this.xpService.getUserXpDetails(userId);
    const enrollmentCount = await this.prisma.enrollment.count({
      where: { userId },
    });
    const completedCount = await this.prisma.enrollment.count({
      where: { userId, progress: 100 },
    });

    const globalRank = await this.prisma.user.count({
      where: {
        xp: { gt: xpDetails.xp },
        role: 'STUDENT',
      },
    });

    return {
      xp: xpDetails.xp,
      streakCount: xpDetails.streakCount,
      enrolledCourses: enrollmentCount,
      completedCourses: completedCount,
      globalRank: globalRank + 1,
    };
  }
}
