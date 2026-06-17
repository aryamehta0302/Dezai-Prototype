"use client";

import { useEffect, useMemo, useState } from "react";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { learningService } from "../services/learning.service";
import type { CourseProgress, DashboardStats } from "../types/learning.types";

export function useProgress() {
  const { enrollments, xpEarned } = useEnrollmentStore();
  const { user } = useAuthStore();
  const [enrolledCourses, setEnrolledCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    learningService.getEnrolledCourses(enrollments).then((result) => {
      setEnrolledCourses(result);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [enrollments]);

  const stats: DashboardStats = useMemo(
    () =>
      learningService.getDashboardStats(
        user?.id || "",
        enrollments,
        xpEarned
      ),
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
    loading,
  };
}
