"use client";

import { Button } from "@/shared/ui/button";
import { useEnrollment } from "../hooks/useEnrollment";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { formatCurrency } from "@/shared/utils/format";
import { ShoppingCart, Play, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { MockCourse } from "@/lib/mock-data/courses";
import { useState } from "react";
import { CheckoutModal } from "./checkout-modal";

interface EnrollmentCTAProps {
  course: MockCourse;
}

export function EnrollmentCTA({ course }: EnrollmentCTAProps) {
  const { isEnrolled } = useEnrollment();
  const enrolled = isEnrolled(course.id);
  const enrollment = useEnrollmentStore((s) => s.getEnrollment(course.id));
  const [showCheckout, setShowCheckout] = useState(false);

  if (enrolled) {
    const firstLessonId = course.modules[0]?.lessons[0]?.id || "";
    const lessonId = enrollment?.lastAccessedLessonId || firstLessonId;

    return (
      <div className="card-elevation p-6 space-y-4">
        <div className="flex items-center gap-2 text-success">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">Enrolled</span>
        </div>
        <Link href={`/programs/${course.slug}/learn/${lessonId}`}>
          <Button className="w-full gap-2">
            <Play className="h-4 w-4" />
            {enrollment?.progress ? "Continue Learning" : "Start Learning"}
          </Button>
        </Link>
        {course.quizId && (
          <Link href={`/programs/${course.slug}/quiz/${course.quizId}`}>
            <Button variant="outline" className="w-full mt-2">
              Take Assessment
            </Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="card-elevation p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-on-surface">
              {formatCurrency(course.price)}
            </span>
            <span className="text-sm text-muted line-through">
              {formatCurrency(Math.round(course.price * 1.5))}
            </span>
          </div>
          <p className="text-xs text-success font-medium">
            {Math.round(((course.price * 0.5) / (course.price * 1.5)) * 100)}% off
          </p>
        </div>

        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => setShowCheckout(true)}
        >
          <ShoppingCart className="h-4 w-4" />
          Enroll Now
        </Button>

        <ul className="space-y-2 text-sm text-on-surface-variant">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Full lifetime access
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Certificate on completion
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            {course.totalLessons} lessons across {course.totalModules} modules
          </li>
        </ul>
      </div>

      <CheckoutModal
        course={course}
        open={showCheckout}
        onClose={() => setShowCheckout(false)}
      />
    </>
  );
}
