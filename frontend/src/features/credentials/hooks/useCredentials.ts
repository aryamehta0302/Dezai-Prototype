"use client";

import { useState, useEffect } from 'react';
import { credentialService } from '../services/credential.service';
import type { Credential } from '../types/credential.types';

export function useCredentials() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCredentials() {
      try {
        setLoading(true);
        const response = await credentialService.getMyCredentials();
        setCredentials(response.credentials);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load credentials');
      } finally {
        setLoading(false);
      }
    }
    fetchCredentials();
  }, []);

  return { credentials, loading, error };
}
