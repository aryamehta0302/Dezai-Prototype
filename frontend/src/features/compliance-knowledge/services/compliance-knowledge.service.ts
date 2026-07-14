import { apiClient } from "@/core/api/client";
import type {
  ComplianceChatRequest,
  ComplianceChatResponse,
  ComplianceDocumentResponse,
  ComplianceDocumentsResponse,
  ComplianceGeneratedContentType,
  RegenerateComplianceContentResponse,
  UploadComplianceDocumentRequest,
  UploadComplianceDocumentResponse,
} from "../types";

export const complianceKnowledgeApi = {
  listDocuments: (organizationId?: string) =>
    apiClient.get<ComplianceDocumentsResponse>("/ai-mentor/compliance/documents", {
      params: organizationId ? { organizationId } : undefined,
    }),

  getDocument: (documentId: string) =>
    apiClient.get<ComplianceDocumentResponse>(
      `/ai-mentor/compliance/documents/${documentId}`,
    ),

  uploadDocument: ({
    file,
    title,
    organizationId,
  }: UploadComplianceDocumentRequest) => {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);
    if (organizationId) formData.append("organizationId", organizationId);

    return apiClient.post<UploadComplianceDocumentResponse>(
      "/ai-mentor/compliance/documents",
      formData,
    );
  },

  regenerateContent: (
    documentId: string,
    type?: ComplianceGeneratedContentType,
  ) =>
    apiClient.post<RegenerateComplianceContentResponse>(
      `/ai-mentor/compliance/documents/${documentId}/generate`,
      type ? { type } : {},
    ),

  chat: (data: ComplianceChatRequest) =>
    apiClient.post<ComplianceChatResponse>("/ai-mentor/compliance/chat", data),
};
