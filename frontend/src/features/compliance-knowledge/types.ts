export type ComplianceGeneratedContentType =
  | "SUMMARY"
  | "LESSON"
  | "FLASHCARD"
  | "ASSESSMENT";

export interface ComplianceDocument {
  id: string;
  organizationId: string;
  title: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  chunkCount: number;
  createdAt: string;
}

export interface ComplianceGeneratedContent {
  id: string;
  organizationId: string;
  documentId: string;
  type: ComplianceGeneratedContentType;
  title: string;
  content: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceCitation {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  chunkIndex: number;
  excerpt: string;
}

export interface UploadComplianceDocumentRequest {
  file: File;
  title?: string;
  organizationId?: string;
}

export interface ComplianceChatRequest {
  message: string;
  documentId?: string;
  activeProgramId?: string;
  activeModuleId?: string;
  activeLessonId?: string;
}

export interface ComplianceChatResponse {
  success: boolean;
  answer: string;
  citations: ComplianceCitation[];
}

export interface ComplianceDocumentsResponse {
  success: boolean;
  documents: ComplianceDocument[];
}

export interface ComplianceDocumentResponse {
  success: boolean;
  document: ComplianceDocument;
  generatedContent: ComplianceGeneratedContent[];
}

export interface UploadComplianceDocumentResponse
  extends ComplianceDocumentResponse {}

export interface RegenerateComplianceContentResponse {
  success: boolean;
  generatedContent: ComplianceGeneratedContent[];
}
