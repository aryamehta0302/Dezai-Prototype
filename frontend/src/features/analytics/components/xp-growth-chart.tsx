"use client";

/**
 * XpGrowthChart
 *
 * Recharts AreaChart showing a student's XP level journey milestones.
 * No backend endpoint required — derives data from the student's current XP total
 * using the same level calculation logic as `achievementService.calculateLevel`.
 *
 * Design: shows levels 1–10 on the X axis, with a filled area up to current progress.
 * The current level is highlighted. A tooltip shows XP needed per level.
 *
 * Props:
 *   xp — current student XP (from enrollment store or achievement stats)
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Zap } from "lucide-react";

interface XpGrowthChartProps {
  xp: number;
}

// Mirrors achievementService.calculateLevel threshold: each level requires level*1000 XP
const XP_PER_LEVEL = 1000;
const TOTAL_LEVELS = 10;

function buildMilestones(currentXp: number) {
  return Array.from({ length: TOTAL_LEVELS }, (_, i) => {
    const level = i + 1;
    const required = level * XP_PER_LEVEL;
    const earned = Math.min(currentXp, required);
    return {
      level,
      required,
      earned,
      percent: Math.round((earned / required) * 100),
    };
  });
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-surface border border-border-light rounded-xl p-3 shadow-lg text-xs space-y-1">
      <p className="font-bold text-on-surface">Level {d.level}</p>
      <p className="text-muted">
        Required:{" "}
        <span className="font-semibold text-primary">{d.required.toLocaleString()} XP</span>
      </p>
      <p className="text-muted">
        Earned:{" "}
        <span className="font-semibold text-success">{d.earned.toLocaleString()} XP</span>
      </p>
      <p className="text-muted">
        Completion: <span className="font-semibold">{d.percent}%</span>
      </p>
    </div>
  );
}

export function XpGrowthChart({ xp }: XpGrowthChartProps) {
  const currentLevel = Math.floor(xp / XP_PER_LEVEL) + 1;
  const milestones = buildMilestones(xp);

  if (xp === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted gap-2">
        <Zap className="h-8 w-8 opacity-30" />
        <p className="text-xs font-semibold">Start learning to see your XP growth.</p>
        <p className="text-[10px]">Complete lessons and quizzes to earn XP.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-muted font-semibold px-1">
        <span>Level Journey</span>
        <span className="text-primary font-bold">{xp.toLocaleString()} XP total</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart
          data={milestones}
          margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
        >
          <defs>
            <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(220, 90%, 56%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(220, 90%, 56%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(0,0%,93%)" />
          <XAxis
            dataKey="level"
            tickFormatter={(v) => `L${v}`}
            tick={{ fontSize: 10, fill: "hsl(0,0%,55%)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 10, fill: "hsl(0,0%,55%)" }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            x={currentLevel}
            stroke="hsl(220, 90%, 56%)"
            strokeDasharray="4 2"
            label={{
              value: "You",
              position: "insideTopRight",
              fontSize: 9,
              fill: "hsl(220, 90%, 56%)",
              fontWeight: 700,
            }}
          />
          <Area
            type="monotone"
            dataKey="percent"
            stroke="hsl(220, 90%, 56%)"
            strokeWidth={2}
            fill="url(#xpGradient)"
            dot={{ fill: "hsl(220, 90%, 56%)", r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
