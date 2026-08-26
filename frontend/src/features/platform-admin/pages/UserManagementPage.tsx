"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Users, ShieldAlert, UserCheck } from "lucide-react";
import { PageContainer } from "@/shared/components/page-container";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { platformAdminService } from "../services/platform-admin.service";
import { PlatformUser } from "../types/platform-admin.types";

export const UserManagementPage: React.FC = () => {
  const searchParams = useSearchParams();
  const initialSearch = searchParams?.get("search") || searchParams?.get("q") || "";
  const initialRole = searchParams?.get("role") || "";

  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [roleFilter, setRoleFilter] = useState(initialRole);

  const loadUsers = useCallback((querySearch?: string, queryRole?: string) => {
    setLoading(true);
    const activeSearch = querySearch !== undefined ? querySearch : search;
    const activeRole = queryRole !== undefined ? queryRole : roleFilter;

    platformAdminService
      .getAllUsers({ role: activeRole || undefined, search: activeSearch || undefined })
      .then((data) => {
        setUsers(data?.items || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, roleFilter]);

  useEffect(() => {
    const q = searchParams?.get("search") || searchParams?.get("q") || "";
    const r = searchParams?.get("role") || "";
    setSearch(q);
    setRoleFilter(r);
    loadUsers(q, r);
  }, [searchParams]);

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
    <PageContainer className="py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">User Management</h1>
        <p className="text-sm text-muted">Super admin control over all users, roles, and account suspensions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-low p-4 rounded-xl border border-border-light">
        <div className="flex gap-4 w-full sm:w-auto">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadUsers()}
            className="w-72"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-border-light bg-surface px-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
            <option value="UNIVERSITY_ADMIN">University Admin</option>
            <option value="DEZAI_ADMIN">Dezai Admin</option>
          </select>
        </div>
        <Button onClick={() => loadUsers()} variant="default" size="sm">
          <Search className="h-4 w-4 mr-1" />
          Search
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-light bg-surface">
        <table className="w-full text-left text-sm text-on-surface">
          <thead className="border-b border-border-light bg-surface-low text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {users.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-surface-low">
                <td className="px-6 py-4">
                  <div className="font-medium text-on-surface">{user.name || "Unnamed"}</div>
                  <div className="text-xs text-muted">{user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="secondary">{user.role}</Badge>
                </td>
                <td className="px-6 py-4">
                  {user.accountStatus === "SUSPENDED" ? (
                    <Badge variant="destructive">Suspended</Badge>
                  ) : (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {user.accountStatus === "SUSPENDED" ? (
                    <Button onClick={() => handleReactivate(user.id)} variant="outline" size="sm">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Reactivate
                    </Button>
                  ) : (
                    <Button onClick={() => handleSuspend(user.id)} variant="outline" size="sm">
                      <ShieldAlert className="h-3 w-3 mr-1" />
                      Suspend
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
};
