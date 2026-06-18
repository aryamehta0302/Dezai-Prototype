"use client";

import { useMemo } from "react";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useProgramsStore } from "@/lib/stores/programs.store";
import { learningService } from "../services/learning.service";

export function useProgress() {
  const { enrollments, xpEarned } = useEnrollmentStore();
  const { user } = useAuthStore();
  const { programs } = useProgramsStore();

  const enrolledCourses = useMemo(
    () => learningService.getEnrolledCourses(enrollments, programs),
    [enrollments, programs]
  );

  const stats = useMemo(
    () => learningService.getDashboardStats(user?.id || "", enrollments, xpEarned),
    [user?.id, enrollments, xpEarned]
  );

  const inProgressCourses = useMemo(
    () => enrolledCourses.filter((c) => c.progress > 0 && c.progress < 100),
    [enrolledCourses]
  );

  const notStartedCourses = useMemo(
    () => enrolledCourses.filter((c) => c.progress === 0),
    [enrolledCourses]
  );

  return {
    enrolledCourses,
    inProgressCourses,
    notStartedCourses,
    stats,
  };
}
