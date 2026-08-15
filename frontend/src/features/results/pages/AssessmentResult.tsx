"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { assessmentAttemptService } from "../../assessments/services/assessment-attempt.service";
import { AttemptHistoryTable } from "../../assessments/components/AttemptHistoryTable";
import { AssessmentResultSkeleton } from "../../assessments/components/AssessmentSkeleton";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Trophy, XCircle, ArrowRight, RotateCcw } from "lucide-react";

interface AssessmentResultProps {
  slug: string;
  assessmentId: string;
}

export function AssessmentResult({ slug, assessmentId }: AssessmentResultProps) {
  const searchParams = useSearchParams();
  const submittedAttemptId = searchParams.get("attemptId");
  const { session } = useAuth();
  const token = session?.accessToken;

  const { data: attemptStatus, isFetching: statusFetching } = useQuery({
    queryKey: ["assessments", "attempt-status", assessmentId],
    queryFn: () => assessmentAttemptService.getAttemptStatus(assessmentId, token!),
    enabled: !!token,
    staleTime: 0,
    refetchInterval: (query) => {
      // Poll until we see data when we just submitted
      if (submittedAttemptId && !query.state.data?.attemptsUsed) return 3000;
      return false;
    },
  });

  const { data: history = [], isLoading: historyLoading, isFetching: historyFetching } = useQuery({
    queryKey: ["assessments", "history", assessmentId],
    queryFn: async () => {
      const res = await assessmentAttemptService.getAttemptHistory(assessmentId, token!);
      return res.attempts;
    },
    enabled: !!token,
    staleTime: 0,
    refetchInterval: (query) => {
      // Poll until we see the attempt we just submitted
      if (submittedAttemptId && query.state.data?.length === 0) return 3000;
      return false;
    },
  });

  if (historyLoading) {
    return <AssessmentResultSkeleton />;
  }

  // Just submitted but data hasn't arrived yet — keep loading
  if (submittedAttemptId && history.length === 0 && (statusFetching || historyFetching)) {
    return <AssessmentResultSkeleton />;
  }

  const bestScore = attemptStatus?.bestPercentage ?? attemptStatus?.bestScore;
  const everPassed = attemptStatus?.everPassed;
  const attemptsUsed = (attemptStatus?.maxAttempts ?? 0) - (attemptStatus?.attemptsRemaining ?? 0);
  const canRetry = !everPassed && (attemptStatus?.attemptsRemaining ?? 0) > 0;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      {/* Summary Banner */}
      <div
        className={`rounded-3xl p-8 text-center space-y-6 border shadow-md ${
          everPassed
            ? "bg-linear-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20"
            : history.length > 0
            ? "bg-linear-to-br from-red-500/10 via-red-500/5 to-transparent border-red-500/20"
            : "bg-linear-to-br from-primary/10 via-primary/5 to-transparent border-primary/20"
        }`}
      >
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full mx-auto ${
            everPassed ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          }`}
        >
          {everPassed ? (
            <Trophy className="h-10 w-10 text-green-500 animate-bounce" />
          ) : (
            <XCircle className="h-10 w-10 text-red-500" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-on-surface">
            {everPassed ? "Congratulations!" : history.length > 0 ? "Keep Trying!" : "Assessment Results"}
          </h1>
          <p className="text-muted max-w-md mx-auto">
            {everPassed
              ? "You successfully cleared the assessment and advanced in your learning journey!"
              : history.length > 0
              ? "Review your results below and try again."
              : "Complete the assessment to see your results here."}
          </p>
        </div>

        {bestScore !== null && bestScore !== undefined && (
          <div className="flex items-center justify-center gap-8 pt-4">
            <div className="text-center">
              <p className={`text-4xl font-extrabold ${everPassed ? "text-green-500" : "text-red-500"}`}>
                {bestScore}%
              </p>
              <p className="text-xs text-muted font-medium uppercase tracking-wider mt-1">Best Score</p>
            </div>
            <div className="h-12 w-px bg-border/40" />
            <div className="text-center">
              <p className={`text-4xl font-extrabold text-on-surface`}>
                {everPassed ? "PASS" : "FAIL"}
              </p>
              <p className="text-xs text-muted font-medium uppercase tracking-wider mt-1">Status</p>
            </div>
            {attemptStatus && (
              <>
                <div className="h-12 w-px bg-border/40" />
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-on-surface">{attemptsUsed}/{attemptStatus.maxAttempts}</p>
                  <p className="text-xs text-muted font-medium uppercase tracking-wider mt-1">Attempts</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      {canRetry && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/programs/${slug}/assessment/${assessmentId}`}>
            <Button size="lg" className="w-full sm:w-auto gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-6 py-5">
              <RotateCcw className="h-5 w-5" />
              Take Assessment
            </Button>
          </Link>
          <Link href={`/programs/${slug}`}>
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 rounded-xl px-6 py-5">
              <ArrowRight className="h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      )}

      {everPassed && !canRetry && (
        <div className="flex justify-center">
          <Link href={`/programs/${slug}`}>
            <Button size="lg" className="gap-2 rounded-xl px-8 py-5">
              <ArrowRight className="h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      )}

      {/* Attempt History Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-on-surface text-lg">Attempt History</h3>
        {history.length > 0 ? (
          <AttemptHistoryTable history={history} slug={slug} assessmentId={assessmentId} />
        ) : (
          <Card className="p-8 text-center text-muted border border-border/40 rounded-2xl">
            No attempts registered yet.
          </Card>
        )}
      </div>

      {history.length > 0 && history.some(a => a.attemptId) && (
        <div className="flex justify-center">
          <Link href={`/programs/${slug}`}>
            <Button variant="outline" size="lg" className="gap-2 rounded-xl px-6 py-5">
              <ArrowRight className="h-5 w-5" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
