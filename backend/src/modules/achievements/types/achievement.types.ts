export const CRITERIA_TYPES = [
  'lessons_completed',
  'modules_completed',
  'programs_completed',
  'xp_earned',
  'streak_days',
  'assessments_passed',
  'perfect_scores',
  'notes_created',
  'bookmarks_added',
] as const;

export type CriteriaType = (typeof CRITERIA_TYPES)[number];

export interface AchievementCriteria {
  type: CriteriaType;
  target: number;
}

export interface EvaluationResult {
  current: number;
  target: number;
  progress: number;
  isUnlocked: boolean;
}

export interface AchievementResponse {
  id: string;
  key: string;
  title: string;
  description: string;
  category: string;
  rarity: string;
  icon: string;
  xpReward: number;
  unlockedAt: string | null;
  progress: number;
  current: number;
  target: number;
  isUnlocked: boolean;
}

export interface AwardResult {
  achievementKey: string;
  title: string;
  xpReward: number;
  newlyUnlocked: boolean;
}

export function parseCriteria(json: unknown): AchievementCriteria {
  return json as AchievementCriteria;
}

export function parseTarget(json: unknown): number {
  return (json as AchievementCriteria).target ?? 0;
}
