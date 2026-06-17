import type { CourseProgress, DashboardStats } from "../types/learning.types";
import type { CourseEnrollment } from "@/lib/stores/enrollment.store";
import { courseService } from "@/features/programs/services/course.service";
import type { ApiTrack } from "@/features/programs/types/program.types";

function getTotalLessons(tracks: ApiTrack[]): number {
  return tracks.reduce((sum, t) =>
    sum + t.modules.reduce((msum, m) => msum + m.lessons.length, 0), 0);
}

export const learningService = {
  async getEnrolledCourses(enrollments: Record<string, CourseEnrollment>): Promise<CourseProgress[]> {
    const programs = await courseService.loadPrograms();
    const programMap = new Map(programs.map(p => [p.id, p]));

    const result: CourseProgress[] = [];

    for (const enrollment of Object.values(enrollments)) {
      const program = programMap.get(enrollment.courseId);
      if (!program) continue;

      const totalLessons = getTotalLessons(program.tracks);

      result.push({
        courseId: program.id,
        courseTitle: program.title,
        courseSlug: program.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        thumbnailUrl: "",
        universityName: program.institution?.name ?? "",
        instructorName: program.faculty?.user.name ?? "",
        progress: enrollment.progress,
        totalLessons,
        completedLessons: enrollment.lessonsCompleted.length,
        lastAccessedLessonId: enrollment.lastAccessedLessonId,
        lastAccessedAt: enrollment.enrolledAt,
      });
    }

    return result;
  },

  getDashboardStats(
    _userId: string,
    enrollments: Record<string, any>,
    xpEarned: number
  ): DashboardStats {
    const enrolledArr = Object.values(enrollments);
    const enrolled = enrolledArr.length;
    const completed = enrolledArr.filter((e) => e.progress >= 100).length;

    return {
      enrolledCourses: enrolled,
      completedCourses: completed,
      certificatesEarned: 0,
      xpEarned,
      learningStreak: 1,
      hoursLearned: Math.round(enrolled * 12.5),
    };
  },

  getNextLesson(
    _courseId: string,
    _completedLessonIds: string[]
  ): { moduleId: string; lessonId: string } | null {
    return null;
  },
};
