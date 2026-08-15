import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class LearningCleanupService {
  private readonly logger = new Logger(LearningCleanupService.name);

  constructor(private prisma: PrismaService) {}

  async cleanupEmptyNotes(daysOld: number = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysOld);

    const result = await this.prisma.note.deleteMany({
      where: {
        content: '',
        updatedAt: { lt: cutoff },
      },
    });

    if (result.count > 0) {
      this.logger.log(`Cleaned up ${result.count} empty notes older than ${daysOld} days`);
    }

    return result.count;
  }

  async cleanupOrphanedBookmarks(): Promise<number> {
    const result = await this.prisma.$executeRawUnsafe(`
      DELETE FROM bookmarks
      WHERE lesson_id NOT IN (SELECT id FROM lessons)
    `);

    this.logger.log(`Cleaned up ${result} orphaned bookmarks`);
    return result;
  }

  async cleanupOrphanedProgress(): Promise<number> {
    const result = await this.prisma.$executeRawUnsafe(`
      DELETE FROM progresses
      WHERE lesson_id NOT IN (SELECT id FROM lessons)
    `);

    this.logger.log(`Cleaned up ${result} orphaned progress records`);
    return result;
  }

  /**
   * Clean up bookmarks, notes, and progress for all lessons in a program
   * when a student's enrollment is dropped.
   */
  async cleanupDroppedEnrollment(userId: string, programId: string): Promise<{
    bookmarksRemoved: number;
    notesRemoved: number;
    progressRemoved: number;
  }> {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: {
        tracks: {
          include: {
            modules: {
              include: { lessons: { select: { id: true } } },
            },
          },
        },
      },
    });

    if (!program) {
      return { bookmarksRemoved: 0, notesRemoved: 0, progressRemoved: 0 };
    }

    const lessonIds = program.tracks.flatMap((t) =>
      t.modules.flatMap((m) => m.lessons.map((l) => l.id))
    );

    if (lessonIds.length === 0) {
      return { bookmarksRemoved: 0, notesRemoved: 0, progressRemoved: 0 };
    }

    const [bookmarksRemoved, notesRemoved, progressRemoved] = await this.prisma.$transaction(async (tx) => {
      const b = await tx.bookmark.deleteMany({
        where: { userId, lessonId: { in: lessonIds } },
      });
      const n = await tx.note.deleteMany({
        where: { userId, lessonId: { in: lessonIds } },
      });
      const p = await tx.progress.deleteMany({
        where: { userId, lessonId: { in: lessonIds } },
      });
      return [b, n, p] as const;
    });

    this.logger.log(
      `Dropped enrollment cleanup for user ${userId} in program ${programId}: ` +
      `${bookmarksRemoved.count} bookmarks, ${notesRemoved.count} notes, ${progressRemoved.count} progress records removed`,
    );

    return {
      bookmarksRemoved: bookmarksRemoved.count,
      notesRemoved: notesRemoved.count,
      progressRemoved: progressRemoved.count,
    };
  }

  async runFullCleanup(): Promise<{ emptyNotes: number; orphanedBookmarks: number; orphanedProgress: number }> {
    const [emptyNotes, orphanedBookmarks, orphanedProgress] = await Promise.all([
      this.cleanupEmptyNotes(),
      this.cleanupOrphanedBookmarks(),
      this.cleanupOrphanedProgress(),
    ]);

    return { emptyNotes, orphanedBookmarks, orphanedProgress };
  }
}
