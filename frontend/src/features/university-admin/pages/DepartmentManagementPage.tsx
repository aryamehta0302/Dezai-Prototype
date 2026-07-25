"use client";

import React, { useEffect, useState } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";
import { PageContainer } from "@/shared/components/page-container";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
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
    <PageContainer className="py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Department Management</h1>
        <p className="text-sm text-muted">Configure academic departments, assign department heads, and monitor program associations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Plus className="h-4 w-4 inline mr-2" />
            Add New Department
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-muted mb-1">Department Name *</label>
              <Input
                placeholder="e.g. Computer Science & Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1">Short Code (Optional)</label>
              <Input
                placeholder="e.g. CSE"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={creating} variant="default" className="w-full">
                {creating ? "Creating..." : "Add Department"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-x-auto rounded-xl border border-border-light bg-surface">
        <table className="w-full text-left text-sm text-on-surface">
          <thead className="border-b border-border-light bg-surface-low text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Department Head</th>
              <th className="px-6 py-4">Faculty Count</th>
              <th className="px-6 py-4">Programs</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {departments.map((dept) => (
              <tr key={dept.id} className="transition-colors hover:bg-surface-low">
                <td className="px-6 py-4 font-medium text-on-surface">{dept.name}</td>
                <td className="px-6 py-4">
                  {dept.code ? (
                    <Badge variant="secondary">{dept.code}</Badge>
                  ) : (
                    "\u2014"
                  )}
                </td>
                <td className="px-6 py-4 text-muted">
                  {dept.headFaculty?.user?.name || <span className="italic text-muted">Unassigned</span>}
                </td>
                <td className="px-6 py-4 text-on-surface">{dept._count?.facultyMembers ?? 0}</td>
                <td className="px-6 py-4 text-on-surface">{dept._count?.programs ?? 0}</td>
                <td className="px-6 py-4 text-right">
                  <Button
                    onClick={() => handleDelete(dept.id, dept.name)}
                    variant="outline"
                    size="sm"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
};
