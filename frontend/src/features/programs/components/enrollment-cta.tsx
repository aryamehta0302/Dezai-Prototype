"use client";

import { Button } from "@/shared/ui/button";
import { useEnrollment } from "../hooks/useEnrollment";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { Play, CheckCircle, Hourglass } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { slugify } from "@/shared/utils/slug";
import type { ApiProgram } from "../types/program.types";
import { CheckoutModal } from "./checkout-modal";

interface EnrollmentCTAProps {
  course: ApiProgram;
}

export function EnrollmentCTA({ course }: EnrollmentCTAProps) {
  const { handleEnroll } = useEnrollment();
  const { isEnrolled, getEnrollment } = useEnrollmentStore();
  const slug = slugify(course.title);
  const enrolled = isEnrolled(course.id);
  const enrollment = getEnrollment(course.id);
  const [showCheckout, setShowCheckout] = useState(false);

  const allLessons = course.tracks.flatMap(t => t.modules.flatMap(m => m.lessons));
  const hasLessons = allLessons.length > 0;

  if (enrolled) {
    const firstLessonId = allLessons[0]?.id || "";
    const lessonId = enrollment?.lastAccessedLessonId || firstLessonId;

    return (
      <div className="card-elevation p-6 space-y-4">
        <div className="flex items-center gap-2 text-success">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">Enrolled</span>
        </div>
        {hasLessons ? (
          <Link href={`/programs/${slug}/learn/${lessonId}`}>
            <Button className="w-full gap-2">
              <Play className="h-4 w-4" />
              {enrollment?.progress ? "Continue Learning" : "Start Learning"}
            </Button>
          </Link>
        ) : (
          <Button className="w-full gap-2" disabled>
            <Hourglass className="h-4 w-4" />
            Curriculum Coming Soon
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="card-elevation p-6 space-y-4">
        <div className="space-y-1">
          <span className="text-3xl font-bold text-on-surface">Free</span>
        </div>

        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => handleEnroll(course.id, course.title)}
        >
          <Play className="h-4 w-4" />
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
            Self-paced learning
          </li>
        </ul>
      </div>
    </>
  );
}
