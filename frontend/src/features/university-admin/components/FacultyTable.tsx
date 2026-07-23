"use client";

import React from "react";
import { FacultyMemberDetail } from "../types/university-admin.types";
import { FacultyStatusBadge } from "./FacultyStatusBadge";

interface FacultyTableProps {
  facultyList: FacultyMemberDetail[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onSuspend?: (id: string) => void;
  onReactivate?: (id: string) => void;
  onRemove?: (id: string) => void;
  loading?: boolean;
}

export const FacultyTable: React.FC<FacultyTableProps> = ({
  facultyList,
  onApprove,
  onReject,
  onSuspend,
  onReactivate,
  onRemove,
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

  if (facultyList.length === 0) {
    return (
      <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 text-slate-400">
        <p className="text-sm font-medium">No faculty members found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-6 py-4">Faculty Member</th>
            <th className="px-6 py-4">Department</th>
            <th className="px-6 py-4">Designation</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {facultyList.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-slate-800/30">
              <td className="px-6 py-4">
                <div className="font-medium text-slate-200">{item.user?.name || "Unnamed"}</div>
                <div className="text-xs text-slate-400">{item.user?.email}</div>
              </td>
              <td className="px-6 py-4">
                {item.institutionDept ? (
                  <span className="rounded bg-slate-800 px-2 py-1 text-xs font-mono text-cyan-400">
                    {item.institutionDept.name}
                  </span>
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </td>
              <td className="px-6 py-4 text-slate-300">{item.designation || "—"}</td>
              <td className="px-6 py-4">
                <FacultyStatusBadge status={item.verificationStatus} accountStatus={item.user?.accountStatus} />
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end space-x-2">
                  {item.verificationStatus === "PENDING" && (
                    <>
                      {onApprove && (
                        <button
                          onClick={() => onApprove(item.id)}
                          className="rounded-md bg-emerald-600/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-600/30 transition"
                        >
                          Approve
                        </button>
                      )}
                      {onReject && (
                        <button
                          onClick={() => onReject(item.id)}
                          className="rounded-md bg-rose-600/20 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-600/30 transition"
                        >
                          Reject
                        </button>
                      )}
                    </>
                  )}

                  {item.verificationStatus === "APPROVED" && (
                    <>
                      {item.user?.accountStatus === "SUSPENDED" ? (
                        onReactivate && (
                          <button
                            onClick={() => onReactivate(item.id)}
                            className="rounded-md bg-cyan-600/20 px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-600/30 transition"
                          >
                            Reactivate
                          </button>
                        )
                      ) : (
                        onSuspend && (
                          <button
                            onClick={() => onSuspend(item.id)}
                            className="rounded-md bg-amber-600/20 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-600/30 transition"
                          >
                            Suspend
                          </button>
                        )
                      )}
                      {onRemove && (
                        <button
                          onClick={() => onRemove(item.id)}
                          className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-700 hover:text-red-400 transition"
                        >
                          Remove
                        </button>
                      )}
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
