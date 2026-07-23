"use client";

import React, { useEffect, useState } from "react";
import { platformAdminService } from "../services/platform-admin.service";
import { PlatformUser } from "../types/platform-admin.types";

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const loadUsers = () => {
    setLoading(true);
    platformAdminService
      .getAllUsers({ role: roleFilter || undefined, search: search || undefined })
      .then((data) => {
        setUsers(data?.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSuspend = async (id: string) => {
    if (confirm("Are you sure you want to suspend this user?")) {
      await platformAdminService.suspendUser(id);
      loadUsers();
    }
  };

  const handleReactivate = async (id: string) => {
    await platformAdminService.reactivateUser(id);
    loadUsers();
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
        <p className="text-sm text-slate-400">Super admin control over all users, roles, and account suspensions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        <div className="flex gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadUsers()}
            className="w-72 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
            <option value="UNIVERSITY_ADMIN">University Admin</option>
            <option value="DEZAI_ADMIN">Dezai Admin</option>
          </select>
        </div>
        <button
          onClick={loadUsers}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
        >
          Search
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-slate-800/30">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-200">{u.name || "Unnamed"}</div>
                  <div className="text-xs text-slate-400">{u.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="rounded bg-slate-800 px-2 py-1 text-xs font-mono text-indigo-400">{u.role}</span>
                </td>
                <td className="px-6 py-4">
                  {u.accountStatus === "SUSPENDED" ? (
                    <span className="text-xs font-medium text-red-400">Suspended</span>
                  ) : (
                    <span className="text-xs font-medium text-emerald-400">Active</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {u.accountStatus === "SUSPENDED" ? (
                    <button
                      onClick={() => handleReactivate(u.id)}
                      className="rounded-md bg-cyan-600/20 px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-600/30 transition"
                    >
                      Reactivate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSuspend(u.id)}
                      className="rounded-md bg-amber-600/20 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-600/30 transition"
                    >
                      Suspend
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
