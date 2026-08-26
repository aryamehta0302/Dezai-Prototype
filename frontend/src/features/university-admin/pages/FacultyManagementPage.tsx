"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { PageContainer } from "@/shared/components/page-container";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { universityAdminService } from "../services/university-admin.service";
import { FacultyMemberDetail } from "../types/university-admin.types";
import { FacultyTable } from "../components/FacultyTable";
import { DepartmentSelect } from "../../departments/components/DepartmentSelect";

export const FacultyManagementPage: React.FC = () => {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || searchParams?.get("q") || "";

  const [facultyList, setFacultyList] = useState<FacultyMemberDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");

  const loadFaculty = useCallback((querySearch?: string) => {
    setLoading(true);
    const activeSearch = querySearch !== undefined ? querySearch : search;
    universityAdminService
      .getAllFaculty({
        search: activeSearch || undefined,
        status: statusFilter || undefined,
        departmentId: departmentFilter || undefined,
      })
      .then((data) => {
        setFacultyList(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, statusFilter, departmentFilter]);

  useEffect(() => {
    const q = searchParams?.get("search") || searchParams?.get("q") || "";
    setSearch(q);
    loadFaculty(q);
  }, [searchParams, statusFilter, departmentFilter]);

  const handleApprove = async (id: string) => {
    await universityAdminService.approveFaculty(id);
    loadFaculty();
  };

  const handleReject = async (id: string) => {
    await universityAdminService.rejectFaculty(id);
    loadFaculty();
  };

  const handleSuspend = async (id: string) => {
    await universityAdminService.suspendFaculty(id);
    loadFaculty();
  };

  const handleReactivate = async (id: string) => {
    await universityAdminService.reactivateFaculty(id);
    loadFaculty();
  };

  const handleRemove = async (id: string) => {
    if (confirm("Are you sure you want to remove this faculty member?")) {
      await universityAdminService.removeFaculty(id);
      loadFaculty();
    }
  };

  return (
    <PageContainer className="py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Faculty Management</h1>
        <p className="text-sm text-muted">Verify faculty registrations, manage department assignments, and oversight</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-low p-4 rounded-xl border border-border-light">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <Input
            placeholder="Search by name, email, employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadFaculty()}
            className="w-full sm:w-72"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-border-light bg-surface px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="APPROVED">Approved / Active</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <div className="w-48">
            <DepartmentSelect
              value={departmentFilter}
              onChange={(val) => setDepartmentFilter(val)}
            />
          </div>
        </div>
        <Button onClick={() => loadFaculty()} variant="default" size="sm">
          <Search className="h-4 w-4 mr-1" />
          Filter
        </Button>
      </div>

      <FacultyTable
        facultyList={facultyList}
        loading={loading}
        onApprove={handleApprove}
        onReject={handleReject}
        onSuspend={handleSuspend}
        onReactivate={handleReactivate}
        onRemove={handleRemove}
      />
    </PageContainer>
  );
};
