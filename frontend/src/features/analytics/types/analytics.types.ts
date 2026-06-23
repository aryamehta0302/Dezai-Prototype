export interface ExtendedAnalytics {
  totalStudents?: number;
  activeStudents?: number;
  completionRate?: number;
  averageXp?: number;
  totalXp?: number;
}

export interface StudentMetric {
  studentId: string;
  studentName?: string;
  email?: string;
  xp?: number;
  completedLessons?: number;
  progress?: number;
}

export interface DifficultModule {
  moduleId: string;
  moduleTitle?: string;
  difficultyScore?: number;
  completionRate?: number;
  averageAttempts?: number;
}

export interface ModuleCompletionStat {
  moduleId: string;
  moduleTitle: string;
  completedLessons: number;
  totalLessons: number;
  completionRate: number;
}

export interface ProgramAnalytics {
  programId: string;
  programTitle?: string;
  totalStudents?: number;
  completionRate?: number;
  modules?: ModuleCompletionStat[];
}

export interface StudentLeaderboardEntry {
  userId: string;
  studentId?: string;
  studentName?: string;
  name?: string;
  email?: string;
  rank?: number;
  xp?: number;
  totalXp?: number;
  completedLessons?: number;
  streak?: number;
}

export interface StudentLeaderboardResponse {
  students?: StudentLeaderboardEntry[];
  leaderboard?: StudentLeaderboardEntry[];
  entries?: StudentLeaderboardEntry[];
}

export interface LeaderboardWidgetEntry {
  userId?: string;
  name?: string;
  studentName?: string;
  rank?: number;
  xp?: number;
  totalXp?: number;
}

export interface StudentWidgetResponse {
  entries?: LeaderboardWidgetEntry[];
  students?: LeaderboardWidgetEntry[];
}

export interface UniversityLeaderboardEntry {
  universityId?: string;
  universityName?: string;
  name?: string;
  rank?: number;
  totalXp?: number;
  studentsCount?: number;
  activeStudents?: number;
}

export interface UniversityLeaderboardResponse {
  universities?: UniversityLeaderboardEntry[];
  leaderboard?: UniversityLeaderboardEntry[];
  entries?: UniversityLeaderboardEntry[];
}

export interface XpMilestone {
  id?: string;
  title?: string;
  description?: string;
  xpRequired?: number;
  xp?: number;
  achieved?: boolean;
}

export type LeaderboardRange =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'all-time'
  | 'all';