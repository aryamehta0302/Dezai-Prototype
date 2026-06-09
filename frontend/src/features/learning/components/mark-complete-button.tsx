"use client";

import { Button } from "@/shared/ui/button";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { lessonService } from "../services/lesson.service";
import { CheckCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface MarkCompleteButtonProps {
  courseId: string;
  lessonId: string;
  onComplete?: () => void;
}

export function MarkCompleteButton({ courseId, lessonId, onComplete }: MarkCompleteButtonProps) {
  const { isLessonCompleted } = useEnrollmentStore();
  const completed = isLessonCompleted(courseId, lessonId);

  const handleClick = () => {
    if (completed) return;
    lessonService.markComplete(courseId, lessonId);
    toast.success(
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-warning" />
        <span>+25 XP earned!</span>
      </div>
    );
    onComplete?.();
  };

  if (completed) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <CheckCircle className="h-4 w-4 text-success" />
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
