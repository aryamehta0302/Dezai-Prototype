"use client";

import React from "react";
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
          <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-slate-800/50" />
        ))}
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400">
        <p className="text-sm font-medium">No enrolled students found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-6 py-4">Student</th>
            <th className="px-6 py-4">Program</th>
            <th className="px-6 py-4">Progress</th>
            <th className="px-6 py-4">Mentor</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {students.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-slate-800/30">
              <td className="px-6 py-4">
                <div className="font-medium text-slate-200">{item.user?.name || "Unnamed Student"}</div>
                <div className="text-xs text-slate-400">{item.user?.email}</div>
              </td>
              <td className="px-6 py-4">
                <span className="font-medium text-slate-200">{item.program?.title || "—"}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-24 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                      style={{ width: `${Math.min(item.progress || 0, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-400">{item.progress}%</span>
                </div>
              </td>
              <td className="px-6 py-4">
                {item.mentor ? (
                  <span className="text-xs text-emerald-400 font-medium">
                    {item.mentor.user?.name || "Assigned"}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 italic">Unassigned</span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                {onAssignMentor && (
                  <button
                    onClick={() => onAssignMentor(item)}
                    className="rounded-md bg-indigo-600/20 px-3 py-1.5 text-xs font-medium text-indigo-400 hover:bg-indigo-600/30 transition"
                  >
                    {item.mentor ? "Change Mentor" : "Assign Mentor"}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
