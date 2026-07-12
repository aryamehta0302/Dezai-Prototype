"use client";

import { useState } from "react";
import { FileUp, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { useUploadComplianceDocument } from "../hooks/useComplianceKnowledge";
import type { ComplianceDocument } from "../types";

interface ComplianceDocumentUploadProps {
  onUploaded: (document: ComplianceDocument) => void;
}

export function ComplianceDocumentUpload({
  onUploaded,
}: ComplianceDocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const uploadMutation = useUploadComplianceDocument();

  const handleUpload = async () => {
    if (!file) return;
    try {
      const result = await uploadMutation.mutateAsync({
        file,
        title: title.trim() || undefined,
      });
      toast.success("Document uploaded and training content generated");
      setFile(null);
      setTitle("");
      onUploaded(result.document);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not upload the compliance document",
      );
    }
  };

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="h-4 w-4" />
          Upload Policy PDF
        </CardTitle>
        <CardDescription>
          Add company policy or SOP documents for grounded AI content.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Document title"
        />
        <Input
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        <Button
          type="button"
          onClick={handleUpload}
          disabled={!file || uploadMutation.isPending}
          className="w-full"
        >
          <Upload className="h-4 w-4" />
          {uploadMutation.isPending ? "Generating..." : "Upload"}
        </Button>
      </CardContent>
    </Card>
  );
}
