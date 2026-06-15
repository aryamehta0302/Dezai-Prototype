"use client";

import Link from "next/link";
import { cn } from "@/shared/utils/cn";
import { Badge } from "@/shared/ui/badge";
import { Star, Clock, Users, BookOpen } from "lucide-react";
import { formatCurrency } from "@/shared/utils/format";
import { CertificateTier } from "@/shared/types/common.types";
import type { MockCourse } from "@/lib/mock-data/courses";

const tierLabels: Record<CertificateTier, { label: string; color: string }> = {
  [CertificateTier.TIER_1]: { label: "Foundational", color: "bg-info/10 text-info" },
  [CertificateTier.TIER_2]: { label: "Academic", color: "bg-warning/10 text-warning" },
  [CertificateTier.TIER_3]: { label: "Professional", color: "bg-success/10 text-success" },
};

interface CourseCardProps {
  course: MockCourse;
  className?: string;
}

export function CourseCard({ course, className }: CourseCardProps) {
  const tier = tierLabels[course.tier];

  return (
    <Link
      href={`/programs/${course.slug}`}
      className={cn(
        "group card-elevation flex flex-col overflow-hidden",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-40 bg-gradient-to-br from-primary/8 via-secondary-container/40 to-primary/5 flex items-center justify-center overflow-hidden">
        <BookOpen className="h-10 w-10 text-primary/30 group-hover:scale-110 transition-transform duration-300" />
        <div className="absolute top-3 left-3">
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", tier.color)}>
            {tier.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 space-y-3">
        <div className="flex-1 space-y-1.5">
          <h3 className="font-semibold text-on-surface text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-muted line-clamp-2">
            {course.shortDescription}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-on-surface-variant">
            {course.instructorName} · {course.universityName}
          </p>

          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-warning text-warning" />
              {course.rating}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {course.enrollmentCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {course.duration}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border-light">
            <span className="text-base font-bold text-on-surface">
              {formatCurrency(course.price)}
            </span>
            <Badge variant="secondary" className="text-xs">
              {course.totalLessons} lessons
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
