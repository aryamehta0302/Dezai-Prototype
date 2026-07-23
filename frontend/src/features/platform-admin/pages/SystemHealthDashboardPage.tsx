"use client";

import React, { useEffect, useState } from "react";
import { platformAdminService } from "../services/platform-admin.service";
import { SystemHealthMetrics } from "../types/platform-admin.types";

export const SystemHealthDashboardPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    platformAdminService
      .getSystemHealth()
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-4 max-w-4xl mx-auto">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-800" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-900" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">System Health & Diagnostic Infrastructure</h1>
        <p className="text-sm text-slate-400">Real-time status of database connection, memory allocations, and latency snapshots</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">System Status</div>
          <div className={`mt-2 text-2xl font-extrabold ${health?.status === 'OK' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {health?.status || 'UNKNOWN'}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">DB Latency</div>
          <div className="mt-2 text-2xl font-extrabold text-cyan-400">{health?.services?.database?.latencyMs ?? 0} ms</div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Memory RSS</div>
          <div className="mt-2 text-2xl font-extrabold text-indigo-400">{health?.services?.memory?.rssMb ?? 0} MB</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Detailed Telemetry</h3>
        <div className="grid grid-cols-2 gap-4 text-xs font-mono">
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
            <span className="text-slate-500">Database Connection:</span>
            <div className="mt-1 font-semibold text-slate-200">{health?.services?.database?.status}</div>
          </div>
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
            <span className="text-slate-500">Node Process Uptime:</span>
            <div className="mt-1 font-semibold text-slate-200">{health?.uptimeSeconds} seconds</div>
          </div>
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
            <span className="text-slate-500">Heap Total:</span>
            <div className="mt-1 font-semibold text-slate-200">{health?.services?.memory?.heapTotalMb} MB</div>
          </div>
          <div className="rounded-lg bg-slate-950 p-3 border border-slate-800">
            <span className="text-slate-500">Heap Used:</span>
            <div className="mt-1 font-semibold text-slate-200">{health?.services?.memory?.heapUsedMb} MB</div>
          </div>
        </div>
      </div>
    </div>
  );
};
