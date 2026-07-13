export { EmployeeDashboard } from "./components/EmployeeDashboard";
export { AssessmentList } from "./components/AssessmentList";
export { ComplianceAssessmentPlayer } from "./components/ComplianceAssessmentPlayer";
export { ActivityTimeline } from "./components/ActivityTimeline";
export { NotesView } from "./components/NotesView";
export { BookmarksView } from "./components/BookmarksView";
export { EmployeeLeaderboard } from "./components/EmployeeLeaderboard";
export { EmployeeProfileCard } from "./components/EmployeeProfileCard";
export { EmployeeStatsWidget } from "./components/widgets/EmployeeStatsWidget";
export { EmployeeProgressWidget } from "./components/widgets/EmployeeProgressWidget";
export { EmployeeRecentActivityWidget } from "./components/widgets/EmployeeRecentActivityWidget";
export { EmployeeCredentialsWidget } from "./components/widgets/EmployeeCredentialsWidget";

export { useEmployeeDashboard } from "./hooks/useEmployeeDashboard";
export { useEmployeeProgress } from "./hooks/useEmployeeProgress";
export { useEmployeeTimeline } from "./hooks/useEmployeeTimeline";
export { useEmployeeNotes } from "./hooks/useEmployeeNotes";
export { useEmployeeBookmarks } from "./hooks/useEmployeeBookmarks";
export { useEmployeeAssessments } from "./hooks/useEmployeeAssessments";
export { useEmployeeProfile } from "./hooks/useEmployeeProfile";

export { employeeLearningApi } from "./services/employee-learning-api.service";
export { employeeLearningService } from "./services/employee-learning.service";

export type {
  DashboardStats,
  TrackProgress,
  ActivityEvent,
  ActivityType,
  AssessmentWithStatus,
  AssessmentQuestion,
  AttemptResult,
  EmployeeProfile,
  EmployeeNote,
  EmployeeBookmark,
  LeaderboardEntry,
  DailyActivity,
  HistoryData,
  TrackDetail,
} from "./types/employee-learning.types";

export { ComplianceTrack, COMPLIANCE_TRACK_LABELS } from "./types/employee-learning.types";
