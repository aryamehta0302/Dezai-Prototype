import { useState, useEffect } from 'react';
import { CredentialService } from '../services/credential.service';
import { Credential } from '../types/credential.types';

export const useVerification = (code: string | undefined) => {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<{ valid: boolean; data?: Credential; message?: string } | null>(null);

    useEffect(() => {
        if (!code) return;

        let isMounted = true;
        const fetchVerification = async () => {
            setLoading(true);
            try {
                const data = await CredentialService.verify(code);
                if (isMounted) setResult(data);
            } catch (error) {
                if (isMounted) setResult({ valid: false, message: 'Network error. Try again later.' });
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchVerification();

        return () => { isMounted = false; }; // Cleanup memory leaks
    }, [code]);

    return { loading, result };
};