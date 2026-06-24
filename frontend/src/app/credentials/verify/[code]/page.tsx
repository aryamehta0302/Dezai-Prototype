"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useCredentialVerification } from '@/features/credentials/hooks/useCredentials';
import { Card, CardContent } from '@/shared/ui/card';
import { CheckCircle2, XCircle, ShieldAlert, ShieldCheck, Fingerprint, Ban, ArrowLeft, Sparkles, Search, Download, Loader2, Award } from 'lucide-react';
import { CredentialStatusBadge } from '@/features/credentials/components/atomic/credential-status-badge';
import { Button } from '@/shared/ui/button';
import Link from 'next/link';

export default function PublicVerificationResultPage() {
  const params = useParams();
  const code = params?.code as string;
  const { verify, loading, result, error } = useCredentialVerification();
  const [isExporting, setIsExporting] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (code) {
      verify(code);
    }
  }, [code, verify]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse flex flex-col items-center"><ShieldCheck className="w-12 h-12 text-muted mb-4" />Verifying signature...</div></div>;
  }

  // TAMPERED OR NOT FOUND
  if (error || !result) {
    return (
      <div className="w-full min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8 relative">
        <Link href="/credentials/verify" className="absolute top-8 left-8 text-muted-foreground hover:text-foreground inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" /> Search Again
        </Link>
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-foreground mb-2">Verification Unsuccessful</h1>
            <p className="text-muted-foreground text-lg">We could not authenticate this credential record.</p>
          </div>

          <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-destructive/10 bg-white rounded-[2rem]">
            <div className="grid grid-cols-1 md:grid-cols-5">
              <div className="md:col-span-2 bg-gradient-to-br from-destructive/5 to-destructive/10 p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-destructive/10 relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-destructive/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative w-28 h-28 mb-6 z-10 mx-auto">
                  <div className="absolute inset-0 bg-surface rounded-xl shadow-md border border-destructive/30 flex flex-col items-center justify-center p-4 transform transition-transform hover:scale-105">
                    <ShieldAlert className="w-12 h-12 text-destructive mb-2" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-surface rounded-full p-1 shadow-lg">
                    <div className="bg-destructive text-destructive-foreground rounded-full p-1.5">
                      <XCircle className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-destructive text-center relative z-10">Invalid Record</h2>
              </div>

              <div className="md:col-span-3 p-10 bg-white">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Diagnostic Details</h3>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-8">
                  <p className="text-slate-600 text-sm leading-relaxed">
                    The digital signature does not match our secure ledger. {error || "Record not found."}
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requested Code</span>
                    <span className="font-mono text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-md break-all">{code}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const verificationData = result as any;

  // SUSPENDED STATE
  if (verificationData.status === 'SUSPENDED') {
    return (
      <div className="w-full min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center justify-center">
        <Link href="/credentials/verify" className="absolute top-8 left-8 text-slate-400 hover:text-slate-900 inline-flex items-center font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Search Again
        </Link>
        <Card className="w-full max-w-lg p-10 border border-amber-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none"></div>
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-amber-200 relative z-10">
            <ShieldAlert className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4 relative z-10">Credential Suspended</h1>
          <p className="text-slate-500 font-medium leading-relaxed relative z-10">The verification code <strong className="text-slate-700">{code}</strong> is currently under review or has been temporarily suspended by the issuer.</p>
        </Card>
      </div>
    );
  }

  // REVOKED STATE
  if (verificationData.status === 'REVOKED') {
    return (
      <div className="w-full min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center justify-center">
        <Link href="/credentials/verify" className="absolute top-8 left-8 text-slate-400 hover:text-slate-900 inline-flex items-center font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" /> Search Again
        </Link>
        <Card className="w-full max-w-lg p-10 border border-red-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none"></div>
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-red-200 relative z-10">
            <Ban className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4 relative z-10">Credential Revoked</h1>
          <p className="text-slate-500 font-medium leading-relaxed relative z-10">The credential record for verification code <strong className="text-slate-700">{code}</strong> was permanently removed or revoked by the issuing institution.</p>
        </Card>
      </div>
    );
  }

  // VALID STATE (Side-by-Side Bento Layout)
  const studentName = verificationData?.studentName || result?.user?.name || result?.userId || 'Student';
  const programTitle = verificationData?.details?.customTitle || result?.program?.title || 'Program Completion';
  
  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);
    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');
      
      const dataUrl = await toPng(certificateRef.current, {
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      // Standard A4 Landscape aspect ratio
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (certificateRef.current.offsetHeight * pdfWidth) / certificateRef.current.offsetWidth;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${studentName.replace(/\s+/g, '_')}_Verified_Certificate.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      
      <div className="max-w-7xl mx-auto mb-8">
        <Link href="/credentials/verify" className="inline-flex items-center text-slate-500 hover:text-slate-900 font-bold transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Search Again
        </Link>
      </div>

      <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-sm mb-4">
              <ShieldCheck className="w-4 h-4" /> Verified Authentic
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">Credential Record</h1>
          </div>
          <div className="text-left sm:text-right">
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Asset ID</p>
             <p className="text-sm font-mono font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">{code}</p>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end mb-8">
          <Button 
            onClick={handleDownloadPDF} 
            disabled={isExporting}
            className="bg-primary text-white hover:bg-primary/90 transition-all font-bold h-12 rounded-xl text-sm shadow-md px-6"
          >
            {isExporting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
            {isExporting ? 'Generating Document...' : 'Download Verified Certificate'}
          </Button>
        </div>

        {/* Visual Certificate Card */}
        <div className="mb-12 overflow-x-auto pb-4">
          <div className="min-w-[850px] w-full">
            <div ref={certificateRef}>
              <Card className="overflow-hidden border border-white shadow-[0_12px_40px_rgb(0,0,0,0.08)] bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-0 relative aspect-[1.414/1]">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none z-0"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none z-0"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-emerald-400 via-primary to-emerald-400"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-24 bg-primary/20 blur-[40px] pointer-events-none z-0"></div>
                
                <div className="p-16 relative z-10 flex flex-col h-full justify-center">
                  <div className="flex justify-between items-start mb-16">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/90 shadow-sm border border-white backdrop-blur-md text-primary rounded-2xl flex items-center justify-center">
                        <Award className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">Dezai Global</h4>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">Verified Issuer</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Blockchain ID</p>
                      <p className="text-sm font-mono font-bold text-slate-800 bg-white/80 border border-slate-100 shadow-sm px-3 py-1.5 rounded-md backdrop-blur-md">{code}</p>
                    </div>
                  </div>

                  <div className="max-w-2xl mt-auto mb-auto">
                    <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
                      Certificate of Completion
                    </h1>
                    
                    <p className="text-lg text-slate-500 font-medium mb-2">This is to certify that</p>
                    <h2 className="text-4xl font-bold text-slate-900 mb-8 break-words">
                      {studentName}
                    </h2>
                    
                    <p className="text-lg text-slate-500 font-medium mb-2">has successfully completed</p>
                    <h3 className="text-3xl font-bold text-primary mb-12 break-words">
                      {programTitle}
                    </h3>

                    <div className="grid grid-cols-2 gap-8 border-t border-slate-200/50 pt-8 mt-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Date Issued</p>
                        <p className="text-base font-bold text-slate-900">{verificationData.issueDate ? new Date(verificationData.issueDate).toLocaleDateString() : 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Achievement Tier</p>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black bg-slate-900 text-white uppercase tracking-widest">
                          {result.tier}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* BENTO GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* MAIN BENTO BLOCK: The Certificate (Left Side) */}
          <div className="xl:col-span-7 flex flex-col">
            <Card className="overflow-hidden border-0 shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white rounded-[2rem] flex flex-col relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-success/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
              
              <div className="bg-success/5 p-8 sm:p-10 border-b border-slate-100 flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center shrink-0 shadow-sm ring-1 ring-success/20">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Official Document</h2>
                  <p className="text-slate-500 font-medium text-sm mt-1">Recorded by Dezai Auth Network.</p>
                </div>
              </div>
              
              <CardContent className="p-8 sm:p-10 flex-1 flex flex-col justify-center relative z-10">
                <div className="mb-12">
                  <p className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase mb-3">Awarded To</p>
                  <p className="text-4xl sm:text-5xl font-serif italic text-slate-900 font-medium break-words">
                    {verificationData.studentName || result.user?.name || result.userId || 'Student'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-slate-100 pt-8 mt-auto">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Achievement</p>
                    <p className="font-bold text-slate-900 text-lg leading-tight">
                      {verificationData.details?.customTitle || result.program?.title || 'Program Completion'}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Tier</p>
                    <p className="font-bold text-slate-900 text-lg">{result.tier}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Issue Date</p>
                    <p className="font-bold text-slate-900 text-lg">{verificationData.issueDate ? new Date(verificationData.issueDate).toLocaleDateString() : 'Unknown Date'}</p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Status</p>
                    <div>
                      <CredentialStatusBadge approvalStatus={result.approvalStatus} verificationStatus={verificationData.status} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SIDE BENTO BLOCKS: Security & AI (Right Side) */}
          <div className="xl:col-span-5 flex flex-col gap-6 lg:gap-8">
            
            {/* Security Block */}
            <Card className="p-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">Digital Ledger</h3>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Signature Verified</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                This document is mathematically signed. We have cryptographically verified that it has not been altered or forged since issuance.
              </p>
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Status</span>
                 <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Secure</span>
              </div>
            </Card>

            {/* AI Coming Soon Block */}
            <Card className="border border-slate-200 shadow-md bg-white rounded-[2rem] relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none"></div>
              
              <div className="p-8 relative z-10 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-extrabold text-slate-900">AI Matcher</h3>
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold tracking-widest uppercase border border-primary/20">Coming Soon</span>
                </div>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Stop reading transcripts. Our AI instantly analyzes the candidate's complete portfolio to find your exact match.
                </p>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-inner mt-auto">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2.5 flex items-start gap-2 mb-4">
                    <Search className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 font-medium italic leading-relaxed">"Does this student have experience managing background logic?"</p>
                  </div>
                  
                  <div className="pl-4 relative">
                    <div className="absolute left-[0.4rem] top-0 bottom-2 w-px bg-slate-200"></div>
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 relative">
                      <div className="absolute -left-[1.05rem] top-3 w-3 h-3 bg-white border-2 border-primary rounded-full z-10"></div>
                      <div className="mb-1">
                        <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Excellent Match</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        Yes. The candidate successfully deployed scalable background worker services during their Track.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
