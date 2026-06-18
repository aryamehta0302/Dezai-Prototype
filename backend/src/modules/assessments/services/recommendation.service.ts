import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";

@Injectable()
export class RecommendationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find the next uncompleted module in order for the student's enrolled program.
   * Checks lesson Progress completion per module. Returns the next module with its first incomplete lesson.
   */
  async getNextModule(userId: string, programId: string) {
    const tracks = await this.prisma.programTrack.findMany({
      where: { programId },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    // Sort tracks to ensure ROOTS track comes before EDGE track
    tracks.sort((a, b) => {
      if (a.type === "ROOTS" && b.type === "EDGE") return -1;
      if (a.type === "EDGE" && b.type === "ROOTS") return 1;
      return 0;
    });

    const progresses = await this.prisma.progress.findMany({
      where: { userId },
      select: { lessonId: true },
    });
    const completedLessonIds = new Set(progresses.map((p) => p.lessonId));

    for (const track of tracks) {
      for (const module of track.modules) {
        const totalLessons = module.lessons.length;
        if (totalLessons === 0) continue;

        const incompleteLessons = module.lessons.filter(
          (l) => !completedLessonIds.has(l.id)
        );

        if (incompleteLessons.length > 0) {
          return {
            moduleId: module.id,
            moduleTitle: module.title,
            moduleOrder: module.order,
            trackType: track.type,
            firstIncompleteLesson: incompleteLessons[0],
            completedLessonsCount: totalLessons - incompleteLessons.length,
            totalLessonsCount: totalLessons,
          };
        }
      }
    }

    return null;
  }

  /**
   * Across all enrolled programs, find the most recently active module
   * (by last Progress.completedAt) and return it as a "Continue Learning" widget payload.
   */
  async getContinueLearning(userId: string) {
    // Try to find the most recently completed lesson progress
    const latestProgress = await this.prisma.progress.findFirst({
      where: { userId },
      orderBy: { completedAt: "desc" },
      include: {
        lesson: {
          include: {
            module: {
              include: {
                track: {
                  select: { programId: true },
                },
              },
            },
          },
        },
      },
    });

    let programId: string | null = null;

    if (latestProgress) {
      programId = latestProgress.lesson.module.track.programId;
    } else {
      // If no progress, find the most recent enrollment
      const enrollment = await this.prisma.enrollment.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (enrollment) {
        programId = enrollment.programId;
      }
    }

    if (!programId) {
      return { success: true, programId: null, completed: false };
    }

    const nextModuleInfo = await this.getNextModule(userId, programId);
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
    });

    if (!nextModuleInfo) {
      return {
        success: true,
        programId,
        programTitle: program?.title || "Program",
        completed: true,
      };
    }

    return {
      success: true,
      programId,
      programTitle: program?.title || "Program",
      ...nextModuleInfo,
      completed: false,
    };
  }

  /**
   * Find assessments linked to modules the student has completed all lessons for
   * but hasn't passed the assessment yet. These are "Ready to take" assessments.
   */
  async getRecommendedAssessments(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      select: { programId: true },
    });
    const programIds = enrollments.map((e) => e.programId);

    if (programIds.length === 0) {
      return { success: true, assessments: [] };
    }

    const modules = await this.prisma.module.findMany({
      where: {
        track: {
          programId: { in: programIds },
        },
      },
      include: {
        lessons: true,
        assessments: true,
      },
    });

    const progresses = await this.prisma.progress.findMany({
      where: { userId },
      select: { lessonId: true },
    });
    const completedLessonIds = new Set(progresses.map((p) => p.lessonId));

    const passedAttempts = await this.prisma.assessmentAttempt.findMany({
      where: {
        userId,
        passed: true,
        completedAt: { not: null },
      },
      select: { assessmentId: true },
    });
    const passedAssessmentIds = new Set(
      passedAttempts.map((a) => a.assessmentId)
    );

    const recommended = [];
    for (const module of modules) {
      if (module.lessons.length === 0) continue;
      const allLessonsCompleted = module.lessons.every((l) =>
        completedLessonIds.has(l.id)
      );

      if (allLessonsCompleted) {
        for (const assessment of module.assessments) {
          if (!passedAssessmentIds.has(assessment.id)) {
            recommended.push({
              assessmentId: assessment.id,
              assessmentTitle: assessment.title,
              moduleId: module.id,
              moduleTitle: module.title,
              passingScore: assessment.passingScore,
            });
          }
        }
      }
    }

    return {
      success: true,
      assessments: recommended,
    };
  }
}
