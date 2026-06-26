"use client";

import Link from "next/link";
import { BookOpen, Sparkles, Lightbulb, BarChart3, ChevronDown, ChevronRight } from "lucide-react";
import { PageContainer } from "@/shared/components/page-container";
import { LoadingSkeleton } from "@/shared/components/loading-skeleton";
import { LevelProgressCard } from "@/features/achievements/components/level-progress-card";
import { Button } from "@/shared/ui/button";
import { InsightCard } from "@/features/learning/components/insight-card";
import { RecommendationCard } from "@/features/learning/components/recommendation-card";
import { ActivityTimeline } from "@/features/learning/components/activity-timeline";
import { LearningPatternCard } from "@/features/learning/components/learning-pattern-card";
import { WeakTopicsCard } from "@/features/learning/components/weak-topics-card";
import { PredictionRulesCard } from "@/features/learning/components/prediction-rules-card";
import { DifficultyAnalysisCard } from "@/features/learning/components/difficulty-analysis-card";

import { useDashboardData } from "../hooks/useDashboardData";
import { useDashboardStore } from "../store/dashboard.store";

import { StatsOverviewWidget } from "./widgets/StatsOverviewWidget";
import { ContinueLearningWidget } from "./widgets/ContinueLearningWidget";
import { AchievementsWidget } from "./widgets/AchievementsWidget";
import { LeaderboardWidget } from "./widgets/LeaderboardWidget";
import { CredentialWidget } from "./widgets/CredentialWidget";
import { AssessmentProgressWidget } from "./widgets/AssessmentProgressWidget";
import { NotificationWidget } from "./widgets/NotificationWidget";

export function StudentDashboard() {
  const data = useDashboardData();
  const { showAllRecs, toggleRecs } = useDashboardStore();

  const {
    user,
    greeting,
    showSkeleton,
    xpEarned,
    globalRank,
    weeklyRank,
    progressStats,
    enrolledCourses,
    inProgressCourses,
    achievements,
    unlockedCount,
    milestones,
    insights,
    recommendations,
    timeline,
    patterns,
    weakTopics,
    predictionRules,
    difficultyAnalysis,
  } = data;

  return (
    <PageContainer className="py-12 space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-2">
          {showSkeleton ? (
            <LoadingSkeleton className="h-10 w-64 rounded-lg" />
          ) : (
            <h1 className="text-3xl font-bold text-on-surface">
              {greeting}, {user?.name?.split(" ")[0] || "Student"}
            </h1>
          )}
          {showSkeleton ? (
            <LoadingSkeleton className="h-5 w-96 rounded-lg" />
          ) : (
            <p className="text-secondary leading-relaxed max-w-2xl">
              {inProgressCourses.length > 0
                ? `You have ${inProgressCourses.length} course${
                    inProgressCourses.length > 1 ? "s" : ""
                  } in progress and ${xpEarned} XP earned.`
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
        {/* Main Column */}
        <div className="xl:col-span-2 space-y-8">
          {/* Continue Learning + Enrolled Courses */}
          <ContinueLearningWidget
            inProgressCourses={inProgressCourses}
            enrolledCourses={enrolledCourses}
            isLoading={showSkeleton}
          />

          {/* Milestones */}
          <AssessmentProgressWidget
            milestones={milestones.data}
            unlockedMilestones={milestones.unlocked}
            totalCount={milestones.total}
            isLoading={showSkeleton || milestones.loading}
          />

          {/* Recommendations */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-warning" />
                Recommendations
              </h2>
            </div>
            {showSkeleton || recommendations.loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <LoadingSkeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : recommendations.data.length > 0 ? (
              <>
                <div className="space-y-3">
                  {(showAllRecs
                    ? recommendations.data
                    : recommendations.data.slice(0, 3)
                  ).map((rec) => (
                    <RecommendationCard
                      key={`${rec.type}-${rec.priority}`}
                      recommendation={rec}
                    />
                  ))}
                </div>
                {recommendations.data.length > 3 && (
                  <button
                    onClick={toggleRecs}
                    className="flex items-center gap-1 text-xs text-primary hover:underline mx-auto"
                  >
                    {showAllRecs ? (
                      <>
                        Show less <ChevronDown className="h-3 w-3" />
                      </>
                    ) : (
                      <>
                        Show all ({recommendations.data.length}){" "}
                        <ChevronRight className="h-3 w-3" />
                      </>
                    )}
                  </button>
                )}
              </>
            ) : null}
          </section>

          {/* Achievements */}
          <AchievementsWidget
            achievements={achievements}
            xp={xpEarned}
            unlockedCount={unlockedCount}
            isLoading={showSkeleton}
          />

          {/* Learning Analytics */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Learning Analytics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                {!showSkeleton &&
                  !weakTopics.loading &&
                  weakTopics.data.length > 0 && (
                    <WeakTopicsCard topics={weakTopics.data} />
                  )}
                {!showSkeleton && weakTopics.loading && (
                  <LoadingSkeleton className="h-44 rounded-xl" />
                )}
              </div>
              <div>
                {!showSkeleton &&
                  !difficultyAnalysis.loading &&
                  difficultyAnalysis.data.length > 0 && (
                    <DifficultyAnalysisCard
                      analysis={difficultyAnalysis.data}
                    />
                  )}
                {!showSkeleton && difficultyAnalysis.loading && (
                  <LoadingSkeleton className="h-44 rounded-xl" />
                )}
              </div>
              <div>
                {!showSkeleton &&
                  !predictionRules.loading &&
                  predictionRules.data &&
                  predictionRules.data.length > 0 && (
                    <PredictionRulesCard rules={predictionRules.data} />
                  )}
                {!showSkeleton && predictionRules.loading && (
                  <LoadingSkeleton className="h-44 rounded-xl" />
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-8">
          {/* Stats Overview */}
          <StatsOverviewWidget
            stats={progressStats}
            globalRank={globalRank}
            unlockedCount={unlockedCount}
            isLoading={showSkeleton}
          />

          {/* Learning Insights */}
          <section className="space-y-3">
            <h3 className="font-bold text-on-surface flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              Insights
            </h3>
            {showSkeleton || insights.loading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <LoadingSkeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : insights.data.length > 0 ? (
              <div className="space-y-3">
                {insights.data.slice(0, 3).map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            ) : null}
          </section>

          {/* Learning Patterns */}
          {!showSkeleton && !patterns.loading && patterns.data && (
            <LearningPatternCard pattern={patterns.data} />
          )}

          {/* Credential Widget */}
          <CredentialWidget />

          {/* Notification Widget */}
          <NotificationWidget />

          {/* Leaderboard */}
          {!showSkeleton && (
            <LeaderboardWidget
              globalRank={globalRank}
              weeklyRank={weeklyRank}
              xp={xpEarned}
              streakCount={progressStats.learningStreak}
            />
          )}

          {/* Activity Timeline */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-on-surface">
              Recent Activity
            </h2>
            {showSkeleton || timeline.loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
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
                <ActivityTimeline events={timeline.data} />
                <Link href="/profile?tab=activity">
                  <Button
                    variant="ghost"
                    className="w-full text-xs text-primary font-medium mt-2"
                  >
                    View Full History
                  </Button>
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
