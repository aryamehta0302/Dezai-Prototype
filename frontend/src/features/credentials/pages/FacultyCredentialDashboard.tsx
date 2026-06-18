"use client";

import React, { useState, useEffect } from 'react';
import { useCredentialContext } from '../context/CredentialContext';
import { FacultyCredentialTable } from '../components/FacultyCredentialTable';
import { IssueCredentialModal } from '../components/IssueCredentialModal';
import { VerificationLookup } from '../components/VerificationLookup';
import { ShieldCheck, Loader2, Plus, Users, Ban, AlertOctagon, Search } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export function FacultyCredentialDashboard() {
    const { credentials, isLoading: loading, fetchAllCredentials } = useCredentialContext();
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchAllCredentials();
    }, []);

    const handleIssueSuccess = () => {
        setIsIssueModalOpen(false);
        // Note: issueCredential in Context automatically updates the state, 
        // but we can re-fetch just to be safe.
        fetchAllCredentials();
    };

    const activeCount = credentials.filter(c => c.verificationStatus === 'ACTIVE').length;
    const suspendedCount = credentials.filter(c => c.verificationStatus === 'SUSPENDED').length;
    const revokedCount = credentials.filter(c => c.verificationStatus === 'REVOKED').length;

    const filteredCredentials = credentials.filter(c => 
        c.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.verificationCode.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Premium Header Segment */}
            <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 to-slate-800 p-8 sm:p-10 text-white shadow-level-1 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-700">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                
                <div className="relative z-10 flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                        <ShieldCheck className="h-8 w-8 text-emerald-400 drop-shadow-md" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">Faculty Command Center</h1>
                        <p className="text-slate-400 text-sm">Issue, Suspend, and Revoke digital credentials.</p>
                    </div>
                </div>

                <div className="relative z-10 shrink-0">
                    <Button onClick={() => setIsIssueModalOpen(true)} className="h-12 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20">
                        <Plus className="h-5 w-5 mr-2" />
                        Grant New Credential
                    </Button>
                </div>
            </div>

            {/* Live Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-light flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Users className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">Total Active</p>
                        <p className="text-2xl font-bold text-on-surface">{activeCount}</p>
                    </div>
                </div>
                
                <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-light flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <Ban className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">Suspended</p>
                        <p className="text-2xl font-bold text-on-surface">{suspendedCount}</p>
                    </div>
                </div>

                <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-light flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <AlertOctagon className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">Revoked</p>
                        <p className="text-2xl font-bold text-on-surface">{revokedCount}</p>
                    </div>
                </div>
            </div>

            {/* Verification Lookup Tool Section */}
            <div className="py-4">
                <VerificationLookup isFaculty={true} />
            </div>

            {/* Table Area */}
            <div className="bg-surface rounded-3xl shadow-level-1 overflow-hidden border border-border-light">
                <div className="p-6 border-b border-border-light flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-50/50">
                    <h2 className="text-lg font-bold text-on-surface">Credential Registry</h2>
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <input 
                            type="text" 
                            placeholder="Search by User ID or Code..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border-light bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-32">
                        <Loader2 className="animate-spin text-primary h-10 w-10" />
                    </div>
                ) : (
                    <FacultyCredentialTable 
                        credentials={filteredCredentials} 
                        onStatusChange={fetchAllCredentials}
                    />
                )}
            </div>

            {isIssueModalOpen && (
                <IssueCredentialModal 
                    onClose={() => setIsIssueModalOpen(false)} 
                    onSuccess={handleIssueSuccess}
                />
            )}
        </div>
    );
}
