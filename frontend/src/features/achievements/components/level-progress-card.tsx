import { Zap, Trophy } from 'lucide-react';
import { achievementService } from '../services/achievement.service';

interface LevelProgressCardProps {
  xp: number;
  levelInfo?: { level: number; currentLevelXp: number; nextLevelXp: number; progress: number };
}

export function LevelProgressCard({ xp, levelInfo }: LevelProgressCardProps) {
  const { level, progress, currentLevelXp, nextLevelXp } = levelInfo ?? achievementService.calculateLevel(xp);

  return (
    <div className="card-elevation p-6 bg-gradient-to-br from-primary/[0.04] to-transparent">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold  uppercase tracking-wider  text-[#45464f]">Current Level</span>
            <div className="flex items-center gap-4">
              <h3 className="text-3xl font-bold text-on-surface">Level {level}</h3>
              <div className="px-3 py-1 rounded-sm border-gray-300 shadow-sm  bg-surface-variant text-[#45464f] ">
                PRO
              </div>
            </div>
          </div>
          <div className="h-12 w-12 rounded-md bg-surface shadow-sm border border-gray-300 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-primary " />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-black ">{currentLevelXp} / {nextLevelXp} XP</span>
            <span className="text-primary font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
            <div
              className="h-full bg-credential-gold transition-all duration-1000 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium text-on-surface">{xp} Total XP</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted/40" />
          <span className="text-sm text-[#45464f]">{nextLevelXp - currentLevelXp} XP to next level</span>
        </div>
      </div>
    </div>
  );
}
