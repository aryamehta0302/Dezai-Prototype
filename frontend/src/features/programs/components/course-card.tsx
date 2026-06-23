"use client";

import Link from "next/link";
import { cn } from "@/shared/utils/cn";
import { Badge } from "@/shared/ui/badge";
import { BookOpen } from "lucide-react";
import { slugify } from "@/shared/utils/slug";
import { getCourseGradient, getThumbnailUrl } from "@/shared/utils/thumbnail";
import type { ApiProgram } from "../types/program.types";

interface CourseCardProps {
  course: ApiProgram;
  className?: string;
}

export function CourseCard({ course, className }: CourseCardProps) {
  const slug = slugify(course.title);
  const totalLessons = course.tracks.reduce((sum, t) =>
    sum + t.modules.reduce((msum, m) => msum + m.lessons.length, 0), 0);
  const instructorName = course.faculty?.user.name ?? "Dezai Faculty";

  return (
    <Link
      href={`/programs/${slug}`}
      className={cn("group card-elevation flex flex-col overflow-hidden", className)}
    >
      <div className={cn("relative h-40 flex items-center justify-center overflow-hidden bg-gradient-to-br", getCourseGradient(course.id))}>
        <img
          src={course.thumbnail ?? getThumbnailUrl(course.id)}
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <BookOpen className="relative h-10 w-10 text-primary/40 group-hover:scale-110 transition-transform duration-300" />
      </div>

      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div className="flex-1 space-y-1.5">
          <h3 className="font-semibold text-on-surface text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-muted line-clamp-2">
            {course.description}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-on-surface-variant">
            {instructorName} &middot; {course.institution?.name}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {totalLessons} lessons
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border-light">
            <span className="text-base font-bold text-on-surface">
              Free
            </span>
            <Badge variant="secondary" className="text-xs">
              {totalLessons > 0 ? `${totalLessons} lessons` : "Coming soon"}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
