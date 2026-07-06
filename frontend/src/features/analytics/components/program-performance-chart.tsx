"use client";

/**
 * ProgramPerformanceChart
 *
 * Recharts BarChart comparing top performer vs low-progress student XP.
 * Data source: faculty/extended analytics (already fetched in FacultyDashboard state).
 *
 * Props:
 *   topStudents   — from analytics.topStudents
 *   weakStudents  — from analytics.weakStudents
 *   isLoading     — skeleton while loading
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users } from "lucide-react";
import type { StudentMetric } from "../types/analytics.types";

interface ProgramPerformanceChartProps {
  topStudents: StudentMetric[];
  weakStudents: StudentMetric[];
  isLoading?: boolean;
}

// Custom tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface border border-border-light rounded-xl p-3 shadow-lg text-xs space-y-1 min-w-[140px]">
      <p className="font-bold text-on-surface truncate">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value} {p.name === "XP" ? "XP" : "%"}
        </p>
      ))}
    </div>
  );
}

export function ProgramPerformanceChart({
  topStudents,
  weakStudents,
  isLoading = false,
}: ProgramPerformanceChartProps) {
  if (isLoading) {
    return (
      <div className="h-56 bg-surface-low rounded-xl animate-pulse" />
    );
  }

  const allStudents = [...topStudents, ...weakStudents];

  if (allStudents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted gap-2">
        <Users className="h-8 w-8 opacity-30" />
        <p className="text-xs font-semibold">No student performance data available yet.</p>
      </div>
    );
  }

  // Deduplicate by userId (a student may appear in both lists)
  const seen = new Set<string>();
  const chartData = allStudents
    .filter((s) => {
      if (seen.has(s.userId)) return false;
      seen.add(s.userId);
      return true;
    })
    .map((s) => ({
      name: s.name.split(" ")[0], // first name only for legibility
      XP: s.xp,
      Progress: s.progress,
      isWeak: weakStudents.some((w) => w.userId === s.userId),
    }))
    .sort((a, b) => b.XP - a.XP)
    .slice(0, 8); // cap at 8 for readability

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
        barGap={4}
        barCategoryGap="30%"
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(0,0%,93%)" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10, fill: "hsl(0,0%,40%)", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="xp"
          orientation="left"
          tick={{ fontSize: 10, fill: "hsl(0,0%,55%)" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <YAxis
          yAxisId="progress"
          orientation="right"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10, fill: "hsl(0,0%,55%)" }}
          axisLine={false}
          tickLine={false}
          width={38}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(0,0%,97%)" }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
        />
        <Bar
          yAxisId="xp"
          dataKey="XP"
          fill="hsl(220, 90%, 56%)"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
        <Bar
          yAxisId="progress"
          dataKey="Progress"
          fill="hsl(142, 71%, 45%)"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
