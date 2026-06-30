"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Clock, GraduationCap } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { LoadingSkeleton } from "@/shared/components/loading-skeleton";
import { ContinueLearningCard } from "@/features/learning/components/continue-learning-card";
import { EnrolledCourseCard } from "@/features/learning/components/enrolled-course-card";
import type { CourseProgress } from "@/features/learning/types/learning.types";

interface ContinueLearningWidgetProps {
  inProgressCourses: CourseProgress[];
  enrolledCourses: CourseProgress[];
  isLoading: boolean;
}

export function ContinueLearningWidget({
  inProgressCourses,
  enrolledCourses,
  isLoading,
}: ContinueLearningWidgetProps) {
  return (
    <>
      {/* Continue Learning */}
      {isLoading ? (
        <section className="space-y-4">
          <LoadingSkeleton className="h-6 w-48 rounded-lg" />
          <div className="grid gap-4 md:grid-cols-2">
            <LoadingSkeleton className="h-[150px] rounded-xl" />
            <LoadingSkeleton className="h-[150px] rounded-xl" />
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-on-surface">
              Continue Learning
            </h2>
            <Link
              href="/catalog"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {inProgressCourses.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {inProgressCourses.slice(0, 2).map((course) => (
                <ContinueLearningCard key={course.courseId} course={course} />
              ))}
            </div>
          ) : (
            <div className="card-elevation py-10 text-center space-y-3">
              <div className="h-10 w-10 rounded-full bg-surface-low flex items-center justify-center mx-auto">
                <Clock className="h-5 w-5 text-secondary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-on-surface">
                  No courses in progress
                </p>
                <p className="text-xs text-secondary">
                  Enroll in a program to start learning.
                </p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Enrolled Courses */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-on-surface">
          My Enrolled Courses
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <LoadingSkeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enrolledCourses.map((course) => (
              <EnrolledCourseCard key={course.courseId} course={course} />
            ))}
          </div>
        ) : (
          <div className="card-elevation py-12 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-surface-low flex items-center justify-center mx-auto">
              <GraduationCap className="h-6 w-6 text-secondary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-on-surface">
                No enrollments yet
              </p>
              <p className="text-sm text-secondary">
                Browse the catalog to find a program that suits you.
              </p>
            </div>
            <Link href="/catalog">
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Browse Catalog
              </Button>
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
