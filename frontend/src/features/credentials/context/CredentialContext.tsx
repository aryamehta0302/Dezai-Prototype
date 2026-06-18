"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Credential, CredentialTemplate, CredentialType, CreateCredentialDto, VerifyStatus } from '../types/credential.types';
import { CredentialService } from '../services/credential.service';

interface CredentialContextState {
    credentials: Credential[];
    templates: CredentialTemplate[];
    isLoading: boolean;
    error: string | null;
    
    // Actions
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

    const fetchStudentCredentials = async (userId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            // Future API Call: await fetch(`/api/credentials/student/${userId}`)
            const data = await CredentialService.getStudentCredentials(userId);
            setCredentials(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch credentials');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllCredentials = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Future API Call: await fetch(`/api/credentials/all`)
            const data = await CredentialService.getAllCredentials();
            setCredentials(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch all credentials');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTemplates = async (type?: CredentialType) => {
        try {
            // Future API Call: await fetch(`/api/credentials/templates${type ? `/${type}` : ''}`)
            const data = type 
                ? await CredentialService.getTemplatesByType(type)
                : await CredentialService.getTemplates();
            setTemplates(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch templates');
        }
    };

    const issueCredential = async (data: CreateCredentialDto) => {
        setIsLoading(true);
        try {
            // Future API Call: await fetch(`/api/credentials/issue`, { method: 'POST', body: JSON.stringify(data) })
            const newCred = await CredentialService.issueCredential(data);
            setCredentials(prev => [newCred, ...prev]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to issue credential');
            throw err; // Re-throw to handle in UI components
        } finally {
            setIsLoading(false);
        }
    };

    const changeStatus = async (id: string, status: VerifyStatus) => {
        try {
            // Future API Call: await fetch(`/api/credentials/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
            const updated = await CredentialService.updateCredentialStatus(id, status);
            setCredentials(prev => prev.map(c => c.id === id ? updated : c));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update status');
            throw err;
        }
    };

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
