import { Credential, CreateCredentialDto, UpdateCredentialStatusDto, VerifyStatus, CredentialType, CredentialTemplate, CredentialSearchParams, SearchResult, ActivityFeedResult, EnhancedAnalytics } from '../types/credential.types';
import { apiClient } from '@/core/api/client';

const BASE = '/api/credentials';

export const CredentialService = {

    verify: async (code: string): Promise<{ valid: boolean; data?: Credential; message?: string; status?: VerifyStatus; tampered?: boolean }> => {
        try {
            const res = await apiClient.get<any>(`${BASE}/verify/${code}`);
            return res;
        } catch {
            return { valid: false, message: 'Invalid verification code or server error' };
        }
    },

    getStudentCredentials: async (userId: string): Promise<Credential[]> => {
        const res = await apiClient.get<{ success: boolean; credentials: Credential[] }>(`${BASE}/student/${userId}`);
        return res.credentials ?? [];
    },

    issueCredential: async (data: CreateCredentialDto): Promise<Credential> => {
        const res = await apiClient.post<{ success: boolean; credential: Credential }>(`${BASE}/issue`, data);
        return res.credential;
    },

    updateCredentialStatus: async (id: string, status: VerifyStatus, reason?: string): Promise<Credential> => {
        const res = await apiClient.patch<{ success: boolean; credential: Credential }>(`${BASE}/${id}/status`, { status, reason });
        return res.credential;
    },

    getAllCredentials: async (): Promise<Credential[]> => {
        const res = await apiClient.get<{ success: boolean; credentials: Credential[] }>(`${BASE}/all`);
        return res.credentials ?? [];
    },

    getCredentialAnalytics: async (): Promise<any> => {
        return await apiClient.get<any>(`${BASE}/analytics`);
    },

    getDownloadUrl: (credentialId: string) => {
        return async (): Promise<string> => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return `fake-pdf-file-url-for-credential-${credentialId}`;
        }
    },

    getTemplates: async (): Promise<CredentialTemplate[]> => {
        const res = await apiClient.get<{ success: boolean; templates: CredentialTemplate[] }>(`${BASE}/templates`);
        return res.templates ?? [];
    },

    getTemplatesByType: async (type: CredentialType): Promise<CredentialTemplate[]> => {
        const res = await apiClient.get<{ success: boolean; templates: CredentialTemplate[] }>(`${BASE}/templates/${type}`);
        return res.templates ?? [];
    },

    getAuditHistory: async (id: string): Promise<{
        credentialId: string;
        verificationCode: string;
        currentStatus: string;
        issuedAt: string;
        statusHistory: Array<{ status: string; changedBy: string; reason: string; date: string }>;
        statusReason: string | null;
    }> => {
        const res = await apiClient.get<any>(`${BASE}/${id}/audit`);
        return res;
    },

    getStats: async (): Promise<{
        total: number;
        active: number;
        revoked: number;
        suspended: number;
        monthlyTrend: Array<{ month: string; count: number }>;
    }> => {
        const res = await apiClient.get<any>(`${BASE}/stats`);
        return res;
    },

    search: async (params: CredentialSearchParams): Promise<SearchResult> => {
        const queryParams = new URLSearchParams();
        if (params.query) queryParams.set('query', params.query);
        if (params.status) queryParams.set('status', params.status);
        if (params.tier) queryParams.set('tier', params.tier);
        if (params.programId) queryParams.set('programId', params.programId);
        if (params.issuerId) queryParams.set('issuerId', params.issuerId);
        if (params.institutionId) queryParams.set('institutionId', params.institutionId);
        if (params.dateFrom) queryParams.set('dateFrom', params.dateFrom);
        if (params.dateTo) queryParams.set('dateTo', params.dateTo);
        if (params.page) queryParams.set('page', params.page.toString());
        if (params.limit) queryParams.set('limit', params.limit.toString());
        const res = await apiClient.get<any>(`${BASE}/search?${queryParams.toString()}`);
        return res;
    },

    batchStatusUpdate: async (ids: string[], status: VerifyStatus, reason?: string): Promise<{ updated: number; status: string }> => {
        const res = await apiClient.post<any>(`${BASE}/batch-status`, { ids, status, reason });
        return res;
    },

    getActivity: async (limit?: number, offset?: number): Promise<ActivityFeedResult> => {
        const queryParams = new URLSearchParams();
        if (limit) queryParams.set('limit', limit.toString());
        if (offset) queryParams.set('offset', offset.toString());
        const res = await apiClient.get<any>(`${BASE}/activity?${queryParams.toString()}`);
        return res;
    },

    getEnhancedAnalytics: async (): Promise<EnhancedAnalytics> => {
        const res = await apiClient.get<any>(`${BASE}/enhanced-analytics`);
        return res;
    },
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
        return {
            credential: response.data || null,
            valid: response.valid,
            status: response.status,
            message: response.message
        };
    },
};
