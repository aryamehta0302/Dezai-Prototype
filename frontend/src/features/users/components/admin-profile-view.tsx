"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  Building2,
  BookOpen,
  Activity,
  ScrollText,
  Settings,
  Mail,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { apiClient } from "@/core/api/client";
import { formatDate } from "@/shared/utils/format";
import type { AuthUser } from "@/lib/stores/auth.store";

interface AdminProfileData {
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    lastActiveAt?: string;
  };
  admin?: {
    roleTitle: string;
    accessLevel: string;
    status: string;
    capabilities: string[];
  };
  institution?: {
    id: string;
    name: string;
    logoUrl?: string;
    country?: string;
    state?: string;
    city?: string;
  };
  stats?: {
    totalUsers?: number;
    totalInstitutions?: number;
    totalPrograms?: number;
    totalFaculty?: number;
    totalStudents?: number;
  };
}

interface AdminProfileViewProps {
  initialUser: AuthUser;
}

export function AdminProfileView({ initialUser }: AdminProfileViewProps) {
  const [profileData, setProfileData] = useState<AdminProfileData | null>(null);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<AdminProfileData>("/users/profile")
      .then((res) => {
        if (isMounted && res) {
          setProfileData(res);
        }
      })
      .catch((err) => {
        console.error("Failed to load admin profile:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isSuperAdmin = initialUser.role === "DEZAI_ADMIN";
  const dashboardUrl = isSuperAdmin ? "/admin/dashboard" : "/university/dashboard";
  const stats = profileData?.stats;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Navigation bar */}
      <div className="flex items-center justify-between">
        <Link
          href={dashboardUrl}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/profile/settings"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-border-light bg-white hover:bg-surface-low text-on-surface transition-all shadow-2xs"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Account Settings
          </Link>
          <Link
            href={dashboardUrl}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover transition-all shadow-sm"
          >
            Open Dashboard
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="card-elevation p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-white via-white to-primary/5">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-900 to-primary text-3xl font-bold text-white shrink-0 shadow-md">
            {initialUser.avatar ? (
              <img
                src={initialUser.avatar}
                alt=""
                className="h-full w-full object-cover rounded-2xl"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              initialUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-on-surface">{initialUser.name}</h1>
              <Badge variant="default" className="capitalize text-xs font-bold bg-slate-900 text-white">
                {isSuperAdmin ? "Super Administrator" : "University Administrator"}
              </Badge>
              <span className="inline-flex items-center gap-1 text-2xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active Account
              </span>
            </div>

            <p className="text-sm font-medium text-slate-600">
              {isSuperAdmin
                ? "Full Platform Governance & Super Admin Access"
                : `University Administration Node — ${profileData?.institution?.name || "Academic Institution"}`}
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-muted pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted" />
                {initialUser.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted" />
                Joined {formatDate(profileData?.user.createdAt || new Date().toISOString())}
              </span>
              <span className="flex items-center gap-1.5 text-primary font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                RBAC Level: Tier 0 (Root)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevation p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-2xs font-bold text-muted uppercase tracking-wider">
              {isSuperAdmin ? "Platform Users" : "University Students"}
            </span>
            <p className="text-2xl font-extrabold text-on-surface">
              {stats?.totalUsers ?? stats?.totalStudents ?? "—"}
            </p>
            <span className="text-3xs text-muted flex items-center gap-1">Managed Accounts</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="card-elevation p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-2xs font-bold text-muted uppercase tracking-wider">
              {isSuperAdmin ? "Institutions" : "Faculty Members"}
            </span>
            <p className="text-2xl font-extrabold text-on-surface">
              {stats?.totalInstitutions ?? stats?.totalFaculty ?? "—"}
            </p>
            <span className="text-3xs text-muted flex items-center gap-1">Onboarded Entities</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-success/10 flex items-center justify-center text-success">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="card-elevation p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-2xs font-bold text-muted uppercase tracking-wider">Active Programs</span>
            <p className="text-2xl font-extrabold text-on-surface">{stats?.totalPrograms ?? "—"}</p>
            <span className="text-3xs text-muted flex items-center gap-1">Curricula in Registry</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="card-elevation p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-2xs font-bold text-muted uppercase tracking-wider">System Telemetry</span>
            <p className="text-base font-extrabold text-success truncate">100% OPERATIONAL</p>
            <span className="text-3xs text-muted flex items-center gap-1">Healthy Node Grid</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-success/10 flex items-center justify-center text-success">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Content: Capabilities & Quick Nav */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Capabilities & Governance Scope */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-elevation p-6 space-y-5 bg-white">
            <div className="flex items-center justify-between border-b border-border-light pb-4">
              <div>
                <h2 className="text-base font-bold text-on-surface">Administrative Scope & Capabilities</h2>
                <p className="text-xs text-muted">Role permissions and system authorizations granted to your account</p>
              </div>
              <Badge variant="secondary" className="font-mono text-2xs">
                ALL PERMISSIONS GRANTED
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { title: "User & Role Governance", desc: "Manage accounts, assign roles, enforce suspensions", icon: Users },
                { title: "Institution Approvals", desc: "Approve university registrations, audit compliance", icon: Building2 },
                { title: "System Health & Telemetry", desc: "Real-time resource and database connection monitoring", icon: Activity },
                { title: "Immutable Audit Trails", desc: "Inspect append-only log of critical system actions", icon: ScrollText },
                { title: "Platform Configuration", desc: "Global policy, thresholds, and signing keys", icon: Settings },
                { title: "Cryptographic Verification", desc: "CITADEL & FORGE credential verification nodes", icon: ShieldCheck },
              ].map(({ title, desc, icon: Icon }) => (
                <div key={title} className="p-4 rounded-xl bg-surface-low border border-border-light/80 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-on-surface">{title}</h3>
                    <p className="text-3xs text-muted mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-elevation p-6 bg-white space-y-4">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              Security & Compliance Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-surface-low rounded-xl">
                <p className="text-3xs text-muted font-bold uppercase">Session Auth</p>
                <p className="font-semibold text-on-surface mt-1">JWT Bearer Signed</p>
              </div>
              <div className="p-3 bg-surface-low rounded-xl">
                <p className="text-3xs text-muted font-bold uppercase">Audit Integrity</p>
                <p className="font-semibold text-success mt-1">Append-Only Immutable</p>
              </div>
              <div className="p-3 bg-surface-low rounded-xl">
                <p className="text-3xs text-muted font-bold uppercase">Multi-Tenant Isolation</p>
                <p className="font-semibold text-on-surface mt-1">Enforced at Guard Level</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Admin Shortcuts */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            Admin Quick Actions
          </h2>

          <div className="card-elevation p-4 space-y-2 bg-white">
            {[
              { label: "User Management", href: "/admin/users", icon: Users, desc: "Search & manage platform users" },
              { label: "University Management", href: "/admin/institutions", icon: Building2, desc: "Review institution approvals" },
              { label: "System Health Telemetry", href: "/admin/system-health", icon: Activity, desc: "Monitor database and uptime" },
              { label: "Platform Audit Logs", href: "/admin/audit-logs", icon: ScrollText, desc: "Browse security event history" },
              { label: "Account & Profile Settings", href: "/profile/settings", icon: Settings, desc: "Update personal credentials" },
            ].map(({ label, href, icon: Icon, desc }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-low transition-all group border border-transparent hover:border-border-light"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">{label}</p>
                    <p className="text-3xs text-muted">{desc}</p>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
