"use client";

import React, { useState, useCallback } from 'react';
import { CredentialService } from '../services/credential.service';
import type { Credential, SearchResult, VerifyStatus } from '../types/credential.types';
import { CredentialStatsPage } from './CredentialStatsPage';
import { CredentialActivityFeed } from '../components/CredentialActivityFeed';
import { FacultyCredentialTable } from '../components/FacultyCredentialTable';
import { IssueCredentialModal } from '../components/IssueCredentialModal';
import { VerificationLookup } from '../components/VerificationLookup';
import {
    ShieldCheck, Loader2, Plus, Users, Ban, AlertOctagon,
    Search, TrendingUp, Award, Globe, Activity, CheckSquare, X
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utils/cn';

export function AdminCredentialDashboard() {
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'registry' | 'analytics' | 'activity'>('registry');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [batchLoading, setBatchLoading] = useState(false);
    const [showBatchActions, setShowBatchActions] = useState(false);

    const fetchSearch = useCallback(async () => {
        setLoading(true);
        try {
            const result = await CredentialService.search({
                query: searchQuery || undefined,
                status: statusFilter !== 'ALL' ? statusFilter as any : undefined,
                limit: 200,
            });
            setSearchResult(result);
        } catch (e) {
            console.error('Search failed', e);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter]);

    React.useEffect(() => {
        fetchSearch();
    }, [fetchSearch]);

    const handleStatusChange = () => {
        fetchSearch();
        setSelectedIds(new Set());
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (!searchResult) return;
        if (selectedIds.size === searchResult.data.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(searchResult.data.map(c => c.id)));
        }
    };

    const handleBatchStatus = async (status: VerifyStatus) => {
        if (selectedIds.size === 0) return;
        const reason = status !== 'ACTIVE'
            ? window.prompt(`Enter reason for batch ${status.toLowerCase()}:`) || 'Batch operation'
            : 'Batch reactivation';
        if (!reason.trim()) return;

        setBatchLoading(true);
        try {
            await CredentialService.batchStatusUpdate(Array.from(selectedIds), status, reason);
            setSelectedIds(new Set());
            fetchSearch();
        } catch (e) {
            alert('Failed to update batch');
        } finally {
            setBatchLoading(false);
        }
    };

    const credentials = searchResult?.data || [];
    const totalCount = searchResult?.total || 0;
    const activeCount = credentials.filter(c => c.verificationStatus === 'ACTIVE').length;
    const suspendedCount = credentials.filter(c => c.verificationStatus === 'SUSPENDED').length;
    const revokedCount = credentials.filter(c => c.verificationStatus === 'REVOKED').length;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 sm:p-10 text-white shadow-level-1 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-700">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="relative z-10 flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                        <Globe className="h-8 w-8 text-sky-400 drop-shadow-md" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">Dezai Admin Console</h1>
                        <p className="text-slate-400 text-sm">Full platform-wide credential oversight and system control.</p>
                    </div>
                </div>
                <div className="relative z-10 shrink-0 flex gap-3">
                    <Button onClick={() => setIsIssueModalOpen(true)} className="h-12 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-lg shadow-emerald-500/20">
                        <Plus className="h-5 w-5 mr-2" />
                        Issue Credential
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={Award} label="Total" value={totalCount} color="slate" />
                <StatCard icon={Users} label="Active" value={activeCount} color="emerald" />
                <StatCard icon={Ban} label="Suspended" value={suspendedCount} color="amber" />
                <StatCard icon={AlertOctagon} label="Revoked" value={revokedCount} color="red" />
            </div>

            <div className="flex gap-1 bg-muted/10 rounded-xl p-1 border border-border-light w-fit">
                {(['registry', 'analytics', 'activity'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize ${
                            activeTab === tab
                                ? 'bg-white text-on-surface shadow-sm border border-border-light'
                                : 'text-muted hover:text-on-surface'
                        }`}
                    >
                        {tab === 'registry' && <Search className="h-4 w-4 inline mr-1.5" />}
                        {tab === 'analytics' && <TrendingUp className="h-4 w-4 inline mr-1.5" />}
                        {tab === 'activity' && <Activity className="h-4 w-4 inline mr-1.5" />}
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'registry' && (
                <>
                    <div className="bg-surface rounded-3xl shadow-level-1 overflow-hidden border border-border-light">
                        <div className="p-6 border-b border-border-light space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                <div className="relative w-full sm:w-96">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Search across all institutions..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border-light bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="px-3 py-2 text-sm rounded-xl border border-border-light bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                    >
                                        <option value="ALL">All Statuses</option>
                                        <option value="ACTIVE">Active</option>
                                        <option value="SUSPENDED">Suspended</option>
                                        <option value="REVOKED">Revoked</option>
                                    </select>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowBatchActions(!showBatchActions)}
                                        className={cn(
                                            'gap-1.5',
                                            showBatchActions && 'bg-primary/10 border-primary/30 text-primary'
                                        )}
                                    >
                                        <CheckSquare className="h-4 w-4" />
                                        Batch
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {showBatchActions && (
                            <div className="px-6 py-3 bg-slate-50 border-b border-border-light flex items-center gap-3 flex-wrap">
                                <span className="text-xs font-medium text-muted">
                                    {selectedIds.size} selected
                                </span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={toggleSelectAll}
                                    className="text-xs h-8"
                                >
                                    {selectedIds.size === credentials.length ? 'Deselect All' : 'Select All'}
                                </Button>
                                {selectedIds.size > 0 && (
                                    <>
                                        <div className="h-5 w-px bg-border-light" />
                                        <Button
                                            size="sm"
                                            onClick={() => handleBatchStatus('ACTIVE')}
                                            disabled={batchLoading}
                                            className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                                        >
                                            <ShieldCheck className="h-3 w-3 mr-1" />
                                            Reactivate All
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleBatchStatus('SUSPENDED')}
                                            disabled={batchLoading}
                                            className="text-xs h-8 bg-amber-500 hover:bg-amber-600 text-white border-0"
                                        >
                                            <Ban className="h-3 w-3 mr-1" />
                                            Suspend All
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleBatchStatus('REVOKED')}
                                            disabled={batchLoading}
                                            className="text-xs h-8 bg-red-600 hover:bg-red-700 text-white border-0"
                                        >
                                            <AlertOctagon className="h-3 w-3 mr-1" />
                                            Revoke All
                                        </Button>
                                        {batchLoading && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
                                    </>
                                )}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center py-32">
                                <Loader2 className="animate-spin text-primary h-10 w-10" />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-muted uppercase bg-muted/20 border-b border-border-light">
                                        <tr>
                                            {showBatchActions && (
                                                <th className="px-4 py-4 w-10">
                                                    <input
                                                        type="checkbox"
                                                        checked={credentials.length > 0 && selectedIds.size === credentials.length}
                                                        onChange={toggleSelectAll}
                                                        className="rounded border-border-light"
                                                    />
                                                </th>
                                            )}
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
                                            <tr key={cred.id} className={cn(
                                                'hover:bg-muted/5 transition-colors',
                                                selectedIds.has(cred.id) && 'bg-primary/5'
                                            )}>
                                                {showBatchActions && (
                                                    <td className="px-4 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.has(cred.id)}
                                                            onChange={() => toggleSelect(cred.id)}
                                                            className="rounded border-border-light"
                                                        />
                                                    </td>
                                                )}
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-on-surface">{cred.user?.name || cred.userId}</div>
                                                    <div className="text-xs text-muted font-mono">{cred.user?.email || ''}</div>
                                                    <div className="text-[10px] text-primary font-mono mt-1 bg-primary/5 px-2 py-0.5 rounded border border-primary/10 inline-block">
                                                        {cred.verificationCode}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-on-surface">{cred.program?.title || cred.programId}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                                                        {cred.tier}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        'text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full',
                                                        cred.verificationStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                                                        cred.verificationStatus === 'SUSPENDED' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                    )}>
                                                        {cred.verificationStatus}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-on-surface">
                                                    {new Date(cred.issuedAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                                                            View
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}

            {activeTab === 'analytics' && <CredentialStatsPage />}

            {activeTab === 'activity' && (
                <div className="bg-surface rounded-3xl p-6 shadow-level-1 border border-border-light">
                    <CredentialActivityFeed limit={100} />
                </div>
            )}

            {isIssueModalOpen && (
                <IssueCredentialModal
                    onClose={() => setIsIssueModalOpen(false)}
                    onSuccess={() => { setIsIssueModalOpen(false); fetchSearch(); }}
                />
            )}
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.FC<{ className?: string }>; label: string; value: number; color: string }) {
    const colorMap: Record<string, { bg: string; text: string }> = {
        slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
        emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
        amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
        red: { bg: 'bg-red-100', text: 'text-red-600' },
    };
    const c = colorMap[color] || colorMap.slate;
    return (
        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border-light flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={`h-11 w-11 rounded-full ${c.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`h-5 w-5 ${c.text}`} />
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
                <p className="text-2xl font-bold text-on-surface">{value}</p>
            </div>
        </div>
    );
}
