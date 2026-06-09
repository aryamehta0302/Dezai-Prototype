import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { getCourseById } from "@/lib/mock-data/courses";

export const lessonService = {
  /**
   * Mark a lesson as complete.
   */
  markComplete: (courseId: string, lessonId: string): boolean => {
    const course = getCourseById(courseId);
    if (!course) return false;
    const totalLessons = course.modules.reduce(
      (sum, m) => sum + m.lessons.length,
      0
    );
    useEnrollmentStore.getState().markLessonComplete(courseId, lessonId, totalLessons);
    return true;
  },

  /**
   * Get lesson content (returns the mock content or a default).
   */
  getLessonContent: (courseId: string, lessonId: string): string | null => {
    const course = getCourseById(courseId);
    if (!course) return null;

    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        return (
          lesson.content ||
          `# ${lesson.title}\n\nThis is the lesson content for "${lesson.title}". In a production environment, this would contain rich multimedia content including videos, interactive exercises, and detailed explanations.\n\n## Key Concepts\n\n- Understanding the fundamentals of this topic\n- Practical applications in real-world scenarios\n- Best practices and common pitfalls to avoid\n\n## Summary\n\nThis lesson covers the essential aspects of ${lesson.title.toLowerCase()}. Review the material carefully and take notes for the assessment.`
        );
      }
    }
    return null;
  },

  /**
   * Find the lesson details within a course.
   */
  getLesson: (courseId: string, lessonId: string) => {
    const course = getCourseById(courseId);
    if (!course) return null;

    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        return { lesson, module: mod };
      }
    }
    return null;
  },
};
