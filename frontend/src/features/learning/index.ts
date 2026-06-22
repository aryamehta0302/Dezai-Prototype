export { ContinueLearningCard } from "./components/continue-learning-card";
export { EnrolledCourseCard } from "./components/enrolled-course-card";
export { CourseProgressPill } from "./components/course-progress-pill";
export { LessonVideoPlayer } from "./components/lesson-video-player";
export { CourseModuleSidebar } from "./components/course-module-sidebar";
export { LessonMarkdownRenderer } from "./components/lesson-markdown-renderer";
export { LessonResourceList } from "./components/lesson-resource-list";
export { PersonalNotesPanel } from "./components/personal-notes-panel";
export { MarkCompleteButton } from "./components/mark-complete-button";

export { MilestoneCard } from "./components/milestone-card";
export { InsightCard } from "./components/insight-card";
export { ActivityTimeline } from "./components/activity-timeline";
export { LearningPatternCard } from "./components/learning-pattern-card";
export { RecommendationCard } from "./components/recommendation-card";
export { WeakTopicsCard } from "./components/weak-topics-card";
export { StreakHeatmap } from "./components/streak-heatmap";

export { useProgress } from "./hooks/useProgress";
export { useNotes } from "./hooks/useNotes";
export {
  useActivityTimeline,
  useMilestones,
  useLearningPatterns,
  useStreakInfo,
  useInsights,
  useRecommendations,
  useWeakTopics,
  useDifficultyAnalysis,
  usePredictionRules,
} from "./hooks/useLearningIntelligence";

export { learningService } from "./services/learning.service";
export { lessonService } from "./services/lesson.service";

export { StudentDashboardPage } from "./pages/StudentDashboardPage";
export { CoursePlayerPage } from "./pages/CoursePlayerPage";

export type { LessonProgress, CourseProgress, DashboardStats, PlayerState, Note } from "./types/learning.types";
export type {
  ActivityEvent,
  Milestone,
  LearningPattern,
  StreakInfo,
  StudentInsight,
  LearningRecommendation,
  WeakTopic,
  DifficultyAnalysis,
  PredictionRule,
} from "./types/learning-intelligence.types";
