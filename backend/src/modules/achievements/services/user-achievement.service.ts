import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { RulesEngineService } from './rules-engine.service';
import { DefinitionService } from './definition.service';
import type { AchievementResponse } from '../types/achievement.types';
import { parseCriteria, parseTarget } from '../types/achievement.types';

@Injectable()
export class UserAchievementService {
  constructor(
    private prisma: PrismaService,
    private rulesEngine: RulesEngineService,
    private definitionService: DefinitionService,
  ) {}

  async getAchievements(
    userId: string,
    filter?: { category?: string; unlocked?: boolean },
  ): Promise<AchievementResponse[]> {
    const definitions = await this.definitionService.findAll();
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
    });

    const uaMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));

    const results: AchievementResponse[] = [];

    for (const def of definitions) {
      if (filter?.unlocked === true || filter?.unlocked === false) {
        const ua = uaMap.get(def.id);
        const isUnlocked = !!ua?.unlockedAt;
        if (isUnlocked !== filter.unlocked) continue;
      }

      const response = await this.buildResponse(userId, def, uaMap.get(def.id));

      if (filter?.category && response.category !== filter.category) continue;

      results.push(response);
    }

    return results;
  }

  async getRecentUnlocks(userId: string, limit = 5): Promise<AchievementResponse[]> {
    const recent = await this.prisma.userAchievement.findMany({
      where: { userId, NOT: { unlockedAt: null } },
      orderBy: { unlockedAt: 'desc' },
      take: limit,
      include: { achievement: true },
    });

    return recent.map((ua) => ({
      id: ua.achievement.id,
      key: ua.achievement.key,
      title: ua.achievement.title,
      description: ua.achievement.description,
      category: ua.achievement.category,
      rarity: ua.achievement.rarity,
      icon: ua.achievement.icon,
      xpReward: ua.achievement.xpReward,
      unlockedAt: ua.unlockedAt.toISOString(),
      progress: ua.progress,
      current: ua.current,
      target: parseTarget(ua.achievement.criteria),
      isUnlocked: true,
    }));
  }

  async getNewlyUnlocked(userId: string, since: Date): Promise<AchievementResponse[]> {
    const recent = await this.prisma.userAchievement.findMany({
      where: {
        userId,
        unlockedAt: { not: null, gte: since },
      },
      orderBy: { unlockedAt: 'desc' },
      include: { achievement: true },
    });

    return recent.map((ua) => ({
      id: ua.achievement.id,
      key: ua.achievement.key,
      title: ua.achievement.title,
      description: ua.achievement.description,
      category: ua.achievement.category,
      rarity: ua.achievement.rarity,
      icon: ua.achievement.icon,
      xpReward: ua.achievement.xpReward,
      unlockedAt: ua.unlockedAt.toISOString(),
      progress: ua.progress,
      current: ua.current,
      target: parseTarget(ua.achievement.criteria),
      isUnlocked: true,
    }));
  }

  async getStats(userId: string) {
    const [total, unlocked, xpFromAchievements] = await Promise.all([
      this.prisma.achievement.count(),
      this.prisma.userAchievement.count({
        where: { userId, unlockedAt: { not: null } },
      }),
      this.prisma.xpTransaction.aggregate({
        where: { userId, type: 'ACHIEVEMENT_REWARD' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalAchievements: total,
      unlockedCount: unlocked,
      lockedCount: total - unlocked,
      totalXpEarned: xpFromAchievements._sum.amount ?? 0,
    };
  }

  private async buildResponse(
    userId: string,
    def: { id: string; key: string; title: string; description: string; category: string; rarity: string; icon: string; xpReward: number; criteria: unknown },
    ua: { unlockedAt: Date | null; progress: number; current: number } | undefined,
  ): Promise<AchievementResponse> {
    if (ua?.unlockedAt) {
      return {
        id: def.id,
        key: def.key,
        title: def.title,
        description: def.description,
        category: def.category,
        rarity: def.rarity,
        icon: def.icon,
        xpReward: def.xpReward,
        unlockedAt: ua.unlockedAt.toISOString(),
        progress: ua.progress,
        current: ua.current,
        target: parseTarget(def.criteria),
        isUnlocked: true,
      };
    }

    if (ua) {
      return {
        id: def.id,
        key: def.key,
        title: def.title,
        description: def.description,
        category: def.category,
        rarity: def.rarity,
        icon: def.icon,
        xpReward: def.xpReward,
        unlockedAt: null,
        progress: ua.progress,
        current: ua.current,
        target: parseTarget(def.criteria),
        isUnlocked: false,
      };
    }

    const evaluation = await this.rulesEngine.evaluate(userId, parseCriteria(def.criteria));
    return {
      id: def.id,
      key: def.key,
      title: def.title,
      description: def.description,
      category: def.category,
      rarity: def.rarity,
      icon: def.icon,
      xpReward: def.xpReward,
      unlockedAt: null,
      progress: evaluation.progress,
      current: evaluation.current,
      target: evaluation.target,
      isUnlocked: false,
    };
  }
}
