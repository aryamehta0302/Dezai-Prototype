import { apiClient } from "@/core/api/client";
import { CredentialResponse } from "../types/credentials.types";
import { ApiResponse } from "@/shared/types/common.types";

export const credentialsService = {
  /**
   * Fetches the logged-in student's credentials.
   */
  getStudentCredentials: async (): Promise<CredentialResponse[]> => {
    const res = await apiClient.get<ApiResponse<CredentialResponse[]>>("/credentials/student");
    return res.data;
  },

  /**
   * Public endpoint to verify a credential by its code.
   */
  verifyCredential: async (code: string): Promise<CredentialResponse> => {
    const res = await apiClient.get<{ success: boolean; credential: CredentialResponse }>(`/credentials/verify/${code}`);
    return res.credential;
  },

  /**
   * Claims a credential for a completed program.
   */
  claimCredential: async (programId: string): Promise<CredentialResponse> => {
    const res = await apiClient.post<{ success: boolean; credential: CredentialResponse }>("/credentials/claim", {
      programId,
    });
    return res.credential;
  },

  /**
   * Fetches specific credential details by database ID.
   */
  getCredentialDetails: async (id: string): Promise<CredentialResponse> => {
    const res = await apiClient.get<{ success: boolean; credential: CredentialResponse }>(`/credentials/${id}`);
    return res.credential;
  },
};
