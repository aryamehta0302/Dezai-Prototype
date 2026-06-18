import { apiClient } from '@/core/api/client';
import type { Credential, PublicCredential } from '../types/credential.types';

export const credentialService = {
  getMyCredentials: () =>
    apiClient.get<{ success: boolean; credentials: Credential[] }>('/credentials/my'),

  getCredentialById: (id: string) =>
    apiClient.get<{ success: boolean; credential: Credential }>(`/credentials/${id}`),

  verifyCredential: (code: string) =>
    apiClient.get<{ success: boolean; credential: PublicCredential }>(`/credentials/verify/${code}`),

  issueCredential: (dto: {
    userId: string;
    programId: string;
    institutionId: string;
    tier: string;
    metadata?: string;
  }) =>
    apiClient.post<{ success: boolean; credential: Credential }>('/credentials', dto),

  updateStatus: (id: string, status: string) =>
    apiClient.patch<{ success: boolean; credential: Credential }>(`/credentials/${id}/status`, { status }),
};
