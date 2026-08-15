import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { XpService } from '../../users/services/xp.service';
import { RulesEngineService } from './rules-engine.service';
import { DefinitionService } from './definition.service';
import { XpType, AchievementCategory } from '@prisma/client';
import type { AwardResult } from '../types/achievement.types';
import { parseCriteria } from '../types/achievement.types';

@Injectable()
export class AwardService {
  private readonly logger = new Logger(AwardService.name);

  constructor(
    private prisma: PrismaService,
    private rulesEngine: RulesEngineService,
    private xpService: XpService,
    private definitionService: DefinitionService,
  ) {}

  async checkAndAward(userId: string, category: AchievementCategory): Promise<AwardResult[]> {
    const achievements = await this.definitionService.findByCategory(category);
    if (achievements.length === 0) return [];

    const results: AwardResult[] = [];

    for (const achievement of achievements) {
      try {
        const result = await this.tryAward(userId, achievement);
        if (result) results.push(result);
      } catch (error) {
        this.logger.error(
          `Failed to evaluate achievement ${achievement.key} for user ${userId}`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    return results;
  }

  private async tryAward(
    userId: string,
    achievement: { id: string; key: string; title: string; xpReward: number; criteria: unknown },
  ): Promise<AwardResult | null> {
    const existing = await this.prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: { userId, achievementId: achievement.id },
      },
    });

    if (existing?.unlockedAt) return null;

      const evaluation = await this.rulesEngine.evaluate(userId, parseCriteria(achievement.criteria));

    if (evaluation.isUnlocked) {
      await this.prisma.userAchievement.upsert({
        where: {
          userId_achievementId: { userId, achievementId: achievement.id },
        },
        create: {
          userId,
          achievementId: achievement.id,
          unlockedAt: new Date(),
          progress: 100,
          current: evaluation.current,
        },
        update: {
          unlockedAt: new Date(),
          progress: 100,
          current: evaluation.current,
        },
      });

      if (achievement.xpReward > 0) {
        await this.xpService.awardXp(userId, XpType.ACHIEVEMENT_REWARD, achievement.xpReward);
      }

      this.logger.log(`Achievement unlocked: ${achievement.key} for user ${userId}`);

      return {
        achievementKey: achievement.key,
        title: achievement.title,
        xpReward: achievement.xpReward,
        newlyUnlocked: true,
      };
    }

    if (!existing || existing.progress < evaluation.progress) {
      await this.prisma.userAchievement.upsert({
        where: {
          userId_achievementId: { userId, achievementId: achievement.id },
        },
        create: {
          userId,
          achievementId: achievement.id,
          progress: evaluation.progress,
          current: evaluation.current,
        },
        update: {
          progress: evaluation.progress,
          current: evaluation.current,
        },
      });
    }

    return null;
  }
}
