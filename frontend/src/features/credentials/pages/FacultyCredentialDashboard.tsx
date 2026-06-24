"use client";

import React, { useState, useEffect } from 'react';
import { CredentialService } from '../services/credential.service';
import type { SearchResult } from '../types/credential.types';
import { FacultyCredentialTable } from '../components/FacultyCredentialTable';
import { IssueCredentialModal } from '../components/IssueCredentialModal';
import { VerificationLookup } from '../components/VerificationLookup';
import { CredentialActivityFeed } from '../components/CredentialActivityFeed';
import { CredentialStatsPage } from './CredentialStatsPage';
import {
    ShieldCheck, Loader2, Plus, Users, Ban, AlertOctagon,
    Search, Sparkles, TrendingUp, BarChart3, Award, CalendarDays, Activity
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/utils/cn';

export function FacultyCredentialDashboard() {
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [tierFilter, setTierFilter] = useState('ALL');
    const [programFilter, setProgramFilter] = useState('ALL');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [issuerFilter, setIssuerFilter] = useState('ALL');
    const [stats, setStats] = useState<any>(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [activeTab, setActiveTab] = useState<'registry' | 'analytics' | 'activity'>('registry');

    const fetchSearch = async () => {
        setLoading(true);
        try {
            const result = await CredentialService.search({
                query: searchQuery || undefined,
                status: statusFilter !== 'ALL' ? statusFilter as any : undefined,
                tier: tierFilter !== 'ALL' ? tierFilter as any : undefined,
                programId: programFilter !== 'ALL' ? programFilter : undefined,
                issuerId: issuerFilter !== 'ALL' ? issuerFilter : undefined,
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
                limit: 100,
            });
            setSearchResult(result);
        } catch (e) {
            console.error('Search failed', e);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        setLoadingAnalytics(true);
        try {
            const statsData = await CredentialService.getStats();
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    useEffect(() => {
        fetchSearch();
    }, [searchQuery, statusFilter, tierFilter, programFilter, issuerFilter, dateFrom, dateTo]);

    useEffect(() => {
        fetchStats();
    }, []);

    const handleIssueSuccess = () => {
        setIsIssueModalOpen(false);
        fetchSearch();
        fetchStats();
    };

    const handleStatusChange = () => {
        fetchSearch();
        fetchStats();
    };

    const credentials = searchResult?.data || [];
    const totalCount = searchResult?.total || 0;
    const activeCount = stats?.active ?? credentials.filter(c => c.verificationStatus === 'ACTIVE').length;
    const suspendedCount = stats?.suspended ?? credentials.filter(c => c.verificationStatus === 'SUSPENDED').length;
    const revokedCount = stats?.revoked ?? credentials.filter(c => c.verificationStatus === 'REVOKED').length;
    const activeRate = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

    const uniquePrograms = credentials.length > 0 ? Array.from(
        new Map(credentials.map(c => [c.programId, c.program?.title || c.programId])).entries()
    ).map(([id, title]) => ({ id, title })) : [];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            {/* Premium Header */}
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

            {/* Stats Cards — 5 columns */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {/* Total */}
                <div className="col-span-2 sm:col-span-1 bg-surface rounded-2xl p-5 shadow-sm border border-border-light flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className="h-11 w-11 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                        <Award className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">Total Issued</p>
                        <p className="text-2xl font-bold text-on-surface">{totalCount}</p>
                    </div>
                </div>

                {/* Active */}
                <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border-light flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className="h-11 w-11 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">Active</p>
                        <p className="text-2xl font-bold text-on-surface">{activeCount}</p>
                    </div>
                </div>

                {/* Suspended */}
                <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border-light flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className="h-11 w-11 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <Ban className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">Suspended</p>
                        <p className="text-2xl font-bold text-on-surface">{suspendedCount}</p>
                    </div>
                </div>

                {/* Revoked */}
                <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border-light flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className="h-11 w-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                        <AlertOctagon className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">Revoked</p>
                        <p className="text-2xl font-bold text-on-surface">{revokedCount}</p>
                    </div>
                </div>

                {/* Active Rate */}
                <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border-light flex items-center gap-3 hover:shadow-md transition-shadow">
                    <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-muted">Active Rate</p>
                        <p className="text-2xl font-bold text-on-surface">{activeRate}%</p>
                    </div>
                </div>
            </div>

            {/* Verification Lookup */}
            <div className="py-2">
                <VerificationLookup isFaculty={true} />
            </div>

            {/* Tab Navigation */}
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
                        {tab === 'registry' ? <Search className="h-4 w-4 inline mr-1.5" /> : tab === 'analytics' ? <BarChart3 className="h-4 w-4 inline mr-1.5" /> : <Activity className="h-4 w-4 inline mr-1.5" />}
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content: Registry */}
            {activeTab === 'registry' && (
                <div className="bg-surface rounded-3xl shadow-level-1 overflow-hidden border border-border-light">
                    <div className="p-6 border-b border-border-light space-y-4 bg-neutral-50/50">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-on-surface">Credential Registry</h2>
                                <p className="text-xs text-muted mt-0.5">
                                    {searchResult ? `Showing ${credentials.length} of ${totalCount} credentials` : ''}
                                </p>
                            </div>
                            <div className="relative w-full sm:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, code..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border-light bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-xl border border-border-light bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    <option value="ALL">All Statuses</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="SUSPENDED">Suspended</option>
                                    <option value="REVOKED">Revoked</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Tier</label>
                                <select
                                    value={tierFilter}
                                    onChange={(e) => setTierFilter(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-xl border border-border-light bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    <option value="ALL">All Tiers</option>
                                    <option value="CITADEL">Citadel</option>
                                    <option value="ARENA">Arena</option>
                                    <option value="FORGE">Forge</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Program</label>
                                <select
                                    value={programFilter}
                                    onChange={(e) => setProgramFilter(e.target.value)}
                                    className="w-full px-3 py-2 text-sm rounded-xl border border-border-light bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                >
                                    <option value="ALL">All Programs</option>
                                    {uniquePrograms.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Issued From</label>
                                <div className="relative">
                                    <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" />
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="w-full pl-8 pr-2 py-2 text-sm rounded-xl border border-border-light bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1">Issued To</label>
                                <div className="relative">
                                    <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted pointer-events-none" />
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="w-full pl-8 pr-2 py-2 text-sm rounded-xl border border-border-light bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {(dateFrom || dateTo || statusFilter !== 'ALL' || tierFilter !== 'ALL' || programFilter !== 'ALL') && (
                            <div className="flex flex-wrap gap-2 pt-1">
                                <span className="text-xs text-muted font-medium">Active filters:</span>
                                {statusFilter !== 'ALL' && (
                                    <button onClick={() => setStatusFilter('ALL')} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors">
                                        Status: {statusFilter} ×
                                    </button>
                                )}
                                {tierFilter !== 'ALL' && (
                                    <button onClick={() => setTierFilter('ALL')} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors">
                                        Tier: {tierFilter} ×
                                    </button>
                                )}
                                {programFilter !== 'ALL' && (
                                    <button onClick={() => setProgramFilter('ALL')} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors">
                                        Program filtered ×
                                    </button>
                                )}
                                {dateFrom && (
                                    <button onClick={() => setDateFrom('')} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors">
                                        From: {dateFrom} ×
                                    </button>
                                )}
                                {dateTo && (
                                    <button onClick={() => setDateTo('')} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors">
                                        To: {dateTo} ×
                                    </button>
                                )}
                                <button
                                    onClick={() => { setStatusFilter('ALL'); setTierFilter('ALL'); setProgramFilter('ALL'); setDateFrom(''); setDateTo(''); setIssuerFilter('ALL'); }}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-32">
                            <Loader2 className="animate-spin text-primary h-10 w-10" />
                        </div>
                    ) : (
                        <FacultyCredentialTable
                            credentials={credentials}
                            onStatusChange={handleStatusChange}
                        />
                    )}
                </div>
            )}

            {/* Tab Content: Analytics */}
            {activeTab === 'analytics' && <CredentialStatsPage />}

            {/* Tab Content: Activity */}
            {activeTab === 'activity' && (
                <div className="bg-surface rounded-3xl p-6 shadow-level-1 border border-border-light">
                    <CredentialActivityFeed limit={50} />
                </div>
            )}

            {isIssueModalOpen && (
                <IssueCredentialModal
                    onClose={() => setIsIssueModalOpen(false)}
                    onSuccess={handleIssueSuccess}
                />
            )}
        </div>
    );
}
