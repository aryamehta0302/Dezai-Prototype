"use client";

import { Button } from "@/shared/ui/button";
import { useEnrollment } from "../hooks/useEnrollment";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { Play, CheckCircle, Hourglass, Award } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { slugify } from "@/shared/utils/slug";
import type { ApiProgram } from "../types/program.types";
import { CheckoutModal } from "./checkout-modal";
import { credentialsService } from "@/features/credentials/services/credentials.service";
import { toast } from "sonner";

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
  const [claimedCred, setClaimedCred] = useState<any>(null);
  const [claiming, setClaiming] = useState(false);

  const allLessons = (course.tracks ?? []).flatMap(t => (t.modules ?? []).flatMap(m => m.lessons ?? []));
  const hasLessons = allLessons.length > 0;
  const allAssessments = (course.tracks ?? []).flatMap(t => (t.modules ?? []).flatMap(m => m.assessments ?? []));

  useEffect(() => {
    if (enrolled) {
      credentialsService.getStudentCredentials()
        .then((creds) => {
          const matching = creds.find(c => c.programId === course.id);
          if (matching) {
            setClaimedCred(matching);
          }
        })
        .catch((err) => console.error("Error loading credentials:", err));
    }
  }, [enrolled, course.id]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await credentialsService.claimCredential(course.id);
      toast.success("Certificate claimed successfully!");
      setClaimedCred(res);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to claim certificate.");
    } finally {
      setClaiming(false);
    }
  };

  if (enrolled) {
    const firstLessonId = allLessons[0]?.id || "";
    const lessonId = enrollment?.lastAccessedLessonId || firstLessonId;

    return (
      <div className="card-elevation p-6 space-y-4">
        <div className="flex items-center gap-2 text-success">
          <CheckCircle className="h-5 w-5" />
          <span className="font-semibold">Enrolled</span>
        </div>
        {hasLessons && (
          <Link href={`/programs/${slug}/learn/${lessonId}`}>
            <Button className="w-full gap-2" variant={enrollment?.progress === 100 ? "outline" : "default"}>
              <Play className="h-4 w-4" />
              {enrollment?.progress === 100 ? "Review Course" : enrollment?.progress ? "Continue Learning" : "Start Learning"}
            </Button>
          </Link>
        )}

        {enrollment?.progress === 100 && (
          <>
            {claimedCred ? (
              <Link href={`/certificates/${claimedCred.id}`}>
                <Button className="w-full gap-2 bg-success text-white hover:bg-success/90">
                  <Award className="h-4 w-4" />
                  View Certificate
                </Button>
              </Link>
            ) : (
              <Button 
                onClick={handleClaim} 
                disabled={claiming}
                className="w-full gap-2 bg-primary text-white hover:bg-primary/90"
              >
                <Award className="h-4 w-4" />
                {claiming ? "Claiming..." : "Claim Certificate"}
              </Button>
            )}
          </>
        )}

        {(enrollment?.progress ?? 100) < 100 && allAssessments.length > 0 && (
          <Link href={`/programs/${slug}/assessment/${allAssessments[0].id}`}>
            <Button className="w-full gap-2 bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80">
              <CheckCircle className="h-4 w-4" />
              Take Assessment
            </Button>
          </Link>
        )}
        {!hasLessons && (
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
