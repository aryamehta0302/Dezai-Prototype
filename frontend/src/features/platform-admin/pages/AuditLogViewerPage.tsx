"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ScrollText } from "lucide-react";
import { PageContainer } from "@/shared/components/page-container";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { platformAdminService } from "../services/platform-admin.service";

export const AuditLogViewerPage: React.FC = () => {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || searchParams?.get("q") || "";

  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);

  const loadLogs = useCallback((querySearch?: string) => {
    setLoading(true);
    const activeSearch = querySearch !== undefined ? querySearch : search;
    platformAdminService
      .getAuditLogs({ search: activeSearch || undefined })
      .then((data) => {
        setLogs(data?.items || []);
        setTotal(data?.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const q = searchParams?.get("search") || searchParams?.get("q") || "";
    setSearch(q);
    loadLogs(q);
  }, [searchParams]);

  return (
    <PageContainer className="py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Platform Audit Logs</h1>
        <p className="text-sm text-muted">Complete immutable record of system actions, security events, and administrative changes</p>
      </div>

      <div className="flex justify-between items-center bg-surface-low p-4 rounded-xl border border-border-light">
        <Input
          placeholder="Filter audit logs by keyword or details..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && loadLogs()}
          className="w-80"
        />
        <span className="text-xs text-muted font-mono">
          <ScrollText className="h-3 w-3 inline mr-1" />
          Total logs: {total}
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-light bg-surface">
        <table className="w-full text-left text-sm text-on-surface">
          <thead className="border-b border-border-light bg-surface-low text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Actor</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light font-mono text-xs">
            {logs.map((log) => (
              <tr key={log.id} className="transition-colors hover:bg-surface-low">
                <td className="px-6 py-4 text-muted">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-on-surface">
                  {log.user?.name || log.user?.email || "System"}
                </td>
                <td className="px-6 py-4">
                  <Badge variant="secondary">{log.userRole}</Badge>
                </td>
                <td className="px-6 py-4 font-semibold text-success">{log.action}</td>
                <td className="px-6 py-4 text-muted font-sans">{log.details || "\u2014"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
};
