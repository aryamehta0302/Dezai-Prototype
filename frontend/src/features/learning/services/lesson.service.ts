import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { learningApi } from "./learning-api.service";
import { courseService } from "@/features/programs/services/course.service";

export const lessonService = {
  markComplete: async (courseId: string, lessonId: string): Promise<boolean> => {
    try {
      const res = await learningApi.completeLesson(lessonId);
      if (res.success) {
        await useEnrollmentStore.getState().fetchEnrollments();
        if (res.xpResult) {
          useEnrollmentStore.getState().setXp(res.xpResult.currentXp);
        }
        return true;
      }
    } catch { /* ignore */ }
    return false;
  },

  getLessonContent: async (_courseId: string, lessonId: string): Promise<string | null> => {
    try {
      const res = await learningApi.getLesson(lessonId);
      if (res.success && res.lesson) {
        return res.lesson.content;
      }
    } catch { /* ignore */ }
    return null;
  },

  getLesson: async (courseId: string, lessonId: string) => {
    try {
      const programs = await courseService.loadPrograms();
      const program = programs.find(p => p.id === courseId);
      if (!program) return null;

      for (const track of program.tracks) {
        for (const mod of track.modules) {
          const lesson = mod.lessons.find(l => l.id === lessonId);
          if (lesson) {
            return { lesson: { ...lesson, type: "video" as const, duration: 15, content: "" }, module: mod };
          }
        }
      }

      const lessonRes = await learningApi.getLesson(lessonId);
      if (lessonRes.success && lessonRes.lesson) {
        return {
          lesson: { ...lessonRes.lesson, type: "article" as const, duration: 15 },
          module: { id: lessonRes.lesson.moduleId, title: lessonRes.lesson.module.title, lessons: [] },
        };
      }
    } catch { /* ignore */ }
    return null;
  },
};
