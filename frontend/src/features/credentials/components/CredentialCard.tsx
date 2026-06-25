"use client";

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Credential } from '../types/credential.types';
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
    const hiddenCertRef = useRef<HTMLDivElement>(null);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isDownloading) return;
        setIsDownloading(true);
        try {
            const html2canvas = (await import("html2canvas")).default;
            const { jsPDF } = await import("jspdf");

            const el = hiddenCertRef.current;
            if (!el) return;

            // Temporarily make it visible for capture
            el.style.left = '-9999px';
            el.style.visibility = 'visible';

            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
            });

            // Hide again
            el.style.left = '-99999px';
            el.style.visibility = 'hidden';

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [canvas.width / 2, canvas.height / 2],
            });
            pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`certificate-${credential.verificationCode}.pdf`);
        } catch (error) {
            console.error("PDF download failed", error);
            alert("Failed to generate PDF. Please try from the certificate detail page.");
        } finally {
            setIsDownloading(false);
        }
    };

    const issuedDate = new Date(credential.issuedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <>
            {/* ── Hidden off-screen certificate div ── */}
            {/* Uses only hex/rgb colors so html2canvas doesn't choke on oklch/lab */}
            <div
                ref={hiddenCertRef}
                style={{
                    position: "fixed",
                    top: 0,
                    left: "-99999px",
                    visibility: "hidden",
                    width: "900px",
                    backgroundColor: "#ffffff",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    border: "1px solid #e5e7eb",
                    borderRadius: "16px",
                    overflow: "hidden",
                }}
            >
                {/* Top accent bar */}
                <div style={{ height: "6px", background: "linear-gradient(to right, #4f46e5, #7c3aed, #a855f7)" }} />

                <div style={{ padding: "48px 64px", textAlign: "center" }}>
                    {/* Badge */}
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
                        <div style={{
                            width: "80px", height: "80px", borderRadius: "50%",
                            backgroundColor: "#ede9fe", border: "4px solid #c4b5fd",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="1.5">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                    </div>

                    {/* Header */}
                    <p style={{ fontSize: "11px", fontWeight: "700", color: "#4f46e5", textTransform: "uppercase", letterSpacing: "4px", marginBottom: "8px" }}>
                        Certificate of Completion
                    </p>
                    <h1 style={{ fontSize: "40px", fontWeight: "700", color: "#111827", margin: "0 0 6px 0", fontFamily: "Georgia, serif" }}>
                        {credential.user?.name || "DezAI Student"}
                    </h1>
                    {credential.user?.email && (
                        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 32px 0" }}>{credential.user.email}</p>
                    )}

                    {/* Divider section */}
                    <div style={{ borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", padding: "28px 0", margin: "0 0 28px 0" }}>
                        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 8px 0" }}>has successfully completed</p>
                        <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" }}>
                            {credential.program?.title || credential.credentialTemplate?.name || "Program"}
                        </h2>
                        {credential.institution?.name && (
                            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                                offered by <span style={{ fontWeight: "700", color: "#111827" }}>{credential.institution.name}</span>
                            </p>
                        )}
                    </div>

                    {/* Meta row */}
                    <div style={{ display: "flex", justifyContent: "center", gap: "48px", marginBottom: "28px" }}>
                        <div>
                            <p style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Issued On</p>
                            <p style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>{issuedDate}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Tier</p>
                            <p style={{ fontSize: "14px", fontWeight: "700", color: "#111827", textTransform: "capitalize" }}>{credential.tier?.toLowerCase() || "Standard"}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Status</p>
                            <p style={{ fontSize: "14px", fontWeight: "700", color: "#16a34a" }}>✓ Verified</p>
                        </div>
                    </div>

                    {/* Verification Code */}
                    <div style={{
                        display: "inline-block", backgroundColor: "#f3f4f6", borderRadius: "12px",
                        padding: "10px 24px", marginBottom: "16px",
                    }}>
                        <p style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 4px 0" }}>Verification Code</p>
                        <p style={{ fontSize: "15px", fontFamily: "monospace", fontWeight: "700", color: "#111827", letterSpacing: "2px", margin: 0 }}>
                            {credential.verificationCode}
                        </p>
                    </div>

                    <p style={{ fontSize: "11px", color: "#9ca3af" }}>
                        Issued by DezAI · Verify at dezai.com/verify/{credential.verificationCode}
                    </p>
                </div>

                {/* Bottom accent bar */}
                <div style={{ height: "4px", background: "linear-gradient(to right, #a855f7, #7c3aed, #4f46e5)" }} />
            </div>

            {/* ── Visible Card ── */}
            <div className={cn("group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-level-1 hover:shadow-level-2 transition-all duration-300 border border-border-light hover:-translate-y-1", className)}>

                {/* Top Cover - tapping navigates to full certificate */}
                <Link href={`/certificates/${credential.id}`} className={cn("relative h-48 flex items-center justify-center overflow-hidden cursor-pointer", getCourseGradient(credential.id))}>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />

                    {credential.institution?.logoUrl && (
                        <div className="absolute inset-0 w-full h-full opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700" style={{ backgroundImage: `url(${credential.institution.logoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    )}

                    <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-lg group-hover:scale-110 transition-transform duration-500 border border-white/30">
                        <Hexagon className="h-8 w-8 text-white drop-shadow-md" />
                    </div>

                    {/* View hint on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <span className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-semibold tracking-wide border border-white/20">
                            View Certificate →
                        </span>
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
                </Link>

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
                            {isDownloading ? "Generating..." : "Download"}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
