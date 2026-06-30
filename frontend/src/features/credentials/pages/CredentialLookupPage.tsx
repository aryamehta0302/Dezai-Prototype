"use client";

import { useState } from 'react';
import { PageContainer } from '@/shared/components/page-container';
import { EmptyState } from '@/shared/components/empty-state';
import { Search, ShieldCheck, ShieldX, Loader2, GraduationCap, Award, AlertTriangle } from 'lucide-react';
import { credentialService } from '../services/credential.service';
import { VerificationPortal } from './VerificationPortal';
import type { PublicCredential } from '../types/credential.types';
import { cn } from '@/shared/utils/cn';

export function CredentialLookupPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicCredential | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setSearched(true);
      const response = await credentialService.verifyCredential(trimmed);
      if (response.valid && response.credential) {
        setResult(response.credential);
      } else {
        setError(response.message || 'Credential not found');
        setResult(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credential not found');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 space-y-10">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-on-surface">
              Dezai<span className="text-primary">.ai</span>
            </span>
          </div>
          <h1 className="text-3xl font-bold text-on-surface">
            Verify a Credential
          </h1>
          <p className="text-muted max-w-md mx-auto">
            Enter a verification code to check the authenticity of a Dezai credential.
            All credentials are cryptographically secured and tamper-proof.
          </p>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-3xl p-6 shadow-level-1 border border-border-light relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-emerald-500 to-teal-600" />

            <form onSubmit={handleSearch} className="flex gap-3 pl-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Enter verification code"
                  className="w-full rounded-xl border border-border-light bg-neutral-50 pl-10 pr-4 py-3 text-sm font-mono uppercase text-on-surface placeholder:text-muted placeholder:normal-case focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shrink-0"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Verify'
                )}
              </button>
            </form>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted">Looking up credential in Dezai Trust Network...</p>
          </div>
        )}

        {error && searched && !loading && (
          <div className="max-w-xl mx-auto">
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center shadow-level-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mx-auto mb-4">
                <ShieldX className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">Verification Failed</h3>
              <p className="text-muted">{error}</p>
              <button
                onClick={() => { setCode(''); setSearched(false); }}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Try another code
              </button>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="border-t border-border-light pt-10">
            <VerificationPortal code={result.verificationCode} />
          </div>
        )}
      </div>
    </div>
  );
}
