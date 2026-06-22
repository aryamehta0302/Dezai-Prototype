"use client";

import { useEffect, useState } from "react";
import { courseService } from "../services/course.service";
import { PageContainer } from "@/shared/components/page-container";
import { CourseHero } from "../components/course-hero";
import { SyllabusAccordion } from "../components/syllabus-accordion";
import { EnrollmentCTA } from "../components/enrollment-cta";
import { RelatedCourses } from "../components/related-courses";
import { EmptyState } from "@/shared/components/empty-state";
import { LoadingSkeleton } from "@/shared/components/loading-skeleton";
import { BookOpen, CheckCircle, Layers, FileText } from "lucide-react";
import type { ApiProgram } from "../types/program.types";

interface CourseDetailPageProps {
  slug: string;
}

export function CourseDetailPage({ slug }: CourseDetailPageProps) {
  const [course, setCourse] = useState<ApiProgram | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    courseService.getBySlug(slug).then((c) => {
      setCourse(c);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    return (
      <PageContainer className="py-16">
        <EmptyState
          icon={BookOpen}
          title="Course not found"
          description="The course you're looking for doesn't exist or has been removed."
        />
      </PageContainer>
    );
  }

  const allModules = (course.tracks ?? []).flatMap(t => t.modules ?? []);
  const allLessons = allModules.flatMap(m => m.lessons ?? []);
  const totalLessons = allLessons.length;
  const hasCurriculum = (course.tracks?.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-background">
      <CourseHero course={course} />

      <PageContainer className="py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-on-surface">
                About this course
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                {course.description}
              </p>
            </section>

            {hasCurriculum ? (
              course.tracks.map((track) => (
                <section key={track.id} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold text-on-surface">
                      {track.title || (track.type === "ROOTS" ? "Foundational Track" : "Advanced Track")}
                    </h2>
                  </div>
                  {track.modules.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {track.modules.map((mod) => (
                        <div key={mod.id} className="flex items-start gap-2.5 p-3 rounded-lg border border-border-light bg-surface-low/50">
                          <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-sm text-on-surface-variant font-medium">{mod.title}</span>
                            <p className="text-xs text-muted mt-0.5">{mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted italic">No modules added yet. Curriculum is being built.</p>
                  )}
                </section>
              ))
            ) : (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-on-surface">Course Structure</h2>
                <p className="text-sm text-muted">Curriculum content is being prepared. Check back soon.</p>
              </section>
            )}

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-on-surface">
                Course Content
              </h2>
              <p className="text-sm text-muted">
                {allModules.length > 0
                  ? `${allModules.length} module${allModules.length !== 1 ? "s" : ""} \u00B7 ${totalLessons} lesson${totalLessons !== 1 ? "s" : ""}`
                  : "Curriculum coming soon"}
              </p>
              {hasCurriculum ? (
                <SyllabusAccordion tracks={course.tracks} programSlug={slug} />
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 text-muted">
                  <FileText className="h-8 w-8" />
                  <p className="text-sm">No content modules yet</p>
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <EnrollmentCTA course={course} />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <RelatedCourses courseId={course.id} />
        </div>
      </PageContainer>
    </div>
  );
}

export function CourseDetailSkeleton() {
  const HeroBlock = ({ className }: { className: string }) => (
    <div className={`skeleton-shimmer ${className}`} style={{ backgroundColor: "rgba(255,255,255,0.08)", backgroundImage: "linear-gradient(90deg, transparent 25%, rgba(255,255,255,0.06) 50%, transparent 75%)" }} />
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero skeleton — dark toned */}
      <div className="relative bg-linear-to-br from-[#0a1628] via-[#0d1f3c] to-[#071224] overflow-hidden">
        <div className="mx-auto max-w-(--container-max) px-4 sm:px-6 lg:px-12 py-12 lg:py-16">
          <div className="max-w-3xl space-y-6">
            <HeroBlock className="h-5 w-32 rounded-lg" />
            <HeroBlock className="h-10 w-3/4 rounded-lg" />
            <HeroBlock className="h-4 w-full rounded-lg" />
            <HeroBlock className="h-4 w-2/3 rounded-lg" />
            <div className="flex items-center gap-3 pt-2">
              <HeroBlock className="h-10 w-10 rounded-full" />
              <div className="space-y-1.5">
                <HeroBlock className="h-3 w-28 rounded-lg" />
                <HeroBlock className="h-3 w-20 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <PageContainer className="py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <LoadingSkeleton className="h-5 w-40" />
              <LoadingSkeleton className="h-3 w-full" />
              <LoadingSkeleton className="h-3 w-full" />
              <LoadingSkeleton className="h-3 w-3/4" />
            </div>
            <div className="space-y-4">
              <LoadingSkeleton className="h-5 w-48" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-3 rounded-lg border border-border-light">
                    <LoadingSkeleton className="h-4 w-3/4" />
                    <LoadingSkeleton className="h-3 w-16 mt-2" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <LoadingSkeleton className="h-5 w-32" />
              <LoadingSkeleton className="h-3 w-48" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-lg border border-border-light">
                  <LoadingSkeleton className="h-4 w-1/3" />
                  <LoadingSkeleton className="h-3 w-2/3 mt-2" />
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-24 card-elevation p-6 space-y-4">
              <LoadingSkeleton className="h-8 w-20" />
              <LoadingSkeleton className="h-10 w-full rounded-xl" />
              <div className="space-y-2">
                <LoadingSkeleton className="h-3 w-full" />
                <LoadingSkeleton className="h-3 w-full" />
                <LoadingSkeleton className="h-3 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
