"use client";

import React, { useState } from 'react';
import { CredentialService } from '../services/credential.service';
import { Credential, VerifyStatus } from '../types/credential.types';
import { Button } from '@/shared/ui/button';
import { Search, Loader2, ShieldAlert, ShieldCheck, AlertOctagon, Ban, ExternalLink, Building2 } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/utils/cn';
import { getCourseGradient } from '@/shared/utils/thumbnail';

interface Props {
    isFaculty: boolean; // STRICT RBAC: Only Faculty can see edit controls
}

export function VerificationLookup({ isFaculty }: Props) {
    const [searchCode, setSearchCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [result, setResult] = useState<{ valid: boolean; data?: Credential; message?: string } | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchCode.trim()) return;
        
        setLoading(true);
        setResult(null);
        try {
            // Future: Use Context API or direct fetch
            const res = await CredentialService.verify(searchCode);
            setResult(res);
        } catch (error) {
            setResult({ valid: false, message: 'Server error while verifying credential.' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: VerifyStatus) => {
        if (!result?.data?.id || !isFaculty) return;
        
        const confirmMsg = `Are you absolutely sure you want to ${newStatus} this credential? This action is logged.`;
        if (!window.confirm(confirmMsg)) return;

        setActionLoading(true);
        try {
            const updated = await CredentialService.updateCredentialStatus(result.data.id, newStatus);
            setResult({ valid: newStatus === 'ACTIVE', data: updated, message: `Credential has been ${newStatus}.` });
            alert(`Successfully marked as ${newStatus}`);
        } catch (error) {
            alert("Failed to update status");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6">
            
            {/* Lookup Form */}
            <div className="bg-white rounded-3xl p-6 shadow-level-1 border border-border-light relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-linear-to-b from-emerald-500 to-teal-600" />
                
                <h3 className="text-xl font-bold text-on-surface mb-2 flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2 text-emerald-600" />
                    Lookup Verification Code
                </h3>
                <p className="text-sm text-muted mb-6">
                    Enter a secure verification ID. Faculty members have elevated access to revoke or suspend fraudulent credentials.
                </p>

                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                        <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono uppercase"
                            placeholder="e.g. A1B2C3D4E5F6"
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                        />
                    </div>
                    <Button type="submit" disabled={loading || !searchCode} className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-md">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify'}
                    </Button>
                </form>
            </div>

            {/* Results Area */}
            {result && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {!result.valid && !result.data ? (
                        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center">
                            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                <ShieldAlert className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-red-900 mb-2">Verification Failed</h3>
                            <p className="text-red-700">{result.message}</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl shadow-level-2 border border-border-light overflow-hidden">
                            {/* Header Gradient */}
                            <div className={cn("h-32 relative", getCourseGradient(result.data!.id))}>
                                <div className="absolute inset-0 bg-black/20" />
                                <div className="absolute -bottom-10 left-8">
                                    <div className="h-20 w-20 bg-white rounded-2xl shadow-xl flex items-center justify-center p-2 border-4 border-white">
                                        {result.data!.institution?.logoUrl ? (
                                            <img src={result.data!.institution.logoUrl} className="w-full h-full object-contain" alt="Logo" />
                                        ) : (
                                            <Building2 className="h-8 w-8 text-slate-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-14 p-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold text-on-surface">
                                                {result.data!.template?.name || result.data!.program?.title}
                                            </h2>
                                            <Badge variant={result.data!.verificationStatus === 'ACTIVE' ? 'default' : 'destructive'} className="uppercase">
                                                {result.data!.verificationStatus}
                                            </Badge>
                                        </div>
                                        <p className="text-muted">Issued to <strong className="text-on-surface">{result.data!.user?.name || result.data!.userId}</strong> on {new Date(result.data!.issuedAt).toLocaleDateString()}</p>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-3 rounded-xl border border-border-light text-center min-w-[120px]">
                                        <p className="text-[10px] uppercase font-bold text-muted mb-1">Security Tier</p>
                                        <p className="text-sm font-black text-slate-800">{result.data!.tier}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 rounded-xl bg-neutral-50 border border-border-light">
                                        <p className="text-[10px] uppercase font-bold text-muted mb-1">Credential ID</p>
                                        <p className="text-sm font-mono text-on-surface">{result.data!.verificationCode}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-neutral-50 border border-border-light">
                                        <p className="text-[10px] uppercase font-bold text-muted mb-1">Institution</p>
                                        <p className="text-sm font-medium text-on-surface">{result.data!.institution?.name}</p>
                                    </div>
                                </div>

                                {/* FACULTY RESTRICTED AREA */}
                                {isFaculty && (
                                    <div className="mt-8 pt-8 border-t border-dashed border-border-light">
                                        <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
                                            
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center mb-4">
                                                <AlertOctagon className="h-4 w-4 mr-2 text-amber-500" />
                                                Restricted Faculty Actions
                                            </h4>
                                            
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <Button 
                                                    onClick={() => handleStatusChange('ACTIVE')}
                                                    disabled={actionLoading || result.data!.verificationStatus === 'ACTIVE'}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md border-0 h-11"
                                                >
                                                    <ShieldCheck className="h-4 w-4 mr-2" /> Mark Active
                                                </Button>
                                                
                                                <Button 
                                                    onClick={() => handleStatusChange('SUSPENDED')}
                                                    disabled={actionLoading || result.data!.verificationStatus === 'SUSPENDED'}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-md border-0 h-11"
                                                >
                                                    <Ban className="h-4 w-4 mr-2" /> Suspend
                                                </Button>
                                                
                                                <Button 
                                                    onClick={() => handleStatusChange('REVOKED')}
                                                    disabled={actionLoading || result.data!.verificationStatus === 'REVOKED'}
                                                    variant="destructive"
                                                    className="rounded-xl shadow-md border-0 h-11"
                                                >
                                                    <AlertOctagon className="h-4 w-4 mr-2" /> Revoke
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
