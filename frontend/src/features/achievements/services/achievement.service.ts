import type { LevelInfo } from '../types/achievement.types';

const XP_PER_LEVEL = 1000;

export const achievementService = {
  calculateLevel: (xp: number): LevelInfo => {
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const currentLevelXp = xp % XP_PER_LEVEL;
    return {
      level,
      nextLevelXp: XP_PER_LEVEL,
      currentLevelXp,
      progress: (currentLevelXp / XP_PER_LEVEL) * 100,
    };
  },
};
