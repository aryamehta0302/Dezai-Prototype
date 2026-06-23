'use client';

import {
  Flame,
  Zap,
  Star,
  Trophy,
  GraduationCap,
  BookOpen,
  Layers,
  ClipboardCheck,
  Award,
  Lock,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import type { Achievement } from '../types/achievement.types';

const ICON_MAP: Record<string, LucideIcon> = {
  Flame,
  Zap,
  Star,
  Trophy,
  GraduationCap,
  BookOpen,
  Layers,
  ClipboardCheck,
  Award,
};

const RARITY_STYLES: Record<string, string> = {
  LEGENDARY: 'bg-yellow-500/20 text-yellow-600',
  EPIC: 'bg-purple-500/20 text-purple-600',
  RARE: 'bg-blue-500/20 text-blue-600',
  COMMON: 'bg-slate-500/10 text-slate-500',
};

interface AchievementGridProps {
  achievements: Achievement[];
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  if (!achievements.length) {
    return (
      <div className="text-center py-12 text-muted">
        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="font-medium">No achievements yet</p>
        <p className="text-sm mt-1">Complete courses and challenges to earn badges.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((achievement) => {
        const Icon = ICON_MAP[achievement.icon] ?? Trophy;

        return (
          <div
            key={achievement.id}
            className={cn(
              'card-elevation p-5',
              achievement.isUnlocked
                ? 'bg-surface border-success/20'
                : 'bg-surface-low border-border-light grayscale',
            )}
          >
            <div className="flex gap-4">
              <div className={cn(
                'h-12 w-12 rounded-xl flex items-center justify-center shrink-0',
                achievement.isUnlocked
                  ? 'bg-success/10 text-success'
                  : 'bg-muted/10 text-muted',
              )}>
                {achievement.isUnlocked ? (
                  <Icon className="h-6 w-6" />
                ) : (
                  <Lock className="h-5 w-5" />
                )}
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-on-surface truncate">
                    {achievement.title}
                  </h4>
                  {achievement.isUnlocked && (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                  {achievement.description}
                </p>

                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-muted">
                      {achievement.current} / {achievement.target}
                    </span>
                    <span className="text-primary-light">
                      +{achievement.xpReward} XP
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-low rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        achievement.isUnlocked ? 'bg-success' : 'bg-primary/30',
                      )}
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={cn(
              'absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider',
              RARITY_STYLES[achievement.rarity] ?? RARITY_STYLES.COMMON,
            )}>
              {achievement.rarity}
            </div>
          </div>
        );
      })}
    </div>
  );
}
