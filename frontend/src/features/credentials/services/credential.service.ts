import { Credential, CreateCredentialDto, UpdateCredentialStatusDto, VerifyStatus, CredentialType, CredentialTemplate } from '../types/credential.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/credentials` 
    : 'http://localhost:3001/api/credentials';

export const CredentialService = {
    
    verify: async (code: string): Promise<{ valid: boolean; data?: Credential; message?: string }> => {
        const response = await fetch(`${API_BASE}/verify/${code}`);
        if (!response.ok) {
            return { valid: false, message: 'Invalid verification code or server error' };
        }
        return await response.json();
    },

    getStudentCredentials: async (userId: string): Promise<Credential[]> => {
        const response = await fetch(`${API_BASE}/student/${userId}`);
        if (!response.ok) throw new Error("Failed to fetch student credentials");
        const json = await response.json();
        return json.credentials ?? json;
    },

    issueCredential: async (data: CreateCredentialDto): Promise<Credential> => {
        const response = await fetch(`${API_BASE}/issue`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error("Failed to issue credential");
        const json = await response.json();
        return json.credential ?? json;
    },

    updateCredentialStatus: async (id: string, status: VerifyStatus): Promise<Credential> => {
        const response = await fetch(`${API_BASE}/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error("Failed to update status");
        const json = await response.json();
        return json.credential ?? json;
    },

    getAllCredentials: async (): Promise<Credential[]> => {
        const response = await fetch(`${API_BASE}/all`);
        if (!response.ok) throw new Error("Failed to fetch all credentials");
        const json = await response.json();
        return json.credentials ?? json;
    },

    getDownloadUrl: (credentialId: string) => {
        return async (): Promise<string> => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return `fake-pdf-file-url-for-credential-${credentialId}`;
        }
    },

    getTemplates: async (): Promise<CredentialTemplate[]> => {
        const response = await fetch(`${API_BASE}/templates`);
        if (!response.ok) throw new Error("Failed to fetch templates");
        const json = await response.json();
        return json.templates ?? json;
    },

    getTemplatesByType: async (type: CredentialType): Promise<CredentialTemplate[]> => {
        const response = await fetch(`${API_BASE}/templates/${type}`);
        if (!response.ok) throw new Error("Failed to fetch templates by type");
        const json = await response.json();
        return json.templates ?? json;
    }
};

export const credentialService = {
    ...CredentialService,
    getMyCredentials: async (userId?: string) => {
        if (!userId) {
            try {
                const { useAuthStore } = await import("@/lib/stores/auth.store");
                const state = useAuthStore.getState();
                userId = state.user?.id;
            } catch {
                userId = "";
            }
        }
        if (!userId) return { credentials: [] };
        const credentials = await CredentialService.getStudentCredentials(userId);
        return { credentials };
    },
    verifyCredential: async (code: string) => {
        const response = await CredentialService.verify(code);
        if (!response.valid) {
            throw new Error(response.message || "Credential not found");
        }
        return { credential: response.data || null };
    },
};
