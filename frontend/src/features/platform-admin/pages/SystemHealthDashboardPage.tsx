"use client";

import React, { useEffect, useState } from "react";
import { Activity, Database, Cpu, Server, HardDrive, Clock } from "lucide-react";
import { PageContainer } from "@/shared/components/page-container";
import { StatCard } from "@/shared/components/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
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
      <PageContainer className="py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">System Health & Diagnostic Infrastructure</h1>
        <p className="text-sm text-muted">Real-time status of database connection, memory allocations, and latency snapshots</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="System Status"
          value={health?.status || "UNKNOWN"}
          icon={Activity}
        />
        <StatCard
          title="DB Latency"
          value={`${health?.services?.database?.latencyMs ?? 0} ms`}
          icon={Database}
        />
        <StatCard
          title="Memory RSS"
          value={`${health?.services?.memory?.rssMb ?? 0} MB`}
          icon={Cpu}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Server className="h-4 w-4 inline mr-2" />
            Detailed Telemetry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div className="rounded-lg bg-surface-low p-3 border border-border-light">
              <span className="text-muted">Database Connection:</span>
              <div className="mt-1 font-semibold text-on-surface">{health?.services?.database?.status}</div>
            </div>
            <div className="rounded-lg bg-surface-low p-3 border border-border-light">
              <span className="text-muted">Node Process Uptime:</span>
              <div className="mt-1 font-semibold text-on-surface">{health?.uptimeSeconds} seconds</div>
            </div>
            <div className="rounded-lg bg-surface-low p-3 border border-border-light">
              <span className="text-muted">Heap Total:</span>
              <div className="mt-1 font-semibold text-on-surface">{health?.services?.memory?.heapTotalMb} MB</div>
            </div>
            <div className="rounded-lg bg-surface-low p-3 border border-border-light">
              <span className="text-muted">Heap Used:</span>
              <div className="mt-1 font-semibold text-on-surface">{health?.services?.memory?.heapUsedMb} MB</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
