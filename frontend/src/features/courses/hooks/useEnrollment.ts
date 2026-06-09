"use client";

import { useCallback } from "react";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useEnrollment() {
  const { enroll, isEnrolled, getEnrollment } = useEnrollmentStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const handleEnroll = useCallback(
    (courseId: string, courseTitle: string) => {
      if (!isAuthenticated) {
        toast.error("Please sign in to enroll");
        router.push("/login");
        return false;
      }

      if (isEnrolled(courseId)) {
        toast.info("You're already enrolled in this course");
        return false;
      }

      enroll(courseId);
      toast.success(`Enrolled in "${courseTitle}"! Start learning now.`);
      return true;
    },
    [enroll, isEnrolled, isAuthenticated, router]
  );

  return {
    handleEnroll,
    isEnrolled,
    getEnrollment,
  };
}
