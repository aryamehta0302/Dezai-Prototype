"use client";

import React, { useEffect, useState } from 'react';
import { CredentialService } from '../services/credential.service';
import { Loader2, ShieldCheck, ShieldAlert, Ban, Clock, User, FileText, ChevronUp } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface AuditEntry {
  status: string;
  changedBy: string;
  reason: string;
  date: string;
}

interface AuditData {
  credentialId: string;
  verificationCode: string;
  currentStatus: string;
  issuedAt: string;
  statusHistory: AuditEntry[];
  statusReason: string | null;
}

interface Props {
  credentialId: string;
  onClose: () => void;
}

function StatusIcon({ status }: { status: string }) {
  if (status === 'ACTIVE') return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
  if (status === 'REVOKED') return <ShieldAlert className="h-4 w-4 text-red-500" />;
  return <Ban className="h-4 w-4 text-amber-500" />;
}

function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase',
      status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
      status === 'REVOKED' ? 'bg-red-100 text-red-700' :
      'bg-amber-100 text-amber-700'
    )}>
      <StatusIcon status={status} />
      {status}
    </span>
  );
}

export function CredentialAuditPanel({ credentialId, onClose }: Props) {
  const [data, setData] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    CredentialService.getAuditHistory(credentialId)
      .then(setData)
      .catch(() => setError('Failed to load audit history'))
      .finally(() => setLoading(false));
  }, [credentialId]);

  return (
    <tr>
      <td colSpan={6} className="px-0 py-0">
        <div className="border-t border-border-light bg-neutral-50/70 px-6 py-5 space-y-4">
          {/* Panel header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-on-surface">Audit History</span>
              {data && (
                <span className="text-xs text-muted font-mono bg-primary/5 border border-primary/10 px-2 py-0.5 rounded">
                  {data.verificationCode}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-xs text-muted hover:text-on-surface transition-colors"
            >
              <ChevronUp className="h-4 w-4" />
              Collapse
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center py-4">{error}</p>
          )}

          {data && !loading && (
            <>
              {/* Issuance entry */}
              <div className="relative pl-8">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-border-light" />
                <div className="space-y-3">
                  {/* Origin event */}
                  <div className="relative">
                    <div className="absolute -left-5 top-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white shadow" />
                    <div className="rounded-xl border border-border-light bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <StatusPill status="ACTIVE" />
                          <span className="text-xs font-medium text-on-surface">Credential Issued</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted">
                          <Clock className="h-3 w-3" />
                          {new Date(data.issuedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status change events */}
                  {data.statusHistory.length === 0 ? (
                    <div className="relative">
                      <div className="absolute -left-5 top-1 h-2.5 w-2.5 rounded-full bg-border-light border-2 border-white shadow" />
                      <p className="text-xs text-muted py-2 pl-2">No status changes recorded.</p>
                    </div>
                  ) : (
                    data.statusHistory.map((entry, idx) => (
                      <div key={idx} className="relative">
                        <div className={cn(
                          'absolute -left-5 top-1 h-2.5 w-2.5 rounded-full border-2 border-white shadow',
                          entry.status === 'ACTIVE' ? 'bg-emerald-500' :
                          entry.status === 'REVOKED' ? 'bg-red-500' : 'bg-amber-500'
                        )} />
                        <div className="rounded-xl border border-border-light bg-white p-3 shadow-sm space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <StatusPill status={entry.status} />
                            <div className="flex items-center gap-1 text-[10px] text-muted">
                              <Clock className="h-3 w-3" />
                              {new Date(entry.date).toLocaleString()}
                            </div>
                          </div>
                          {entry.reason && (
                            <p className="text-xs text-on-surface-variant bg-neutral-50 rounded-lg px-3 py-2 border border-border-light">
                              "{entry.reason}"
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-muted">
                            <User className="h-3 w-3" />
                            Changed by: <span className="font-medium text-on-surface">{entry.changedBy}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
