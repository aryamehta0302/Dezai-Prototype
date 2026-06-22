"use client";

import { Award, BookOpen } from "lucide-react";
import { getThumbnailUrl } from "@/shared/utils/thumbnail";
import type { ApiProgram } from "../types/program.types";

interface CourseHeroProps {
  course: ApiProgram;
}

export function CourseHero({ course }: CourseHeroProps) {
  const totalLessons = (course.tracks ?? []).reduce((sum, t) =>
    sum + (t.modules ?? []).reduce((msum, m) => msum + (m.lessons ?? []).length, 0), 0);
  const instructorName = course.faculty?.user.name ?? "Dezai Faculty";

  return (
    <div className="relative bg-linear-to-br from-[#0a1628] via-[#0d1f3c] to-[#071224] text-white overflow-hidden">
      <img
        src={getThumbnailUrl(course.id)}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-15"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-10 left-20 h-48 w-48 rounded-full bg-secondary/20 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-(--container-max) px-4 sm:px-6 lg:px-12 py-12 lg:py-16">
        <div className="max-w-3xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <Award className="h-3 w-3" />
              Certificate Track
            </span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
            {course.title}
          </h1>

          <p className="text-lg text-white/70 leading-relaxed max-w-2xl">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {totalLessons} lessons
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
              {instructorName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{instructorName}</p>
              <p className="text-xs text-white/50">{course.institution?.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
