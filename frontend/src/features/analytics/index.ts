/**
 * @module features/analytics
 *
 * Analytics, charts & reporting feature — Sprint 6 Analytics Completion.
 *
 * Exports all public components, hooks, services, and types
 * for the Dezai analytics layer.
 */

// ─── Components ───────────────────────────────────────────────────────────────
export { ModuleCompletionChart } from './components/module-completion-chart';
export { ProgramPerformanceChart } from './components/program-performance-chart';
export { XpGrowthChart } from './components/xp-growth-chart';

// ─── Hooks ────────────────────────────────────────────────────────────────────
export { useProgramAnalytics } from './hooks/useProgramAnalytics';

// ─── Services ─────────────────────────────────────────────────────────────────
export { analyticsService } from './services/analytics.service';

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  ExtendedAnalytics,
  StudentMetric,
  DifficultModule,
  ProgramAnalytics,
  ModuleCompletionStat,
  StudentLeaderboardEntry,
  StudentLeaderboardResponse,
  LeaderboardWidgetEntry,
  StudentWidgetResponse,
  UniversityLeaderboardEntry,
  UniversityLeaderboardResponse,
  XpMilestone,
  LeaderboardRange,
} from './types/analytics.types';
