"use client";

import React, { useState } from 'react';
import { Credential } from '../types/credential.types';
import { CredentialService } from '../services/credential.service';
import { Download, ExternalLink, Loader2, Sparkles, Hexagon } from 'lucide-react';
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/cn";
import { getCourseGradient } from "@/shared/utils/thumbnail";

interface CredentialCardProps {
    credential: Credential;
    className?: string;
}

export function CredentialCard({ credential, className }: CredentialCardProps) {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const getPdfUrlFunc = CredentialService.getDownloadUrl(credential.id);
            const url = await getPdfUrlFunc();
            alert(`Generating high-quality branded PDF for: ${credential.program?.title}`);
        } catch (error) {
            console.error("PDF download failed", error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className={cn("group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-level-1 hover:shadow-level-2 transition-all duration-300 border border-border-light hover:-translate-y-1", className)}>
            
            {/* Top Cover - Glassmorphism & Branding */}
            <div className={cn("relative h-48 flex items-center justify-center overflow-hidden", getCourseGradient(credential.id))}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />
                
                {/* Institution Logo Background Pattern */}
                {credential.institution?.logoUrl && (
                     <div className="absolute inset-0 w-full h-full opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700" style={{ backgroundImage: `url(${credential.institution.logoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                )}
                
                {/* Center Badge Icon */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg group-hover:scale-110 transition-transform duration-500 border border-white/30">
                    <Hexagon className="h-8 w-8 text-white drop-shadow-md" />
                </div>
                 
                {/* Tier Badge */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wider shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                        {credential.tier}
                    </div>
                    {credential.credentialTemplate?.type && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold tracking-wider shadow-sm w-fit">
                            {credential.credentialTemplate.type}
                        </div>
                    )}
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-20">
                    <Badge variant={credential.verificationStatus === 'ACTIVE' ? 'default' : 'destructive'} className="text-[10px] uppercase tracking-wider backdrop-blur-md bg-white/90 text-black border-none shadow-sm">
                        {credential.verificationStatus}
                    </Badge>
                </div>
            </div>

            {/* Bottom Content Area */}
            <div className="flex flex-1 flex-col p-5 bg-white">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-muted">
                        Issued {new Date(credential.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-2">
                        {credential.institution?.logoUrl && (
                            <img src={credential.institution.logoUrl} alt="Institution" className="h-5 w-5 object-contain" />
                        )}
                        <span className="text-xs font-semibold text-on-surface-variant">{credential.institution?.name || 'Dezai University'}</span>
                    </div>
                </div>

                <div className="flex-1 space-y-2 mb-6">
                    <h3 className="font-bold text-on-surface text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {credential.credentialTemplate?.name || credential.program?.title || 'Advanced Certification'}
                    </h3>
                    <p className="text-sm text-muted line-clamp-2">
                        {credential.credentialTemplate?.description || 'Successfully completed all assessments and modules required for this credential.'}
                    </p>
                </div>

                {/* ID Container */}
                <div className="bg-neutral-50 rounded-xl p-3 mb-5 border border-border-light flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted font-bold">Credential ID</p>
                        <p className="text-xs font-mono font-medium text-on-surface mt-0.5">{credential.verificationCode}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Button 
                        variant="outline" 
                        className="w-full bg-transparent hover:bg-neutral-50 rounded-xl transition-all"
                        onClick={() => window.open(`/verify/${credential.verificationCode}`, '_blank')}
                    >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Verify
                    </Button>
                    <Button 
                        className="w-full rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
                        onClick={handleDownload}
                        disabled={isDownloading || credential.verificationStatus !== 'ACTIVE'}
                    >
                        {isDownloading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4 mr-2" />
                        )}
                        Download
                    </Button>
                </div>
            </div>
        </div>
    );
}
