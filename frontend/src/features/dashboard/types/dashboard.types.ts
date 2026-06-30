export type WidgetId =
  | 'stats-overview'
  | 'continue-learning'
  | 'achievements'
  | 'leaderboard'
  | 'credential'
  | 'assessment-progress'
  | 'notifications';

export interface DashboardSection {
  id: WidgetId;
  label: string;
}
