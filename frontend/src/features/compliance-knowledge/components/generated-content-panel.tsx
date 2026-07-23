"use client";

import type React from "react";
import { BookOpen, Layers3, ListChecks, RefreshCw } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { useRegenerateComplianceContent } from "../hooks/useComplianceKnowledge";
import type {
  ComplianceGeneratedContent,
  ComplianceGeneratedContentType,
} from "../types";

interface GeneratedContentPanelProps {
  documentId: string;
  items: ComplianceGeneratedContent[];
}

const labels: Record<ComplianceGeneratedContentType, string> = {
  SUMMARY: "Summary",
  LESSON: "Lesson",
  FLASHCARD: "Flashcards",
  ASSESSMENT: "Assessment",
};

const icons: Record<ComplianceGeneratedContentType, React.ReactNode> = {
  SUMMARY: <ListChecks className="h-4 w-4" />,
  LESSON: <BookOpen className="h-4 w-4" />,
  FLASHCARD: <Layers3 className="h-4 w-4" />,
  ASSESSMENT: <ListChecks className="h-4 w-4" />,
};

export function GeneratedContentPanel({
  documentId,
  items,
}: GeneratedContentPanelProps) {
  const regenerateMutation = useRegenerateComplianceContent(documentId);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Generated Content</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => regenerateMutation.mutate(undefined)}
          disabled={regenerateMutation.isPending}
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </Button>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id} className="rounded-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2">
                  {icons[item.type]}
                  {item.title}
                </span>
                <Badge variant="outline">{labels[item.type]}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ContentPreview content={item.content} />
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <div className="rounded-lg border border-dashed bg-background p-8 text-sm text-muted-foreground">
            Generated lessons, summaries, flashcards, and assessments will appear
            after a policy PDF is uploaded.
          </div>
        )}
      </div>
    </div>
  );
}

function ContentPreview({ content }: { content: unknown }) {
  if (Array.isArray(content)) {
    return (
      <div className="space-y-2">
        {content.slice(0, 5).map((item, index) => (
          <div key={index} className="rounded-md bg-muted/50 p-3">
            <JsonBlock value={item} />
          </div>
        ))}
      </div>
    );
  }

  if (content && typeof content === "object") {
    return (
      <div className="space-y-3">
        {Object.entries(content as Record<string, unknown>).map(
          ([key, value]) => (
            <section key={key} className="space-y-1">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground">
                {key.replace(/([A-Z])/g, " $1")}
              </h3>
              <JsonBlock value={value} />
            </section>
          ),
        )}
      </div>
    );
  }

  return <p className="whitespace-pre-wrap text-sm">{String(content ?? "")}</p>;
}

function JsonBlock({ value }: { value: unknown }) {
  if (Array.isArray(value)) {
    return (
      <ul className="space-y-1 text-sm">
        {value.map((item, index) => (
          <li key={index}>{renderInline(item)}</li>
        ))}
      </ul>
    );
  }

  if (value && typeof value === "object") {
    return (
      <pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs text-slate-50">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return <p className="whitespace-pre-wrap text-sm">{renderInline(value)}</p>;
}

function renderInline(value: unknown) {
  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value ?? "");
}
