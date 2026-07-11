import { useState, useEffect, useCallback } from 'react';
import { CredentialService } from '../services/credential.service';
import { EnterpriseCredentialService } from '../services/enterprise-credential.service';
import { Credential } from '../types/credential.types';

export const useVerification = (code: string | undefined) => {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<{ valid: boolean; data?: any; message?: string; status?: string; tampered?: boolean; isEnterprise?: boolean } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchVerification = useCallback(async () => {
        if (!code) return;

        setLoading(true);
        setError(null);
        try {
            // 1. Try University verification first
            const data = await CredentialService.verify(code);
            if (data.valid && data.data) {
                setResult({ ...data, isEnterprise: false });
                return;
            }

            // 2. Try Enterprise verification fallback
            const entData = await EnterpriseCredentialService.verify(code);
            if (entData.valid && entData.data) {
                setResult({ ...entData, isEnterprise: true });
                return;
            }

            // If both fail, set error from university or enterprise
            setResult({ valid: false, message: entData.message || data.message || 'Invalid verification code' });
            setError(entData.message || data.message || 'Invalid verification code');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Network error. Try again later.';
            setError(message);
            setResult({ valid: false, message });
        } finally {
            setLoading(false);
        }
    }, [code]);

    useEffect(() => {
        fetchVerification();
    }, [fetchVerification]);

    return { loading, result, error, refetch: fetchVerification };
};