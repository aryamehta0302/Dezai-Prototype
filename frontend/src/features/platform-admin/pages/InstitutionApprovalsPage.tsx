"use client";

import React, { useEffect, useState } from "react";
import { platformAdminService } from "../services/platform-admin.service";
import { PlatformInstitution } from "../types/platform-admin.types";

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

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">University Management & Approvals</h1>
        <p className="text-sm text-slate-400">Review pending university registrations, approve onboarding, or suspend access</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-md">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-6 py-4">University Name</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {institutions.map((inst) => (
              <tr key={inst.id} className="transition-colors hover:bg-slate-800/30">
                <td className="px-6 py-4 font-medium text-slate-200">{inst.name}</td>
                <td className="px-6 py-4 text-slate-400">
                  {[inst.city, inst.state, inst.country].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                    inst.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    inst.status === "SUSPENDED" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    inst.status === "PENDING" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  }`}>
                    {inst.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    {inst.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleApprove(inst.id)}
                          className="rounded-md bg-emerald-600/20 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-600/30 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(inst.id)}
                          className="rounded-md bg-rose-600/20 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-600/30 transition"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {inst.status === "APPROVED" && (
                      <button
                        onClick={() => handleSuspend(inst.id)}
                        className="rounded-md bg-amber-600/20 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-600/30 transition"
                      >
                        Suspend
                      </button>
                    )}

                    {inst.status === "SUSPENDED" && (
                      <button
                        onClick={() => handleReactivate(inst.id)}
                        className="rounded-md bg-cyan-600/20 px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-600/30 transition"
                      >
                        Reactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
