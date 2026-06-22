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
import { StatCard } from "@/shared/components/stat-card";
import { LevelProgressCard } from "@/features/achievements/components/level-progress-card";
import { AchievementGrid } from "@/features/achievements/components/achievement-grid";
import { ContinueLearningCard } from "../components/continue-learning-card";
import { EnrolledCourseCard } from "../components/enrolled-course-card";
import { StudentRankingCard } from "@/features/leaderboards/components/student-ranking-card";
import { TopPerformerList } from "@/features/leaderboards/components/top-performer-list";
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
  const { fetchEnrollments, fetchStats, xpEarned, enrollments, globalRank, isLoading: enrollmentsLoading } = useEnrollmentStore();
  const { fetchPrograms, isLoading: programsLoading } = useProgramsStore();
  const isLoading = enrollmentsLoading || programsLoading;
  const { enrolledCourses, inProgressCourses } = useProgress();
  const { stats, achievements, unlockedCount } = useAchievements();

  // Load data from backend on mount
  useEffect(() => {
    fetchEnrollments();
    fetchStats();
    fetchPrograms();
  }, [fetchEnrollments, fetchStats, fetchPrograms]);

  const { programs } = useProgramsStore();

  const programsMap = useMemo(() => {
    return programs.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as Record<string, any>);
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

  return (
    <PageContainer className="py-8 space-y-8 pb-16">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-2">
          {isLoading ? (
            <>
              <div className="h-10 w-64 bg-surface-low animate-pulse rounded-lg" />
              <div className="h-4 w-96 bg-surface-low animate-pulse rounded-lg" />
              <div className="h-10 w-40 bg-surface-low animate-pulse rounded-full mt-4" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-on-surface">
                {greeting()}, {user?.name?.split(" ")[0] || "Student"} 👋
              </h1>
              <p className="text-muted leading-relaxed max-w-2xl">
                {inProgressCourses.length > 0
                  ? `You're doing great! You've already earned ${xpEarned} XP this week. Keep the momentum going!`
                  : "Welcome to your new learning hub. Start by exploring our advanced AI and commerce programs."}
              </p>
              <div className="pt-2">
                <Link href="/catalog">
                  <Button className="gap-2 rounded-full px-6">
                    <BookOpen className="h-4 w-4" />
                    Explore Courses
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="w-full lg:w-[400px]">
          {isLoading ? (
            <div className="h-32 w-full bg-surface-low animate-pulse rounded-xl" />
          ) : (
            <LevelProgressCard xp={xpEarned} />
          )}
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-24 bg-surface-low animate-pulse rounded-xl" />
          ))
        ) : (
          <>
            <StatCard title="Enrolled" value={stats.enrolledCourses} icon={BookOpen} />
            <StatCard title="Completed" value={stats.completedCourses} icon={Trophy} />
            <StatCard title="Streak" value={`${stats.streakCount}d`} icon={Flame} />
            <StatCard title="Hours" value={stats.totalHours} icon={Clock} />
            <StatCard title="Unlocked" value={`${unlockedCount}`} icon={Sparkles} />
            <StatCard title="Rank" value={`#${globalRank}`} icon={Award} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Continue Learning */}
          {(isLoading || inProgressCourses.length > 0) && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  <Zap className="h-5 w-5 text-warning fill-warning" />
                  Continue Learning
                </h2>
                {!isLoading && (
                  <Link href="/catalog" className="text-sm text-primary hover:underline flex items-center gap-1">
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {isLoading ? (
                  <>
                    <div className="h-40 rounded-xl bg-surface-low animate-pulse" />
                    <div className="h-40 rounded-xl bg-surface-low animate-pulse" />
                  </>
                ) : (
                  inProgressCourses.slice(0, 2).map((course) => (
                    <ContinueLearningCard key={course.courseId} course={course} />
                  ))
                )}
              </div>
            </section>
          )}

          {/* Achievement Progress Preview */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Achievements
              </h2>
              {!isLoading && (
                <span className="text-xs font-bold text-muted uppercase tracking-widest bg-surface-low px-2 py-1 rounded shadow-sm border border-border-light">
                  {unlockedCount} / {achievements.length} Unlocked
                </span>
              )}
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-32 bg-surface-low animate-pulse rounded-xl" />
                <div className="h-32 bg-surface-low animate-pulse rounded-xl" />
                <div className="h-32 bg-surface-low animate-pulse rounded-xl" />
              </div>
            ) : (
              <AchievementGrid achievements={achievements.slice(0, 3)} />
            )}
          </section>

          {/* My Courses Catalog */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-on-surface">My Enrolled Courses</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 rounded-xl bg-surface-low animate-pulse" />
                ))}
              </div>
            ) : enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                {enrolledCourses.map((course) => (
                  <EnrolledCourseCard key={course.courseId} course={course} />
                ))}
              </div>
            ) : (
              <div className="card-elevation p-12 text-center space-y-4 bg-surface-low/50">
                <div className="h-16 w-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto">
                  <GraduationCap className="h-8 w-8 text-muted" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold">No active enrollments</h3>
                  <p className="text-sm text-muted">Pick a program from the catalog to start your journey.</p>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="xl:col-span-1 space-y-8">
          {/* Student Ranking Card — Sprint 5 */}
          {!isLoading && globalRank > 0 && (
            <StudentRankingCard
              rank={globalRank}
              xp={xpEarned}
              streakCount={stats.streakCount}
            />
          )}
          
          {/* Activity Tracking Placeholder */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-on-surface capitalize">activity feed</h2>
            <div className="card-elevation p-6 space-y-6">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-surface-low animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1 pt-1">
                      <div className="h-3 w-1/2 bg-surface-low animate-pulse rounded" />
                      <div className="h-2 w-3/4 bg-surface-low animate-pulse rounded" />
                    </div>
                  </div>
                ))
              ) : recentActivity.length > 0 ? (
                recentActivity.map((event, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {event.type.toUpperCase() === "ENROLLMENT" ? (
                        <BookOpen className="h-5 w-5 text-primary" />
                      ) : event.type.toUpperCase() === "COMPLETION" ? (
                        <Trophy className="h-5 w-5 text-success" />
                      ) : (
                        <Zap className="h-5 w-5 text-warning" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-on-surface">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted">
                        {event.description}
                      </p>
                      <p className="text-[10px] text-muted-dark capitalize">{event.type} &middot; Just now</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 text-muted/20 mx-auto mb-2" />
                  <p className="text-sm text-muted">No recent activity</p>
                </div>
              )}
              {!isLoading && (
                <Link href="/profile?tab=activity">
                  <Button variant="ghost" className="w-full text-xs text-primary font-bold">View Full History</Button>
                </Link>
              )}
            </div>
          </section>

          {/* Top Performer List — Sprint 5 */}
          <TopPerformerList />

        </div>
      </div>
    </PageContainer>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
