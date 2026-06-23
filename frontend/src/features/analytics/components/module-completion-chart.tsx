"use client";

/**
 * ModuleCompletionChart
 *
 * Horizontal Recharts BarChart showing per-module syllabus completion rates.
 * Data source: GET /api/analytics/programs/:id/modules/stats
 *
 * Colour coding:
 *   >= 70% → success (green)
 *   >= 40% → warning (amber)
 *   < 40%  → danger (red)
 *
 * Props:
 *   moduleStats  — array of ModuleCompletionStat from the analytics service
 *   isLoading    — show skeleton while fetching
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { BookOpen } from "lucide-react";
import type { ModuleCompletionStat } from "../types/analytics.types";

interface ModuleCompletionChartProps {
  moduleStats: ModuleCompletionStat[];
  isLoading?: boolean;
}

function getBarColor(percent: number): string {
  if (percent >= 70) return "hsl(142, 71%, 45%)";   // success
  if (percent >= 40) return "hsl(38, 92%, 50%)";    // warning
  return "hsl(0, 84%, 60%)";                         // danger
}

// Truncate long module titles for the Y axis
function truncate(str: string, max = 22): string {
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

// Custom tooltip
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ModuleCompletionStat;
  return (
    <div className="bg-surface border border-border-light rounded-xl p-3 shadow-lg text-xs space-y-1">
      <p className="font-bold text-on-surface">{d.moduleTitle}</p>
      <p className="text-muted">
        <span className="font-semibold text-primary">{d.completionPercent}%</span> completed
      </p>
      <p className="text-muted">
        {d.completedCount} / {d.totalStudents} students
      </p>
    </div>
  );
}

export function ModuleCompletionChart({
  moduleStats,
  isLoading = false,
}: ModuleCompletionChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-surface-low rounded-lg" />
        ))}
      </div>
    );
  }

  if (!moduleStats || moduleStats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted gap-2">
        <BookOpen className="h-8 w-8 opacity-30" />
        <p className="text-xs font-semibold">No module data for this program yet.</p>
      </div>
    );
  }

  const chartData = moduleStats.map((m) => ({
    ...m,
    shortTitle: truncate(m.moduleTitle),
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 52)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 48, left: 4, bottom: 4 }}
        barCategoryGap="28%"
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(0,0%,90%)" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickCount={6}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10, fill: "hsl(0,0%,55%)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="shortTitle"
          width={130}
          tick={{ fontSize: 11, fill: "hsl(0,0%,30%)", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(0,0%,97%)" }} />
        <Bar dataKey="completionPercent" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {chartData.map((entry) => (
            <Cell key={entry.moduleId} fill={getBarColor(entry.completionPercent)} />
          ))}
          <LabelList
            dataKey="completionPercent"
            position="right"
            formatter={(v: any) => `${v}%`}
            style={{ fontSize: 10, fontWeight: 700, fill: "hsl(0,0%,35%)" }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
