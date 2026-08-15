"use client";

import React, { useEffect, useState } from 'react';
import { CredentialService } from '../services/credential.service';
import type { ActivityEntry } from '../types/credential.types';
import { Loader2, Activity, Award, Ban, Clock, User, ShieldCheck, AlertTriangle } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface Props {
    limit?: number;
    showTitle?: boolean;
}

export function CredentialActivityFeed({ limit = 20, showTitle = true }: Props) {
    const [activities, setActivities] = useState<ActivityEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const res = await CredentialService.getActivity(limit, 0);
                setActivities(res.data);
                setTotal(res.total);
            } catch (e) {
                console.error('Failed to fetch activity feed', e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [limit]);

    const getActionIcon = (details: string | null) => {
        if (!details) return <Award className="h-3.5 w-3.5 text-primary" />;
        const lower = details.toLowerCase();
        if (lower.includes('revoked')) return <Ban className="h-3.5 w-3.5 text-red-500" />;
        if (lower.includes('suspended')) return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
        if (lower.includes('active') || lower.includes('reactivat')) return <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />;
        return <Award className="h-3.5 w-3.5 text-primary" />;
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="space-y-4">
            {showTitle && (
                <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Activity Feed
                    </h3>
                    <span className="text-xs text-muted bg-muted/10 px-2 py-1 rounded-full">
                        {total} total
                    </span>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
            ) : activities.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted border border-dashed border-border-light rounded-xl">
                    No activity recorded yet.
                </div>
            ) : (
                <div className="space-y-1">
                    {activities.map((act, idx) => (
                        <div
                            key={act.id}
                            className={cn(
                                'flex items-start gap-3 p-3 rounded-xl transition-colors',
                                idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/5'
                            )}
                        >
                            <div className={cn(
                                'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                                act.details?.toLowerCase().includes('revoked') ? 'bg-red-100' :
                                act.details?.toLowerCase().includes('suspended') ? 'bg-amber-100' :
                                'bg-primary/10'
                            )}>
                                {getActionIcon(act.details)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-on-surface font-medium leading-snug">
                                    {act.details || 'Credential action recorded'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-muted flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {act.user?.name || 'System'}
                                    </span>
                                    <span className="text-[10px] text-muted">•</span>
                                    <span className="text-[10px] text-muted flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatTime(act.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
