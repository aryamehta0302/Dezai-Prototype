"use client";

import React, { useState } from 'react';
import { Credential, VerifyStatus } from '../types/credential.types';
import { CredentialService } from '../services/credential.service';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Loader2, AlertCircle, History, ChevronDown } from 'lucide-react';
import { RevocationModal } from './RevocationModal';
import { CredentialAuditPanel } from './CredentialAuditPanel';
import { cn } from '@/shared/utils/cn';

interface Props {
    credentials: Credential[];
    onStatusChange: () => void;
}

interface PendingAction {
    id: string;
    status: VerifyStatus;
    code: string;
    studentName: string;
}

export function FacultyCredentialTable({ credentials, onStatusChange }: Props) {
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

    const handleRequestAction = (cred: Credential, newStatus: VerifyStatus) => {
        setPendingAction({
            id: cred.id,
            status: newStatus,
            code: cred.verificationCode,
            studentName: cred.user?.name || 'Unknown Student',
        });
    };

    const handleConfirmAction = async (reason: string) => {
        if (!pendingAction) return;
        const { id, status } = pendingAction;
        setPendingAction(null);
        setUpdatingId(id);
        try {
            await CredentialService.updateCredentialStatus(id, status, reason);
            onStatusChange();
        } catch (error) {
            console.error('Failed to update status', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleAudit = (id: string) => {
        setExpandedAuditId(prev => prev === id ? null : id);
    };

    if (credentials.length === 0) {
        return (
            <div className="p-12 text-center text-muted">
                <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>No credentials match the search and filter criteria.</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted uppercase bg-muted/20 border-b border-border-light">
                        <tr>
                            <th className="px-6 py-4 font-medium">Student</th>
                            <th className="px-6 py-4 font-medium">Program</th>
                            <th className="px-6 py-4 font-medium">Tier</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Issued</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-light">
                        {credentials.map((cred) => (
                            <React.Fragment key={cred.id}>
                                <tr className={cn(
                                    'hover:bg-muted/5 transition-colors',
                                    expandedAuditId === cred.id && 'bg-primary/5'
                                )}>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-on-surface">{cred.user?.name || 'Unknown Student'}</div>
                                        <div className="text-xs text-muted font-mono">{cred.user?.email || cred.userId}</div>
                                        <div className="text-[10px] text-primary font-mono mt-1 bg-primary/5 px-2 py-0.5 rounded border border-primary/10 inline-block">
                                            {cred.verificationCode}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-on-surface">{cred.program?.title || cred.programId}</div>
                                        <div className="text-[10px] text-muted font-mono mt-0.5">ID: {cred.programId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                            {cred.tier}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <Badge
                                                variant={cred.verificationStatus === 'ACTIVE' ? 'default' : cred.verificationStatus === 'SUSPENDED' ? 'secondary' : 'destructive'}
                                                className="text-[10px] tracking-wider"
                                            >
                                                {cred.verificationStatus}
                                            </Badge>
                                            {cred.metadata && (() => {
                                                try {
                                                    const meta = JSON.parse(cred.metadata);
                                                    if (meta.statusReason) {
                                                        return (
                                                            <div className="text-[10px] text-red-500 font-medium max-w-[200px] truncate" title={meta.statusReason}>
                                                                Reason: {meta.statusReason}
                                                            </div>
                                                        );
                                                    }
                                                } catch (e) {}
                                                return null;
                                            })()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-on-surface font-medium">
                                            {new Date(cred.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="text-[10px] text-muted">
                                            {new Date(cred.issuedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {updatingId === cred.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-muted" />
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleAudit(cred.id)}
                                                        className={cn(
                                                            'h-7 text-xs gap-1',
                                                            expandedAuditId === cred.id && 'bg-primary/10 text-primary'
                                                        )}
                                                        title="View audit history"
                                                    >
                                                        <History className="h-3.5 w-3.5" />
                                                        <ChevronDown className={cn('h-3 w-3 transition-transform', expandedAuditId === cred.id && 'rotate-180')} />
                                                    </Button>
                                                    {cred.verificationStatus !== 'ACTIVE' && (
                                                        <Button variant="outline" size="sm" onClick={() => handleRequestAction(cred, 'ACTIVE')} className="h-7 text-xs">
                                                            Reissue
                                                        </Button>
                                                    )}
                                                    {cred.verificationStatus === 'ACTIVE' && (
                                                        <Button variant="outline" size="sm" onClick={() => handleRequestAction(cred, 'SUSPENDED')} className="h-7 text-xs">
                                                            Suspend
                                                        </Button>
                                                    )}
                                                    {cred.verificationStatus !== 'REVOKED' && (
                                                        <Button variant="destructive" size="sm" onClick={() => handleRequestAction(cred, 'REVOKED')} className="h-7 text-xs">
                                                            Revoke
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                                {expandedAuditId === cred.id && (
                                    <CredentialAuditPanel
                                        credentialId={cred.id}
                                        onClose={() => setExpandedAuditId(null)}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {pendingAction && (
                <RevocationModal
                    credentialCode={pendingAction.code}
                    studentName={pendingAction.studentName}
                    newStatus={pendingAction.status}
                    onConfirm={handleConfirmAction}
                    onCancel={() => setPendingAction(null)}
                />
            )}
        </>
    );
}
