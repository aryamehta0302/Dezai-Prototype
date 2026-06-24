"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCredentials } from '@/features/credentials/hooks/useCredentials';
import { CredentialTier } from '@/features/credentials/types/credential.types';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Loader2, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

interface GenerationViewProps {
  type: 'program' | 'assessment';
  id: string; // The programId or assessmentId
  userId: string;
}

export function GenerationView({ type, id, userId }: GenerationViewProps) {
  const { generateProgram, loading, error } = useCredentials();
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const handleGenerate = async () => {
    try {
      if (type === 'program') {
        const result = await generateProgram({
          userId,
          programId: id,
          tier: CredentialTier.FORGE // Default or could be passed down
        });
        setSuccess(true);
        setTimeout(() => {
          router.push(`/credentials/${result.id}`);
        }, 2000);
      }
    } catch (e: any) {
      // CRITICAL BUG FIX: The backend now auto-generates credentials. If the user hits this page,
      // the backend returns a 400 "already generated" error. We catch it and cleanly redirect 
      // them to their dashboard instead of failing silently. Do not remove this error handling.
      if (e.response?.data?.message?.includes('already generated')) {
        router.push('/credentials');
      }
    }
  };

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto mt-20 p-12 text-center bg-emerald-50 border-emerald-200">
        <ShieldCheck className="w-20 h-20 text-emerald-500 mx-auto mb-6 animate-pulse" />
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Credential Secured!</h2>
        <p className="text-emerald-700 font-medium">Your cryptographic credential has been successfully generated and recorded. Redirecting...</p>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-20 px-4">
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-blue-100 rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Zap className="w-10 h-10 text-blue-600 -rotate-12" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Claim Your Credential</h1>
        <p className="text-lg text-slate-500">
          You've successfully completed the eligibility requirements. Generate your immutable certificate now to add it to your secure digital vault.
        </p>
      </div>

      <Card className="p-8 sm:p-12 border-0 shadow-2xl ring-1 ring-slate-100 rounded-3xl bg-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-emerald-400"></div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <Button 
          onClick={handleGenerate} 
          disabled={loading}
          size="lg"
          className="w-full sm:w-auto text-lg px-12 py-8 rounded-full bg-slate-900 hover:bg-slate-800 hover:scale-105 transition-all shadow-xl hover:shadow-slate-900/20"
        >
          {loading ? (
            <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Minting Credential...</>
          ) : (
            <>Generate My Credential <ArrowRight className="w-6 h-6 ml-3" /></>
          )}
        </Button>
        <p className="mt-6 text-sm text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Backed by Dezai Cryptographic Verification
        </p>
      </Card>
    </div>
  );
}
