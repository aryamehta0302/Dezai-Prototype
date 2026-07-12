import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { complianceKnowledgeApi } from "../services/compliance-knowledge.service";
import type {
  ComplianceChatRequest,
  ComplianceGeneratedContentType,
  UploadComplianceDocumentRequest,
} from "../types";

const QUERY_KEYS = {
  documents: (organizationId?: string) => [
    "compliance-knowledge",
    "documents",
    organizationId ?? "current",
  ],
  document: (documentId: string) => [
    "compliance-knowledge",
    "document",
    documentId,
  ],
};

export const useComplianceDocuments = (organizationId?: string) =>
  useQuery({
    queryKey: QUERY_KEYS.documents(organizationId),
    queryFn: () => complianceKnowledgeApi.listDocuments(organizationId),
    staleTime: 30000,
  });

export const useComplianceDocument = (documentId?: string | null) =>
  useQuery({
    queryKey: documentId ? QUERY_KEYS.document(documentId) : [],
    queryFn: () =>
      documentId
        ? complianceKnowledgeApi.getDocument(documentId)
        : Promise.resolve(null),
    enabled: !!documentId,
    staleTime: 30000,
  });

export const useUploadComplianceDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadComplianceDocumentRequest) =>
      complianceKnowledgeApi.uploadDocument(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["compliance-knowledge"] });
      queryClient.setQueryData(
        QUERY_KEYS.document(data.document.id),
        data,
      );
    },
  });
};

export const useRegenerateComplianceContent = (documentId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (type?: ComplianceGeneratedContentType) =>
      complianceKnowledgeApi.regenerateContent(documentId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.document(documentId),
      });
    },
  });
};

export const useComplianceChat = () =>
  useMutation({
    mutationFn: (data: ComplianceChatRequest) => complianceKnowledgeApi.chat(data),
  });
