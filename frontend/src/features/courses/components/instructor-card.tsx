"use client";

import { Star, BookOpen } from "lucide-react";
import type { MockInstructor } from "@/lib/mock-data/instructors";

interface InstructorCardProps {
  instructor: MockInstructor;
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  return (
    <div className="card-elevation p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
          {instructor.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-semibold text-on-surface">{instructor.name}</h3>
          <p className="text-sm text-muted">{instructor.title}</p>
          <p className="text-xs text-primary">{instructor.university}</p>
        </div>
      </div>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        {instructor.bio}
      </p>
      <div className="flex items-center gap-4 text-sm text-muted">
        <span className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-warning text-warning" />
          {instructor.rating} rating
        </span>
        <span className="flex items-center gap-1">
          <BookOpen className="h-4 w-4" />
          {instructor.coursesCount} courses
        </span>
      </div>
    </div>
  );
}
