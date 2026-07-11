"use client";

import React, { useState, useEffect } from 'react';
import { EnterpriseCredentialService, EnterpriseCredential } from '../services/enterprise-credential.service';
import { Loader2, Search, Filter, ShieldCheck, ShieldAlert, Award, FileText, Ban, AlertCircle, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { useAuthStore } from '@/lib/stores/auth.store';

export function OrgCredentialDashboard() {
    const { user } = useAuthStore();
    const [credentials, setCredentials] = useState<EnterpriseCredential[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [analytics, setAnalytics] = useState<any>({ statusCounts: { ACTIVE: 0, REVOKED: 0, SUSPENDED: 0 }, trackStats: {} });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedTrack, setSelectedTrack] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal state for changing credential status
    const [selectedCredForAction, setSelectedCredForAction] = useState<EnterpriseCredential | null>(null);
    const [actionStatus, setActionStatus] = useState<'REVOKED' | 'SUSPENDED' | 'ACTIVE'>('ACTIVE');
    const [actionReason, setActionReason] = useState('');
    const [isSubmittingAction, setIsSubmittingAction] = useState(false);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // In a real project, we get organizationId scoped by user, or let backend resolve it.
            const stats = await EnterpriseCredentialService.getAnalytics();
            setAnalytics(stats);

            const searchRes = await EnterpriseCredentialService.search({
                query: searchQuery,
                status: selectedStatus,
                track: selectedTrack,
                page,
                limit: 10,
            });

            setCredentials(searchRes.data);
            setTotalCount(searchRes.total);
            setTotalPages(searchRes.totalPages);
        } catch (err) {
            console.error("Failed to load organization credentials", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, [searchQuery, selectedStatus, selectedTrack, page]);

    const formatTrack = (track: string) => {
        if (!track) return 'Compliance';
        return track.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    };

    const handleActionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCredForAction) return;

        setIsSubmittingAction(true);
        try {
            await EnterpriseCredentialService.updateCredentialStatus(selectedCredForAction.id, actionStatus, actionReason);
            setSelectedCredForAction(null);
            setActionReason('');
            fetchDashboardData();
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update status. Please try again.");
        } finally {
            setIsSubmittingAction(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Organization Compliance Credentials</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Manage, review, and audit employee compliance certifications for {user?.name || "Allianz Corp"}.
                </p>
            </div>

            {/* Analytics Widgets (Bento Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Award className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Active</p>
                        <p className="text-2xl font-extrabold text-slate-800">{analytics.statusCounts?.ACTIVE || 0}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Suspended</p>
                        <p className="text-2xl font-extrabold text-slate-800">{analytics.statusCounts?.SUSPENDED || 0}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                        <Ban className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Revoked</p>
                        <p className="text-2xl font-extrabold text-slate-800">{analytics.statusCounts?.REVOKED || 0}</p>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Compliance Score</p>
                        <p className="text-2xl font-extrabold text-slate-800">100%</p>
                    </div>
                </div>
            </div>

            {/* Filters panel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search employee or credential code..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all font-medium"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        value={selectedStatus}
                        onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
                        className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="REVOKED">Revoked</option>
                    </select>

                    <select
                        value={selectedTrack}
                        onChange={(e) => { setSelectedTrack(e.target.value); setPage(1); }}
                        className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                    >
                        <option value="">All Tracks</option>
                        <option value="CYBER_SECURITY">Cybersecurity Awareness</option>
                        <option value="DATA_PRIVACY">Data Privacy</option>
                        <option value="PASSWORD_SECURITY">Password Security</option>
                        <option value="SECURE_EMAIL">Secure Email</option>
                    </select>
                </div>
            </div>

            {/* Credentials Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider">
                                <th className="p-4">Employee</th>
                                <th className="p-4">Department / Title</th>
                                <th className="p-4">Compliance Track</th>
                                <th className="p-4">Verification Code</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center">
                                        <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto" />
                                    </td>
                                </tr>
                            ) : credentials.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-slate-400">
                                        No compliance records match your filters.
                                    </td>
                                </tr>
                            ) : (
                                credentials.map((cred) => (
                                    <tr key={cred.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{cred.employee?.user?.name}</p>
                                                <p className="text-slate-400 mt-0.5">{cred.employee?.user?.email}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="text-slate-800">{cred.employee?.department?.name || 'Unassigned'}</p>
                                                <p className="text-slate-400 mt-0.5">{cred.employee?.title || 'Associate'}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className="bg-indigo-50/50 text-indigo-700 border-none font-bold">
                                                {formatTrack(cred.complianceTrack)}
                                            </Badge>
                                        </td>
                                        <td className="p-4 font-mono font-bold text-slate-800">{cred.verificationCode}</td>
                                        <td className="p-4">
                                            <Badge
                                                variant={cred.verificationStatus === 'ACTIVE' ? 'default' : cred.verificationStatus === 'SUSPENDED' ? 'secondary' : 'destructive'}
                                                className={`uppercase font-bold tracking-wider text-[9px] ${cred.verificationStatus === 'ACTIVE' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}`}
                                            >
                                                {cred.verificationStatus}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="px-2.5 py-1 text-[10px] font-bold border-slate-200 hover:bg-slate-50"
                                                    onClick={() => window.open(`/verify/${cred.verificationCode}`, '_blank')}
                                                >
                                                    Verify Link
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="px-2.5 py-1 text-[10px] font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                    onClick={() => {
                                                        setSelectedCredForAction(cred);
                                                        setActionStatus(cred.verificationStatus);
                                                    }}
                                                >
                                                    Update Status
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-slate-400 font-bold">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal for status update */}
            {selectedCredForAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-md w-full p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-lg">Update Credential Status</h3>
                                <p className="text-slate-400 text-xs mt-0.5">Credential: {selectedCredForAction.verificationCode}</p>
                            </div>
                            <button
                                onClick={() => setSelectedCredForAction(null)}
                                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleActionSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                            <div className="space-y-2">
                                <label className="block text-slate-500 font-bold uppercase tracking-wider">Verification Status</label>
                                <select
                                    value={actionStatus}
                                    onChange={(e) => setActionStatus(e.target.value as any)}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-750 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                                >
                                    <option value="ACTIVE">Active (Valid)</option>
                                    <option value="SUSPENDED">Suspended (Under Review)</option>
                                    <option value="REVOKED">Revoked (Permanently Invalid)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-slate-500 font-bold uppercase tracking-wider">Audit / Reason Log</label>
                                <textarea
                                    required
                                    placeholder="Explain the reason for this action (e.g. employee offboarded, certificate error)..."
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setSelectedCredForAction(null)}
                                    className="rounded-xl px-4 py-2 text-xs font-bold border-slate-200 hover:bg-slate-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="rounded-xl px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/10"
                                    disabled={isSubmittingAction}
                                >
                                    {isSubmittingAction ? (
                                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                                    ) : (
                                        "Save Action"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
