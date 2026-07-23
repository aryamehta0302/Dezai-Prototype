"use client";

import React, { useEffect, useState } from "react";
import { universityAdminService } from "../services/university-admin.service";
import { FacultyMemberDetail } from "../types/university-admin.types";
import { FacultyTable } from "../components/FacultyTable";
import { DepartmentSelect } from "../../departments/components/DepartmentSelect";

export const FacultyManagementPage: React.FC = () => {
  const [facultyList, setFacultyList] = useState<FacultyMemberDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");

  const loadFaculty = () => {
    setLoading(true);
    universityAdminService
      .getAllFaculty({
        search: search || undefined,
        status: statusFilter || undefined,
        departmentId: departmentFilter || undefined,
      })
      .then((data) => {
        setFacultyList(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadFaculty();
  }, [statusFilter, departmentFilter]);

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
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Faculty Management</h1>
        <p className="text-sm text-slate-400">Verify faculty registrations, manage department assignments, and oversight</p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div className="flex flex-1 gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name, email, employee ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadFaculty()}
            className="w-full sm:w-72 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        <button
          onClick={loadFaculty}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
        >
          Filter
        </button>
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
    </div>
  );
};
