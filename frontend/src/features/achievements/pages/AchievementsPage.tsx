'use client';

import { PageContainer } from '@/shared/components/page-container';
import { LevelProgressCard } from '../components/level-progress-card';
import { AchievementGrid } from '../components/achievement-grid';
import { AchievementsPageSkeleton } from '../components/achievement-skeleton';
import { useAchievementsData } from '../hooks/useAchievements';
import { useAchievementNotifications } from '../hooks/useAchievementNotifications';
import { useRecentAchievements } from '../api/achievements-query.service';
import { Trophy, ShieldCheck, Star, Clock, Sparkles, TrendingUp } from 'lucide-react';
import { XpGrowthChart } from '@/features/analytics/components/xp-growth-chart';

export function AchievementsPage() {
  const { achievements, stats, isLoading, error } = useAchievementsData();
  const { data: recentUnlocks } = useRecentAchievements(10);
  useAchievementNotifications();

  if (error) {
    return (
      <PageContainer className="py-12">
        <div className="text-center py-16 text-muted">
          <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Failed to load achievements</p>
          <p className="text-sm mt-1">Please try refreshing the page</p>
        </div>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer className="py-12">
        <AchievementsPageSkeleton />
      </PageContainer>
    );
  }

  const totalXp = achievements
    .filter((a) => a.isUnlocked)
    .reduce((sum, a) => sum + a.xpReward, 0);

  return (
    <PageContainer className="py-12 space-y-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Trophy className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold text-on-surface">Achievements</h1>
        <p className="text-muted">Track your progress, unlock badges, and earn XP.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <LevelProgressCard xp={totalXp} />

          {/* Sprint 6 — XP Growth & Achievement Analytics */}
          <div className="card-elevation p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted uppercase tracking-wider">
              <TrendingUp className="h-4 w-4 text-primary" />
              XP Level Journey
            </h3>
            <XpGrowthChart xp={totalXp} />
          </div>

          <div className="card-elevation p-5 space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2 text-muted uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4 text-success" />
              Badge Statistics
            </h3>
            <div className="space-y-2">
              <StatRow
                label="Common"
                unlocked={countsFor('COMMON', achievements)}
                total={countsForTotal('COMMON', achievements)}
                className="bg-slate-500/10 text-slate-600"
              />
              <StatRow
                label="Rare"
                unlocked={countsFor('RARE', achievements)}
                total={countsForTotal('RARE', achievements)}
                className="bg-blue-500/10 text-blue-600"
              />
              <StatRow
                label="Epic"
                unlocked={countsFor('EPIC', achievements)}
                total={countsForTotal('EPIC', achievements)}
                className="bg-purple-500/10 text-purple-600"
              />
              <StatRow
                label="Legendary"
                unlocked={countsFor('LEGENDARY', achievements)}
                total={countsForTotal('LEGENDARY', achievements)}
                className="bg-yellow-500/10 text-yellow-600"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {recentUnlocks && recentUnlocks.length > 0 && (
            <div className="card-elevation p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 text-muted uppercase tracking-wider">
                <Clock className="h-4 w-4" />
                Recent Unlocks
              </h3>
              <div className="space-y-2">
                {recentUnlocks.map((a: any, i: number) => (
                  <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-low border border-border-light">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">{a.title}</p>
                      <p className="text-xs text-muted">{a.description}</p>
                    </div>
                    <div className="text-xs text-muted shrink-0">
                      {a.unlockedAt ? new Date(a.unlockedAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-on-surface">All Achievements</h2>
            <span className="text-sm text-muted">
              {stats.unlockedCount} of {stats.totalAchievements}
            </span>
          </div>
          <AchievementGrid achievements={achievements} />
        </div>
      </div>
    </PageContainer>
  );
}

function StatRow({
  label,
  unlocked,
  total,
  className,
}: {
  label: string;
  unlocked: number;
  total: number;
  className: string;
}) {
  return (
    <div className="flex justify-between items-center bg-surface-low p-3 rounded-lg border border-border-light">
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded flex items-center justify-center ${className}`}>
          <Star className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="font-bold">{unlocked}/{total}</span>
    </div>
  );
}

function countsFor(rarity: string, achievements: { rarity: string; isUnlocked: boolean }[]) {
  return achievements.filter((a) => a.rarity === rarity && a.isUnlocked).length;
}

function countsForTotal(rarity: string, achievements: { rarity: string }[]) {
  return achievements.filter((a) => a.rarity === rarity).length;
}
