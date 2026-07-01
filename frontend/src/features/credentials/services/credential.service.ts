import { Credential, CreateCredentialDto, UpdateCredentialStatusDto, VerifyStatus, CredentialType, CredentialTemplate } from '../types/credential.types';
import { apiClient } from '@/core/api/client';

export const CredentialService = {
    
    verify: async (code: string): Promise<{ valid: boolean; data?: Credential; message?: string }> => {
        try {
            const response = await apiClient.get<{ valid: boolean; data?: Credential; message?: string }>(`/credentials/verify/${code}`);
            return response;
        } catch (error) {
            return { valid: false, message: 'Invalid verification code or server error' };
        }
    },

    getStudentCredentials: async (userId: string): Promise<Credential[]> => {
        const response = await apiClient.get<{ credentials: Credential[] }>(`/credentials/student/${userId}`);
        return response.credentials;
    },

    issueCredential: async (data: CreateCredentialDto): Promise<Credential> => {
        const response = await apiClient.post<{ credential: Credential }>('/credentials/issue', data);
        return response.credential;
    },

    updateCredentialStatus: async (id: string, status: VerifyStatus): Promise<Credential> => {
        const response = await apiClient.patch<{ credential: Credential }>(`/credentials/${id}/status`, { status });
        return response.credential;
    },

    getAllCredentials: async (): Promise<Credential[]> => {
        const response = await apiClient.get<{ credentials: Credential[] }>('/credentials/all');
        return response.credentials;
    },

    getDownloadUrl: (credentialId: string) => {
        return async (): Promise<string> => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return `fake-pdf-file-url-for-credential-${credentialId}`;
        }
    },

    getTemplates: async (): Promise<CredentialTemplate[]> => {
        const response = await apiClient.get<{ templates: CredentialTemplate[] }>('/credentials/templates');
        return response.templates;
    },

    getTemplatesByType: async (type: CredentialType): Promise<CredentialTemplate[]> => {
        const response = await apiClient.get<{ templates: CredentialTemplate[] }>(`/credentials/templates/${type}`);
        return response.templates;
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
