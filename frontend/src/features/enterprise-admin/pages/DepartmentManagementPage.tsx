"use client";

import React, { useState, useEffect, useCallback } from "react";
import { enterpriseAdminService } from "../services/enterprise-admin.service";
import type {
  Department,
  DepartmentStats,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "../types/enterprise-admin.types";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Users,
  UserCheck,
  UserX,
  AlertCircle,
} from "lucide-react";

interface DeptFormState {
  name: string;
  description: string;
}

export function DepartmentManagementPage() {
  const { user } = useAuthStore();
  const orgId = (user as any)?.organizationId ?? "";

  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create / Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [form, setForm] = useState<DeptFormState>({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [depts, s] = await Promise.all([
        enterpriseAdminService.getDepartments(),
        enterpriseAdminService.getDepartmentStats(),
      ]);
      setDepartments(depts);
      setStats(s);
    } catch (err: any) {
      setError(err.message ?? "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Open create dialog ──
  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: "", description: "" });
    setFormError(null);
    setDialogOpen(true);
  };

  // ── Open edit dialog ──
  const openEdit = (dept: Department) => {
    setEditTarget(dept);
    setForm({ name: dept.name, description: dept.description ?? "" });
    setFormError(null);
    setDialogOpen(true);
  };

  // ── Save (create or update) ──
  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Department name is required");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editTarget) {
        const updated: UpdateDepartmentInput = {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        };
        await enterpriseAdminService.updateDepartment(editTarget.id, updated);
      } else {
        const created: CreateDepartmentInput = {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          organizationId: "", // Backend resolves this automatically from req.user
        };
        await enterpriseAdminService.createDepartment(created);
      }
      setDialogOpen(false);
      fetchAll();
    } catch (err: any) {
      setFormError(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await enterpriseAdminService.deleteDepartment(deleteTarget.id);
      setDeleteTarget(null);
      fetchAll();
    } catch (err: any) {
      setError(err.message ?? "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Departments</h1>
          <p className="text-slate-500 mt-1">Create and manage your organization's departments.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          New Department
        </Button>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Building2, label: "Total Departments", value: stats.summary.totalDepartments },
            { icon: Users, label: "Total Employees", value: stats.summary.totalEmployees },
            { icon: UserCheck, label: "With Manager", value: stats.summary.departmentsWithManager },
            { icon: UserX, label: "Without Manager", value: stats.summary.departmentsWithoutManager },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Icon className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-xl font-bold text-slate-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      )}

      {/* Department Cards */}
      {!loading && !error && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.length === 0 && (
            <div className="col-span-full text-center py-16 text-slate-400">
              <Building2 className="mx-auto h-10 w-10 mb-3 opacity-40" />
              <p className="text-sm">No departments yet. Create your first one.</p>
            </div>
          )}
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <Building2 className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(dept)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(dept)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-slate-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {dept.description && (
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{dept.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {dept._count.employees} employee{dept._count.employees !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  {dept.manager ? (
                    <>
                      <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                      {dept.manager.user.name}
                    </>
                  ) : (
                    <>
                      <UserX className="h-3.5 w-3.5 text-amber-400" />
                      No manager
                    </>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit Department" : "New Department"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Engineering"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
            {formError && <p className="text-sm text-red-500">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{deleteTarget?.name}</span>?{" "}
            {deleteTarget && deleteTarget._count.employees > 0 && (
              <span className="text-amber-600">
                {deleteTarget._count.employees} employee(s) will become department-less.
              </span>
            )}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
