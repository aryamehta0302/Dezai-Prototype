"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCredentialStore } from '@/features/credential/store/credential-context';
import { Card, CardContent } from '@/features/credential/components/ui/card';
import { CheckCircle2, XCircle, ShieldAlert, ShieldCheck, Fingerprint, Ban } from 'lucide-react';
import { CredentialStatusBadge } from '@/features/credential/components/atomic/CredentialStatusBadge';

export default function PublicVerificationPage() {
  const params = useParams();
  const code = params?.verificationCode as string;
  const { verifyCredential } = useCredentialStore();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (code) {
      verifyCredential(code).then(res => {
        setResult(res);
        setLoading(false);
      });
    }
  }, [code, verifyCredential]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Verifying signature...</div>;
  }

  // TAMPERED OR NOT FOUND
  if (!result) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Verification Unsuccessful</h1>
            <p className="text-slate-500 text-lg">We could not authenticate this credential record.</p>
          </div>

          <Card className="overflow-hidden border-0 shadow-2xl ring-1 ring-red-100 bg-white rounded-3xl">
            <div className="grid grid-cols-1 md:grid-cols-5">
              
              <div className="md:col-span-2 bg-red-50 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-red-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full opacity-50 -mr-10 -mt-10 blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-rose-100 rounded-full opacity-50 -ml-8 -mb-8 blur-lg"></div>
                
                <div className="relative w-32 h-32 mb-6 z-10 mx-auto">
                  <div className="absolute inset-0 bg-white rounded-xl shadow-sm border border-red-200 transform -rotate-6 transition-transform hover:-rotate-12"></div>
                  <div className="absolute inset-0 bg-white rounded-xl shadow-md border border-red-200 flex flex-col items-center justify-center p-4 transform transition-transform hover:scale-105">
                    <div className="w-full h-2 bg-slate-100 rounded mb-2"></div>
                    <div className="w-3/4 h-2 bg-slate-100 rounded mb-4"></div>
                    <ShieldAlert className="w-12 h-12 text-red-500 mb-2" />
                    <div className="w-1/2 h-2 bg-red-100 rounded"></div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                    <div className="bg-red-500 text-white rounded-full p-1.5">
                      <XCircle className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-red-800 text-center relative z-10">Invalid Record</h2>
              </div>

              <div className="md:col-span-3 p-8 bg-white">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Diagnostic Details</h3>
                
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-6">
                  <p className="text-slate-600 text-sm leading-relaxed">
                    The digital signature does not match our secure ledger. This occurs if the document was <strong className="text-slate-800">tampered with</strong>, or the verification code is incorrect.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-50 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requested Code</span>
                    <span className="font-mono text-sm text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{code}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-50 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timestamp</span>
                    <span className="font-mono text-sm text-slate-600">{new Date().toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Status</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                      <ShieldAlert className="w-3.5 h-3.5" /> Authentication Denied
                    </span>
                  </div>
                </div>
              </div>
              
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // SUSPENDED STATE
  if (result.status === 'SUSPENDED') {
    return (
      <div className="w-full min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center">
        <div className="w-full max-w-2xl text-center mb-8">
          <ShieldAlert className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Credential Suspended</h1>
          <p className="text-slate-600">This credential has been temporarily frozen by the issuer.</p>
        </div>
        <Card className="w-full max-w-2xl p-6 bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800">The verification code <strong>{code}</strong> belongs to <strong>{result.studentName}</strong>, but it is currently under review or suspended. Please check back later or contact the institution.</p>
        </Card>
      </div>
    );
  }

  // REVOKED STATE
  if (result.status === 'REVOKED') {
    return (
      <div className="w-full min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center">
        <div className="w-full max-w-2xl text-center mb-8">
          <Ban className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Credential Removed</h1>
          <p className="text-slate-600">This credential has been permanently removed by the issuer.</p>
        </div>
        <Card className="w-full max-w-2xl p-6 bg-red-50 border-red-200">
          <p className="text-red-800">The credential record for verification code <strong>{code}</strong> was permanently removed/revoked by the issuing institution and is no longer valid.</p>
        </Card>
      </div>
    );
  }

  // PENDING/REJECTED STATE
  if (result.approvalStatus !== 'APPROVED') {
    return (
      <div className="w-full min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center">
        <div className="w-full max-w-2xl text-center mb-8">
          <ShieldAlert className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Credential Not Live</h1>
          <p className="text-slate-600">This credential has not yet been approved for public verification.</p>
        </div>
      </div>
    );
  }

  // VALID STATE (Professional Zomato/Flagship style)
  return (
    <div className="w-full min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-3xl min-w-[320px] animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold border border-emerald-200 shadow-sm mb-6">
            <ShieldCheck className="w-5 h-5" /> Verified by Dezai
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Authentic Credential Record</h1>
          <p className="text-lg text-slate-500">This cryptographic signature proves the authenticity of the academic record.</p>
        </div>

        <Card className="overflow-hidden border-0 shadow-2xl ring-1 ring-slate-200/60 bg-white rounded-3xl">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-emerald-400 rounded-full opacity-30 blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-teal-400 rounded-full opacity-30 blur-2xl pointer-events-none"></div>
            
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-1 ring-white/50">
              <CheckCircle2 className="w-10 h-10 text-white drop-shadow-md" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Digital Signature Verified</h2>
            <p className="text-emerald-50 font-medium tracking-wide">The integrity of this document is intact.</p>
          </div>
          
          <CardContent className="p-8 sm:p-12 bg-white">
            <div className="text-center mb-12">
              <p className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase mb-2">Awarded To</p>
              <p className="text-3xl sm:text-4xl font-serif italic text-slate-900 font-medium">{result.studentName}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-b border-slate-100 py-8 mb-8">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Achievement</p>
                <p className="font-medium text-slate-800 text-lg">
                  {result.type === 'MERIT' ? result.details.awardTitle : 'Program Completion'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Tier</p>
                <p className="font-medium text-slate-800 text-lg">{result.tier}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Issue Date</p>
                <p className="font-medium text-slate-800 text-lg">{new Date(result.issueDate).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Status</p>
                <div>
                  <CredentialStatusBadge approvalStatus="APPROVED" verificationStatus={result.status} />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                <Fingerprint className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 overflow-hidden w-full">
                <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-1">SHA-256 Checksum</p>
                <p className="font-mono text-xs sm:text-sm text-slate-700 truncate w-full" title={result.hashSignature}>
                  {result.hashSignature}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
