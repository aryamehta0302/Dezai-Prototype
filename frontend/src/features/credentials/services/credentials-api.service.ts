import { apiClient } from '@/core/api/client';
import { 
  ICredential, 
  IGenerateProgramCredentialDto, 
  IGenerateAssessmentCredentialDto 
} from '../types/credential.types';

class CredentialsApiService {
  private basePath = '/credentials';

  // --- Verification Services (Public & Auth) ---
  
  async verifyCredential(idOrCode: string): Promise<ICredential> {
    return await apiClient.get<ICredential>(`${this.basePath}/verify/${idOrCode}`);
  }

  // --- Generation Services ---

  async generateProgramCredential(data: IGenerateProgramCredentialDto): Promise<ICredential> {
    return await apiClient.post<ICredential>(`${this.basePath}/generate/program`, data);
  }

  async generateAssessmentCredential(data: IGenerateAssessmentCredentialDto): Promise<ICredential> {
    return await apiClient.post<ICredential>(`${this.basePath}/generate/assessment`, data);
  }



  // --- Student Specific ---

  async getMyCredentials(): Promise<ICredential[]> {
    // Assuming backend endpoint /credentials/me or similar exists
    // For now, if there is no /me, we might have to use a generic fetch with userId
    return await apiClient.get<ICredential[]>(`${this.basePath}/me`);
  }

  async getCredentialById(id: string): Promise<ICredential> {
    return await apiClient.get<ICredential>(`${this.basePath}/${id}`);
  }
}

export const credentialsApiService = new CredentialsApiService();
