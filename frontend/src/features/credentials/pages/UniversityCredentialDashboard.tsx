"use client";

import React, { useState, useCallback } from 'react';
import { CredentialService } from '../services/credential.service';
import { VerifyStatus, type Credential, type SearchResult, type EnhancedAnalytics } from '../types/credential.types';
import { CredentialStatsPage } from './CredentialStatsPage';
import { CredentialActivityFeed } from '../components/CredentialActivityFeed';
import { FacultyCredentialTable } from '../components/FacultyCredentialTable';
import { IssueCredentialModal } from '../components/IssueCredentialModal';
import { VerificationLookup } from '../components/VerificationLookup';
import {
    ShieldCheck, Loader2, Plus, Users, Ban, AlertOctagon,
    Search, TrendingUp, Award, Building2, Activity
} from 'lucide-react';
import { Button } from '@/shared/ui/button';

export function UniversityCredentialDashboard() {
    const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'registry' | 'analytics' | 'activity'>('registry');

    const fetchSearch = useCallback(async () => {
        setLoading(true);
        try {
            const result = await CredentialService.search({
                query: searchQuery || undefined,
                status: statusFilter !== 'ALL' ? statusFilter as any : undefined,
                limit: 100,
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
    };

    const credentials = searchResult?.data || [];

    const totalCount = searchResult?.total || 0;
    const activeCount = credentials.filter(c => c.verificationStatus === VerifyStatus.ACTIVE).length;
    const suspendedCount = credentials.filter(c => c.verificationStatus === VerifyStatus.SUSPENDED).length;
    const revokedCount = credentials.filter(c => c.verificationStatus === VerifyStatus.REVOKED).length;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 p-8 sm:p-10 text-white shadow-level-1 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-700">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="relative z-10 flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                        <Building2 className="h-8 w-8 text-indigo-400 drop-shadow-md" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-1">University Admin Portal</h1>
                        <p className="text-indigo-200 text-sm">Oversee credential lifecycle across your institution.</p>
                    </div>
                </div>
                <div className="relative z-10 shrink-0">
                    <Button onClick={() => setIsIssueModalOpen(true)} className="h-12 px-6 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white border-0 shadow-lg shadow-indigo-500/20">
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
                            <div className="relative w-full sm:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, code, program..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border-light bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div className="flex gap-2">
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
                            </div>
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
                </>
            )}

            {activeTab === 'analytics' && <CredentialStatsPage />}

            {activeTab === 'activity' && (
                <div className="bg-surface rounded-3xl p-6 shadow-level-1 border border-border-light">
                    <CredentialActivityFeed limit={50} />
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
