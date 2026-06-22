"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { useProgramsStore } from "@/lib/stores/programs.store";
import { useProgress } from "../hooks/useProgress";
import { useAchievements } from "@/features/achievements/hooks/useAchievements";
import { activityService } from "@/features/users/services/activity.service";
import { PageContainer } from "@/shared/components/page-container";
import { LevelProgressCard } from "@/features/achievements/components/level-progress-card";
import { AchievementGrid } from "@/features/achievements/components/achievement-grid";
import { ContinueLearningCard } from "../components/continue-learning-card";
import { EnrolledCourseCard } from "../components/enrolled-course-card";
import { StudentRankingCard } from "@/features/leaderboards/components/student-ranking-card";
import { TopPerformerList } from "@/features/leaderboards/components/top-performer-list";
import { LoadingSkeleton } from "@/shared/components/loading-skeleton";
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
  Sparkles,
} from "lucide-react";

export function StudentDashboardPage() {
  const { user } = useAuthStore();
  const { fetchEnrollments, fetchStats, xpEarned, enrollments, globalRank, isLoading, hasFetched } = useEnrollmentStore();
  const { fetchPrograms, programs } = useProgramsStore();
  const { enrolledCourses, inProgressCourses, stats: progressStats } = useProgress();
  const { achievements, unlockedCount } = useAchievements();

  useEffect(() => {
    fetchEnrollments();
    fetchStats();
    fetchPrograms();
  }, [fetchEnrollments, fetchStats, fetchPrograms]);

  const programsMap = useMemo(() => {
    return programs.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as Record<string, { title: string }>);
  }, [programs]);

  const recentActivity = useMemo(() =>
    activityService.getEvents(enrollments, achievements, programsMap).slice(0, 5),
    [enrollments, achievements, programsMap]
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const hasData = hasFetched || Object.keys(enrollments).length > 0;
  const showSkeleton = !hasData && isLoading;

  return (
    <PageContainer className="py-12 space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-2">
          {showSkeleton ? (
            <LoadingSkeleton className="h-10 w-64 rounded-lg" />
          ) : (
            <h1 className="text-3xl font-bold text-on-surface">
              {greeting()}, {user?.name?.split(" ")[0] || "Student"}
            </h1>
          )}
          {showSkeleton ? (
            <LoadingSkeleton className="h-5 w-96 rounded-lg" />
          ) : (
            <p className="text-secondary leading-relaxed max-w-2xl">
              {inProgressCourses.length > 0
                ? `You have ${inProgressCourses.length} course${inProgressCourses.length > 1 ? 's' : ''} in progress and ${xpEarned} XP earned.`
                : "Start exploring our programs to begin your learning journey."}
            </p>
          )}
          {!showSkeleton && (
            <div className="pt-3">
              <Link href="/catalog">
                <Button className="gap-2 px-6">
                  <BookOpen className="h-4 w-4" />
                  Explore Courses
                </Button>
              </Link>
            </div>
          )}
        </div>
        <div className="w-full lg:w-[380px]">
          {showSkeleton ? (
            <LoadingSkeleton className="h-[140px] rounded-xl" />
          ) : (
            <LevelProgressCard xp={xpEarned} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Continue Learning — highest priority */}
          {showSkeleton ? (
            <section className="space-y-4">
              <LoadingSkeleton className="h-6 w-48 rounded-lg" />
              <div className="grid gap-4 md:grid-cols-2">
                <LoadingSkeleton className="h-[150px] rounded-xl" />
                <LoadingSkeleton className="h-[150px] rounded-xl" />
              </div>
            </section>
          ) : inProgressCourses.length > 0 ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-on-surface">Continue Learning</h2>
                <Link href="/catalog" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {inProgressCourses.slice(0, 2).map((course) => (
                  <ContinueLearningCard key={course.courseId} course={course} />
                ))}
              </div>
            </section>
          ) : null}

          {/* My Enrolled Courses — second priority */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-on-surface">My Enrolled Courses</h2>
            {showSkeleton ? (
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
                  <p className="text-sm font-medium text-on-surface">No enrollments yet</p>
                  <p className="text-sm text-secondary">Browse the catalog to find a program that suits you.</p>
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

          {/* Achievements */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface">Achievements</h2>
              {!showSkeleton && (
                <span className="text-xs text-secondary">{unlockedCount} / {achievements.length} unlocked</span>
              )}
            </div>
            {showSkeleton ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LoadingSkeleton className="h-28 rounded-xl" />
                <LoadingSkeleton className="h-28 rounded-xl" />
                <LoadingSkeleton className="h-28 rounded-xl" />
              </div>
            ) : (
              <AchievementGrid achievements={achievements.slice(0, 3)} />
            )}
          </section>
        </div>

        <div className="xl:col-span-1 space-y-8">
          {/* Stats — compact summary card */}
          {showSkeleton ? (
            <LoadingSkeleton className="h-64 rounded-xl" />
          ) : (
            <div className="card-elevation p-5 space-y-4">
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider">Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1 p-3 rounded-lg bg-surface-low">
                  <span className="text-xs text-secondary flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3" /> Enrolled
                  </span>
                  <p className="text-lg font-bold text-on-surface">{progressStats.enrolledCourses}</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-surface-low">
                  <span className="text-xs text-secondary flex items-center gap-1.5">
                    <Trophy className="h-3 w-3" /> Completed
                  </span>
                  <p className="text-lg font-bold text-on-surface">{progressStats.completedCourses}</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-surface-low">
                  <span className="text-xs text-secondary flex items-center gap-1.5">
                    <Flame className="h-3 w-3" /> Streak
                  </span>
                  <p className="text-lg font-bold text-on-surface">{progressStats.learningStreak}d</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-surface-low">
                  <span className="text-xs text-secondary flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> Hours
                  </span>
                  <p className="text-lg font-bold text-on-surface">{progressStats.hoursLearned}</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-surface-low">
                  <span className="text-xs text-secondary flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" /> Unlocked
                  </span>
                  <p className="text-lg font-bold text-on-surface">{unlockedCount}</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-surface-low">
                  <span className="text-xs text-secondary flex items-center gap-1.5">
                    <Award className="h-3 w-3" /> Rank
                  </span>
                  <p className="text-lg font-bold text-on-surface">#{globalRank ?? '-'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Ranking Card */}
          {!showSkeleton && globalRank !== null && globalRank > 0 && (
            <StudentRankingCard
              rank={globalRank}
              xp={xpEarned}
              streakCount={progressStats.learningStreak}
            />
          )}

          {/* Activity Feed */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-on-surface">Recent Activity</h2>
            {showSkeleton ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4">
                    <LoadingSkeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <LoadingSkeleton className="h-4 w-1/2 rounded" />
                      <LoadingSkeleton className="h-3 w-3/4 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-elevation p-5 space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((event, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-8 w-8 rounded-lg bg-surface-low flex items-center justify-center shrink-0">
                        {event.type === "ENROLLMENT" ? (
                          <BookOpen className="h-4 w-4 text-primary" />
                        ) : event.type === "COMPLETION" ? (
                          <Trophy className="h-4 w-4 text-success" />
                        ) : (
                          <Zap className="h-4 w-4 text-warning" />
                        )}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-sm font-medium text-on-surface truncate">{event.title}</p>
                        <p className="text-xs text-secondary truncate">{event.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <Clock className="h-6 w-6 text-muted/30 mx-auto mb-2" />
                    <p className="text-sm text-secondary">No recent activity</p>
                  </div>
                )}
                <Link href="/profile?tab=activity">
                  <Button variant="ghost" className="w-full text-xs text-primary font-medium">View Full History</Button>
                </Link>
              </div>
            )}
          </section>

          <TopPerformerList />
        </div>
      </div>
    </PageContainer>
  );
}
