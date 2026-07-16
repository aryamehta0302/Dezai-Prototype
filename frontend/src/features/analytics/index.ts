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
} from './types/analytics.types.ts';

// ─── Sprint 8: Enterprise Analytics (additive — existing exports unchanged) ───
export { ComplianceTrackChart } from './components/compliance-track-chart';
export { DepartmentComplianceTable } from './components/department-compliance-table';
export { EnterpriseAnalyticsDashboard } from './pages/EnterpriseAnalyticsDashboard';
export { useEnterpriseAnalytics } from './hooks/useEnterpriseAnalytics';
export { enterpriseAnalyticsService } from './services/enterprise-analytics.service';
export type {
  EnterpriseOverview,
  EnterpriseTrackStat,
  EnterpriseDepartmentStat,
  EnterpriseEmployeeRow,
  EnterpriseEmployeeList,
  EnterpriseActivityEntry,
  EnterpriseActivityType,
  EnterpriseAnalyticsState,
} from './types/enterprise-analytics.types';
