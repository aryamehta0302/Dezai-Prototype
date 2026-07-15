"use client";

import React from "react";
import { 
  Users, 
  CheckCircle2, 
  Award,
  TrendingUp,
  MoreVertical,
  Building2,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useOrganizations, useOrganizationStats } from "@/features/enterprise/hooks/use-enterprise";

export default function EnterpriseDashboardPage() {
  // Temporary: Grab the first organization the user has access to
  const { data: orgs, isLoading: isLoadingOrgs } = useOrganizations();
  const activeOrgId = orgs?.[0]?.id;

  const { stats, departments, isLoading } = useOrganizationStats(activeOrgId);

  if (isLoading || isLoadingOrgs) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="h-16 w-1/3 skeleton-shimmer rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 skeleton-shimmer rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 skeleton-shimmer rounded-xl"></div>
          <div className="h-96 skeleton-shimmer rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!orgs || orgs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Building2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No Organization Found</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          You don't belong to any organization yet. Please create a new enterprise workspace to view the dashboard.
        </p>
        <Button onClick={() => window.location.href = '/onboarding/enterprise'} className="bg-primary text-white hover:bg-primary-hover">
          Create Workspace
        </Button>
      </div>
    );
  }

  const statCards = [
    { label: "Total Employees", value: stats.totalEmployees.toString(), icon: Users, trend: `${stats.activeEmployees} active members`, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Total Departments", value: stats.totalDepartments.toString(), icon: Building2, trend: "Across the organization", color: "text-purple-600", bg: "bg-purple-100" },
    // Keeping these as placeholder concepts until backend compliance engine is built
    { label: "Compliance Rate", value: "94%", icon: CheckCircle2, trend: "+2% from last month", color: "text-green-600", bg: "bg-green-100" },
    { label: "Avg. Engagement", value: "78%", icon: TrendingUp, trend: "+5% from last month", color: "text-orange-600", bg: "bg-orange-100" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-bold tracking-tight text-foreground">Overview</h1>
          <p className="text-muted-foreground mt-1 text-lg">Welcome back. Here's what's happening across your organization today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-10 px-4 font-medium">Download Report</Button>
          <Button onClick={() => window.location.href = '/enterprise/team'} className="bg-primary hover:bg-primary-hover text-white h-10 px-4 font-medium shadow-sm">
            Manage Team
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-border shadow-sm hover:shadow-md transition-shadow bg-surface">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity (Placeholder until Activity API exists) */}
        <Card className="lg:col-span-2 border-border shadow-sm bg-surface">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
            <div>
              <CardTitle className="text-lg font-bold">Recent Activity</CardTitle>
            </div>
            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No recent activity found</p>
              <p className="text-xs text-muted-foreground">Activity logs will appear here once your team starts engaging.</p>
            </div>
          </CardContent>
        </Card>

        {/* Departments Quick View */}
        <Card className="border-border shadow-sm bg-surface">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-lg font-bold">Departments</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {departments && departments.length > 0 ? (
              departments.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-surface-muted flex items-center justify-center border border-border">
                      <Building2 className="h-4 w-4 text-on-surface-variant" />
                    </div>
                    <span className="text-sm font-medium">{dept.name}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground mb-3">No departments created yet.</p>
                <Button variant="outline" size="sm" className="w-full font-medium">Create Department</Button>
              </div>
            )}
            {departments && departments.length > 0 && (
              <Button variant="outline" className="w-full mt-2 font-medium">View All Departments</Button>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
