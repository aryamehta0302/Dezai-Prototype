import { useState, useEffect, useCallback } from 'react';
import { CredentialService } from '../services/credential.service';
import { Credential } from '../types/credential.types';

export const useVerification = (code: string | undefined) => {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<{ valid: boolean; data?: Credential; message?: string; status?: string; tampered?: boolean } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchVerification = useCallback(async () => {
        if (!code) return;

        setLoading(true);
        setError(null);
        try {
            const data = await CredentialService.verify(code);
            setResult(data);
            if (!data.valid && !data.data) {
                setError(data.message || 'Invalid verification code');
            }
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