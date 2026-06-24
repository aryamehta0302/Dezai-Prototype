import React from 'react';
import { Card, CardContent } from '@/shared/ui/card';
import { ICredential, CredentialTier } from '@/features/credentials/types/credential.types';
import { Award, ShieldCheck, ArrowRight, Calendar, Fingerprint } from 'lucide-react';
import Link from 'next/link';

interface CredentialCardProps {
  credential: ICredential;
}

export function CredentialCard({ credential }: CredentialCardProps) {
  const isCitadel = credential.tier === CredentialTier.CITADEL;
  const isActive = credential.verificationStatus === 'ACTIVE';

  let metadata: any = {};
  if (credential.metadata) {
    try {
      metadata = JSON.parse(credential.metadata as string);
    } catch (e) {}
  }
  const programTitle = metadata.customTitle || credential.program?.title || 'Program Completion';

  return (
    <Link href={`/credentials/${credential.id}`} className="block h-full group">
      {/* Exact Bento Card Aesthetic from Verification Page */}
      <Card className="h-full border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white rounded-[2rem] relative overflow-hidden flex flex-col transition-all duration-300 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1">
        
        {/* Subtle Ambient Glow (like the verification bento cards) */}
        <div className={`absolute top-0 right-0 w-64 h-64 ${isCitadel ? 'bg-amber-500/10' : 'bg-primary/5'} rounded-full blur-[60px] -mr-20 -mt-20 pointer-events-none transition-transform duration-500 group-hover:scale-110`}></div>
        
        {/* Top Header Block */}
        <div className="p-6 sm:p-8 relative z-10 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm ring-1 ${isCitadel ? 'bg-amber-50 text-amber-600 ring-amber-200' : 'bg-primary/5 text-primary ring-primary/20'}`}>
                <Award className="w-6 h-6" />
             </div>
             <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-slate-900 text-sm">Official Record</h3>
                  {isActive && (
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium tracking-wide">Dezai Auth Network</p>
             </div>
          </div>
          
          <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase border ${isCitadel ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-primary/5 text-primary border-primary/20'}`}>
            {credential.tier}
          </div>
        </div>

        {/* Main Content Area */}
        <CardContent className="p-6 sm:p-8 flex-1 flex flex-col relative z-10">
          
          <div className="mb-auto">
            <h2 className="text-xl font-extrabold text-slate-900 leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {programTitle}
            </h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2">
              Cryptographically secured academic credential. Authenticity mathematically proven via blockchain.
            </p>
          </div>

          {/* Bottom Bento Sub-block */}
          <div className="mt-8 bg-slate-50 rounded-2xl p-4 border border-slate-100 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Issued On</span>
              </div>
              <span className="text-sm font-bold text-slate-900">{new Date(credential.issuedAt).toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-200/60">
               <div className="flex items-center gap-2">
                 <ShieldCheck className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-500' : 'text-amber-500'}`} />
                 <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-emerald-700' : 'text-amber-700'}`}>
                   {isActive ? 'Secured Asset' : credential.verificationStatus}
                 </span>
               </div>
               <ArrowRight className="w-4 h-4 text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </div>
          </div>

        </CardContent>
      </Card>
    </Link>
  );
}
