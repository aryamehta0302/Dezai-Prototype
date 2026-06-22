import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import type { AchievementCriteria } from '../types/achievement.types';

const CACHE_TTL_MS = 5 * 60 * 1000;

interface CachedAchievement {
  id: string;
  key: string;
  title: string;
  description: string;
  category: string;
  rarity: string;
  icon: string;
  xpReward: number;
  criteria: AchievementCriteria;
}

@Injectable()
export class DefinitionService implements OnModuleInit {
  private readonly logger = new Logger(DefinitionService.name);
  private cache: CachedAchievement[] | null = null;
  private cacheTimestamp = 0;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.warmCache();
  }

  async findAll(): Promise<CachedAchievement[]> {
    if (this.isCacheValid()) {
      return this.cache!;
    }
    return this.fetchAndCache();
  }

  async findByCategory(category: string): Promise<CachedAchievement[]> {
    const all = await this.findAll();
    return all.filter((a) => a.category === category);
  }

  async findByKey(key: string): Promise<CachedAchievement | null> {
    const all = await this.findAll();
    return all.find((a) => a.key === key) ?? null;
  }

  invalidateCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  private async warmCache(): Promise<void> {
    try {
      await this.fetchAndCache();
      this.logger.log('Achievement definitions cache warmed');
    } catch {
      this.logger.warn('Failed to warm achievement cache on startup');
    }
  }

  private isCacheValid(): boolean {
    return (
      this.cache !== null &&
      Date.now() - this.cacheTimestamp < CACHE_TTL_MS
    );
  }

  private async fetchAndCache(): Promise<CachedAchievement[]> {
    const rows = await this.prisma.achievement.findMany({
      orderBy: [{ category: 'asc' }, { xpReward: 'asc' }],
    });

    this.cache = rows.map((r) => ({
      id: r.id,
      key: r.key,
      title: r.title,
      description: r.description,
      category: r.category,
      rarity: r.rarity,
      icon: r.icon,
      xpReward: r.xpReward,
      criteria: r.criteria as unknown as AchievementCriteria,
    }));
    this.cacheTimestamp = Date.now();

    return this.cache;
  }
}
