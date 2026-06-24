import React from 'react';
import { VerificationSearch } from '@/features/credentials/components/atomic/verification-search';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

export function PublicVerification() {
  return (
    <div className="min-h-screen bg-slate-50 relative py-24 px-4 sm:px-6 flex flex-col items-center">
      
      {/* Decorative ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto text-center mt-12 mb-24">
        
        {/* Recruiter Friendly Header */}
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 shadow-sm mb-8">
          <ShieldCheck className="w-4 h-4" /> Official Credential Registry
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          Verify an <span className="text-primary">Achievement</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed">
          Enter a credential ID or secure link below to instantly verify an official academic record through the Dezai Auth Network.
        </p>

        {/* Search Bar Component */}
        <div className="mb-20">
          <VerificationSearch />
        </div>

        {/* Bento Grid Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-left">
          
          <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Guaranteed Authentic</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Every credential is mathematically signed by the issuing institution, guaranteeing it has never been forged or altered.</p>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Instant Verification</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Skip the background checks. Instantly verify the authenticity of any candidate's certificate globally in milliseconds.</p>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 transition-transform">
              <Lock className="w-7 h-7 text-teal-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Tamper-Proof Data</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Backed by secure cryptographic infrastructure. If a single character on the credential changes, the system instantly flags it.</p>
          </div>

        </div>
      </div>
    </div>
  );
}
