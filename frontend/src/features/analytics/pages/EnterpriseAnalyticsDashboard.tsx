"use client";

/**
 * EnterpriseAnalyticsDashboard
 * Primary Sprint 8 deliverable.
 * 3-tab compliance analytics page for ORGANIZATION_ADMIN, ORGANIZATION_MANAGER, DEZAI_ADMIN.
 * Sprint 8 — Enterprise Analytics Dashboard
 * New file — additive only.
 */

import { useState } from "react";
import {
  Users, ShieldCheck, Award, TrendingUp, Activity, Building2,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock,
  BarChart3, AlertTriangle,
} from "lucide-react";
import { useEnterpriseAnalytics } from "../hooks/useEnterpriseAnalytics";
import { ComplianceTrackChart } from "../components/compliance-track-chart";
import { DepartmentComplianceTable } from "../components/department-compliance-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import type { EnterpriseActivityEntry, EnterpriseEmployeeRow } from "../types/enterprise-analytics.types";

// ─── KPI Stat Card ────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
}

function StatCard({ title, value, icon: Icon, description }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider truncate">{title}</p>
          <p className="mt-1.5 text-2xl font-black text-on-surface">{value}</p>
          {description && <p className="mt-1 text-xs text-muted">{description}</p>}
        </div>
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="h-4.5 w-4.5 text-primary" />
        </div>
      </div>
    </div>
  );
}

// ─── Activity Feed Item ────────────────────────────────────────────────────────

function ActivityItem({ entry }: { entry: EnterpriseActivityEntry }) {
  const isAssessment = entry.type === "ASSESSMENT";
  const ts = new Date(entry.timestamp);
  const timeStr = ts.toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border-light last:border-0">
      <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isAssessment ? (entry.passed ? "bg-success/10" : "bg-destructive/10") : "bg-primary/10"
      }`}>
        {isAssessment
          ? (entry.passed ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />)
          : <Award className="h-4 w-4 text-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">{entry.employeeName}</p>
        <p className="text-xs text-muted mt-0.5 line-clamp-2">{entry.detail}</p>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-muted flex-shrink-0">
        <Clock className="h-3 w-3" />
        <span>{timeStr}</span>
      </div>
    </div>
  );
}

// ─── Employee Row ─────────────────────────────────────────────────────────────

function EmployeeRow({ employee }: { employee: EnterpriseEmployeeRow }) {
  const statusVariant: "default" | "secondary" | "destructive" =
    employee.employmentStatus === "ACTIVE" ? "default"
    : employee.employmentStatus === "SUSPENDED" ? "secondary"
    : "destructive";

  const scoreClass =
    employee.lastAttemptScore === null ? "text-muted"
    : employee.lastAttemptPassed ? "text-success font-bold"
    : "text-destructive font-bold";

  return (
    <tr className="border-b border-border-light hover:bg-surface-low/40 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-on-surface">{employee.name}</p>
        <p className="text-xs text-muted">{employee.email}</p>
      </td>
      <td className="px-4 py-3">
        <p className="text-xs font-medium text-on-surface">{employee.department}</p>
        {employee.title && <p className="text-[10px] text-muted">{employee.title}</p>}
      </td>
      <td className="px-4 py-3 text-center">
        <Badge variant={statusVariant} className="text-[10px] font-bold uppercase">
          {employee.employmentStatus}
        </Badge>
      </td>
      <td className={`px-4 py-3 text-center text-sm ${scoreClass}`}>
        {employee.lastAttemptScore !== null ? `${employee.lastAttemptScore}%` : "—"}
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <span className="text-sm font-semibold text-on-surface">{employee.activeCredentials}</span>
          {employee.activeCredentials > 0 && <ShieldCheck className="h-3.5 w-3.5 text-success" />}
        </div>
      </td>
    </tr>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function EnterpriseAnalyticsDashboard() {
  const { overview, tracks, departments, employees, activity, isLoading, error, fetchEmployeePage } =
    useEnterpriseAnalytics();
  const [activeTab, setActiveTab] = useState("overview");
  const [employeePage, setEmployeePage] = useState(1);

  const handleEmployeePage = async (newPage: number) => {
    setEmployeePage(newPage);
    await fetchEmployeePage(newPage);
  };

  if (error) {
    return (
      <div className="py-12 flex flex-col items-center justify-center gap-4 px-6">
        <AlertTriangle className="h-12 w-12 text-destructive opacity-60" />
        <p className="text-base font-semibold text-on-surface">Failed to load enterprise analytics</p>
        <p className="text-sm text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="py-8 px-6 space-y-8 pb-16 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Enterprise Analytics</h1>
          <p className="text-sm text-muted">Compliance performance across your organization</p>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-surface-low animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Employees" value={overview?.totalEmployees ?? 0} icon={Users}
            description={`${overview?.activeEmployees ?? 0} active`} />
          <StatCard title="Compliance Rate" value={`${overview?.overallComplianceRate ?? 0}%`} icon={ShieldCheck}
            description="employees with passed assessment" />
          <StatCard title="Active Credentials" value={overview?.activeCredentials ?? 0} icon={Award}
            description={`${overview?.totalCredentials ?? 0} total issued`} />
          <StatCard title="Avg. Assessment Score" value={`${overview?.averageScore ?? 0}%`} icon={TrendingUp}
            description={`${overview?.assessmentsTaken ?? 0} assessments taken`} />
        </div>
      )}

      {/* Compliance Health Banner */}
      {!isLoading && overview && (
        <div className="rounded-2xl border border-border bg-surface p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            overview.overallComplianceRate >= 70 ? "bg-success/10 text-success"
            : overview.overallComplianceRate >= 40 ? "bg-warning/10 text-warning"
            : "bg-destructive/10 text-destructive"
          }`}>
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-shrink-0">
            <p className="text-xs font-bold text-muted uppercase tracking-wider">Organization Compliance Health</p>
            <p className="text-lg font-black text-on-surface">{overview.overallComplianceRate}%</p>
          </div>
          <div className="flex-1">
            <Progress value={overview.overallComplianceRate} className="h-3" />
          </div>
          <Badge
            variant={overview.overallComplianceRate >= 70 ? "default" : overview.overallComplianceRate >= 40 ? "secondary" : "destructive"}
            className="text-xs font-bold uppercase tracking-wider flex-shrink-0"
          >
            {overview.overallComplianceRate >= 70 ? "Compliant" : overview.overallComplianceRate >= 40 ? "In Progress" : "At Risk"}
          </Badge>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="gap-2"><Activity className="h-4 w-4" />Overview</TabsTrigger>
          <TabsTrigger value="departments" className="gap-2"><Building2 className="h-4 w-4" />Departments</TabsTrigger>
          <TabsTrigger value="employees" className="gap-2"><Users className="h-4 w-4" />Employees</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-on-surface">Compliance by Track</h2>
                <p className="text-xs text-muted mt-0.5">Pass rate per compliance training area</p>
              </div>
              <ComplianceTrackChart tracks={tracks} isLoading={isLoading} />
            </div>
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-on-surface">Recent Activity</h2>
                <p className="text-xs text-muted mt-0.5">Assessment attempts & credential issuances</p>
              </div>
              {isLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-16 bg-surface-low rounded-lg" />)}
                </div>
              ) : activity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted gap-2">
                  <Activity className="h-6 w-6 opacity-30" />
                  <p className="text-xs font-semibold">No recent activity</p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[380px] pr-1">
                  {activity.map((entry) => <ActivityItem key={entry.id} entry={entry} />)}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-on-surface">Department Compliance Breakdown</h2>
              <p className="text-xs text-muted mt-0.5">Compliance rate and credential coverage per department</p>
            </div>
            <DepartmentComplianceTable departments={departments} isLoading={isLoading} />
          </div>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-on-surface">Employee Compliance Status</h2>
              <p className="text-xs text-muted mt-0.5">
                {employees ? `${employees.total} employees — Page ${employeePage} of ${employees.totalPages}` : "Loading…"}
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 bg-surface-low rounded-lg" />)}
              </div>
            ) : !employees || employees.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted gap-2">
                <Users className="h-8 w-8 opacity-30" />
                <p className="text-xs font-semibold">No employee records found.</p>
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-border-light overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-low border-b border-border-light">
                        <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">Employee</th>
                        <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider">Department</th>
                        <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-center">Status</th>
                        <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-center">Last Score</th>
                        <th className="px-4 py-3 text-xs font-bold text-muted uppercase tracking-wider text-center">Credentials</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.data.map((emp) => <EmployeeRow key={emp.employeeId} employee={emp} />)}
                    </tbody>
                  </table>
                </div>
                {employees.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted font-semibold">
                      Showing {(employeePage - 1) * 20 + 1}–{Math.min(employeePage * 20, employees.total)} of {employees.total}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={employeePage === 1}
                        onClick={() => handleEmployeePage(employeePage - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" disabled={employeePage === employees.totalPages}
                        onClick={() => handleEmployeePage(employeePage + 1)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
