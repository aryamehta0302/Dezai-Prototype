"use client";

import React, { useEffect, useState } from "react";
import { platformAdminService } from "../services/platform-admin.service";

export const AuditLogViewerPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadLogs = () => {
    setLoading(true);
    platformAdminService
      .getAuditLogs({ search: search || undefined })
      .then((data) => {
        setLogs(data?.items || []);
        setTotal(data?.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Platform Audit Logs</h1>
        <p className="text-sm text-slate-400">Complete immutable record of system actions, security events, and administrative changes</p>
      </div>

      <div className="flex justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <input
          type="text"
          placeholder="Filter audit logs by keyword or details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadLogs()}
          className="w-80 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <span className="text-xs text-slate-400 font-mono">Total logs: {total}</span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Actor</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
            {logs.map((log) => (
              <tr key={log.id} className="transition-colors hover:bg-slate-800/30">
                <td className="px-6 py-4 text-slate-400">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-slate-200">
                  {log.user?.name || log.user?.email || "System"}
                </td>
                <td className="px-6 py-4">
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-indigo-400">{log.userRole}</span>
                </td>
                <td className="px-6 py-4 font-semibold text-emerald-400">{log.action}</td>
                <td className="px-6 py-4 text-slate-300 font-sans">{log.details || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
