import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction, EnrollmentStatus, Prisma } from '@prisma/client';

type TxClient = Omit<PrismaService, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

@Injectable()
export class EnrollmentService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) { }

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

    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId,
        programId,
        progress: 0,
        status: EnrollmentStatus.ACTIVE,
      },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ENROLLMENT_CREATED,
      `User ${userId} enrolled in program ${programId} (Enrollment ID: ${enrollment.id})`,
    );

    return enrollment;
  }

  /**
   * Drop enrollment: cleanup bookmarks/notes/progress, mark status DROPPED.
   */
  async dropEnrollment(userId: string, programId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { userId_programId: { userId, programId } },
      include: {
        program: {
          include: {
            tracks: {
              include: {
                modules: {
                  include: { lessons: { select: { id: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment not found for user ${userId} in program ${programId}`);
    }

    const lessonIds = this.getProgramLessonIds(enrollment.program);

    await this.prisma.$transaction(async (tx) => {
      await tx.bookmark.deleteMany({
        where: { userId, lessonId: { in: lessonIds } },
      });

      await tx.note.deleteMany({
        where: { userId, lessonId: { in: lessonIds } },
      });

      await tx.progress.deleteMany({
        where: { userId, lessonId: { in: lessonIds } },
      });

      await tx.enrollment.update({
        where: { userId_programId: { userId, programId } },
        data: {
          status: EnrollmentStatus.DROPPED,
          progress: 0,
        },
      });
    });

    await this.auditService.logAction(
      userId,
      AuditAction.ENROLLMENT_DROPPED,
      `User ${userId} dropped enrollment in program ${programId} — bookmarks, notes, and progress cleaned up`,
    );

    return { success: true };
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
      const programLessonIds = new Set(
        this.getProgramLessonIds(e.program)
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
   * Accepts optional tx for transactional composition.
   * Calculates: (completed lessons / total lessons in program) * 100
   */
  async updateEnrollmentProgress(userId: string, programId: string, tx?: TxClient) {
    const client = tx ?? this.prisma;

    const program = await client.program.findUnique({
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

    const allLessons = this.getProgramLessonIds(program);
    if (allLessons.length === 0) return;

    const completedCount = await client.progress.count({
      where: {
        userId,
        lessonId: { in: allLessons },
      },
    });

    const progressPercent = Math.round((completedCount / allLessons.length) * 100);

    const isComplete = progressPercent >= 100;

    return client.enrollment.update({
      where: {
        userId_programId: { userId, programId },
      },
      data: {
        progress: progressPercent,
        status: isComplete ? EnrollmentStatus.COMPLETED : undefined,
        completedAt: isComplete ? new Date() : null,
      },
    });
  }

  /**
   * Extract all lesson IDs from a program's track/module structure.
   */
  private getProgramLessonIds(program: { tracks: { modules: { lessons: { id: string }[] }[] }[] }): string[] {
    return program.tracks.flatMap((t) =>
      t.modules.flatMap((m) => m.lessons.map((l) => l.id))
    );
  }
}
