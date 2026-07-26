"use client";

import React, { useEffect, useState } from "react";
import { Users, Building2, GraduationCap, Award } from "lucide-react";
import { PageContainer } from "@/shared/components/page-container";
import { StatCard } from "@/shared/components/stat-card";
import { Card, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
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
      <PageContainer className="py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Super Admin Platform Dashboard</h1>
        <p className="text-sm text-muted">Global system metrics, university management, and platform analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Platform Users"
          value={metrics?.totalUsers ?? 0}
          icon={Users}
        />
        <StatCard
          title="Universities"
          value={metrics?.totalInstitutions ?? 0}
          icon={Building2}
          description={`${metrics?.totalDepartments ?? 0} departments`}
        />
        <StatCard
          title="Programs & Assessments"
          value={metrics?.totalPrograms ?? 0}
          icon={GraduationCap}
          description={`${metrics?.totalAssessments ?? 0} published assessments`}
        />
        <StatCard
          title="Credentials & XP"
          value={metrics?.totalCredentialsIssued ?? 0}
          icon={Award}
          description={`${(metrics?.totalXpAwarded ?? 0).toLocaleString()} XP awarded`}
        />
      </div>
    </PageContainer>
  );
};
