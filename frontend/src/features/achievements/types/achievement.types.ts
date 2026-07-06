export type AchievementCategory = 'STREAK' | 'XP' | 'COMPLETION' | 'ASSESSMENT' | 'ENGAGEMENT';
export type AchievementRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  xpReward: number;
  unlockedAt: string | null;
  progress: number;
  current: number;
  target: number;
  isUnlocked: boolean;
}

export interface AchievementStats {
  totalAchievements: number;
  unlockedCount: number;
  lockedCount: number;
  totalXpEarned: number;
}

export interface LevelInfo {
  level: number;
  nextLevelXp: number;
  currentLevelXp: number;
  progress: number;
}
