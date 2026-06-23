"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MarkCompleteButtonProps {
  courseId: string;
  lessonId: string;
  onComplete?: () => void;
}

export function MarkCompleteButton({ courseId, lessonId, onComplete }: MarkCompleteButtonProps) {
  const { markLessonComplete, isLessonCompleted, isLoading } = useEnrollmentStore();
  const [completing, setCompleting] = useState(false);
  
  const completed = isLessonCompleted(courseId, lessonId);

  const handleClick = async () => {
    if (completed || completing) return;
    setCompleting(true);
    await markLessonComplete(courseId, lessonId);
    setCompleting(false);

    toast.success(
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-warning" />
        <span>Lesson completed! XP updated.</span>
      </div>
    );
    onComplete?.();
  };

  if (completed) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <CheckCircle className="h-4 w-4 text-green-500" />
        Completed
      </Button>
    );
  }

  return (
    <Button onClick={handleClick} disabled={completing || isLoading} className="gap-2">
      {completing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle className="h-4 w-4" />
      )}
      {completing ? "Saving..." : "Mark as Complete"}
    </Button>
  );
}
