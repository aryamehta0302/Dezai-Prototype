"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { learningApi } from "@/features/learning/services/learning-api.service";

export interface LessonProgressData {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
  lessonsCompleted: LessonProgressData[];
  lastAccessedLessonId?: string;
  notes: Record<string, string>;
}

export interface EnrollmentState {
  enrollments: Record<string, CourseEnrollment>;
  xpEarned: number;
  streakCount: number;
  hoursLearned: number;
  globalRank: number | null;
  isLoading: boolean;
  hasFetched: boolean;
  statsFetched: boolean;

  fetchEnrollments: () => Promise<void>;
  fetchStats: () => Promise<void>;
  enroll: (programId: string) => Promise<boolean>;
  isEnrolled: (courseId: string) => boolean;
  getEnrollment: (courseId: string) => CourseEnrollment | undefined;

  markLessonComplete: (courseId: string, lessonId: string) => Promise<void>;
  toggleBookmark: (courseId: string, lessonId: string) => Promise<void>;
  saveNote: (courseId: string, lessonId: string, text: string) => Promise<void>;
  fetchNote: (courseId: string, lessonId: string) => Promise<string>;
  getNote: (courseId: string, lessonId: string) => string;

  isLessonCompleted: (courseId: string, lessonId: string) => boolean;

  setLastAccessedLesson: (courseId: string, lessonId: string) => void;
  addXP: (amount: number) => void;
  setXp: (amount: number) => void;
}

export const useEnrollmentStore = create<EnrollmentState>()(
  persist(
    (set, get) => ({
      enrollments: {},
      xpEarned: 0,
      streakCount: 0,
      hoursLearned: 0,
      globalRank: null,
      isLoading: false,
      hasFetched: false,
      statsFetched: false,

      isLessonCompleted: (courseId: string, lessonId: string) => {
        const enrollment = get().enrollments[courseId];
        if (!enrollment) return false;
        return enrollment.lessonsCompleted.some((l) => l.lessonId === lessonId);
      },

      fetchEnrollments: async () => {
        if (get().hasFetched) return;
        set({ isLoading: true });
        try {
          const response = await learningApi.getEnrollments();
          if (response.success) {
            const enrollmentsMap: Record<string, CourseEnrollment> = {};
            response.enrollments.forEach((e: any) => {
              enrollmentsMap[e.programId] = {
                id: e.id,
                courseId: e.programId,
                enrolledAt: e.createdAt,
                progress: e.progress,
                lessonsCompleted: (e.progresses || e.completedLessonIds || []).map((p: any) => ({
                  lessonId: typeof p === 'string' ? p : p.lessonId,
                  completed: true,
                  completedAt: typeof p === 'string' ? undefined : p.completedAt,
                })),
                notes: {},
              };
            });
            set({ enrollments: enrollmentsMap, hasFetched: true });
          }
        } catch (error) {
          console.error("Failed to fetch enrollments:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchStats: async () => {
        if (get().statsFetched) return;
        try {
          const res = await learningApi.getMyStats();
          if (res.success) {
            set({
              xpEarned: res.xp,
              streakCount: res.streakCount || 0,
              hoursLearned: Math.round((res.enrolledCourses || 0) * 8.5), // estimated
              globalRank: res.globalRank ?? null,
              statsFetched: true,
            });
          }
        } catch { /* not critical */ }
      },

      enroll: async (programId) => {
        set({ isLoading: true });
        try {
          const response = await learningApi.enroll(programId);
          if (response.success) {
            const e = response.enrollment;
            set((state) => ({
              enrollments: {
                ...state.enrollments,
                [programId]: {
                  id: e.id,
                  courseId: e.programId,
                  enrolledAt: e.createdAt,
                  progress: e.progress,
                  lessonsCompleted: [],
                  notes: {},
                },
              },
            }));
            return true;
          }
        } catch (error) {
          console.error("Failed to enroll:", error);
        } finally {
          set({ isLoading: false });
        }
        return false;
      },

      isEnrolled: (courseId) => !!get().enrollments[courseId],

      getEnrollment: (courseId) => get().enrollments[courseId],

      markLessonComplete: async (courseId, lessonId) => {
        // Optimistic local update — instant UI feedback
        set((state) => {
          const enrollment = state.enrollments[courseId];
          if (!enrollment || enrollment.lessonsCompleted.some(l => l.lessonId === lessonId)) return state;
          return {
            enrollments: {
              ...state.enrollments,
              [courseId]: {
                ...enrollment,
                lessonsCompleted: [
                  ...enrollment.lessonsCompleted,
                  { lessonId, completed: true, completedAt: new Date().toISOString() }
                ]
              }
            }
          };
        });

        // Fire API in background — don't block navigation
        learningApi.completeLesson(lessonId).then((response) => {
          if (response.success) {
            if (response.xpResult?.currentXp) {
              get().setXp(response.xpResult.currentXp);
            }
            get().fetchEnrollments();
          }
        }).catch((error) => {
          console.error("Failed to save lesson completion:", error);
        });
      },

      toggleBookmark: async (courseId, lessonId) => {
        try {
          await learningApi.toggleBookmark(lessonId);
        } catch (error) {
          console.error("Failed to toggle bookmark:", error);
        }
      },

      saveNote: async (courseId, lessonId, text) => {
        try {
          const response = await learningApi.upsertNote(lessonId, text);
          if (response.success) {
            set((state) => {
              const enrollment = state.enrollments[courseId];
              if (!enrollment) return state;
              return {
                enrollments: {
                  ...state.enrollments,
                  [courseId]: {
                    ...enrollment,
                    notes: { ...enrollment.notes, [lessonId]: text },
                  },
                },
              };
            });
          }
        } catch (error) {
          console.error("Failed to save note:", error);
        }
      },

      setLastAccessedLesson: (courseId, lessonId) =>
        set((state) => {
          const enrollment = state.enrollments[courseId];
          if (!enrollment) return state;
          return {
            enrollments: {
              ...state.enrollments,
              [courseId]: { ...enrollment, lastAccessedLessonId: lessonId },
            },
          };
        }),

      getNote: (courseId, lessonId) => {
        const enrollment = get().enrollments[courseId];
        return enrollment?.notes[lessonId] || "";
      },

      fetchNote: async (courseId, lessonId) => {
        try {
          const response = await learningApi.getNote(lessonId);
          if (response.success && response.note) {
            set((state) => {
              const enrollment = state.enrollments[courseId];
              if (!enrollment) return state;
              return {
                enrollments: {
                  ...state.enrollments,
                  [courseId]: {
                    ...enrollment,
                    notes: { ...enrollment.notes, [lessonId]: response.note!.content },
                  },
                },
              };
            });
            return response.note.content;
          }
        } catch (error) {
          console.error("Failed to fetch note:", error);
        }
        return "";
      },

      addXP: (amount) =>
        set((state) => ({ xpEarned: state.xpEarned + amount })),

      setXp: (amount) => set({ xpEarned: amount }),
    }),
    {
      name: "dezai-enrollments-v3",
    }
  )
);
