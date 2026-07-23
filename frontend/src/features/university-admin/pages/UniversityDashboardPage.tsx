"use client";

import React, { useEffect, useState } from "react";
import { universityAdminService } from "../services/university-admin.service";
import { UniversityDashboardMetrics } from "../types/university-admin.types";
import { SuspendedInstitutionBanner } from "../components/SuspendedInstitutionBanner";

export const UniversityDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<UniversityDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    universityAdminService
      .getDashboard()
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-900/60 border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <SuspendedInstitutionBanner status={metrics?.institutionStatus} />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">University Dashboard</h1>
          <p className="text-sm text-slate-400">Institutional overview, faculty approvals, and student progress</p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Faculty</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-100">{metrics?.totalFaculty ?? 0}</div>
          <div className="mt-1 text-xs text-amber-400">
            {metrics?.pendingFacultyApprovals ?? 0} pending approval
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Enrolled Students</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-100">{metrics?.totalStudents ?? 0}</div>
          <div className="mt-1 text-xs text-emerald-400">
            {metrics?.activeEnrollments ?? 0} active enrollments
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Departments</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-100">{metrics?.totalDepartments ?? 0}</div>
          <div className="mt-1 text-xs text-indigo-400">
            {metrics?.totalPrograms ?? 0} active programs
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pass Rate</div>
          <div className="mt-2 text-3xl font-extrabold text-slate-100">{metrics?.assessmentPassRate ?? 0}%</div>
          <div className="mt-1 text-xs text-cyan-400">
            {metrics?.credentialsIssuedThisMonth ?? 0} credentials issued this month
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
        <h3 className="text-base font-semibold text-slate-200 mb-4">Recent Institutional Activity</h3>
        {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
          <div className="space-y-3">
            {metrics.recentActivity.map((log) => (
              <div key={log.id} className="flex items-center justify-between border-b border-slate-800/60 pb-3 text-xs">
                <div>
                  <span className="font-medium text-slate-300">{log.user?.name || "System"}</span>
                  <span className="text-slate-400 mx-2">—</span>
                  <span className="text-slate-300">{log.details || log.action}</span>
                </div>
                <span className="text-slate-500 font-mono">
                  {new Date(log.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No recent activity recorded.</p>
        )}
      </div>
    </div>
  );
};
