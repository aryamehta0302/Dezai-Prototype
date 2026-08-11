"use client";

import React from "react";
import { 
  Users, 
  CheckCircle2, 
  Award,
  TrendingUp,
  MoreVertical,
  Building2,
  AlertCircle,
  Sun,
  Zap,
  Coffee,
  Moon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { useSearchParams } from "next/navigation";
import { useOrganizations, useOrganizationStats } from "@/features/enterprise/hooks/use-enterprise";
import { WelcomeModal } from "@/features/dashboard/components/welcome-modal";

export default function EnterpriseDashboardPage() {
  const searchParams = useSearchParams();
  const { data: orgs, isLoading: isLoadingOrgs } = useOrganizations();
  const orgIdParam = searchParams.get('orgId');
  const activeOrgId = (orgIdParam && orgs?.some(o => o.id === orgIdParam) ? orgIdParam : undefined) ?? orgs?.[0]?.id;

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
    { label: "Total Employees", value: stats.totalEmployees.toString(), icon: Users, trend: `${stats.activeEmployees} active members`, color: "text-[#1a56db]", bg: "bg-[#f0f5ff]" },
    { label: "Total Departments", value: stats.totalDepartments.toString(), icon: Building2, trend: "Across the organization", color: "text-[#1a56db]", bg: "bg-[#f0f5ff]" },
    { label: "Compliance Rate", value: "94%", icon: CheckCircle2, trend: "+2% from last month", color: "text-[#1a56db]", bg: "bg-[#f0f5ff]" },
    { label: "Avg. Engagement", value: "78%", icon: TrendingUp, trend: "+5% from last month", color: "text-[#1a56db]", bg: "bg-[#f0f5ff]" },
  ];

  const getTimeInfo = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "Good morning", icon: Sun };
    if (hour >= 12 && hour < 17) return { text: "Good afternoon", icon: Zap };
    if (hour >= 17 && hour < 22) return { text: "Good evening", icon: Coffee };
    return { text: "Late night focus", icon: Moon };
  };

  const { text: greetingText, icon: TimeIcon } = getTimeInfo();

  return (
    <>
      <WelcomeModal />
      <div className="relative min-h-screen pb-20 bg-[#f8fafc]">
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
          
          {/* Aesthetic White SaaS Header */}
          <div className="relative bg-white rounded-[24px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#e2e8f0] overflow-hidden">
            {/* Subtle blue corner accent */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/80 rounded-full blur-[80px] pointer-events-none transform translate-x-1/3 -translate-y-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/50 border border-blue-100 text-blue-600 text-[13px] font-semibold mb-4">
                  <TimeIcon className="w-4 h-4" />
                  <span>{greetingText}</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
                  Organization Overview
                </h1>
                <p className="text-slate-500 text-[15px] leading-relaxed max-w-xl">
                  A high-level view of your enterprise's performance, team engagement, and daily metrics.
                </p>
              </div>
              
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button variant="outline" className="w-full md:w-auto h-11 px-6 rounded-full border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-all shadow-sm">
                  Download Report
                </Button>
                <Button onClick={() => window.location.href = '/enterprise/team'} className="w-full md:w-auto h-11 px-6 rounded-full bg-[#1a56db] text-white font-medium hover:bg-blue-700 transition-all shadow-[0_8px_20px_rgba(26,86,219,0.15)] border-0">
                  Manage Team
                </Button>
              </div>
            </div>
          </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-[#c4dbff] bg-white transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6">
              <CardTitle className="text-[15px] font-medium text-slate-500">
                {stat.label}
              </CardTitle>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="text-4xl font-bold text-slate-800 mb-1">{stat.value}</div>
              <p className="text-[13px] text-slate-400 font-medium">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity */}
        <Card className="lg:col-span-2 rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-[#c4dbff] bg-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[#f0f5ff] pb-5 pt-6 px-8">
            <div>
              <CardTitle className="text-xl font-bold text-[#1a56db]">Recent Activity</CardTitle>
            </div>
            <Button variant="ghost" size="icon" className="hover:bg-[#f0f5ff] text-slate-400 hover:text-[#1a56db] rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-[#f8fafc] rounded-2xl flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-[#c4dbff]" />
              </div>
              <p className="text-[15px] font-semibold text-slate-600 mb-1">No recent activity found</p>
              <p className="text-sm text-slate-400">Activity logs will appear here once your team starts engaging.</p>
            </div>
          </CardContent>
        </Card>

        {/* Departments Quick View */}
        <Card className="rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-[#c4dbff] bg-white">
          <CardHeader className="border-b border-[#f0f5ff] pb-5 pt-6 px-8">
            <CardTitle className="text-xl font-bold text-[#1a56db]">Departments</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {departments && departments.length > 0 ? (
              departments.map((dept) => (
                <div key={dept.id} className="flex items-center justify-between py-3 border-b border-[#f8fafc] last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-[#f0f5ff] flex items-center justify-center text-[#1a56db]">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span className="text-[15px] font-semibold text-slate-700">{dept.name}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-[15px] text-slate-500 mb-5">No departments created yet.</p>
                <Button variant="outline" className="w-full h-11 rounded-full border border-[#c4dbff] text-[#1a56db] font-semibold hover:bg-[#f0f5ff] transition-all">
                  Create Department
                </Button>
              </div>
            )}
            {departments && departments.length > 0 && (
              <Button variant="outline" className="w-full mt-4 h-11 rounded-full border border-[#c4dbff] text-[#1a56db] font-semibold hover:bg-[#f0f5ff] transition-all">
                View All Departments
              </Button>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
    </div>
    </>
  );
}
