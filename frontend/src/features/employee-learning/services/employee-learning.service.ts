import type {
  TrackProgress,
  AssessmentWithStatus,
  ActivityEvent,
  DailyActivity,
  COMPLIANCE_TRACK_LABELS,
} from "../types/employee-learning.types";

export const employeeLearningService = {
  getTrackCompletionLabel(track: TrackProgress): string {
    if (track.completionPercentage === 100) return "Completed";
    if (track.completionPercentage > 0) return "In Progress";
    return "Not Started";
  },

  getAssessmentStatusLabel(assessment: AssessmentWithStatus): string {
    if (assessment.everPassed) return "Passed";
    if (assessment.hasActiveAttempt) return "In Progress";
    if (assessment.attemptsUsed > 0) return "Failed";
    return "Not Started";
  },

  getAssessmentStatusColor(assessment: AssessmentWithStatus): string {
    if (assessment.everPassed) return "text-emerald-600 bg-emerald-50";
    if (assessment.hasActiveAttempt) return "text-blue-600 bg-blue-50";
    if (assessment.attemptsUsed > 0) return "text-amber-600 bg-amber-50";
    return "text-slate-500 bg-slate-50";
  },

  getActivityIcon(type: string): string {
    switch (type) {
      case "ASSESSMENT_PASSED": return "check-circle";
      case "ASSESSMENT_FAILED": return "x-circle";
      case "ASSESSMENT_STARTED": return "play-circle";
      case "ASSESSMENT_COMPLETED": return "clipboard-check";
      case "CREDENTIAL_EARNED": return "award";
      case "CREDENTIAL_REVOKED": return "ban";
      case "XP_EARNED": return "star";
      case "ACHIEVEMENT_UNLOCKED": return "trophy";
      case "NOTE_CREATED": return "file-text";
      case "BOOKMARK_ADDED": return "bookmark";
      default: return "activity";
    }
  },

  getActivityColor(type: string): string {
    switch (type) {
      case "ASSESSMENT_PASSED": return "text-emerald-500 bg-emerald-50";
      case "ASSESSMENT_FAILED": return "text-red-500 bg-red-50";
      case "ASSESSMENT_STARTED": return "text-blue-500 bg-blue-50";
      case "CREDENTIAL_EARNED": return "text-amber-500 bg-amber-50";
      case "XP_EARNED": return "text-violet-500 bg-violet-50";
      case "ACHIEVEMENT_UNLOCKED": return "text-yellow-500 bg-yellow-50";
      default: return "text-slate-500 bg-slate-50";
    }
  },

  formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  },

  calculateLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number; progress: number } {
    const XP_PER_LEVEL = 1000;
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const currentXp = xp % XP_PER_LEVEL;
    const nextLevelXp = XP_PER_LEVEL;
    const progress = Math.round((currentXp / nextLevelXp) * 100);
    return { level, currentXp, nextLevelXp, progress };
  },

  formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec > 0 ? `${min}m ${sec}s` : `${min}m`;
  },
};
