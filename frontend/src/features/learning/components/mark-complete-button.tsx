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
    if (isCompleted) return;

    // Navigate next immediately so the video starts transitioning
    onComplete?.();

    try {
      await markLessonComplete(courseId, lessonId);
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-warning" />
          <span>Lesson completed! XP updated.</span>
        </div>
      );
    } catch {
      // API failure already logged in store — no misleading toast
    }
  };

  if (completed) {
    return (
      <Button variant="outline" disabled className="gap-2 bg-success/10 text-success border-success/20">
        <CheckCircle className="h-4 w-4" />
        Completed
      </Button>
    );
  }

  return (
    <Button onClick={handleClick} className="gap-2">
      <CheckCircle className="h-4 w-4" />
      Mark as Complete
    </Button>
  );
}
