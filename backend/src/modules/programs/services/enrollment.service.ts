import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class EnrollmentService {
  constructor(private prisma: PrismaService) { }

  /**
   * Enroll a student in a program. If already enrolled, return existing enrollment.
   */
  async enrollStudent(userId: string, programId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${programId} not found`);
    }

    const existing = await this.prisma.enrollment.findUnique({
      where: {
        userId_programId: { userId, programId },
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.enrollment.create({
      data: {
        userId,
        programId,
        progress: 0,
      },
    });
  }

  /**
   * List all program enrollments for a given student user.
   */
  async getStudentEnrollments(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        program: {
          include: {
            institution: { select: { name: true } },
            tracks: {
              include: {
                modules: {
                  include: { lessons: { select: { id: true } } }
                }
              }
            }
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const completed = await this.prisma.progress.findMany({
      where: { userId },
      select: { lessonId: true },
    });

    const allCompletedIds = completed.map((c) => c.lessonId);

    return enrollments.map((e) => {
      // Filter the global completed list to only those in THIS program's lessons
      const programLessonIds = new Set(
        e.program.tracks.flatMap((t) =>
          t.modules.flatMap((m) => m.lessons.map((l) => l.id))
        )
      );

      const filteredIds = allCompletedIds.filter((id) => programLessonIds.has(id));

      return {
        ...e,
        completedLessonIds: filteredIds,
      };
    });
  }

  /**
   * Re-calculate and update the program completion progress of a student.
   * Calculates: (completed lessons / total lessons in program) * 100
   */
  async updateEnrollmentProgress(userId: string, programId: string) {
    // 1. Get all lesson IDs in this program
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

    if (!program) return;

    const allLessons = program.tracks.flatMap((t) =>
      t.modules.flatMap((m) => m.lessons.map((l) => l.id))
    );

    if (allLessons.length === 0) return;

    // 2. Count completed lessons by this user
    const completedCount = await this.prisma.progress.count({
      where: {
        userId,
        lessonId: { in: allLessons },
      },
    });

    // 3. Compute percentage
    const progressPercent = Math.round((completedCount / allLessons.length) * 100);

    // 4. Update enrollment progress
    return this.prisma.enrollment.update({
      where: {
        userId_programId: { userId, programId },
      },
      data: {
        progress: progressPercent,
        completedAt: progressPercent >= 100 ? new Date() : null,
      },
    });
  }
}
