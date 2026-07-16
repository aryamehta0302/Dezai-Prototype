"use client";

/**
 * ComplianceTrackChart
 * Recharts horizontal BarChart — pass rate per ComplianceTrack.
 * Sprint 8 — Enterprise Analytics Dashboard
 * New file — additive only.
 */

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { ShieldCheck } from "lucide-react";
import type { EnterpriseTrackStat } from "../types/enterprise-analytics.types";

interface ComplianceTrackChartProps {
  tracks: EnterpriseTrackStat[];
  isLoading?: boolean;
}

function formatTrack(track: string): string {
  return track.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function getBarColor(passRate: number): string {
  if (passRate >= 70) return "hsl(142, 71%, 45%)";
  if (passRate >= 40) return "hsl(38, 92%, 50%)";
  return "hsl(0, 84%, 60%)";
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as EnterpriseTrackStat;
  return (
    <div className="bg-surface border border-border-light rounded-xl p-3 shadow-lg text-xs space-y-1 min-w-[180px]">
      <p className="font-bold text-on-surface">{formatTrack(d.track)}</p>
      <p className="text-muted">Pass Rate: <span className="font-semibold text-primary">{d.passRate}%</span></p>
      <p className="text-muted">{d.passedAttempts} / {d.totalAttempts} passed</p>
      <p className="text-muted">Credentials issued: <span className="font-semibold">{d.credentialsIssued}</span></p>
    </div>
  );
}

export function ComplianceTrackChart({ tracks, isLoading = false }: ComplianceTrackChartProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-8 bg-surface-low rounded-lg" />)}
      </div>
    );
  }

  if (!tracks || tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted gap-2">
        <ShieldCheck className="h-8 w-8 opacity-30" />
        <p className="text-xs font-semibold">No compliance track data yet.</p>
        <p className="text-[10px]">Assessment attempts will appear here once employees begin compliance training.</p>
      </div>
    );
  }

  const chartData = tracks.map((t) => ({ ...t, label: formatTrack(t.track) }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 56)}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 52, left: 4, bottom: 4 }} barCategoryGap="28%">
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(0,0%,90%)" />
        <XAxis type="number" domain={[0, 100]} tickCount={6} tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 10, fill: "hsl(0,0%,55%)" }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" width={140}
          tick={{ fontSize: 11, fill: "hsl(0,0%,30%)", fontWeight: 600 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(0,0%,97%)" }} />
        <Bar dataKey="passRate" radius={[0, 6, 6, 0]} maxBarSize={28}>
          {chartData.map((entry) => <Cell key={entry.track} fill={getBarColor(entry.passRate)} />)}
          <LabelList dataKey="passRate" position="right" formatter={(v: any) => `${v}%`}
            style={{ fontSize: 10, fontWeight: 700, fill: "hsl(0,0%,35%)" }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
