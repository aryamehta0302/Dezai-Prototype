"use client";

import React from "react";
import { UserCheck, ShieldAlert, UserX, RotateCcw, X, Check, Users } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";
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
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (facultyList.length === 0) {
    return (
      <div className="flex h-48 w-full flex-col items-center justify-center rounded-xl border border-border-light bg-surface text-muted">
        <Users className="h-8 w-8 mb-2" />
        <p className="text-sm font-medium">No faculty members found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border-light bg-surface">
      <table className="w-full text-left text-sm text-on-surface">
        <thead className="border-b border-border-light bg-surface-low text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="px-6 py-4">Faculty Member</th>
            <th className="px-6 py-4">Department</th>
            <th className="px-6 py-4">Designation</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {facultyList.map((item) => (
            <tr key={item.id} className="transition-colors hover:bg-surface-low">
              <td className="px-6 py-4">
                <div className="font-medium text-on-surface">{item.user?.name || "Unnamed"}</div>
                <div className="text-xs text-muted">{item.user?.email}</div>
              </td>
              <td className="px-6 py-4">
                {item.institutionDept ? (
                  <Badge variant="secondary">{item.institutionDept.name}</Badge>
                ) : (
                  <span className="text-muted">&mdash;</span>
                )}
              </td>
              <td className="px-6 py-4 text-on-surface">{item.designation || "\u2014"}</td>
              <td className="px-6 py-4">
                <FacultyStatusBadge status={item.verificationStatus} accountStatus={item.user?.accountStatus} />
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end space-x-2">
                  {item.verificationStatus === "PENDING" && (
                    <>
                      {onApprove && (
                        <Button onClick={() => onApprove(item.id)} variant="outline" size="sm">
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      )}
                      {onReject && (
                        <Button onClick={() => onReject(item.id)} variant="outline" size="sm">
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      )}
                    </>
                  )}

                  {item.verificationStatus === "APPROVED" && (
                    <>
                      {item.user?.accountStatus === "SUSPENDED" ? (
                        onReactivate && (
                          <Button onClick={() => onReactivate(item.id)} variant="outline" size="sm">
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Reactivate
                          </Button>
                        )
                      ) : (
                        onSuspend && (
                          <Button onClick={() => onSuspend(item.id)} variant="outline" size="sm">
                            <ShieldAlert className="h-3 w-3 mr-1" />
                            Suspend
                          </Button>
                        )
                      )}
                      {onRemove && (
                        <Button onClick={() => onRemove(item.id)} variant="outline" size="sm">
                          <UserX className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
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
