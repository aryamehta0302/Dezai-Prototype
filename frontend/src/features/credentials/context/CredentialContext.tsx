"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Credential, CredentialTemplate, CredentialType, CreateCredentialDto, VerifyStatus } from '../types/credential.types';
import { CredentialService } from '../services/credential.service';

interface CredentialContextState {
    credentials: Credential[];
    templates: CredentialTemplate[];
    isLoading: boolean;
    error: string | null;

    fetchStudentCredentials: (userId: string) => Promise<void>;
    fetchAllCredentials: () => Promise<void>;
    fetchTemplates: (type?: CredentialType) => Promise<void>;
    issueCredential: (data: CreateCredentialDto) => Promise<void>;
    changeStatus: (id: string, status: VerifyStatus) => Promise<void>;
}

const CredentialContext = createContext<CredentialContextState | undefined>(undefined);

export function CredentialProvider({ children }: { children: React.ReactNode }) {
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [templates, setTemplates] = useState<CredentialTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStudentCredentials = useCallback(async (userId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await CredentialService.getStudentCredentials(userId);
            setCredentials(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch credentials');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchAllCredentials = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await CredentialService.getAllCredentials();
            setCredentials(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch all credentials');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchTemplates = useCallback(async (type?: CredentialType) => {
        try {
            const data = type
                ? await CredentialService.getTemplatesByType(type)
                : await CredentialService.getTemplates();
            setTemplates(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch templates');
        }
    }, []);

    const issueCredential = useCallback(async (data: CreateCredentialDto) => {
        setIsLoading(true);
        try {
            const newCred = await CredentialService.issueCredential(data);
            setCredentials(prev => [newCred, ...prev]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to issue credential');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const changeStatus = useCallback(async (id: string, status: VerifyStatus) => {
        try {
            const updated = await CredentialService.updateCredentialStatus(id, status);
            setCredentials(prev => prev.map(c => c.id === id ? updated : c));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update status');
            throw err;
        }
    }, []);

    return (
        <CredentialContext.Provider value={{
            credentials,
            templates,
            isLoading,
            error,
            fetchStudentCredentials,
            fetchAllCredentials,
            fetchTemplates,
            issueCredential,
            changeStatus
        }}>
            {children}
        </CredentialContext.Provider>
    );
}

export function useCredentialContext() {
    const context = useContext(CredentialContext);
    if (context === undefined) {
        throw new Error('useCredentialContext must be used within a CredentialProvider');
    }
    return context;
}
