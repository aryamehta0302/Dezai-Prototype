"use client";

import React, { useState, useEffect, useCallback } from "react";
import { enterpriseAdminService } from "../services/enterprise-admin.service";
import type { Employee, EmploymentStatus } from "../types/enterprise-admin.types";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Search,
  Building2,
  UserCheck,
  Users,
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

export function OrgDirectoryPage() {
  const { user } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const orgId = (user as any)?.organizationId ?? "";

  const fetchDirectory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await enterpriseAdminService.getOrgDirectory();
      setEmployees(data);
    } catch (err: any) {
      setError(err.message ?? "Failed to load org directory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  const filtered = employees.filter((emp) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      emp.user.name.toLowerCase().includes(q) ||
      emp.user.email.toLowerCase().includes(q) ||
      (emp.title ?? "").toLowerCase().includes(q) ||
      (emp.department?.name ?? "").toLowerCase().includes(q)
    );
  });

  // Group by department
  const grouped = filtered.reduce<Record<string, Employee[]>>((acc, emp) => {
    const key = emp.department?.name ?? "Unassigned";
    if (!acc[key]) acc[key] = [];
    acc[key].push(emp);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Org Directory</h1>
        <p className="text-slate-500 mt-1">
          Browse all employees — department, title, and manager at a glance.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Users, label: "Total Employees", value: employees.length },
          {
            icon: Building2,
            label: "Departments",
            value: Object.keys(grouped).filter((k) => k !== "Unassigned").length,
          },
          {
            icon: UserCheck,
            label: "Active",
            value: employees.filter((e) => e.employmentStatus === "ACTIVE").length,
          },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Icon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          className="pl-10"
          placeholder="Search by name, email, title, or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Directory grouped by department */}
      {!loading && !error && (
        <div className="space-y-8">
          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Users className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No employees found.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([dept, emps]) => (
              <div key={dept}>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <h2 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">
                    {dept}
                  </h2>
                  <span className="text-xs text-slate-400">({emps.length})</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {emps.map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-semibold">
                            {initials(emp.user.name ?? "?")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{emp.user.name}</p>
                          <p className="text-xs text-slate-500">{emp.user.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {emp.title && (
                          <span className="text-xs text-slate-500 hidden md:block">{emp.title}</span>
                        )}

                        {emp.manager && (
                          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>{emp.manager.user.name}</span>
                          </div>
                        )}

                        <Badge
                          className={`text-xs font-medium border ${STATUS_COLORS[emp.employmentStatus]}`}
                          variant="outline"
                        >
                          {emp.employmentStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
