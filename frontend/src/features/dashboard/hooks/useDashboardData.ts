"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { useProgramsStore } from "@/lib/stores/programs.store";
import { useProgress } from "@/features/learning/hooks/useProgress";
import { useAchievements } from "@/features/achievements/hooks/useAchievements";
import {
  useMilestones,
  useInsights,
  useRecommendations,
  useActivityTimeline,
  useLearningPatterns,
  useWeakTopics,
  usePredictionRules,
  useDifficultyAnalysis,
} from "@/features/learning/hooks/useLearningIntelligence";
import { useDashboardStore } from "../store/dashboard.store";

export function useDashboardData() {
  const { user } = useAuthStore();
  const {
    fetchEnrollments,
    fetchStats,
    xpEarned,
    globalRank,
    isLoading,
    hasFetched,
    enrollments,
  } = useEnrollmentStore();
  const { fetchPrograms } = useProgramsStore();
  const { enrolledCourses, inProgressCourses, stats: progressStats } =
    useProgress();
  const { achievements, unlockedCount } = useAchievements();

  // Learning Intelligence hooks
  const milestones = useMilestones();
  const insights = useInsights();
  const recommendations = useRecommendations();
  const timeline = useActivityTimeline(5);
  const patterns = useLearningPatterns();
  const weakTopics = useWeakTopics();
  const predictionRules = usePredictionRules();
  const difficultyAnalysis = useDifficultyAnalysis();

  // Dashboard-specific store
  const { weeklyRank, fetchWeeklyRank } = useDashboardStore();

  // Fetch all data on mount
  useEffect(() => {
    fetchEnrollments();
    fetchStats();
    fetchPrograms();
    fetchWeeklyRank();
  }, [fetchEnrollments, fetchStats, fetchPrograms, fetchWeeklyRank]);

  // Derived state
  const hasData = hasFetched || Object.keys(enrollments).length > 0;
  const showSkeleton = !hasData && isLoading;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return {
    user,
    greeting: greeting(),
    showSkeleton,

    // Stats & Progress
    xpEarned,
    globalRank,
    weeklyRank,
    progressStats,
    enrolledCourses,
    inProgressCourses,

    // Achievements
    achievements,
    unlockedCount,

    // Learning Intelligence
    milestones,
    insights,
    recommendations,
    timeline,
    patterns,
    weakTopics,
    predictionRules,
    difficultyAnalysis,
  };
}
