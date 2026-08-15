"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { useProgramsStore } from "@/lib/stores/programs.store";
import { useProgress } from "../hooks/useProgress";
import { useAchievements } from "@/features/achievements/hooks/useAchievements";
import { PageContainer } from "@/shared/components/page-container";
import { LevelProgressCard } from "@/features/achievements/components/level-progress-card";
import { AchievementGrid } from "@/features/achievements/components/achievement-grid";
import { ContinueLearningCard } from "../components/continue-learning-card";
import { EnrolledCourseCard } from "../components/enrolled-course-card";
import { StudentRankingCard } from "@/features/leaderboards/components/student-ranking-card";
import { LoadingSkeleton } from "@/shared/components/loading-skeleton";
import { Button } from "@/shared/ui/button";
import { MilestoneCard } from "../components/milestone-card";
import { InsightCard } from "../components/insight-card";
import { RecommendationCard } from "../components/recommendation-card";
import { ActivityTimeline } from "../components/activity-timeline";
import { LearningPatternCard } from "../components/learning-pattern-card";
import { WeakTopicsCard } from "../components/weak-topics-card";
import { PredictionRulesCard } from "../components/prediction-rules-card";
import { DifficultyAnalysisCard } from "../components/difficulty-analysis-card";
import { apiClient } from "@/core/api/client";
import {
  useMilestones,
  useInsights,
  useRecommendations,
  useActivityTimeline,
  useLearningPatterns,
  useWeakTopics,
  usePredictionRules,
  useDifficultyAnalysis,
} from "../hooks/useLearningIntelligence";
import {
  BookOpen,
  Trophy,
  Award,
  Flame,
  Clock,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Layers,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  BarChart3,
} from "lucide-react";

export function StudentDashboardPage() {
  const { user } = useAuthStore();
  const { fetchEnrollments, fetchStats, xpEarned, globalRank, hasFetched } = useEnrollmentStore();
  const { fetchPrograms, hasFetched: programsHasFetched } = useProgramsStore();
  const { enrolledCourses, inProgressCourses, stats: progressStats } = useProgress();
  const { achievements, unlockedCount, isLoading: achievementsLoading } = useAchievements();

  const { data: milestones, unlocked: unlockedMilestones, total: totalMCount, loading: loadingMilestones } = useMilestones();
  const { data: insights, loading: loadingInsights } = useInsights();
  const { data: recommendations, loading: loadingRecs } = useRecommendations();
  const { data: timelineEvents, loading: loadingTimeline } = useActivityTimeline(5);
  const { data: patterns, loading: loadingPatterns } = useLearningPatterns();
  const { data: weakTopics, loading: loadingWeak } = useWeakTopics();
  const { data: predictionRules, loading: loadingPrediction } = usePredictionRules();
  const { data: difficultyAnalysis, loading: loadingDifficulty } = useDifficultyAnalysis();

  const [showAllMilestones, setShowAllMilestones] = useState(false);
  const [showAllRecs, setShowAllRecs] = useState(false);
  const [weeklyRank, setWeeklyRank] = useState<number | null>(null);

  useEffect(() => {
    fetchEnrollments();
    fetchStats();
    fetchPrograms();

    apiClient.get<{ rank: number }>("/leaderboards/widgets/student")
      .then(res => {
        if (res?.rank) setWeeklyRank(res.rank);
      })
      .catch(() => {});
  }, [fetchEnrollments, fetchStats, fetchPrograms]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <PageContainer className="py-12 space-y-10 pb-20">
      {/* Header — always available from user store */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-2">
          <h1 className="text-3xl font-bold text-on-surface">
            {greeting()}, {user?.name?.split(" ")[0] || "Student"}
          </h1>
          {!hasFetched || !programsHasFetched ? (
            <LoadingSkeleton className="h-5 w-96 rounded-lg" />
          ) : (
            <p className="text-secondary leading-relaxed max-w-2xl">
              {inProgressCourses.length > 0
                ? `You have ${inProgressCourses.length} course${inProgressCourses.length > 1 ? 's' : ''} in progress and ${xpEarned} XP earned.`
                : "Start exploring our programs to begin your learning journey."}
            </p>
          )}
          <div className="pt-3">
            <Link href="/catalog">
              <Button className="gap-2 px-6">
                <BookOpen className="h-4 w-4" />
                Explore Courses
              </Button>
            </Link>
          </div>
        </div>
        <div className="w-full lg:w-[380px]">
          <LevelProgressCard xp={xpEarned} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Continue Learning — highest priority */}
          {!hasFetched || !programsHasFetched ? (
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
                <h2 className="text-xl font-bold text-on-surface">Continue Learning</h2>
                <Link href="/catalog" className="text-sm text-primary hover:underline flex items-center gap-1">
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
                    <p className="text-sm font-medium text-on-surface">No courses in progress</p>
                    <p className="text-xs text-secondary">Enroll in a program to start learning.</p>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* My Enrolled Courses — second priority */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-on-surface">My Enrolled Courses</h2>
            {!hasFetched || !programsHasFetched ? (
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

          {/* Milestones */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Milestones
              </h2>
              {totalMCount > 0 && (
                <span className="text-xs text-secondary">{unlockedMilestones.length} / {totalMCount} unlocked</span>
              )}
            </div>
            {loadingMilestones ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <LoadingSkeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            ) : milestones.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(showAllMilestones ? milestones : milestones.slice(0, 4)).map((ms) => (
                    <MilestoneCard key={ms.id} milestone={ms} />
                  ))}
                </div>
                {milestones.length > 4 && (
                  <button
                    onClick={() => setShowAllMilestones(!showAllMilestones)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline mx-auto"
                  >
                    {showAllMilestones ? (
                      <>Show less <ChevronDown className="h-3 w-3" /></>
                    ) : (
                      <>Show all ({milestones.length}) <ChevronRight className="h-3 w-3" /></>
                    )}
                  </button>
                )}
              </>
            ) : (
              <div className="card-elevation py-10 text-center space-y-2">
                <p className="text-sm text-secondary">No milestones yet — keep learning to unlock your first one!</p>
              </div>
            )}
          </section>

          {/* Recommendations */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                Recommendations
              </h2>
            </div>
            {loadingRecs ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <LoadingSkeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <>
                <div className="space-y-3">
                  {(showAllRecs ? recommendations : recommendations.slice(0, 3)).map((rec) => (
                    <RecommendationCard key={`${rec.type}-${rec.priority}`} recommendation={rec} />
                  ))}
                </div>
                {recommendations.length > 3 && (
                  <button
                    onClick={() => setShowAllRecs(!showAllRecs)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline mx-auto"
                  >
                    {showAllRecs ? (
                      <>Show less <ChevronDown className="h-3 w-3" /></>
                    ) : (
                      <>Show all ({recommendations.length}) <ChevronRight className="h-3 w-3" /></>
                    )}
                  </button>
                )}
              </>
            ) : (
              <div className="card-elevation py-10 text-center space-y-2">
                <p className="text-sm text-secondary">No recommendations yet — keep learning to get personalized suggestions.</p>
              </div>
            )}
          </section>

          {/* Achievements */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface">Achievements</h2>
              {achievements.length > 0 && (
                <span className="text-xs text-secondary">{unlockedCount} / {achievements.length} unlocked</span>
              )}
            </div>
            {achievementsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LoadingSkeleton className="h-28 rounded-xl" />
                <LoadingSkeleton className="h-28 rounded-xl" />
                <LoadingSkeleton className="h-28 rounded-xl" />
              </div>
            ) : (
              <AchievementGrid achievements={achievements.slice(0, 3)} />
            )}
          </section>

          {/* Learning Analytics */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Learning Analytics
            </h2>
            <div className="flex flex-wrap gap-4">
              {loadingWeak ? (
                <LoadingSkeleton className="h-44 rounded-xl w-[calc(33%-8px)] min-w-[250px]" />
              ) : weakTopics.length > 0 ? (
                <div className="w-[calc(33%-8px)] min-w-[250px]"><WeakTopicsCard topics={weakTopics} /></div>
              ) : null}
              {loadingDifficulty ? (
                <LoadingSkeleton className="h-44 rounded-xl w-[calc(33%-8px)] min-w-[250px]" />
              ) : difficultyAnalysis.length > 0 ? (
                <div className="w-[calc(33%-8px)] min-w-[250px]"><DifficultyAnalysisCard analysis={difficultyAnalysis} /></div>
              ) : null}
              {loadingPrediction ? (
                <LoadingSkeleton className="h-44 rounded-xl w-[calc(33%-8px)] min-w-[250px]" />
              ) : predictionRules && predictionRules.length > 0 ? (
                <div className="w-[calc(33%-8px)] min-w-[250px]"><PredictionRulesCard rules={predictionRules} /></div>
              ) : null}
            </div>
          </section>
        </div>

        <div className="xl:col-span-1 space-y-8">
          {/* Stats — compact summary card */}
          {!hasFetched || !programsHasFetched ? (
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

          {/* Learning Insights */}
          <section className="space-y-3">
            <h3 className="font-bold text-on-surface flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              Insights
            </h3>
            {loadingInsights ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <LoadingSkeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : insights.length > 0 ? (
              <div className="space-y-3">
                {insights.slice(0, 3).map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary card-elevation py-6 text-center">No insights yet. Complete more lessons to get learning insights.</p>
            )}
          </section>

          {/* Learning Patterns */}
          {loadingPatterns ? (
            <LoadingSkeleton className="h-44 rounded-xl" />
          ) : patterns ? (
            <LearningPatternCard pattern={patterns} />
          ) : (
            <div className="card-elevation p-5 text-center">
              <p className="text-sm text-secondary">Not enough data to detect learning patterns yet.</p>
            </div>
          )}

          {/* Ranking Card */}
          {globalRank !== null && globalRank > 0 ? (
            <StudentRankingCard
              rank={globalRank}
              weeklyRank={weeklyRank}
              xp={xpEarned}
              streakCount={progressStats.learningStreak}
            />
          ) : (
            <div className="card-elevation p-5 text-center space-y-2">
              <p className="text-sm font-medium text-on-surface">Ranking unavailable</p>
              <p className="text-xs text-secondary">Complete lessons and earn XP to appear on the leaderboard.</p>
            </div>
          )}

          {/* Activity Timeline */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-on-surface">Recent Activity</h2>
            {loadingTimeline ? (
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
              <div className="card-elevation p-5">
                <ActivityTimeline events={timelineEvents} />
                <Link href="/profile?tab=activity">
                  <Button variant="ghost" className="w-full text-xs text-primary font-medium mt-2">View Full History</Button>
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
