"use client";

import { Badge } from "@/shared/ui/badge";
import { Star, Clock, Users, Award } from "lucide-react";
import { formatCurrency } from "@/shared/utils/format";
import { CertificateTier } from "@/shared/types/common.types";
import type { MockCourse } from "@/lib/mock-data/courses";
import { cn } from "@/shared/utils/cn";

const tierConfig: Record<CertificateTier, { label: string; color: string; bg: string }> = {
  [CertificateTier.TIER_1]: { label: "Tier 1 · Foundational", color: "text-info", bg: "bg-info/10" },
  [CertificateTier.TIER_2]: { label: "Tier 2 · University Accredited", color: "text-warning", bg: "bg-warning/10" },
  [CertificateTier.TIER_3]: { label: "Tier 3 · Industry Verified", color: "text-success", bg: "bg-success/10" },
};

interface CourseHeroProps {
  course: MockCourse;
}

export function CourseHero({ course }: CourseHeroProps) {
  const tier = tierConfig[course.tier];

  return (
    <div className="relative bg-linear-to-br from-[#0a1628] via-[#0d1f3c] to-[#071224] text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 right-10 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute bottom-10 left-20 h-48 w-48 rounded-full bg-secondary/20 blur-2xl" />
      </div>

      <div className="relative mx-auto max-w-(--container-max) px-4 sm:px-6 lg:px-12 py-12 lg:py-16">
        <div className="max-w-3xl space-y-6">
          {/* Tier Badge */}
          <div className="flex items-center gap-3">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", tier.bg, tier.color)}>
              <Award className="h-3 w-3" />
              {tier.label}
            </span>
            <Badge variant="secondary" className="bg-white/10 text-white/80 border-white/10">
              {course.category}
            </Badge>
          </div>

          {/* Title */}
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
            {course.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-white/70 leading-relaxed max-w-2xl">
            {course.shortDescription}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-semibold text-white">{course.rating}</span>
              <span>({course.reviewCount} reviews)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {course.enrollmentCount.toLocaleString()} enrolled
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {course.duration} · {course.totalLessons} lessons
            </span>
          </div>

          {/* Instructor & University */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
              {course.instructorName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{course.instructorName}</p>
              <p className="text-xs text-white/50">{course.universityName}</p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 pt-2">
            <span className="text-3xl font-bold">{formatCurrency(course.price)}</span>
            {course.price > 0 && (
              <span className="text-sm text-white/50 line-through">
                {formatCurrency(Math.round(course.price * 1.5))}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
