"use client";

import { useState, useEffect } from 'react';
import { credentialService } from '../services/credential.service';
import type { PublicCredential } from '../types/credential.types';

export function useCredentialVerify(code: string) {
  const [credential, setCredential] = useState<PublicCredential | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    async function verify() {
      try {
        setLoading(true);
        setError(null);
        const response = await credentialService.verifyCredential(code);
        setCredential(response.credential);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Credential not found');
        setCredential(null);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [code]);

  return { credential, loading, error };
}
