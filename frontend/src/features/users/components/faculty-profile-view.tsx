"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Building2,
  BookOpen,
  Users,
  Clock,
  Mail,
  Calendar,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  Edit3,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { apiClient } from "@/core/api/client";
import { LoadingSkeleton } from "@/shared/components/loading-skeleton";
import { formatDate } from "@/shared/utils/format";
import type { AuthUser } from "@/lib/stores/auth.store";

interface FacultyProfileData {
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    lastActiveAt?: string;
  };
  faculty: {
    id: string;
    department?: string;
    designation?: string;
    employeeId?: string;
    contactNumber?: string;
    verificationStatus: "PENDING" | "APPROVED" | "REJECTED";
  };
  institution: {
    id: string;
    name: string;
    logoUrl?: string;
    country?: string;
    state?: string;
    city?: string;
  };
  programs: Array<{
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    createdAt: string;
    _count?: { enrollments: number };
  }>;
  stats: {
    totalPrograms: number;
    totalStudents: number;
    pendingAttempts: number;
  };
}

interface FacultyProfileViewProps {
  initialUser: AuthUser;
}

export function FacultyProfileView({ initialUser }: FacultyProfileViewProps) {
  const [profileData, setProfileData] = useState<FacultyProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<FacultyProfileData>("/users/profile")
      .then((res) => {
        if (isMounted && res) {
          setProfileData(res);
        }
      })
      .catch((err) => {
        console.error("Failed to load faculty profile:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const faculty = profileData?.faculty;
  const institution = profileData?.institution;
  const programs = profileData?.programs || [];
  const stats = profileData?.stats || {
    totalPrograms: programs.length,
    totalStudents: 0,
    pendingAttempts: 0,
  };

  const isApproved = faculty?.verificationStatus === "APPROVED";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Navigation bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/university/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Faculty Console
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/profile/settings"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border border-border-light bg-white hover:bg-surface-low text-on-surface transition-all shadow-2xs"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Profile Settings
          </Link>
          <Link
            href="/university/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary-hover transition-all shadow-sm"
          >
            Open Console
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="card-elevation p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-white via-white to-primary/5">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-3xl font-bold text-white shrink-0 shadow-md">
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
              <Badge variant="secondary" className="capitalize text-xs font-bold">
                {faculty?.designation || "Faculty Member"}
              </Badge>
              {isApproved ? (
                <span className="inline-flex items-center gap-1 text-2xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified Faculty
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-2xs font-bold text-warning bg-warning/10 px-2.5 py-1 rounded-full border border-warning/20">
                  <AlertCircle className="h-3.5 w-3.5" /> Verification Pending
                </span>
              )}
            </div>

            <p className="text-sm font-medium text-primary">
              {faculty?.department || "Academic Department Not Specified"}
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-muted pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted" />
                {initialUser.email}
              </span>
              {institution?.name && (
                <span className="flex items-center gap-1.5 font-medium text-on-surface">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                  {institution.name}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-muted" />
                Joined {formatDate(profileData?.user.createdAt || new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevation p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-2xs font-bold text-muted uppercase tracking-wider">Taught Programs</span>
            <p className="text-2xl font-extrabold text-on-surface">{stats.totalPrograms}</p>
            <span className="text-3xs text-muted flex items-center gap-1">Active Curriculum Units</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="card-elevation p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-2xs font-bold text-muted uppercase tracking-wider">Total Enrolled Cohort</span>
            <p className="text-2xl font-extrabold text-on-surface">{stats.totalStudents}</p>
            <span className="text-3xs text-muted flex items-center gap-1">Learners Across Courses</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-success/10 flex items-center justify-center text-success">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="card-elevation p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-2xs font-bold text-muted uppercase tracking-wider">Pending Submissions</span>
            <p className="text-2xl font-extrabold text-on-surface">{stats.pendingAttempts}</p>
            <span className="text-3xs text-muted flex items-center gap-1">Awaiting Evaluation</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-warning/10 flex items-center justify-center text-warning">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="card-elevation p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-2xs font-bold text-muted uppercase tracking-wider">Affiliation Status</span>
            <p className="text-base font-extrabold text-primary truncate max-w-[130px]">
              {faculty?.verificationStatus || "PENDING"}
            </p>
            <span className="text-3xs text-muted flex items-center gap-1">Institutional Node</span>
          </div>
          <div className="h-11 w-11 rounded-xl bg-credential-gold/15 flex items-center justify-center text-credential-gold">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Content: Taught Programs & Institution Affiliation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Taught Courses & Programs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Taught Programs & Courses ({programs.length})
            </h2>
            <Link
              href="/university/dashboard"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Manage in Console
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              <LoadingSkeleton className="h-28 rounded-2xl" />
              <LoadingSkeleton className="h-28 rounded-2xl" />
            </div>
          ) : programs.length > 0 ? (
            <div className="space-y-4">
              {programs.map((prog) => (
                <div
                  key={prog.id}
                  className="card-elevation p-5 flex flex-col sm:flex-row items-start gap-4 hover:border-primary/30 transition-all group"
                >
                  <div className="h-16 w-24 rounded-xl bg-surface-low flex items-center justify-center text-muted shrink-0 overflow-hidden border border-border-light">
                    {prog.thumbnail ? (
                      <img src={prog.thumbnail} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <BookOpen className="h-7 w-7 text-primary/40 group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">
                      {prog.title}
                    </h3>
                    <p className="text-xs text-muted line-clamp-2">{prog.description}</p>
                    <div className="flex items-center gap-3 pt-1 text-2xs text-muted font-medium">
                      <span className="flex items-center gap-1 text-on-surface font-semibold">
                        <Users className="h-3 w-3 text-primary" />
                        {prog._count?.enrollments || 0} enrolled learners
                      </span>
                      <span>•</span>
                      <span>Created {formatDate(prog.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-elevation py-12 text-center space-y-3 border-dashed">
              <BookOpen className="h-10 w-10 text-muted/30 mx-auto" />
              <p className="text-sm font-medium text-muted">No taught programs assigned yet</p>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Once programs are created or assigned in the faculty console, they will appear on your public instructor profile.
              </p>
              <Link
                href="/university/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm hover:bg-primary-hover transition-all"
              >
                Create New Program
              </Link>
            </div>
          )}
        </div>

        {/* Right 1 Col: Institutional Affiliation Card */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Institution Affiliation
          </h2>

          <div className="card-elevation p-6 space-y-5 bg-white">
            <div className="flex flex-col items-center text-center p-4 bg-surface-low rounded-2xl border border-border-light space-y-3">
              {institution?.logoUrl ? (
                <img
                  src={institution.logoUrl}
                  alt="Logo"
                  className="h-16 w-16 object-contain rounded-2xl bg-white border border-border-light p-2.5 shadow-2xs"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Building2 className="h-8 w-8" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-on-surface">{institution?.name || "Affiliated University"}</h4>
                <Badge variant={isApproved ? "default" : "secondary"} className="mt-1 text-2xs">
                  {faculty?.verificationStatus === "APPROVED" ? "Official Faculty Member" : "Verification In Review"}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 text-xs text-on-surface">
              <div className="flex items-center gap-3 p-3 bg-surface-low rounded-xl">
                <MapPin className="h-4 w-4 text-muted shrink-0" />
                <div className="min-w-0">
                  <p className="text-3xs text-muted font-bold uppercase">Campus Location</p>
                  <p className="font-semibold truncate">
                    {[institution?.city, institution?.state, institution?.country].filter(Boolean).join(", ") || "Global Campus"}
                  </p>
                </div>
              </div>

              {faculty?.employeeId && (
                <div className="flex items-center gap-3 p-3 bg-surface-low rounded-xl">
                  <ShieldCheck className="h-4 w-4 text-muted shrink-0" />
                  <div className="min-w-0">
                    <p className="text-3xs text-muted font-bold uppercase">Faculty / Employee ID</p>
                    <p className="font-mono font-semibold truncate">{faculty.employeeId}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 bg-surface-low rounded-xl">
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-3xs text-muted font-bold uppercase">Dezai AI Node Access</p>
                  <p className="font-semibold text-success">Automated Grading & Proctoring Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
