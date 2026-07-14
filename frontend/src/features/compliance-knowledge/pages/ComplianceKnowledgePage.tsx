"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { ComplianceChatPanel } from "../components/compliance-chat-panel";
import { ComplianceDocumentUpload } from "../components/compliance-document-upload";
import { GeneratedContentPanel } from "../components/generated-content-panel";
import {
  useComplianceDocument,
  useComplianceDocuments,
} from "../hooks/useComplianceKnowledge";
import type { ComplianceDocument } from "../types";

export function ComplianceKnowledgePage() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null,
  );
  const documentsQuery = useComplianceDocuments();
  const documentQuery = useComplianceDocument(selectedDocumentId);
  const documents = documentsQuery.data?.documents ?? [];
  const selectedDocument = documentQuery.data?.document;
  const generatedContent = documentQuery.data?.generatedContent ?? [];

  useEffect(() => {
    if (!selectedDocumentId && documents.length > 0) {
      setSelectedDocumentId(documents[0].id);
    }
  }, [documents, selectedDocumentId]);

  const handleUploaded = (document: ComplianceDocument) => {
    setSelectedDocumentId(document.id);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">
            AI Knowledge & Compliance Engine
          </h1>
          <p className="text-sm text-muted-foreground">
            Convert company PDFs into grounded training and compliance answers.
          </p>
        </div>
        <Badge variant="outline">{documents.length} documents</Badge>
      </header>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="space-y-4">
          <ComplianceDocumentUpload onUploaded={handleUploaded} />
          <Card className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {documents.map((document) => (
                <Button
                  key={document.id}
                  type="button"
                  variant={
                    document.id === selectedDocumentId ? "secondary" : "ghost"
                  }
                  className="h-auto w-full justify-start whitespace-normal rounded-lg px-3 py-2 text-left"
                  onClick={() => setSelectedDocumentId(document.id)}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {document.title}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {document.chunkCount} chunks ·{" "}
                      {Math.round(document.sizeBytes / 1024)} KB
                    </span>
                  </span>
                </Button>
              ))}
              {!documentsQuery.isLoading && documents.length === 0 && (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Upload a policy or SOP PDF to begin.
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        <section className="space-y-4">
          {selectedDocument ? (
            <>
              <div className="rounded-lg border bg-background p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedDocument.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedDocument.fileName} ·{" "}
                      {selectedDocument.chunkCount} extracted chunks
                    </p>
                  </div>
                  <Badge variant="secondary">Document grounded</Badge>
                </div>
              </div>
              <GeneratedContentPanel
                documentId={selectedDocument.id}
                items={generatedContent}
              />
              <ComplianceChatPanel documentId={selectedDocument.id} />
            </>
          ) : (
            <div className="rounded-lg border border-dashed bg-background p-10 text-center text-sm text-muted-foreground">
              Select or upload a compliance document.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
