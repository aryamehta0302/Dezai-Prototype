"use client";

import React, { useEffect, useState } from "react";
import { Users, GraduationCap, Building2, TrendingUp, Clock } from "lucide-react";
import { PageContainer } from "@/shared/components/page-container";
import { StatCard } from "@/shared/components/stat-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
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
      <SuspendedInstitutionBanner status={metrics?.institutionStatus} />

      <div>
        <h1 className="text-2xl font-bold text-on-surface">University Dashboard</h1>
        <p className="text-sm text-muted">Institutional overview, faculty approvals, and student progress</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Faculty"
          value={metrics?.totalFaculty ?? 0}
          icon={Users}
          description={`${metrics?.pendingFacultyApprovals ?? 0} pending approval`}
        />
        <StatCard
          title="Enrolled Students"
          value={metrics?.totalStudents ?? 0}
          icon={GraduationCap}
          description={`${metrics?.activeEnrollments ?? 0} active enrollments`}
        />
        <StatCard
          title="Departments"
          value={metrics?.totalDepartments ?? 0}
          icon={Building2}
          description={`${metrics?.totalPrograms ?? 0} active programs`}
        />
        <StatCard
          title="Pass Rate"
          value={`${metrics?.assessmentPassRate ?? 0}%`}
          icon={TrendingUp}
          description={`${metrics?.credentialsIssuedThisMonth ?? 0} credentials this month`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Clock className="h-4 w-4 inline mr-2" />
            Recent Institutional Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {metrics.recentActivity.map((log) => (
                <div key={log.id} className="flex items-center justify-between border-b border-border-light pb-3 text-xs">
                  <div>
                    <span className="font-medium text-on-surface">{log.user?.name || "System"}</span>
                    <span className="text-muted mx-2">&mdash;</span>
                    <span className="text-on-surface">{log.details || log.action}</span>
                  </div>
                  <span className="text-muted font-mono">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted italic">No recent activity recorded.</p>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
};
