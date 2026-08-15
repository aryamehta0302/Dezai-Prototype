"use client";

import React, { useState, useEffect } from "react";
import { enterpriseAdminService } from "../services/enterprise-admin.service";
import type { Employee, EmploymentStatus } from "../types/enterprise-admin.types";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  User,
  Mail,
  Building2,
  UserCheck,
  Users,
  Briefcase,
  Clock,
  AlertCircle,
} from "lucide-react";

const STATUS_COLORS: Record<EmploymentStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  INVITED: "bg-blue-100 text-blue-700 border-blue-200",
  SUSPENDED: "bg-amber-100 text-amber-700 border-amber-200",
  OFFBOARDED: "bg-slate-100 text-slate-500 border-slate-200",
};

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface Props {
  employeeId: string;
}

export function EmployeeProfilePage({ employeeId }: Props) {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await enterpriseAdminService.getEmployeeProfile(employeeId);
        setEmployee(data);
      } catch (err: any) {
        setError(err.message ?? "Failed to load employee profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [employeeId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl p-5">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error ?? "Employee not found."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* ── Profile Header Card ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 flex items-center gap-5">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl font-bold">
            {initials(employee.user.name ?? "?")}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-900">{employee.user.name}</h1>
            <Badge
              variant="outline"
              className={`text-xs font-medium border ${STATUS_COLORS[employee.employmentStatus]}`}
            >
              {employee.employmentStatus}
            </Badge>
          </div>
          {employee.title && (
            <p className="text-slate-500 text-sm mt-0.5">{employee.title}</p>
          )}
          <p className="text-slate-400 text-xs mt-1">{employee.user.email}</p>
        </div>
      </div>

      {/* ── Details Card ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: Mail,
              label: "Email",
              value: employee.user.email,
            },
            {
              icon: Briefcase,
              label: "Title",
              value: employee.title ?? "—",
            },
            {
              icon: Building2,
              label: "Department",
              value: employee.department?.name ?? "Unassigned",
            },
            {
              icon: UserCheck,
              label: "Manager",
              value: employee.manager?.user.name ?? "None",
            },
            {
              icon: Clock,
              label: "Invited",
              value: formatDate(employee.invitedAt),
            },
            {
              icon: Clock,
              label: "Joined",
              value: formatDate(employee.joinedAt),
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="p-2 bg-slate-50 rounded-lg mt-0.5">
                <Icon className="h-4 w-4 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-medium text-slate-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Direct Reports Card ── */}
      {employee.directReports.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Direct Reports ({employee.directReports.length})
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {employee.directReports.map((report) => (
              <div key={report.id} className="py-3 flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-semibold">
                    {initials(report.user.name ?? "?")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-slate-900">{report.user.name}</p>
                  <p className="text-xs text-slate-400">
                    {report.department?.name ?? "Unassigned"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty direct reports message */}
      {employee.directReports.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
              Direct Reports
            </h2>
          </div>
          <p className="text-sm text-slate-400">No direct reports assigned.</p>
        </div>
      )}
    </div>
  );
}
