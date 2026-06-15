import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EnrollmentService } from '../../programs/services/enrollment.service';
import { XpService } from '../../users/services/xp.service';
import { XpType } from '@prisma/client';

@Injectable()
export class LearningService {
  constructor(
    private prisma: PrismaService,
    private enrollmentService: EnrollmentService,
    private xpService: XpService
  ) {}

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
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
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

    return {
      success: true,
      progress,
      xpResult,
    };
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

    return { success: true, bookmarked: true };
  }

  /**
   * Upsert notes for a lesson.
   */
  async upsertNote(userId: string, lessonId: string, content: string) {
    return this.prisma.note.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: { content },
      create: { userId, lessonId, content },
    });
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
}
