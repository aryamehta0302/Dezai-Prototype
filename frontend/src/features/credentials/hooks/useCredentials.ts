import { useState, useCallback } from 'react';
import { credentialsApiService } from '@/features/credentials/services/credentials-api.service';
import { 
  ICredential, 
  IGenerateProgramCredentialDto,
  IGenerateAssessmentCredentialDto
} from '@/features/credentials/types/credential.types';

/**
 * React hook for managing the state and logic of credential verification.
 * Used on public verification pages to cryptographically verify a credential's authenticity.
 * 
 * @returns Object containing the verify function, loading state, error state, and the resulting credential data.
 */
export function useCredentialVerification() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ICredential | null>(null);

  /**
   * Calls the backend verification API to recalculate the hash signature and check validity.
   * @param code The public verification code to check.
   */
  const verify = useCallback(async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await credentialsApiService.verifyCredential(code);
      setResult(data);
      return data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed');
      setResult(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { verify, loading, error, result };
}

/**
 * React hook for managing a student's personal credential lifecycle.
 * Provides functions for fetching, generating, and tracking credentials.
 * 
 * @returns Object containing lifecycle states and generation/fetching functions.
 */
export function useCredentials() {
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<ICredential[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchMyCredentials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Mocking fetch or assuming backend handles /me
      const data = await credentialsApiService.getMyCredentials();
      setCredentials(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch credentials');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateProgram = useCallback(async (data: IGenerateProgramCredentialDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await credentialsApiService.generateProgramCredential(data);
      setCredentials(prev => [...prev, result]);
      return result;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate credential');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);



  return { 
    loading, 
    error, 
    credentials, 
    fetchMyCredentials,
    generateProgram
  };
}
