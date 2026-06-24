"use client";

import { cn } from "@/shared/utils/cn";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { PlayCircle, FileText, CheckCircle, HelpCircle } from "lucide-react";
import type { ApiModule } from "@/features/programs/types/program.types";

interface CourseModuleSidebarProps {
  courseId: string;
  courseSlug: string;
  modules: ApiModule[];
  currentLessonId: string;
  onLessonSelect: (lessonId: string) => void;
  className?: string;
}

export function CourseModuleSidebar({
  courseId,
  courseSlug,
  modules,
  currentLessonId,
  onLessonSelect,
  className,
}: CourseModuleSidebarProps) {
  const { isLessonCompleted } = useEnrollmentStore();

  return (
    <div className={cn("space-y-1 custom-scrollbar overflow-y-auto", className)}>
      {modules.map((mod, modIndex) => (
        <div key={mod.id} className="space-y-0.5 mb-4 last:mb-0">
          <div className="px-3 py-2.5">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">
              Module {modIndex + 1}
            </p>
            <p className="text-sm font-medium text-on-surface mt-0.5 line-clamp-1">
              {mod.title}
            </p>
          </div>

          {mod.lessons.map((lesson) => {
            const Icon = lesson.videoUrl ? PlayCircle : FileText;
            const isCurrent = lesson.id === currentLessonId;
            const isCompleted = isLessonCompleted(courseId, lesson.id);

            return (
              <button
                key={lesson.id}
                onClick={() => onLessonSelect(lesson.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors text-sm",
                  isCurrent
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-on-surface-variant hover:bg-surface-low"
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                ) : (
                  <Icon className={cn("h-4 w-4 flex-shrink-0", isCurrent ? "text-primary" : "text-muted")} />
                )}
                <span className="flex-1 line-clamp-1">{lesson.title}</span>
                {lesson.videoUrl && (
                  <span className="text-xs text-muted flex-shrink-0">video</span>
                )}
              </button>
            );
          })}

          {mod.assessments && mod.assessments.map((assessment) => {
            const quizUrl = `/programs/${courseSlug}/assessment/${assessment.id}`;

            return (
              <a
                key={assessment.id}
                href={quizUrl}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors text-sm text-on-surface-variant hover:bg-surface-low border border-dashed border-primary/20 bg-primary/5 mt-1"
                )}
              >
                <HelpCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="flex-1 font-medium text-primary line-clamp-1">{assessment.title}</span>
                <span className="text-xs text-primary font-semibold flex-shrink-0 bg-primary/10 px-1.5 py-0.5 rounded">Quiz</span>
              </a>
            );
          })}
        </div>
      ))}
    </div>
  );
}
