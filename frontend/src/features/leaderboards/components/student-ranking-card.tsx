"use client";

import { Trophy, Flame, Zap, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface StudentRankingCardProps {
  rank: number;
  xp: number;
  streakCount: number;
  totalStudents?: number;
}

function getRankStyle(rank: number): {
  badge: string;
  label: string;
  glow: string;
} {
  if (rank === 1)
    return {
      badge: "bg-yellow-400/20 text-yellow-700 border-yellow-400/40",
      label: "🥇 Gold",
      glow: "from-yellow-400/10 to-transparent",
    };
  if (rank === 2)
    return {
      badge: "bg-slate-300/30 text-slate-600 border-slate-300/50",
      label: "🥈 Silver",
      glow: "from-slate-300/10 to-transparent",
    };
  if (rank === 3)
    return {
      badge: "bg-amber-600/20 text-amber-700 border-amber-500/30",
      label: "🥉 Bronze",
      glow: "from-amber-400/10 to-transparent",
    };
  if (rank <= 10)
    return {
      badge: "bg-primary/10 text-primary border-primary/20",
      label: "Top 10",
      glow: "from-primary/10 to-transparent",
    };
  return {
    badge: "bg-surface-low text-muted border-border-light",
    label: `Rank #${rank}`,
    glow: "from-surface-low/50 to-transparent",
  };
}

export function StudentRankingCard({
  rank,
  xp,
  streakCount,
  totalStudents,
}: StudentRankingCardProps) {
  const style = getRankStyle(rank);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`relative overflow-hidden card-elevation p-5 bg-gradient-to-br ${style.glow} border border-border-light`}
    >
      {/* Decorative background circle */}
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />

      <div className="relative z-10 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-muted uppercase tracking-wider">
              Your Ranking
            </span>
          </div>
          <span
            className={`text-2xs font-extrabold px-2.5 py-1 rounded-full border ${style.badge}`}
          >
            {style.label}
          </span>
        </div>

        {/* Rank number */}
        <div className="flex items-end gap-2">
          <div>
            <span className="text-4xl font-black text-on-surface leading-none">
              #{rank}
            </span>
            {totalStudents && totalStudents > 0 && (
              <p className="text-2xs text-muted font-semibold mt-0.5">
                of {totalStudents.toLocaleString()} students globally
              </p>
            )}
          </div>
          <div className="pb-1 ml-auto">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 pt-1 border-t border-border-light">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-warning fill-warning/20" />
            <span className="text-xs font-bold text-on-surface">
              {xp.toLocaleString()} XP
            </span>
          </div>
          <div className="w-1 h-1 rounded-full bg-muted/30" />
          <div className="flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-xs font-bold text-on-surface">
              {streakCount}d streak
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
