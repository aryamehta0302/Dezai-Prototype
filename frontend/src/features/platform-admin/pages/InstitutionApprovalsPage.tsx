"use client";

import React, { useEffect, useState } from "react";
import { Building2, Check, X, Ban, RotateCcw } from "lucide-react";
import { PageContainer } from "@/shared/components/page-container";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/skeleton";
import { platformAdminService } from "../services/platform-admin.service";
import { PlatformInstitution } from "../types/platform-admin.types";

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case "APPROVED": return "default" as const;
    case "SUSPENDED": return "destructive" as const;
    case "PENDING": return "secondary" as const;
    default: return "outline" as const;
  }
};

export const InstitutionApprovalsPage: React.FC = () => {
  const [institutions, setInstitutions] = useState<PlatformInstitution[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInstitutions = () => {
    setLoading(true);
    platformAdminService
      .getAllInstitutions()
      .then((data) => {
        setInstitutions(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  const handleApprove = async (id: string) => {
    await platformAdminService.approveInstitution(id);
    loadInstitutions();
  };

  const handleReject = async (id: string) => {
    await platformAdminService.rejectInstitution(id);
    loadInstitutions();
  };

  const handleSuspend = async (id: string) => {
    if (confirm("Suspending this institution will block access for all its faculty and students without deleting any data. Proceed?")) {
      await platformAdminService.suspendInstitution(id);
      loadInstitutions();
    }
  };

  const handleReactivate = async (id: string) => {
    await platformAdminService.reactivateInstitution(id);
    loadInstitutions();
  };

  if (loading) {
    return (
      <PageContainer className="py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">University Management & Approvals</h1>
        <p className="text-sm text-muted">Review pending university registrations, approve onboarding, or suspend access</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-light bg-surface">
        <table className="w-full text-left text-sm text-on-surface">
          <thead className="border-b border-border-light bg-surface-low text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-6 py-4">University Name</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {institutions.map((inst) => (
              <tr key={inst.id} className="transition-colors hover:bg-surface-low">
                <td className="px-6 py-4 font-medium text-on-surface">{inst.name}</td>
                <td className="px-6 py-4 text-muted">
                  {[inst.city, inst.state, inst.country].filter(Boolean).join(", ") || "\u2014"}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={statusBadgeVariant(inst.status)}>{inst.status}</Badge>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    {inst.status === "PENDING" && (
                      <>
                        <Button onClick={() => handleApprove(inst.id)} variant="outline" size="sm">
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button onClick={() => handleReject(inst.id)} variant="outline" size="sm">
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {inst.status === "APPROVED" && (
                      <Button onClick={() => handleSuspend(inst.id)} variant="outline" size="sm">
                        <Ban className="h-3 w-3 mr-1" />
                        Suspend
                      </Button>
                    )}

                    {inst.status === "SUSPENDED" && (
                      <Button onClick={() => handleReactivate(inst.id)} variant="outline" size="sm">
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reactivate
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
};
