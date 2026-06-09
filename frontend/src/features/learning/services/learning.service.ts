import { getCourseById } from "@/lib/mock-data/courses";
import { getCertificatesByUser } from "@/lib/mock-data/certificates";
import type { CourseProgress, DashboardStats } from "../types/learning.types";
import type { CourseEnrollment } from "@/lib/stores/enrollment.store";

export const learningService = {
  /**
   * Build CourseProgress objects from enrollment data + mock courses.
   */
  getEnrolledCourses: (enrollments: Record<string, CourseEnrollment>): CourseProgress[] => {
    return Object.values(enrollments)
      .map((enrollment) => {
        const course = getCourseById(enrollment.courseId);
        if (!course) return null;

        const totalLessons = course.modules.reduce(
          (sum, m) => sum + m.lessons.length,
          0
        );

        return {
          courseId: course.id,
          courseTitle: course.title,
          courseSlug: course.slug,
          thumbnailUrl: course.thumbnailUrl,
          universityName: course.universityName,
          instructorName: course.instructorName,
          progress: enrollment.progress,
          totalLessons,
          completedLessons: enrollment.lessonsCompleted.length,
          lastAccessedLessonId: enrollment.lastAccessedLessonId,
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
    enrollments: Record<string, CourseEnrollment>,
    xpEarned: number
  ): DashboardStats => {
    const enrolled = Object.keys(enrollments).length;
    const completed = Object.values(enrollments).filter(
      (e) => e.progress >= 100
    ).length;
    const certificates = getCertificatesByUser(userId).length;

    return {
      enrolledCourses: enrolled,
      completedCourses: completed,
      certificatesEarned: certificates,
      xpEarned,
      learningStreak: 7, // Mock streak
      hoursLearned: Math.round(enrolled * 12.5),
    };
  },

  /**
   * Get the next lesson to continue for a course.
   */
  getNextLesson: (
    courseId: string,
    completedLessonIds: string[]
  ): { moduleId: string; lessonId: string } | null => {
    const course = getCourseById(courseId);
    if (!course) return null;

    for (const mod of course.modules) {
      for (const lesson of mod.lessons) {
        if (!completedLessonIds.includes(lesson.id)) {
          return { moduleId: mod.id, lessonId: lesson.id };
        }
      }
    }
    return null;
  },
};
