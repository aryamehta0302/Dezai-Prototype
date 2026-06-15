"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { useProgress } from "../hooks/useProgress";
import { PageContainer } from "@/shared/components/page-container";
import { StatCard } from "@/shared/components/stat-card";
import { EmptyState } from "@/shared/components/empty-state";
import { ContinueLearningCard } from "../components/continue-learning-card";
import { EnrolledCourseCard } from "../components/enrolled-course-card";
import { Button } from "@/shared/ui/button";
import {
  BookOpen,
  Trophy,
  Award,
  Zap,
  Flame,
  Clock,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

export function StudentDashboardPage() {
  const { user } = useAuthStore();
  const { enroll } = useEnrollmentStore();
  const { enrolledCourses, inProgressCourses, stats } = useProgress();

  // Seed initial enrollments from mock user data on first load
  useEffect(() => {
    const enrolledCourseIds = (user as any)?.enrolledCourseIds;
    if (enrolledCourseIds) {
      enrolledCourseIds.forEach((courseId: string) => {
        enroll(courseId);
      });
    }
  }, [user, enroll]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <PageContainer className="py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">
            {greeting()}, {user?.name?.split(" ")[0] || "Student"} 👋
          </h1>
          <p className="text-muted mt-1">
            {inProgressCourses.length > 0
              ? `You have ${inProgressCourses.length} course${inProgressCourses.length > 1 ? "s" : ""} in progress. Keep going!`
              : "Ready to start learning? Browse our catalog."}
          </p>
        </div>
        <Link href="/catalog">
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Browse Catalog
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 fade-in-staggered">
        <StatCard
          title="Enrolled"
          value={stats.enrolledCourses}
          icon={BookOpen}
          trend={{ value: 12, direction: "up" }}
        />
        <StatCard
          title="Completed"
          value={stats.completedCourses}
          icon={Trophy}
        />
        <StatCard
          title="Certificates"
          value={stats.certificatesEarned}
          icon={Award}
        />
        <StatCard title="XP Earned" value={stats.xpEarned} icon={Zap} />
        <StatCard
          title="Streak"
          value={`${stats.learningStreak}d`}
          icon={Flame}
        />
        <StatCard
          title="Hours"
          value={stats.hoursLearned}
          icon={Clock}
        />
      </div>

      {/* Continue Learning */}
      {inProgressCourses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-on-surface">
              Continue Learning
            </h2>
            <Link
              href="/catalog"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {inProgressCourses.slice(0, 2).map((course) => (
              <ContinueLearningCard key={course.courseId} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* All Enrolled Courses */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-on-surface">
          My Courses
        </h2>
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 fade-in-staggered">
            {enrolledCourses.map((course) => (
              <EnrolledCourseCard key={course.courseId} course={course} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={GraduationCap}
            title="No courses yet"
            description="Browse our catalog to find your first course and start learning."
            action={
              <Link href="/catalog">
                <Button className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Explore Courses
                </Button>
              </Link>
            }
          />
        )}
      </section>
    </PageContainer>
  );
}
