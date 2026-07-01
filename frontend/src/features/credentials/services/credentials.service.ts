import { apiClient } from "@/core/api/client";
import { CredentialResponse } from "../types/credentials.types";
import { ApiResponse } from "@/shared/types/common.types";

export const credentialsService = {
  /**
   * Fetches the logged-in student's credentials.
   */
  getStudentCredentials: async (): Promise<CredentialResponse[]> => {
    const res = await apiClient.get<{ success: boolean; credentials: CredentialResponse[] }>("/api/credentials/student");
    return res.credentials;
  },

  /**
   * Public endpoint to verify a credential by its code.
   */
  verifyCredential: async (code: string): Promise<CredentialResponse> => {
    const res = await apiClient.get<{ success: boolean; credential: CredentialResponse }>(`/api/credentials/verify/${code}`);
    return res.credential;
  },

  /**
   * Claims a credential for a completed program.
   */
  claimCredential: async (programId: string): Promise<CredentialResponse> => {
    const res = await apiClient.post<{ success: boolean; credential: CredentialResponse }>("/api/credentials/claim", {
      programId,
    });
    return res.credential;
  },

  /**
   * Fetches specific credential details by database ID.
   */
  getCredentialDetails: async (id: string): Promise<CredentialResponse> => {
    const res = await apiClient.get<{ success: boolean; credential: CredentialResponse }>(`/api/credentials/${id}`);
    return res.credential;
  },

  /**
   * Fetches credential analytics.
   */
  getCredentialAnalytics: async (): Promise<any> => {
    return await apiClient.get<any>("/api/credentials/analytics");
  },
};
