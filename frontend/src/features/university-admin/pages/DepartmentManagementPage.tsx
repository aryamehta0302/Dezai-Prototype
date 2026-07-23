"use client";

import React, { useEffect, useState } from "react";
import { departmentService } from "../../departments/services/department.service";
import { Department } from "../../departments/types/department.types";

export const DepartmentManagementPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const loadDepartments = () => {
    setLoading(true);
    departmentService
      .getDepartments()
      .then((data) => {
        setDepartments(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreating(true);
    try {
      await departmentService.createDepartment({ name, code, description });
      setName("");
      setCode("");
      setDescription("");
      loadDepartments();
    } catch (err: any) {
      alert(err.message || "Failed to create department");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, deptName: string) => {
    if (confirm(`Are you sure you want to delete department "${deptName}"?`)) {
      try {
        await departmentService.deleteDepartment(id, "");
        loadDepartments();
      } catch (err: any) {
        alert(err.message || "Cannot delete department");
      }
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Department Management</h1>
        <p className="text-sm text-slate-400">Configure academic departments, assign department heads, and monitor program associations</p>
      </div>

      {/* Create form */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4">Add New Department</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Department Name *</label>
            <input
              type="text"
              placeholder="e.g. Computer Science & Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Short Code (Optional)</label>
            <input
              type="text"
              placeholder="e.g. CSE"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50"
            >
              {creating ? "Creating..." : "Add Department"}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Department Head</th>
              <th className="px-6 py-4">Faculty Count</th>
              <th className="px-6 py-4">Programs</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {departments.map((dept) => (
              <tr key={dept.id} className="transition-colors hover:bg-slate-800/30">
                <td className="px-6 py-4 font-medium text-slate-200">{dept.name}</td>
                <td className="px-6 py-4">
                  {dept.code ? (
                    <span className="rounded bg-slate-800 px-2 py-1 text-xs font-mono text-cyan-400">{dept.code}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-6 py-4 text-slate-400">
                  {dept.headFaculty?.user?.name || <span className="italic text-slate-600">Unassigned</span>}
                </td>
                <td className="px-6 py-4 text-slate-300">{dept._count?.facultyMembers ?? 0}</td>
                <td className="px-6 py-4 text-slate-300">{dept._count?.programs ?? 0}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(dept.id, dept.name)}
                    className="rounded-md bg-rose-600/20 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-600/30 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
