"use client";

import { useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { useComplianceChat } from "../hooks/useComplianceKnowledge";
import type { ComplianceCitation } from "../types";

interface ComplianceChatPanelProps {
  documentId?: string;
}

interface ComplianceTurn {
  question: string;
  answer: string;
  citations: ComplianceCitation[];
}

export function ComplianceChatPanel({ documentId }: ComplianceChatPanelProps) {
  const [message, setMessage] = useState("");
  const [turns, setTurns] = useState<ComplianceTurn[]>([]);
  const chatMutation = useComplianceChat();

  const handleSend = async () => {
    const question = message.trim();
    if (!question) return;
    setMessage("");

    try {
      const response = await chatMutation.mutateAsync({
        message: question,
        documentId,
      });
      setTurns((current) => [
        ...current,
        {
          question,
          answer: response.answer,
          citations: response.citations,
        },
      ]);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Compliance chat could not answer right now",
      );
    }
  };

  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Compliance Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
          {turns.map((turn, index) => (
            <div key={`${turn.question}-${index}`} className="space-y-2">
              <div className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                {turn.question}
              </div>
              <div className="rounded-lg border bg-background px-3 py-2 text-sm">
                <p className="whitespace-pre-wrap">{turn.answer}</p>
                {turn.citations.length > 0 && (
                  <div className="mt-3 space-y-2 border-t pt-3">
                    {turn.citations.map((citation) => (
                      <div
                        key={citation.chunkId}
                        className="rounded-md bg-muted/60 p-2 text-xs text-muted-foreground"
                      >
                        <div className="font-medium text-foreground">
                          {citation.documentTitle} · chunk{" "}
                          {citation.chunkIndex + 1}
                        </div>
                        <div className="mt-1 line-clamp-3">
                          {citation.excerpt}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {turns.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              Ask about an uploaded company document. Answers are constrained to
              retrieved policy/SOP excerpts.
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Ask a policy or SOP question"
            className="min-h-11 resize-none"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() || chatMutation.isPending}
            aria-label="Send compliance question"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
