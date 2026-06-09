"use client";

import Link from "next/link";
import { cn } from "@/shared/utils/cn";
import { Progress } from "@/shared/ui/progress";
import { BookOpen } from "lucide-react";
import type { CourseProgress } from "../types/learning.types";

interface EnrolledCourseCardProps {
  course: CourseProgress;
  className?: string;
}

export function EnrolledCourseCard({ course, className }: EnrolledCourseCardProps) {
  const isCompleted = course.progress >= 100;

  return (
    <Link
      href={`/courses/${course.courseSlug}`}
      className={cn(
        "group card-elevation flex flex-col overflow-hidden",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-36 bg-gradient-to-br from-primary/10 via-secondary-container/50 to-primary/5 flex items-center justify-center">
        <BookOpen className="h-8 w-8 text-primary/40" />
        {isCompleted && (
          <div className="absolute top-3 right-3 rounded-full bg-success px-2.5 py-0.5 text-xs font-semibold text-white">
            Completed
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div className="flex-1">
          <h3 className="font-semibold text-on-surface text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {course.courseTitle}
          </h3>
          <p className="text-xs text-muted mt-1">{course.universityName}</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">
              {course.completedLessons}/{course.totalLessons} lessons
            </span>
            <span className={cn("font-medium", isCompleted ? "text-success" : "text-primary")}>
              {course.progress}%
            </span>
          </div>
          <Progress value={course.progress} className="h-1.5" />
        </div>
      </div>
    </Link>
  );
}
