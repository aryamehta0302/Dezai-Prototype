import { Trophy, Star, Flame, Zap, Award, type LucideIcon } from 'lucide-react';
import type { AchievementRarity } from '../types/achievement.types';

const ICON_MAP: Record<string, LucideIcon> = {
  Trophy,
  Star,
  Flame,
  Zap,
  Award,
};

const RARITY_COLORS: Record<AchievementRarity, { bg: string; border: string; text: string }> = {
  COMMON: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-300' },
  RARE: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
  EPIC: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
  LEGENDARY: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400' },
};

interface AchievementToastProps {
  title: string;
  description?: string;
  icon?: string;
  rarity?: AchievementRarity;
  xpReward?: number;
}

export function AchievementToastContent({ title, description, icon, rarity = 'COMMON', xpReward }: AchievementToastProps) {
  const Icon = icon ? ICON_MAP[icon] ?? Trophy : Trophy;
  const colors = RARITY_COLORS[rarity];

  return (
    <div className="flex items-start gap-3 min-w-[300px] bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl">
      <div className={`h-10 w-10 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0`}>
        <Icon className={`h-5 w-5 ${colors.text}`} />
      </div>
      <div className="space-y-0.5">
        <p className="font-bold text-sm text-white">Achievement Unlocked!</p>
        <p className="font-semibold text-sm text-gray-100">{title}</p>
        {description && <p className="text-xs text-gray-400">{description}</p>}
        {xpReward && xpReward > 0 ? (
          <p className="text-xs font-medium text-yellow-400">+{xpReward} XP</p>
        ) : null}
      </div>
    </div>
  );
}
