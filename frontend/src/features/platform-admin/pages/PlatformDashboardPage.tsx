"use client";

import React, { useEffect, useState } from "react";
import { platformAdminService } from "../services/platform-admin.service";
import { PlatformOverviewMetrics } from "../types/platform-admin.types";

export const PlatformDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<PlatformOverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    platformAdminService
      .getOverview()
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-900" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Super Admin Platform Dashboard</h1>
        <p className="text-sm text-slate-400">Global system metrics, university management, and platform analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Platform Users</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-100">{metrics?.totalUsers ?? 0}</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Universities</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-100">{metrics?.totalInstitutions ?? 0}</div>
          <div className="mt-1 text-xs text-indigo-400">{metrics?.totalDepartments ?? 0} departments</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Programs & Assessments</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-100">{metrics?.totalPrograms ?? 0}</div>
          <div className="mt-1 text-xs text-cyan-400">{metrics?.totalAssessments ?? 0} published assessments</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Credentials & XP</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-100">{metrics?.totalCredentialsIssued ?? 0}</div>
          <div className="mt-1 text-xs text-emerald-400">{(metrics?.totalXpAwarded ?? 0).toLocaleString()} XP awarded</div>
        </div>
      </div>
    </div>
  );
};
