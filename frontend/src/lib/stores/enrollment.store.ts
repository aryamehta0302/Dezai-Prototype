"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LessonProgressData {
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}

export interface CourseEnrollment {
  courseId: string;
  enrolledAt: string;
  progress: number; // 0-100
  lessonsCompleted: LessonProgressData[];
  lastAccessedLessonId?: string;
  notes: Record<string, string>; // lessonId -> note text
}

export interface EnrollmentState {
  enrollments: Record<string, CourseEnrollment>; // courseId -> enrollment
  xpEarned: number;

  enroll: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
  getEnrollment: (courseId: string) => CourseEnrollment | undefined;
  getEnrolledCourseIds: () => string[];

  markLessonComplete: (courseId: string, lessonId: string, totalLessons: number) => void;
  isLessonCompleted: (courseId: string, lessonId: string) => boolean;
  setLastAccessedLesson: (courseId: string, lessonId: string) => void;

  saveNote: (courseId: string, lessonId: string, text: string) => void;
  getNote: (courseId: string, lessonId: string) => string;

  addXP: (amount: number) => void;
}

export const useEnrollmentStore = create<EnrollmentState>()(
  persist(
    (set, get) => ({
      enrollments: {},
      xpEarned: 0,

      enroll: (courseId) =>
        set((state) => {
          if (state.enrollments[courseId]) return state;
          return {
            enrollments: {
              ...state.enrollments,
              [courseId]: {
                courseId,
                enrolledAt: new Date().toISOString(),
                progress: 0,
                lessonsCompleted: [],
                notes: {},
              },
            },
          };
        }),

      isEnrolled: (courseId) => !!get().enrollments[courseId],

      getEnrollment: (courseId) => get().enrollments[courseId],

      getEnrolledCourseIds: () => Object.keys(get().enrollments),

      markLessonComplete: (courseId, lessonId, totalLessons) =>
        set((state) => {
          const enrollment = state.enrollments[courseId];
          if (!enrollment) return state;

          const alreadyCompleted = enrollment.lessonsCompleted.some(
            (l) => l.lessonId === lessonId
          );
          if (alreadyCompleted) return state;

          const newCompleted = [
            ...enrollment.lessonsCompleted,
            { lessonId, completed: true, completedAt: new Date().toISOString() },
          ];

          const progress = Math.round((newCompleted.length / totalLessons) * 100);

          return {
            enrollments: {
              ...state.enrollments,
              [courseId]: {
                ...enrollment,
                lessonsCompleted: newCompleted,
                progress: Math.min(progress, 100),
              },
            },
            xpEarned: state.xpEarned + 25,
          };
        }),

      isLessonCompleted: (courseId, lessonId) => {
        const enrollment = get().enrollments[courseId];
        if (!enrollment) return false;
        return enrollment.lessonsCompleted.some((l) => l.lessonId === lessonId);
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

      saveNote: (courseId, lessonId, text) =>
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
        }),

      getNote: (courseId, lessonId) => {
        const enrollment = get().enrollments[courseId];
        return enrollment?.notes[lessonId] || "";
      },

      addXP: (amount) =>
        set((state) => ({ xpEarned: state.xpEarned + amount })),
    }),
    {
      name: "dezai-enrollments",
    }
  )
);
