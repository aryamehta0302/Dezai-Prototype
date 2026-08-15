"use client";

/**
 * DepartmentComplianceTable
 * Per-department compliance breakdown table.
 * Sprint 8 — Enterprise Analytics Dashboard
 * New file — additive only.
 */

import { Building2 } from "lucide-react";
import type { EnterpriseDepartmentStat } from "../types/enterprise-analytics.types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";

interface DepartmentComplianceTableProps {
  departments: EnterpriseDepartmentStat[];
  isLoading?: boolean;
}

function getRateBadgeVariant(rate: number): "default" | "secondary" | "destructive" {
  if (rate >= 70) return "default";
  if (rate >= 40) return "secondary";
  return "destructive";
}

export function DepartmentComplianceTable({ departments, isLoading = false }: DepartmentComplianceTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 bg-surface-low rounded-lg" />)}
      </div>
    );
  }

  if (!departments || departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-muted gap-2">
        <Building2 className="h-8 w-8 opacity-30" />
        <p className="text-xs font-semibold">No departments found for this organization.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-light overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-surface-low">
            <TableHead className="font-bold text-xs uppercase tracking-wider">Department</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Employees</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Compliant</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-wider">Compliance Rate</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Credentials</TableHead>
            <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((dept) => (
            <TableRow key={dept.departmentId} className="hover:bg-surface-low/50 transition-colors">
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="font-semibold text-sm text-on-surface">{dept.departmentName}</span>
                </div>
              </TableCell>
              <TableCell className="text-center font-medium text-sm">{dept.employeeCount}</TableCell>
              <TableCell className="text-center font-medium text-sm text-success">{dept.compliantCount}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5 min-w-[140px]">
                  <Progress value={dept.complianceRate} className="h-2 flex-1" />
                  <span className="text-xs font-bold text-on-surface w-9 text-right">{dept.complianceRate}%</span>
                </div>
              </TableCell>
              <TableCell className="text-center font-medium text-sm">{dept.credentialCount}</TableCell>
              <TableCell className="text-center">
                <Badge variant={getRateBadgeVariant(dept.complianceRate)} className="text-[10px] font-bold uppercase tracking-wider">
                  {dept.complianceRate >= 70 ? "Compliant" : dept.complianceRate >= 40 ? "In Progress" : "At Risk"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
