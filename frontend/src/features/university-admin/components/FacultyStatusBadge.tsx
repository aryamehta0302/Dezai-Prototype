"use client";

import React from "react";

interface FacultyStatusBadgeProps {
  status: string;
  accountStatus?: string;
}

export const FacultyStatusBadge: React.FC<FacultyStatusBadgeProps> = ({ status, accountStatus }) => {
  if (accountStatus === "SUSPENDED") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">
        Suspended
      </span>
    );
  }

  switch (status) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
          Active
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20">
          Pending Approval
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-400 border border-rose-500/20">
          Rejected
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-medium text-slate-400 border border-slate-500/20">
          {status}
        </span>
      );
  }
};
