"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { assessmentAttemptService } from "../../assessments/services/assessment-attempt.service";
import { AttemptResult } from "../../assessments/types/assessment.types";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface AssessmentReviewProps {
  slug: string;
  assessmentId: string;
}

export function AssessmentReview({ slug, assessmentId }: AssessmentReviewProps) {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const { session } = useAuth();
  const token = session?.accessToken;

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      if (!token || !attemptId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await assessmentAttemptService.getAttemptResult(attemptId, token);
        setResult(data);
      } catch (err) {
        console.error("Failed to load attempt result:", err);
        const message = err instanceof Error ? err.message : "Failed to load attempt details";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [attemptId, token]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted">Loading question reviews...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mx-auto mb-4 text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold">Review Details Not Found</h2>
        <p className="text-muted mt-2">Could not retrieve details for the specified attempt ID.</p>
        <Link href={`/programs/${slug}`} className="mt-6 inline-block">
          <Button>Back to Program</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <Link href={`/programs/${slug}/assessment/${assessmentId}/results?attemptId=${attemptId}`}>
            <Button variant="ghost" size="sm" className="gap-2 rounded-xl">
              <ArrowLeft className="h-4 w-4" /> Back to Results
            </Button>
          </Link>
          <div className="h-6 w-px bg-border/40" />
          <div>
            <h1 className="text-lg font-bold text-on-surface">Review Answers</h1>
            <p className="text-xs text-muted mt-0.5">{result.assessmentTitle}</p>
          </div>
        </div>

        <div className="text-right">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            result.passed ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"
          }`}>
            {result.score}% Score
          </span>
        </div>
      </div>

      {/* Questions Breakdown List */}
      <div className="space-y-6">
        {result.breakdown.map((item, idx) => {
          const isAnswerCorrect = item.isCorrect;
          const isUnanswered = !item.selectedOptionId;

          return (
            <Card
              key={item.questionId}
              className={`p-6 border transition-all duration-300 rounded-2xl ${
                isUnanswered
                  ? "border-border/60 bg-surface/50"
                  : isAnswerCorrect
                  ? "border-green-500/20 bg-green-500/5 shadow-xs"
                  : "border-red-500/20 bg-red-500/5 shadow-xs"
              }`}
            >
              <div className="space-y-4">
                {/* Header indicators */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    Question {idx + 1}
                  </span>

                  <div className="flex items-center gap-2">
                    {isUnanswered ? (
                      <Badge variant="secondary" className="bg-slate-200 text-slate-700">
                        Unanswered
                      </Badge>
                    ) : isAnswerCorrect ? (
                      <Badge className="bg-green-500/20 text-green-600 border border-green-500/10 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Correct
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="bg-red-500/20 text-red-600 border border-red-500/10 flex items-center gap-1">
                        <XCircle className="h-3 w-3" /> Incorrect
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="text-base font-bold text-on-surface leading-snug">
                  {item.text}
                </h3>

                {/* Shuffled Options rendering */}
                <div className="space-y-2.5 pt-1">
                  {item.options.map((opt) => {
                    const isSelected = item.selectedOptionId === opt.id;
                    const isCorrectOption = item.correctOptionId === opt.id;

                    let optionStyle = "border-border/60 bg-surface/50 text-on-surface-variant";
                    let checkIcon = null;

                    if (isCorrectOption) {
                      // Correct option is always highlighted green in review screen
                      optionStyle = "border-green-500 bg-green-500/10 text-on-surface font-semibold shadow-xs";
                      checkIcon = <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />;
                    } else if (isSelected) {
                      // If user selected this and it's not correct, highlight red
                      optionStyle = "border-red-500 bg-red-500/10 text-on-surface font-semibold";
                      checkIcon = <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-sm transition-colors ${optionStyle}`}
                      >
                        <span className="font-medium">{opt.text}</span>
                        {checkIcon}
                      </div>
                    );
                  })}
                </div>

                {/* Conceptual Explanation Block */}
                <div className="mt-4 p-4 bg-surface-variant/10 border border-border/20 rounded-xl flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">
                      Explanation
                    </p>
                    <p className="text-xs text-muted leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-center pt-4 border-t border-border/40">
        <Link href={`/programs/${slug}/assessment/${assessmentId}/results?attemptId=${attemptId}`}>
          <Button size="lg" className="rounded-xl px-8">
            Return to Results
          </Button>
        </Link>
      </div>
    </div>
  );
}
