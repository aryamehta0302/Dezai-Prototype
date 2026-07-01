"use client";

import React, { useEffect, useState } from 'react';
import { CredentialService } from '../services/credential.service';
import type { EnhancedAnalytics } from '../types/credential.types';
import { Loader2, BarChart3, PieChart, TrendingUp, Users, Award, Ban, AlertOctagon, Sparkles, CalendarDays } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export function CredentialStatsPage() {
    const [analytics, setAnalytics] = useState<EnhancedAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await CredentialService.getEnhancedAnalytics();
                setAnalytics(data);
            } catch (e) {
                setError('Failed to load analytics');
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !analytics) {
        return (
            <div className="text-center py-20 text-muted">
                <p>{error || 'No analytics available'}</p>
            </div>
        );
    }

    const totalCreds = analytics.statusCounts.ACTIVE + analytics.statusCounts.SUSPENDED + analytics.statusCounts.REVOKED;
    const activeRate = totalCreds > 0 ? Math.round((analytics.statusCounts.ACTIVE / totalCreds) * 100) : 0;

    const maxDailyIssued = Math.max(...analytics.dailyActivity.map(d => d.issued), 1);

    const maxProgramCount = Math.max(...analytics.programStats.map(p => p.count), 1);

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="h-7 w-7 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Credential Statistics</h1>
                    <p className="text-sm text-muted">Comprehensive analytics and insights across all credentials</p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={Award} label="Total" value={totalCreds} color="slate" />
                <StatCard icon={Users} label="Active" value={analytics.statusCounts.ACTIVE} color="emerald" />
                <StatCard icon={Ban} label="Suspended" value={analytics.statusCounts.SUSPENDED} color="amber" />
                <StatCard icon={AlertOctagon} label="Revoked" value={analytics.statusCounts.REVOKED} color="red" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface rounded-3xl p-6 shadow-level-1 border border-border-light space-y-5">
                    <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-primary" />
                        Status Distribution
                    </h3>
                    <div className="space-y-4">
                        {([
                            { label: 'ACTIVE', count: analytics.statusCounts.ACTIVE, color: 'bg-emerald-500' },
                            { label: 'SUSPENDED', count: analytics.statusCounts.SUSPENDED, color: 'bg-amber-500' },
                            { label: 'REVOKED', count: analytics.statusCounts.REVOKED, color: 'bg-red-500' },
                        ] as const).map(item => {
                            const pct = totalCreds > 0 ? Math.round((item.count / totalCreds) * 100) : 0;
                            return (
                                <div key={item.label} className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-on-surface">{item.label}</span>
                                        <span className="text-muted">{item.count} ({pct}%)</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={cn('h-full rounded-full transition-all duration-700', item.color)} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="pt-2 text-center">
                        <span className="text-sm font-bold text-on-surface">{activeRate}%</span>
                        <span className="text-xs text-muted ml-1">Active Rate</span>
                    </div>
                </div>

                <div className="bg-surface rounded-3xl p-6 shadow-level-1 border border-border-light space-y-5">
                    <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-emerald-500" />
                        Tier Distribution
                    </h3>
                    <div className="space-y-4">
                        {([
                            { label: 'FORGE', count: analytics.tierStats.FORGE, color: 'bg-slate-500' },
                            { label: 'ARENA', count: analytics.tierStats.ARENA, color: 'bg-blue-500' },
                            { label: 'CITADEL', count: analytics.tierStats.CITADEL, color: 'bg-purple-500' },
                        ] as const).map(item => {
                            const pct = totalCreds > 0 ? Math.round((item.count / totalCreds) * 100) : 0;
                            return (
                                <div key={item.label} className="space-y-1.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-on-surface">{item.label}</span>
                                        <span className="text-muted">{item.count} ({pct}%)</span>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={cn('h-full rounded-full transition-all duration-700', item.color)} style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {analytics.dailyActivity.length > 0 && (
                <div className="bg-surface rounded-3xl p-6 shadow-level-1 border border-border-light space-y-5">
                    <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-blue-500" />
                        30-Day Issuance Activity
                    </h3>
                    <div className="flex items-end gap-1 h-40">
                        {analytics.dailyActivity.map((day, idx) => {
                            const heightPct = maxDailyIssued > 0 ? (day.issued / maxDailyIssued) * 100 : 0;
                            const isHighActivity = day.issued > 0;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                                    <span className="text-[8px] text-muted opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4 font-bold">
                                        {day.issued}
                                    </span>
                                    <div className={cn(
                                        'w-full rounded-sm transition-all duration-300',
                                        isHighActivity ? 'bg-primary/60 hover:bg-primary' : 'bg-slate-100'
                                    )}
                                        style={{ height: `${Math.max(heightPct, 2)}%` }}
                                    />
                                    {idx % 5 === 0 && (
                                        <span className="text-[7px] text-muted mt-1 -rotate-45 origin-left whitespace-nowrap">
                                            {day.date.slice(5)}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-xs text-muted text-center mt-2">Last 30 days — daily credential issuance</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analytics.programStats.length > 0 && (
                    <div className="bg-surface rounded-3xl p-6 shadow-level-1 border border-border-light space-y-5">
                        <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            Program Distribution
                        </h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {analytics.programStats.map((p, idx) => {
                                const pct = totalCreds > 0 ? Math.round((p.count / totalCreds) * 100) : 0;
                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-on-surface-variant truncate max-w-[250px]" title={p.programTitle}>
                                                {p.programTitle}
                                            </span>
                                            <span className="font-bold text-on-surface">{p.count}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {analytics.issuerStats.length > 0 && (
                    <div className="bg-surface rounded-3xl p-6 shadow-level-1 border border-border-light space-y-5">
                        <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-500" />
                            Issuer Breakdown
                        </h3>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                            {analytics.issuerStats.map((issuer, idx) => {
                                const pct = totalCreds > 0 ? Math.round((issuer.count / totalCreds) * 100) : 0;
                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className="text-on-surface-variant truncate max-w-[250px]">
                                                {issuer.issuerName}
                                            </span>
                                            <span className="font-bold text-on-surface">{issuer.count}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: React.FC<{ className?: string }>; label: string; value: number; color: string }) {
    const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
        slate: { bg: 'bg-slate-100', text: 'text-slate-600', icon: 'text-slate-600' },
        emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: 'text-emerald-600' },
        amber: { bg: 'bg-amber-100', text: 'text-amber-600', icon: 'text-amber-600' },
        red: { bg: 'bg-red-100', text: 'text-red-600', icon: 'text-red-600' },
    };
    const c = colorMap[color] || colorMap.slate;
    return (
        <div className="bg-surface rounded-2xl p-5 shadow-sm border border-border-light flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className={cn('h-11 w-11 rounded-full flex items-center justify-center shrink-0', c.bg)}>
                <Icon className={cn('h-5 w-5', c.icon)} />
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
                <p className="text-2xl font-bold text-on-surface">{value}</p>
            </div>
        </div>
    );
}
