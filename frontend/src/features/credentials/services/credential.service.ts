import { Credential, CreateCredentialDto, UpdateCredentialStatusDto, VerifyStatus, CredentialType, CredentialTemplate } from '../types/credential.types';
import dummyData from '../dummy-credentials.json';

const API_BASE = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/credentials` 
    : 'http://localhost:3001/api/credentials';

// Removed Mock Templates for UI since we are connecting to real backend

export const CredentialService = {
    
    // 1. Verify API
    verify: async (code: string): Promise<{ valid: boolean; data?: Credential; message?: string }> => {
        const response = await fetch(`${API_BASE}/verify/${code}`);
        if (!response.ok) {
            return { valid: false, message: 'Invalid verification code or server error' };
        }
        return await response.json();
    },

    // 2. Student Credentials API
    getStudentCredentials: async (userId: string): Promise<Credential[]> => {
        const response = await fetch(`${API_BASE}/student/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch student credentials");
        return await response.json();
    },

    // 3. Issue Credential API
    issueCredential: async (data: CreateCredentialDto): Promise<Credential> => {
        const response = await fetch(`${API_BASE}/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to issue credential");
        return await response.json();
    },

    // 4. Update Credential Status API (Suspend/Revoke)
    updateCredentialStatus: async (id: string, status: VerifyStatus): Promise<Credential> => {
        const response = await fetch(`${API_BASE}/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error("Failed to update status");
        return await response.json();
    },

    // 5. Faculty - Get all credentials
    getAllCredentials: async (): Promise<Credential[]> => {
        // Assume API has /all route or similar. Using /all since dashboard needs it
        const response = await fetch(`${API_BASE}/all`);
        if (!response.ok) throw new Error("Failed to fetch all credentials");
        return await response.json();
    },

    // 6. PDF Download Helper
    getDownloadUrl: (credentialId: string) => {
        return async (): Promise<string> => {
            console.log("Generating branded PDF...");
            await new Promise(resolve => setTimeout(resolve, 2000));
            return `fake-pdf-file-url-for-credential-${credentialId}`;
        }
    },

    // 7. Template Fetching APIs
    getTemplates: async (): Promise<CredentialTemplate[]> => {
        const response = await fetch(`${API_BASE}/templates`);
        if (!response.ok) throw new Error("Failed to fetch templates");
        return await response.json();
    },

    getTemplatesByType: async (type: CredentialType): Promise<CredentialTemplate[]> => {
        const response = await fetch(`${API_BASE}/templates/${type}`);
        if (!response.ok) throw new Error("Failed to fetch templates by type");
        return await response.json();
    }
};