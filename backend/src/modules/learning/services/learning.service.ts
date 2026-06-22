import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EnrollmentService } from '../../programs/services/enrollment.service';
import { XpService } from '../../users/services/xp.service';
import { AwardService } from '../../achievements/services/award.service';
import { XpType, AchievementCategory } from '@prisma/client';

@Injectable()
export class LearningService {
  constructor(
    private prisma: PrismaService,
    private enrollmentService: EnrollmentService,
    private xpService: XpService,
    private awardService: AwardService,
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
  async createLesson(moduleId: string, data: { title: string; content: string; videoUrl?: string; order: number }) {
    return this.prisma.lesson.create({
      data: {
        moduleId,
        title: data.title,
        content: data.content,
        videoUrl: data.videoUrl,
        order: data.order,
      },
    });
  }

  /**
   * Update lesson content.
   */
  async updateLesson(id: string, data: { title?: string; content?: string; videoUrl?: string; order?: number }) {
    return this.prisma.lesson.update({
      where: { id },
      data,
    });
  }

  /**
   * Mark a lesson as completed by the student.
   * If all lessons in the module are completed, awards MODULE_COMPLETION XP.
   * Also updates daily streak and lastActiveAt.
   */
  async completeLesson(userId: string, lessonId: string) {
    const existing = await this.prisma.progress.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });

    if (existing) {
      return { success: true, alreadyCompleted: true };
    }

    const progress = await this.prisma.progress.create({
      data: {
        userId,
        lessonId,
      },
    });

    await this.updateStreak(userId);

    // Resolve the program ID to update the enrollment progress percentages
    const lesson = await this.prisma.lesson.findUnique({
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
      return { success: true, progress };
    }

    const programId = lesson.module.track.programId;

    // Trigger update progress recalculation
    await this.enrollmentService.updateEnrollmentProgress(userId, programId);

    // Centralized XP Logic: Check if all lessons in the module are completed
    const allLessonIds = lesson.module.lessons.map((l) => l.id);
    const completedCount = await this.prisma.progress.count({
      where: {
        userId,
        lessonId: { in: allLessonIds },
      },
    });

    let xpResult = null;
    if (completedCount === allLessonIds.length) {
      xpResult = await this.xpService.awardXp(userId, XpType.MODULE_COMPLETION);
    }

    await this.awardService.checkAndAward(userId, AchievementCategory.STREAK);
    await this.awardService.checkAndAward(userId, AchievementCategory.COMPLETION);
    await this.awardService.checkAndAward(userId, AchievementCategory.XP);

    return {
      success: true,
      progress,
      xpResult,
    };
  }

  /**
   * Update daily streak for a user.
   * If the last active date was yesterday, increment the streak.
   * If it's a new day and streak wasn't yesterday, reset to 1.
   */
  private async updateStreak(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { streakCount: true, lastActiveAt: true },
    });

    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let newStreak = user.streakCount;
    let shouldAwardXp = false;

    if (!lastActive || lastActive.getTime() === today.getTime()) {
      // Already active today, update timestamp but keep streak
    } else if (lastActive.getTime() === yesterday.getTime()) {
      // Consecutive day — increment
      newStreak += 1;
      shouldAwardXp = true;
    } else {
      // Gap — reset to 1
      newStreak = 1;
      shouldAwardXp = true;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        lastActiveAt: new Date(),
        streakCount: newStreak,
      },
    });

    if (shouldAwardXp) {
      await this.xpService.awardXp(userId, XpType.DAILY_STREAK);
      await this.awardService.checkAndAward(userId, AchievementCategory.STREAK);
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

    this.awardService.checkAndAward(userId, AchievementCategory.ENGAGEMENT);

    return { success: true, bookmarked: true };
  }

  /**
   * Upsert notes for a lesson.
   */
  async upsertNote(userId: string, lessonId: string, content: string) {
    const existing = await this.prisma.note.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    const note = await this.prisma.note.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { content },
      create: { userId, lessonId, content },
    });

    if (!existing) {
      this.awardService.checkAndAward(userId, AchievementCategory.ENGAGEMENT);
    }

    return note;
  }

  /**
   * Retrieve notes for a lesson.
   */
  async getNote(userId: string, lessonId: string) {
    return this.prisma.note.findUnique({
      where: {
        userId_lessonId: { userId, lessonId },
      },
    });
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
