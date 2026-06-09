"use client";

import { courseService } from "../services/course.service";
import { PageContainer } from "@/shared/components/page-container";
import { CourseHero } from "../components/course-hero";
import { SyllabusAccordion } from "../components/syllabus-accordion";
import { InstructorCard } from "../components/instructor-card";
import { EnrollmentCTA } from "../components/enrollment-cta";
import { RelatedCourses } from "../components/related-courses";
import { EmptyState } from "@/shared/components/empty-state";
import { BookOpen, CheckCircle } from "lucide-react";

interface CourseDetailPageProps {
  slug: string;
}

export function CourseDetailPage({ slug }: CourseDetailPageProps) {
  const course = courseService.getBySlug(slug);

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

  const instructor = courseService.getInstructor(course.instructorId);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <CourseHero course={course} />

      {/* Content */}
      <PageContainer className="py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-on-surface">
                About this course
              </h2>
              <p className="text-on-surface-variant leading-relaxed">
                {course.description}
              </p>
            </section>

            {/* Outcomes */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-on-surface">
                What you&apos;ll learn
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.outcomes.map((outcome, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-on-surface-variant">{outcome}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Prerequisites */}
            {course.prerequisites.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-on-surface">
                  Prerequisites
                </h2>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {prereq}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Syllabus */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-on-surface">
                Course Content
              </h2>
              <p className="text-sm text-muted">
                {course.totalModules} modules · {course.totalLessons} lessons
              </p>
              <SyllabusAccordion modules={course.modules} />
            </section>

            {/* Instructor */}
            {instructor && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-on-surface">
                  Instructor
                </h2>
                <InstructorCard instructor={instructor} />
              </section>
            )}
          </div>

          {/* Sidebar — Enrollment CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <EnrollmentCTA course={course} />
            </div>
          </div>
        </div>

        {/* Related Courses */}
        <div className="mt-12">
          <RelatedCourses courseId={course.id} />
        </div>
      </PageContainer>
    </div>
  );
}
