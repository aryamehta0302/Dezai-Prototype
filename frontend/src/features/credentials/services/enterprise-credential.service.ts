import { apiClient } from '@/core/api/client';

const BASE = '/api/enterprise-credentials';

export interface EnterpriseCredential {
    id: string;
    employeeId: string;
    organizationId: string;
    complianceAssessmentId?: string;
    complianceTrack: string;
    verificationCode: string;
    qrCodeUrl?: string;
    verificationUrl: string;
    verificationStatus: 'ACTIVE' | 'REVOKED' | 'SUSPENDED';
    issuedAt: string;
    employee?: {
        id: string;
        title?: string;
        user: { id: string; name: string; email: string };
        department?: { id: string; name: string };
    };
    organization?: { id: string; name: string; logoUrl?: string };
    complianceAssessment?: { id: string; title: string };
    template?: { id: string; name: string; designUrl?: string };
}

export interface SearchParams {
    query?: string;
    status?: string;
    track?: string;
    departmentId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

export const EnterpriseCredentialService = {
    verify: async (code: string): Promise<{ valid: boolean; data?: EnterpriseCredential; message?: string; status?: string; tampered?: boolean }> => {
        try {
            return await apiClient.get<any>(`${BASE}/verify/${code}`);
        } catch {
            return { valid: false, message: 'Invalid verification code or server error' };
        }
    },

    getMyCredentials: async (): Promise<EnterpriseCredential[]> => {
        const res = await apiClient.get<{ success: boolean; credentials: EnterpriseCredential[] }>(`${BASE}/employee/me`);
        return res.credentials ?? [];
    },

    getEmployeeCredentials: async (employeeId: string): Promise<EnterpriseCredential[]> => {
        const res = await apiClient.get<{ success: boolean; credentials: EnterpriseCredential[] }>(`${BASE}/employee/${employeeId}`);
        return res.credentials ?? [];
    },

    updateCredentialStatus: async (id: string, status: string, reason?: string): Promise<EnterpriseCredential> => {
        const res = await apiClient.patch<{ success: boolean; credential: EnterpriseCredential }>(`${BASE}/${id}/status`, { status, reason });
        return res.credential;
    },

    batchStatusUpdate: async (ids: string[], status: string, reason?: string): Promise<{ updated: number; status: string }> => {
        return await apiClient.post<any>(`${BASE}/batch-status`, { ids, status, reason });
    },

    getTemplates: async (organizationId?: string): Promise<any[]> => {
        const url = organizationId ? `${BASE}/templates?organizationId=${organizationId}` : `${BASE}/templates`;
        const res = await apiClient.get<{ success: boolean; templates: any[] }>(url);
        return res.templates ?? [];
    },

    getAnalytics: async (organizationId?: string): Promise<any> => {
        const url = organizationId ? `${BASE}/analytics?organizationId=${organizationId}` : `${BASE}/analytics`;
        return await apiClient.get<any>(url);
    },

    search: async (params: SearchParams, organizationId?: string): Promise<{ data: EnterpriseCredential[]; total: number; page: number; limit: number; totalPages: number }> => {
        const queryParams = new URLSearchParams();
        if (organizationId) queryParams.set('organizationId', organizationId);
        if (params.query) queryParams.set('query', params.query);
        if (params.status) queryParams.set('status', params.status);
        if (params.track) queryParams.set('track', params.track);
        if (params.departmentId) queryParams.set('departmentId', params.departmentId);
        if (params.dateFrom) queryParams.set('dateFrom', params.dateFrom);
        if (params.dateTo) queryParams.set('dateTo', params.dateTo);
        if (params.page) queryParams.set('page', params.page.toString());
        if (params.limit) queryParams.set('limit', params.limit.toString());
        return await apiClient.get<any>(`${BASE}/search?${queryParams.toString()}`);
    },

    getDetails: async (id: string): Promise<EnterpriseCredential> => {
        const res = await apiClient.get<{ success: boolean; credential: EnterpriseCredential }>(`${BASE}/${id}`);
        return res.credential;
    }
};
