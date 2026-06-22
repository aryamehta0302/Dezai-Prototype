import type { CourseProgress, DashboardStats } from "../types/learning.types";
import type { CourseEnrollment } from "@/lib/stores/enrollment.store";
import type { ApiProgram } from "./learning-api.service";
import { slugify } from "@/shared/utils/slug";
import { getThumbnailUrl } from "@/shared/utils/thumbnail";

export const learningService = {
  /**
   * Build CourseProgress objects from enrollment data + live API programs.
   */
  getEnrolledCourses: (
    enrollments: Record<string, CourseEnrollment>,
    programs: ApiProgram[]
  ): CourseProgress[] => {
    return Object.values(enrollments)
      .map((enrollment) => {
        const program = programs.find((p) => p.id === enrollment.courseId);
        if (!program) return null;

        const totalLessons = program.tracks.reduce(
          (sum, t) =>
            sum +
            t.modules.reduce((ms, m) => ms + m.lessons.length, 0),
          0
        );

        const nextLesson = learningService.getNextLesson(
          program,
          enrollment.lessonsCompleted.map((l) => l.lessonId)
        );

        const completedLessons = enrollment.lessonsCompleted.length;
        const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        return {
          courseId: program.id,
          courseTitle: program.title,
          courseSlug: slugify(program.title),
          thumbnailUrl: getThumbnailUrl(program.id),
          universityName: program.institution?.name ?? "",
          instructorName: program.faculty?.user?.name ?? "",
          progress, // Locally calculated to match the count below
          totalLessons,
          completedLessons,
          lastAccessedLessonId: enrollment.lastAccessedLessonId || nextLesson?.lessonId || "",
          lastAccessedAt: enrollment.enrolledAt,
        } as CourseProgress;
      })
      .filter(Boolean) as CourseProgress[];
  },

  /**
   * Get dashboard statistics for a student.
   */
  getDashboardStats: (
    userId: string,
    enrollments: Record<string, { id: string; courseId: string; enrolledAt: string; progress: number; lessonsCompleted: { lessonId: string; completed: boolean; completedAt?: string }[]; lastAccessedLessonId?: string; notes: Record<string, string> }>,
    xpEarned: number
  ): DashboardStats => {
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

  /**
   * Get the next lesson to continue for a course.
   */
  getNextLesson: (
    program: ApiProgram | undefined,
    completedLessonIds: string[]
  ): { moduleId: string; lessonId: string } | null => {
    if (!program) return null;

    for (const track of program.tracks) {
      for (const mod of track.modules) {
        for (const lesson of mod.lessons) {
          if (!completedLessonIds.includes(lesson.id)) {
            return { moduleId: mod.id, lessonId: lesson.id };
          }
        }
      }
    }
    return null;
  },
};
