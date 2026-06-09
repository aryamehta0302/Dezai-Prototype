"use client";

import Link from "next/link";
import { cn } from "@/shared/utils/cn";
import { Progress } from "@/shared/ui/progress";
import { Play, Clock } from "lucide-react";
import type { CourseProgress } from "../types/learning.types";

interface ContinueLearningCardProps {
  course: CourseProgress;
  className?: string;
}

export function ContinueLearningCard({ course, className }: ContinueLearningCardProps) {
  return (
    <Link
      href={`/courses/${course.courseSlug}/learn/${course.lastAccessedLessonId || "les-1-1-1"}`}
      className={cn(
        "group relative flex flex-col sm:flex-row gap-4 rounded-xl border border-border-light bg-white p-4 hover:border-primary/30 hover:shadow-level-2 transition-all",
        className
      )}
    >
      {/* Thumbnail Placeholder */}
      <div className="relative h-32 sm:h-auto sm:w-48 rounded-lg bg-gradient-to-br from-primary/10 via-secondary-container to-primary/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
          <Play className="h-5 w-5 text-primary ml-0.5" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
              {course.courseTitle}
            </h3>
            <p className="text-sm text-muted">
              {course.universityName} · {course.instructorName}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">
              {course.completedLessons}/{course.totalLessons} lessons
            </span>
            <span className="font-medium text-primary">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted">
          <Clock className="h-3 w-3" />
          <span>Continue where you left off</span>
        </div>
      </div>
    </Link>
  );
}
