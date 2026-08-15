"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { CheckCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface MarkCompleteButtonProps {
  courseId: string;
  lessonId: string;
  onComplete?: () => void;
}

export function MarkCompleteButton({ courseId, lessonId, onComplete }: MarkCompleteButtonProps) {
  const { markLessonComplete, isLessonCompleted } = useEnrollmentStore();
  const [completing, setCompleting] = useState(false);

  const completed = isLessonCompleted(courseId, lessonId);

  const handleClick = async () => {
    if (completed || completing) return;

    setCompleting(true);
    onComplete?.();

    try {
      await markLessonComplete(courseId, lessonId);
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-warning" aria-hidden="true" />
          <span>Lesson completed! XP updated.</span>
        </div>
      );
    } catch {
      toast.error("Failed to save progress. Please try again.");
    } finally {
      setCompleting(false);
    }
  };

  if (completed) {
    return (
      <Button variant="outline" disabled className="gap-2 bg-success/10 text-success border-success/20" aria-label="Lesson already completed">
        <CheckCircle className="h-4 w-4" aria-hidden="true" />
        Completed
      </Button>
    );
  }

  return (
    <Button onClick={handleClick} disabled={completing} className="gap-2" aria-label={completing ? "Saving progress" : "Mark lesson as complete"}>
      <CheckCircle className="h-4 w-4" aria-hidden="true" />
      {completing ? "Saving..." : "Mark as Complete"}
    </Button>
  );
}
