"use client";

import { useState } from 'react';
import { PageContainer } from '@/shared/components/page-container';
import { EmptyState } from '@/shared/components/empty-state';
import { Search, ShieldCheck, ShieldX, Loader2 } from 'lucide-react';
import { credentialService } from '../services/credential.service';
import { CredentialVerifyPage } from './CredentialVerifyPage';
import type { PublicCredential } from '../types/credential.types';

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
      setResult(response.credential);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credential not found');
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer className="py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="rounded-2xl bg-primary/10 p-4">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-on-surface">
          Verify a Credential
        </h1>
        <p className="text-on-surface-variant max-w-md mx-auto">
          Enter a verification code to check the authenticity of a Dezai.ai credential.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="max-w-lg mx-auto">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code (e.g., DZ-XXXX-XXXX)"
              className="w-full rounded-xl border border-border-light bg-surface pl-10 pr-4 py-3 text-sm text-on-surface placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Verify'
            )}
          </button>
        </div>
      </form>

      {/* Results */}
      {loading && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted">Looking up credential…</p>
        </div>
      )}

      {error && searched && !loading && (
        <EmptyState
          icon={ShieldX}
          title="Credential Not Found"
          description={error}
        />
      )}

      {result && !loading && (
        <div className="mt-6">
          <CredentialVerifyPage id={result.verificationCode} />
        </div>
      )}
    </PageContainer>
  );
}
