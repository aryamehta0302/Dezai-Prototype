"use client";

import React, { useState } from 'react';
import { Credential, VerifyStatus } from '../types/credential.types';
import { CredentialService } from '../services/credential.service';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { MoreHorizontal, Loader2, AlertCircle } from 'lucide-react';

interface Props {
    credentials: Credential[];
    onStatusChange: () => void;
}

export function FacultyCredentialTable({ credentials, onStatusChange }: Props) {
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const handleUpdateStatus = async (id: string, newStatus: VerifyStatus) => {
        setUpdatingId(id);
        try {
            await CredentialService.updateCredentialStatus(id, newStatus);
            onStatusChange();
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    if (credentials.length === 0) {
        return (
            <div className="p-12 text-center text-muted">
                <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p>No credentials have been issued yet.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted uppercase bg-muted/20 border-b border-border-light">
                    <tr>
                        <th className="px-6 py-4 font-medium">Student / User ID</th>
                        <th className="px-6 py-4 font-medium">Program ID</th>
                        <th className="px-6 py-4 font-medium">Tier</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border-light">
                    {credentials.map((cred) => (
                        <tr key={cred.id} className="hover:bg-muted/5 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-medium text-on-surface">{cred.userId}</div>
                                <div className="text-xs text-muted font-mono mt-0.5">{cred.verificationCode}</div>
                            </td>
                            <td className="px-6 py-4 text-on-surface-variant">{cred.programId}</td>
                            <td className="px-6 py-4">
                                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                    {cred.tier}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <Badge variant={cred.verificationStatus === 'ACTIVE' ? 'default' : cred.verificationStatus === 'SUSPENDED' ? 'secondary' : 'destructive'} className="text-[10px] tracking-wider">
                                    {cred.verificationStatus}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                                {updatingId === cred.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin inline-block text-muted" />
                                ) : (
                                    <>
                                        {cred.verificationStatus !== 'ACTIVE' && (
                                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(cred.id, 'ACTIVE')} className="h-7 text-xs">
                                                Reissue
                                            </Button>
                                        )}
                                        {cred.verificationStatus === 'ACTIVE' && (
                                            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(cred.id, 'SUSPENDED')} className="h-7 text-xs">
                                                Suspend
                                            </Button>
                                        )}
                                        {cred.verificationStatus !== 'REVOKED' && (
                                            <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(cred.id, 'REVOKED')} className="h-7 text-xs">
                                                Revoke
                                            </Button>
                                        )}
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
