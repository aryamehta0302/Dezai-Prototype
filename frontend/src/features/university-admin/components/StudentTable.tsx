"use client";

import React from "react";
import { UserPlus, Users } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
import { StudentEnrollmentDetail } from "../types/university-admin.types";

interface StudentTableProps {
  students: StudentEnrollmentDetail[];
  onAssignMentor?: (student: StudentEnrollmentDetail) => void;
  loading?: boolean;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onAssignMentor,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="w-full space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl border border-border-light bg-surface text-muted">
        <Users className="h-8 w-8 mb-2" />
        <p className="text-sm font-medium">No enrolled students found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-light bg-surface">
      <table className="w-full text-left text-sm text-on-surface">
        <thead className="border-b border-border-light bg-surface-low text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="px-6 py-4">Student</th>
            <th className="px-6 py-4">Program</th>
            <th className="px-6 py-4">Progress</th>
            <th className="px-6 py-4">Mentor</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {students.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-surface-low">
              <td className="px-6 py-4">
                <div className="font-medium text-on-surface">{item.user?.name || "Unnamed Student"}</div>
                <div className="text-xs text-muted">{item.user?.email}</div>
              </td>
              <td className="px-6 py-4">
                <span className="font-medium text-on-surface">{item.program?.title || "\u2014"}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-24 rounded-full bg-surface-low overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min(item.progress || 0, 100)}%`, backgroundColor: "var(--color-primary)" }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted">{item.progress}%</span>
                </div>
              </td>
              <td className="px-6 py-4">
                {item.mentor ? (
                  <span className="text-xs text-success font-medium">
                    {item.mentor.user?.name || "Assigned"}
                  </span>
                ) : (
                  <span className="text-xs text-muted italic">Unassigned</span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                {onAssignMentor && (
                  <Button
                    onClick={() => onAssignMentor(item)}
                    variant="outline"
                    size="sm"
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    {item.mentor ? "Change Mentor" : "Assign Mentor"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
