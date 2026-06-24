"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useCredentials } from '@/features/credentials/hooks/useCredentials';
import { credentialsApiService } from '@/features/credentials/services/credentials-api.service';
import { ICredential } from '@/features/credentials/types/credential.types';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Download, Share2, ArrowLeft, Loader2, Award, ShieldCheck, ExternalLink, ShieldAlert, SearchX } from 'lucide-react';
import Link from 'next/link';

export function CredentialDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [credential, setCredential] = useState<ICredential | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      credentialsApiService.getCredentialById(id)
        .then(setCredential)
        .catch((err) => {
          console.error(err);
          setError(err.message || 'Credential not found');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !credential) {
    const isForbidden = error?.toLowerCase().includes('permission') || error?.toLowerCase().includes('forbidden');
    
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative backgrounds */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <Card className="max-w-md w-full relative z-10 border border-white/50 shadow-[0_20px_60px_-15px_rgba(220,38,38,0.1)] bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 text-center overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-rose-500 to-red-400"></div>
          
          <div className="w-20 h-20 mx-auto bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-8 shadow-inner border border-red-100">
             {isForbidden ? <ShieldAlert className="w-10 h-10" /> : <SearchX className="w-10 h-10" />}
          </div>
          
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
            {isForbidden ? "Access Denied" : "Asset Not Found"}
          </h2>
          
          <p className="text-slate-500 mb-10 leading-relaxed text-sm">
            {isForbidden 
              ? "You do not have the cryptographic permissions required to view this credential. If you believe this is an error, please contact your administrator." 
              : "We couldn't locate this credential in the blockchain ledger. It may have been removed or the ID is incorrect."}
          </p>
          
          <Link href="/credentials" className="inline-flex items-center justify-center w-full bg-slate-900 text-white hover:bg-slate-800 transition-all font-bold h-12 rounded-xl text-sm shadow-md">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to Dashboard
          </Link>
        </Card>
      </div>
    );
  }

  let metadata: any = {};
  if (credential.metadata) {
    try {
      metadata = JSON.parse(credential.metadata as string);
    } catch (e) {}
  }

  const studentName = metadata.studentName || credential.user?.name || credential.userId || 'Student';
  const programTitle = metadata.customTitle || credential.program?.title || 'Advanced Technical Program';
  const isActive = credential.verificationStatus === 'ACTIVE';

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
      pdf.save(`${studentName.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleLinkedInShare = () => {
    // CRITICAL BUG FIX: Always prioritize the `verificationUrl` returned securely from the backend. 
    // Do not revert to purely hardcoded links, as they will break if routing or domains change.
    const certUrl = credential.verificationUrl || `${window.location.origin}/credentials/verify/${credential.verificationCode}`;
    const url = new URL('https://www.linkedin.com/profile/add');
    url.searchParams.append('startTask', 'CERTIFICATION_NAME');
    url.searchParams.append('name', programTitle);
    url.searchParams.append('organizationName', 'Dezai Global');
    url.searchParams.append('issueYear', new Date(credential.issuedAt).getFullYear().toString());
    url.searchParams.append('issueMonth', (new Date(credential.issuedAt).getMonth() + 1).toString());
    url.searchParams.append('certUrl', certUrl);
    window.open(url.toString(), '_blank');
  };

  return (
    <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen relative">
      
      {/* Background glow effects to match the premium aesthetic */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -mr-96 -mt-96 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px] -ml-64 -mb-64 pointer-events-none"></div>
      <Link href="/credentials" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 overflow-x-auto pb-4">
          {/* Premium White Glass Certificate Card */}
          <div className="min-w-[850px] w-full">
            <div ref={certificateRef}>
              <Card className="overflow-hidden border border-white shadow-[0_12px_40px_rgb(0,0,0,0.08)] bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-0 relative aspect-[1.414/1]">
              
              {/* Subtle Noise Texture */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay pointer-events-none z-0"></div>
              
              {/* Technical Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none z-0"></div>
              
              {/* Top Blue Accent Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-blue-400 via-primary to-blue-400"></div>
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Asset ID</p>
                    <p className="text-sm font-mono font-bold text-slate-800 bg-white/80 border border-slate-100 shadow-sm px-3 py-1.5 rounded-md backdrop-blur-md">{credential.verificationCode}</p>
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
                      <p className="text-base font-bold text-slate-900">{new Date(credential.issuedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Achievement Tier</p>
                      <p className="text-base font-bold text-slate-900">{credential.tier}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            </div>
          </div>
        </div>

        {/* Sidebar Actions & Cryptography */}
        <div className="lg:col-span-4 flex flex-col gap-6 relative z-10">
          
          <Card className="p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl rounded-[2rem]">
            <h3 className="font-bold text-slate-900 mb-6 text-[11px] uppercase tracking-[0.2em]">Manage Credential</h3>
            <div className="space-y-4">
              <Button 
                onClick={handleDownloadPDF} 
                disabled={isExporting || !isActive}
                className={`w-full transition-all font-bold h-12 rounded-xl text-sm shadow-md ${isActive ? 'bg-primary text-white hover:bg-primary/90' : 'bg-slate-100 text-slate-400 opacity-70'}`}
              >
                {isExporting ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
                {isExporting ? 'Generating PDF...' : 'Download PDF'}
              </Button>
              <Button 
                onClick={handleLinkedInShare}
                disabled={!isActive}
                variant="outline" 
                className={`w-full backdrop-blur-sm transition-all font-bold h-12 rounded-xl text-sm ${isActive ? 'bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-400 opacity-70'}`}
              >
                <Share2 className="w-5 h-5 mr-2" /> Add to LinkedIn
              </Button>
              {!isActive && (
                <p className="text-center text-[10px] font-bold text-amber-600 mt-2">Downloads disabled for inactive credentials</p>
              )}
            </div>
          </Card>

          <Card className="p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/80 backdrop-blur-xl rounded-[2rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className={`w-12 h-12 bg-white/90 backdrop-blur-sm shadow-sm border ${isActive ? 'border-emerald-100 text-emerald-600' : 'border-amber-100 text-amber-600'} rounded-xl flex items-center justify-center shrink-0`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-[15px]">{isActive ? 'Blockchain Verified' : 'Status Warning'}</h4>
                <p className={`text-[11px] font-bold mt-0.5 ${isActive ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isActive ? 'Authenticity mathematically proven' : `Credential is currently ${credential.verificationStatus}`}
                </p>
              </div>
            </div>

            <div className="bg-white/90 shadow-sm rounded-xl p-5 border border-slate-100 relative z-10">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <ShieldCheck className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-amber-500'}`} />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">System Status</span>
                 </div>
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${isActive ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
                   {isActive ? 'Secured' : credential.verificationStatus}
                 </span>
              </div>
            </div>
            
            <div className="mt-4 relative z-10">
              <Link href={`/credentials/verify/${credential.verificationCode}`} target="_blank" className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white hover:bg-slate-800 transition-all font-bold h-12 rounded-xl text-sm shadow-md">
                View Public Record <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
