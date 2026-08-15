"use client";

import React, { useState, useEffect, useRef } from 'react';
import { EnterpriseCredentialService, EnterpriseCredential } from '../services/enterprise-credential.service';
import { Loader2, Search, Download, ExternalLink, ShieldCheck, Hexagon, Calendar, Building, Briefcase } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { useAuthStore } from '@/lib/stores/auth.store';

export function EmployeeCredentialCenter() {
    const { user } = useAuthStore();
    const [credentials, setCredentials] = useState<EnterpriseCredential[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTrack, setSelectedTrack] = useState('ALL');
    const [isDownloading, setIsDownloading] = useState<string | null>(null);
    const hiddenCertRef = useRef<HTMLDivElement>(null);
    const [activeCert, setActiveCert] = useState<EnterpriseCredential | null>(null);

    useEffect(() => {
        const fetchCerts = async () => {
            try {
                const data = await EnterpriseCredentialService.getMyCredentials();
                setCredentials(data);
                if (data.length > 0) {
                    setActiveCert(data[0]);
                }
            } catch (err) {
                console.error("Failed to load compliance credentials", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCerts();
    }, []);

    const formatTrack = (track: string) => {
        if (!track) return 'Compliance Certificate';
        return track.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    };

    const handleDownload = async (cred: EnterpriseCredential) => {
        if (isDownloading) return;
        setIsDownloading(cred.id);
        try {
            const html2canvas = (await import("html2canvas")).default;
            const { jsPDF } = await import("jspdf");

            // Wait brief moment for hidden ref rendering
            await new Promise(resolve => setTimeout(resolve, 100));
            const el = hiddenCertRef.current;
            if (!el) return;

            el.style.left = '-9999px';
            el.style.visibility = 'visible';

            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
            });

            el.style.left = '-99999px';
            el.style.visibility = 'hidden';

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "px",
                format: [canvas.width / 2, canvas.height / 2],
            });
            pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`compliance-${cred.verificationCode}.pdf`);
        } catch (error) {
            console.error("PDF download failed", error);
            alert("Failed to generate PDF.");
        } finally {
            setIsDownloading(null);
        }
    };

    const filteredCredentials = credentials.filter(c => {
        const matchesQuery = formatTrack(c.complianceTrack).toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.organization?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.verificationCode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTrack = selectedTrack === 'ALL' || c.complianceTrack === selectedTrack;
        return matchesQuery && matchesTrack;
    });

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
        );
    }

    const uniqueTracks = Array.from(new Set(credentials.map(c => c.complianceTrack)));

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-8">
            {/* Header section with glassmorphism gradient card */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl border border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/10 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider w-fit mb-3">
                            <ShieldCheck className="h-4 w-4" /> Enterprise Compliance
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Compliance Credential Wallet</h1>
                        <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-xl">
                            View, share, and verify your professional compliance achievements. These certificates are signed on the Dezai Trust Network and universally verifiable.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/5 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shrink-0">
                        <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                            <Hexagon className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-400">Compliance Standing</p>
                            <p className="text-lg font-bold text-emerald-400">100% Fully Compliant</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter and search bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex gap-2 flex-wrap items-center">
                    <button
                        onClick={() => setSelectedTrack('ALL')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedTrack === 'ALL' ? 'bg-indigo-650 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                    >
                        All Tracks ({credentials.length})
                    </button>
                    {uniqueTracks.map(track => (
                        <button
                            key={track}
                            onClick={() => setSelectedTrack(track)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedTrack === track ? 'bg-indigo-650 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                            {formatTrack(track)}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search certificates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all font-medium"
                    />
                </div>
            </div>

            {filteredCredentials.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl bg-white shadow-sm">
                    <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Hexagon className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700">No Credentials Found</h3>
                    <p className="text-slate-400 text-xs mt-1">Try refining your search terms or track filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: List of Certificates */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider px-1">Certificate Index</h2>
                        <div className="space-y-3">
                            {filteredCredentials.map((cred) => (
                                <div
                                    key={cred.id}
                                    onClick={() => setActiveCert(cred)}
                                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${activeCert?.id === cred.id ? 'border-indigo-500 bg-indigo-500/5 shadow-md shadow-indigo-500/5' : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'}`}
                                >
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold uppercase tracking-wider text-[9px]">
                                            {formatTrack(cred.complianceTrack)}
                                        </Badge>
                                        <span className="text-[10px] text-slate-400 font-mono font-bold">{cred.verificationCode}</span>
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1">{cred.template?.name || formatTrack(cred.complianceTrack)}</h3>
                                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                        <Building className="h-3 w-3" /> {cred.organization?.name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: High Fidelity Certificate View */}
                    <div className="lg:col-span-2">
                        {activeCert && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-8 space-y-6">
                                <div className="flex justify-between items-center flex-wrap gap-4 border-b border-slate-100 pb-5">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">Active Certificate Details</h3>
                                        <p className="text-xs text-slate-400">Verification ID: {activeCert.verificationCode}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="rounded-xl px-4 py-2 border-slate-200 hover:bg-slate-50 text-xs font-bold"
                                            onClick={() => window.open(`/verify/${activeCert.verificationCode}`, '_blank')}
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" /> Verify
                                        </Button>
                                        <Button
                                            className="rounded-xl px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/10"
                                            onClick={() => handleDownload(activeCert)}
                                            disabled={isDownloading !== null || activeCert.verificationStatus !== 'ACTIVE'}
                                        >
                                            {isDownloading === activeCert.id ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4 mr-2" />
                                            )}
                                            {isDownloading === activeCert.id ? "Generating..." : "Download"}
                                        </Button>
                                    </div>
                                </div>

                                {/* Dynamic Visual Representation of the Certificate */}
                                <div className="border border-slate-200 rounded-2xl bg-neutral-50/50 p-6 flex flex-col justify-between aspect-[1.414/1] relative overflow-hidden shadow-inner max-w-2xl mx-auto">
                                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                                    <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
                                    
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-lg font-black text-slate-800 font-serif leading-none">{activeCert.organization?.name}</h4>
                                            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Compliance Department</p>
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                        </div>
                                    </div>

                                    <div className="text-center my-6 space-y-3">
                                        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] font-sans">Certificate of Compliance</p>
                                        <h3 className="text-2xl sm:text-3xl font-bold font-serif text-slate-800 tracking-tight">
                                            {activeCert.employee?.user?.name || user?.name || 'Tirth Employee'}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                                            has successfully satisfied all training modules and exams required for the compliance track:
                                        </p>
                                        <p className="text-sm font-bold text-slate-800 border-y border-slate-200/60 py-2 inline-block px-6">
                                            {formatTrack(activeCert.complianceTrack)}
                                        </p>
                                    </div>

                                    <div className="flex justify-between items-end border-t border-slate-100 pt-4 text-xs">
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Issued On</p>
                                            <p className="font-bold text-slate-800">{new Date(activeCert.issuedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Verification ID</p>
                                            <p className="font-mono text-slate-800 font-bold">{activeCert.verificationCode}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Information cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Department</p>
                                        <p className="font-bold text-slate-700 text-xs sm:text-sm mt-1">{activeCert.employee?.department?.name || 'Global Risk'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Title</p>
                                        <p className="font-bold text-slate-700 text-xs sm:text-sm mt-1">{activeCert.employee?.title || 'Compliance Associate'}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
                                        <p className="font-bold text-emerald-600 text-xs sm:text-sm mt-1 flex items-center gap-1">
                                            <ShieldCheck className="h-4 w-4" /> {activeCert.verificationStatus}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Hidden off-screen certificate div for html2canvas generation ── */}
            {activeCert && (
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
                    <div style={{ height: "6px", background: "linear-gradient(to right, #4f46e5, #7c3aed, #a855f7)" }} />
                    <div style={{ padding: "48px 64px", textAlign: "center" }}>
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

                        <p style={{ fontSize: "11px", fontWeight: "700", color: "#4f46e5", textTransform: "uppercase", letterSpacing: "4px", marginBottom: "8px" }}>
                            Enterprise Certificate of Compliance
                        </p>
                        <h1 style={{ fontSize: "40px", fontWeight: "700", color: "#111827", margin: "0 0 6px 0", fontFamily: "Georgia, serif" }}>
                            {activeCert.employee?.user?.name || user?.name || "Allianz Employee"}
                        </h1>
                        <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 32px 0" }}>{activeCert.employee?.user?.email || user?.email}</p>

                        <div style={{ borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", padding: "28px 0", margin: "0 0 28px 0" }}>
                            <p style={{ fontSize: "14px", color: "#6b7280", margin: "0 0 8px 0" }}>has successfully satisfied all training modules and exams for the compliance track</p>
                            <h2 style={{ fontSize: "26px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" }}>
                                {formatTrack(activeCert.complianceTrack)}
                            </h2>
                            <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                                within <span style={{ fontWeight: "700", color: "#111827" }}>{activeCert.organization?.name || "Allianz Corp"}</span>
                            </p>
                        </div>

                        <div style={{ display: "flex", justifyContent: "center", gap: "48px", marginBottom: "28px" }}>
                            <div>
                                <p style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Issued On</p>
                                <p style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>{new Date(activeCert.issuedAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Status</p>
                                <p style={{ fontSize: "14px", fontWeight: "700", color: "#16a34a" }}>✓ Verified</p>
                            </div>
                            <div>
                                <p style={{ fontSize: "11px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Verification Standard</p>
                                <p style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>Dezai Core</p>
                            </div>
                        </div>

                        <div style={{
                            display: "inline-block", backgroundColor: "#f3f4f6", borderRadius: "12px",
                            padding: "10px 24px", marginBottom: "16px",
                        }}>
                            <p style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "2px", margin: "0 0 4px 0" }}>Verification Code</p>
                            <p style={{ fontSize: "15px", fontFamily: "monospace", fontWeight: "700", color: "#111827", letterSpacing: "2px", margin: 0 }}>
                                {activeCert.verificationCode}
                            </p>
                        </div>

                        <p style={{ fontSize: "11px", color: "#9ca3af" }}>
                            Verify at dezai.com/verify/{activeCert.verificationCode}
                        </p>
                    </div>
                    <div style={{ height: "4px", background: "linear-gradient(to right, #a855f7, #7c3aed, #4f46e5)" }} />
                </div>
            )}
        </div>
    );
}
