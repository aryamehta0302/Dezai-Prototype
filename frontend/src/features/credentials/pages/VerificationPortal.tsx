"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import { useVerification } from '../hooks/useVerification';
import { ShieldCheck, ShieldAlert, Loader2, GraduationCap, Award, ExternalLink } from 'lucide-react';

export function VerificationPortal() {
    const params = useParams();
    const code = Array.isArray(params?.code) ? params.code[0] : params?.code;
    const { loading, result } = useVerification(code as string);

    return (
        <div className="flex w-full min-h-screen flex-col xl:flex-row">
            {/* Left Panel — Premium Dezai Branding */}
            <div className="hidden xl:flex xl:w-[48%] 2xl:w-[50%] relative bg-linear-to-br from-primary via-primary-container to-secondary overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-float" />
                    <div className="absolute bottom-32 right-16 h-56 w-56 rounded-full bg-white/15 blur-2xl animate-float" style={{ animationDelay: "2s" }} />
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
                    <div className="mt-10 flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                            <ShieldCheck className="h-6 w-6 text-white" />
                            <div>
                                <p className="text-sm font-bold">Cryptographically Secured</p>
                                <p className="text-xs text-white/70">Anti-fraud ecosystem</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel — Verification Data */}
            <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 bg-background relative">
                
                {/* Mobile / Tablet Logo */}
                <div className="absolute top-8 left-8 flex xl:hidden items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-on-surface">
                        Dezai<span className="text-primary">.ai</span>
                    </span>
                </div>

                <div className="w-full max-w-lg mx-auto">
                    {loading ? (
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
                    ) : !result?.valid ? (
                        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center shadow-level-1 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 mx-auto mb-6">
                                <ShieldAlert className="h-10 w-10 text-red-500" />
                            </div>
                            <h2 className="text-3xl font-bold text-on-surface mb-3">Verification Failed</h2>
                            <p className="text-muted mb-6">{result?.message}</p>
                            <button onClick={() => window.location.href = '/'} className="px-6 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
                                Return Home
                            </button>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border-light bg-white shadow-level-1 overflow-hidden relative group">
                            {/* Success Banner */}
                            <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-500 relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-20 w-20 rounded-full bg-white p-1 shadow-lg">
                                    <div className="h-full w-full rounded-full bg-emerald-100 flex items-center justify-center">
                                        <Award className="h-8 w-8 text-emerald-600" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-14 px-8 pb-8 text-center">
                                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold tracking-widest uppercase rounded-full mb-4">
                                    {result.data?.verificationStatus} CREDENTIAL
                                </span>
                                <h2 className="text-2xl font-bold text-on-surface mb-1">{result.data?.program?.title || 'Certified Mastery'}</h2>
                                <p className="text-muted text-sm mb-8">Issued to <span className="font-semibold text-on-surface">{result.data?.user?.name || result.data?.userId}</span></p>

                                <div className="grid grid-cols-2 gap-4 text-left border-y border-border-light py-6 mb-8">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Issue Date</p>
                                        <p className="text-sm font-medium text-on-surface">{new Date(result.data?.issuedAt || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Credential Tier</p>
                                        <p className="text-sm font-bold text-primary">{result.data?.tier}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] uppercase tracking-wider text-muted font-semibold mb-1">Verification ID</p>
                                        <p className="text-sm font-mono text-on-surface bg-muted/10 p-2 rounded-md">{result.data?.verificationCode}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 justify-center text-sm">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                    <span className="text-muted">Verified by <span className="font-semibold text-on-surface">{result.data?.institution?.name || 'Dezai'}</span></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
