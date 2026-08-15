"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useVerification } from '../hooks/useVerification';
import {
    ShieldCheck, ShieldAlert, Loader2, GraduationCap, Award,
    Copy, Check, Share2, Mail, AlertTriangle, User, Building2, Printer
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface VerificationPortalProps {
    code?: string;
}

function LoadingSkeleton() {
    return (
        <div className="w-full max-w-lg mx-auto print:hidden">
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-on-surface mb-2">Authenticating</h2>
                    <p className="text-muted">Querying Dezai Trust Network for records...</p>
                </div>
            </div>
        </div>
    );
}

function ErrorBoundaryFallback({ error, onRetry }: { error: string; onRetry: () => void }) {
    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center shadow-level-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mx-auto mb-4">
                    <ShieldAlert className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-on-surface mb-2">Verification Error</h2>
                <p className="text-muted text-sm mb-6">{error}</p>
                <button
                    onClick={onRetry}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
}

export function VerificationPortal({ code: propCode }: VerificationPortalProps) {
    const params = useParams();
    const routeCode = Array.isArray(params?.id) ? params.id[0] : params?.id;
    const code = propCode || routeCode;
    const { loading, result, error, refetch } = useVerification(code as string);
    const [copied, setCopied] = useState(false);
    const [showFallback, setShowFallback] = useState(false);

    const formatTrack = (track: string) => {
        if (!track) return 'Compliance Certificate';
        return track.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    };

    useEffect(() => {
        if (error && !loading && !result?.data) {
            setShowFallback(true);
        }
    }, [error, loading, result]);

    // Reset fallback when code changes
    useEffect(() => {
        setShowFallback(false);
    }, [code]);

    const verifyUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/verify/${code}`
        : `https://dezai.ai/verify/${code}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(verifyUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { }
    };

    const handleShareLinkedIn = () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
        window.open(url, '_blank');
    };

    const handleShareEmail = () => {
        const title = result?.isEnterprise ? formatTrack(result?.data?.complianceTrack) : (result?.data?.program?.title || 'Dezai.ai');
        const subject = encodeURIComponent(`Verified Credential — ${title}`);
        const body = encodeURIComponent(`You can verify this credential at: ${verifyUrl}`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
    };

    const handleRetry = () => {
        setShowFallback(false);
        if (refetch) refetch();
    };

    // Parse revocation reason from metadata
    const getStatusReason = (): string | null => {
        if (!result?.data?.metadata) return null;
        try {
            const meta = JSON.parse(result.data.metadata as string);
            return meta.statusReason || null;
        } catch {
            return null;
        }
    };

    const getStatusChangeDate = (): string | null => {
        if (!result?.data?.metadata) return null;
        try {
            const meta = JSON.parse(result.data.metadata as string);
            return meta.statusLastChangedAt || null;
        } catch {
            return null;
        }
    };

    if (showFallback && error) {
        return (
            <div className="flex w-full min-h-screen flex-col xl:flex-row">
                <div className="hidden xl:flex xl:w-[48%] 2xl:w-[50%] relative bg-gradient-to-br from-primary via-primary-container to-secondary overflow-hidden print:hidden" />
                <div className="flex flex-1 items-center justify-center px-4 sm:px-8 lg:px-12 py-12 bg-background">
                    <ErrorBoundaryFallback error={error} onRetry={handleRetry} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full min-h-screen flex-col xl:flex-row verification-panel">
            {/* Left Panel — Dezai Branding */}
            <div className="hidden xl:flex xl:w-[48%] 2xl:w-[50%] relative bg-gradient-to-br from-primary via-primary-container to-secondary overflow-hidden print:hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
                    <div className="absolute bottom-32 right-16 h-56 w-56 rounded-full bg-white/15 blur-2xl" style={{ animationDelay: "2s" }} />
                </div>
                <div className="relative z-10 flex flex-col justify-center px-10 2xl:px-16 text-white w-full max-w-2xl mx-auto">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                            <GraduationCap className="h-7 w-7" />
                        </div>
                        <span className="text-2xl font-bold">Dezai.ai</span>
                    </div>
                    <h1 className="text-3xl 2xl:text-4xl font-bold leading-tight mb-4">
                        Authentic Digital Credentials
                    </h1>
                    <p className="text-base 2xl:text-lg text-white/80 leading-relaxed">
                        Dezai Credentials represent verified mastery and achievement. Instantly verifiable, tamper-proof, and universally recognized across our network of top universities and industry partners.
                    </p>
                    <div className="mt-10 flex flex-col gap-4">
                        <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl backdrop-blur-md">
                            <ShieldCheck className="h-6 w-6 text-white shrink-0" />
                            <div>
                                <p className="text-sm font-bold">Cryptographically Secured</p>
                                <p className="text-xs text-white/70">Anti-fraud ecosystem</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl backdrop-blur-md">
                            <Award className="h-6 w-6 text-white shrink-0" />
                            <div>
                                <p className="text-sm font-bold">Industry Recognized</p>
                                <p className="text-xs text-white/70">Accepted by top employers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel — Verification Data */}
            <div className="flex flex-1 items-center justify-center overflow-y-auto px-4 sm:px-8 lg:px-12 py-12 bg-background relative print:p-0 print:bg-white print:block">
                {/* Mobile Logo */}
                <div className="absolute top-8 left-8 flex xl:hidden items-center gap-2.5 print:hidden">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-on-surface">
                        Dezai<span className="text-primary">.ai</span>
                    </span>
                </div>

                <div className="w-full max-w-lg mx-auto print:max-w-4xl print:w-full">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : !result?.valid ? (
                        result?.data ? (
                            /* Premium Revoked / Tampered State UI */
                            <div className="rounded-2xl border-2 border-red-500/30 bg-white shadow-level-1 overflow-hidden relative print:shadow-none print:border-none print:w-full print:mx-auto">						
								{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
								{(result as any).tampered ? (
									<>
										{/* Blinking Red Security Alert Banner */}
										<div
											className="relative z-20 overflow-hidden"
											style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
										>
											<div className="bg-red-600 text-white text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-center py-3 px-4 animate-pulse">
												<div className="flex items-center justify-center gap-2">
													<ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5" />
													<span>CRITICAL SECURITY BREACH — TAMPERING DETECTED</span>
												</div>
											</div>
										</div>

										{/* Strobe effect on tamper */}
										<div className="absolute inset-0 pointer-events-none z-10">
											<div className="w-full h-full bg-red-600/5 animate-pulse" />
										</div>
									</>
								) : (
									<div
										className="p-2 bg-red-600 text-white text-xs font-bold uppercase tracking-widest text-center relative z-10 animate-pulse"
										style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
									>
										INVALIDATED CREDENTIAL
									</div>
                                )}
                                {/* Diagonal Watermark Overlays */}
                                <div className="absolute inset-0 pointer-events-none select-none opacity-[0.03] flex flex-col justify-between py-16 overflow-hidden rotate-[-15deg]">
                                    <div className="text-red-600 text-6xl font-black tracking-widest text-center">REVOKED</div>
                                    <div className="text-red-600 text-6xl font-black tracking-widest text-center">INVALID</div>
                                    <div className="text-red-600 text-6xl font-black tracking-widest text-center">REVOKED</div>
                                </div>

                                <div className="pt-10 px-4 sm:px-8 pb-8 text-center relative z-10">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mx-auto mb-4 border-2 border-red-500">
                                        <ShieldAlert className="h-9 w-9 text-red-600" />
                                    </div>
                                    
                                    <h2 className="text-2xl font-black text-red-600 mb-2">
                                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                        {(result as any).tampered ? 'CRITICAL SECURITY BREACH' : 'Credential Revoked'}
                                    </h2>
                                    <p className="text-muted text-sm mb-6 max-w-md mx-auto">
                                        {result.message}
                                    </p>

                                    {/* Warning detail card */}
                                    <div className="bg-red-50/70 border border-red-200 rounded-xl p-4 text-left mb-6 space-y-3">
                                        <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider">
                                            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                                            <span>Revocation & Status Audit</span>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-red-100 pt-3">
                                            <div>
                                                <p className="text-muted font-semibold">Verification Status</p>
                                                <p className="font-bold text-red-600">
                                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                    {(result as any).tampered ? 'TAMPERED / CORRUPTED' : 'PERMANENTLY REVOKED'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted font-semibold">Updated On</p>
                                                <p className="font-medium text-on-surface">
                                                    {result.data?.metadata ? (
                                                        (() => {
                                                            try {
                                                                const meta = JSON.parse(result.data.metadata);
                                                                return meta.statusLastChangedAt ? new Date(meta.statusLastChangedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown';
                                                            } catch {
                                                                return 'Unknown';
                                                            }
                                                        })()
                                                    ) : 'Unknown'}
                                                </p>
                                            </div>
                                            {getStatusReason() && (
                                                <div className="col-span-1 sm:col-span-2">
                                                    <p className="text-muted font-semibold">Reason</p>
                                                    <p className="font-medium text-red-700 italic bg-white border border-red-100 px-3 py-2 rounded-lg mt-1">
                                                        "{getStatusReason()}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Recipient Details in Disabled Look */}
                                    <div className="border border-border-light rounded-xl p-4 bg-neutral-50/50 text-left space-y-2 opacity-50">
                                        <p className="text-xs font-semibold text-muted uppercase tracking-wider">Attempted Recipient Details</p>
                                        <div className="text-sm border-t border-border-light pt-2 space-y-1">
                                            <p className="text-on-surface">
                                                Recipient: <span className="font-bold line-through">
                                                    {result.isEnterprise ? (result.data?.employee?.user?.name || 'Employee') : (result.data?.user?.name || result.data?.userId)}
                                                </span>
                                            </p>
                                            <p className="text-on-surface">
                                                {result.isEnterprise ? 'Compliance Track' : 'Program'}: <span className="font-medium line-through">
                                                    {result.isEnterprise ? formatTrack(result.data?.complianceTrack) : (result.data?.program?.title || 'Unknown Program')}
                                                </span>
                                            </p>
                                            <p className="text-on-surface">
                                                {result.isEnterprise ? 'Organization' : 'Institution'}: <span className="font-medium">
                                                    {result.isEnterprise ? (result.data?.organization?.name || 'Allianz') : (result.data?.program?.institution?.name || 'Unknown Institution')}
                                                </span>
                                            </p>
                                            <p className="text-xs text-muted font-mono bg-neutral-100 p-2 rounded-md mt-2 select-all">
                                                Code: {result.data?.verificationCode}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex flex-col gap-2 print:hidden">
                                        <button onClick={() => window.location.href = '/'} className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-md shadow-red-200">
                                            Return Home
                                        </button>
                                        <p className="text-[10px] text-muted-foreground mt-2">
                                            This verification code is permanently marked as invalid. Contact platform support if you believe this is an error.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Simple Invalid Code Card */
                            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center shadow-level-1 relative overflow-hidden print:hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 mx-auto mb-6 animate-pulse">
                                    <ShieldAlert className="h-10 w-10 text-red-500" />
                                </div>
                                <h2 className="text-3xl font-bold text-on-surface mb-3">Verification Failed</h2>
                                <p className="text-muted mb-6">{result?.message || 'Invalid verification code or server error'}</p>
                                <button onClick={() => window.location.href = '/'} className="px-6 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
                                    Return Home
                                </button>
                            </div>
                        )
                    ) : (
                        /* Valid Active Certificate Card */
                        <div className="rounded-2xl border border-border-light bg-white shadow-level-1 overflow-hidden print:shadow-none print:border-none print:w-full print:mx-auto">
                            {/* Success Banner */}
                            <div 
                                className="h-24 bg-gradient-to-r from-emerald-500 to-teal-500 relative overflow-hidden"
                                style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                            >
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-20 w-20 rounded-full bg-white p-1 shadow-lg">
                                    {result.isEnterprise ? (
                                        result.data?.organization?.logoUrl ? (
                                            <img
                                                src={result.data.organization.logoUrl}
                                                alt="Organization logo"
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full rounded-full bg-emerald-100 flex items-center justify-center">
                                                <Award className="h-8 w-8 text-emerald-600" />
                                            </div>
                                        )
                                    ) : (
                                        result.data?.program?.institution?.logoUrl ? (
                                            <img
                                                src={result.data.program.institution.logoUrl}
                                                alt="Institution logo"
                                                className="h-full w-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full rounded-full bg-emerald-100 flex items-center justify-center">
                                                <Award className="h-8 w-8 text-emerald-600" />
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="pt-14 px-6 sm:px-8 pb-8 text-center">
                                <span 
                                    className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold tracking-widest uppercase rounded-full mb-4"
                                    style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                                >
                                    {result.data?.verificationStatus} CREDENTIAL
                                </span>
                                <h2 className="text-2xl font-black text-on-surface mb-1">
                                    {result.isEnterprise ? (result.data?.template?.name || formatTrack(result.data?.complianceTrack)) : (result.data?.program?.title || 'Certified Mastery')}
                                </h2>
                                <p className="text-muted text-sm mb-6">
                                    Issued to <span className="font-bold text-on-surface">
                                        {result.isEnterprise ? (result.data?.employee?.user?.name || 'Employee') : (result.data?.user?.name || result.data?.userId)}
                                    </span>
                                </p>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4 text-left border-y border-border-light py-5 mb-5">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Issue Date</p>
                                        <p className="text-sm font-medium text-on-surface">
                                            {new Date(result.data?.issuedAt || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Credential Tier</p>
                                        <p className="text-sm font-bold text-primary">{result.isEnterprise ? 'COMPLIANCE' : result.data?.tier}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">
                                            <User className="inline h-3 w-3 mr-0.5" />{result.isEnterprise ? 'Department' : 'Issued By'}
                                        </p>
                                        <p className="text-sm font-medium text-on-surface">
                                            {result.isEnterprise ? (result.data?.employee?.department?.name || 'Global Risk & Compliance') : (result.data?.issuer?.name || 'Dezai.ai')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">
                                            <Building2 className="inline h-3 w-3 mr-0.5" />{result.isEnterprise ? 'Organization' : 'Institution'}
                                        </p>
                                        <p className="text-sm font-medium text-on-surface font-semibold text-emerald-600">
                                            {result.isEnterprise ? (result.data?.organization?.name || 'Allianz Corp') : (result.data?.program?.institution?.name || 'Dezai')}
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Verification ID</p>
                                        <p className="text-sm font-mono text-on-surface bg-muted/10 p-2 rounded-md select-all">{result.data?.verificationCode}</p>
                                    </div>
                                </div>

                                {/* Verified by line */}
                                <div className="flex items-center gap-3 justify-center text-sm mb-6">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                    <span className="text-muted">
                                        Verified by <span className="font-semibold text-on-surface">{result.isEnterprise ? (result.data?.organization?.name || 'Allianz') : (result.data?.program?.institution?.name || 'Dezai')}</span>
                                    </span>
                                </div>

                                {/* Share / Copy / Print actions */}
                                <div className="flex gap-2.5 flex-wrap justify-center print:hidden">
                                    <button
                                        onClick={handleCopy}
                                        className={cn(
                                            'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all',
                                            copied
                                                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                                                : 'bg-white border-border-light hover:bg-neutral-50 text-on-surface'
                                        )}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </button>
                                    
                                    <button
                                        onClick={() => window.print()}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all"
                                    >
                                        <Printer className="h-4 w-4" />
                                        Print
                                    </button>

                                    <button
                                        onClick={handleShareLinkedIn}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-[#0077b5]/20 bg-[#0077b5]/5 text-[#0077b5] hover:bg-[#0077b5]/10 transition-all"
                                    >
                                        <Share2 className="h-4 w-4" />
                                        LinkedIn
                                    </button>
                                    
                                    <button
                                        onClick={handleShareEmail}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border border-border-light bg-white hover:bg-neutral-50 text-on-surface transition-all"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
