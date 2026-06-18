"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { assessmentAttemptService } from "../services/assessment-attempt.service";
import { AttemptResult, AttemptHistoryItem } from "../types/assessment.types";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Trophy, XCircle, ArrowRight, RotateCcw, HelpCircle, Award, BookOpen, AlertTriangle, Play } from "lucide-react";
import { toast } from "sonner";

interface AssessmentResultProps {
  slug: string;
  assessmentId: string;
}

export function AssessmentResult({ slug, assessmentId }: AssessmentResultProps) {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const { session } = useAuth();
  const token = session?.accessToken;

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [history, setHistory] = useState<AttemptHistoryItem[]>([]);
  const [recommendations, setRecommendations] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !attemptId) return;

      setIsLoading(true);
      try {
        // 1. Fetch current attempt result
        const resData = await assessmentAttemptService.getAttemptResult(attemptId, token);
        setResult(resData);

        // 2. Fetch attempt history
        const histData = await assessmentAttemptService.getAttemptHistory(assessmentId, token);
        setHistory(histData.attempts);

        // 3. Fetch recommendation (Next module)
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
          const recRes = await fetch(`${apiUrl}/assessments/recommendations/continue-learning`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (recRes.ok) {
            const recData = await recRes.json();
            setRecommendations(recData);
          }
        } catch (err) {
          console.warn("Failed to load continue learning recommendation:", err);
        }
      } catch (err: any) {
        console.error("Failed to load result page data:", err);
        toast.error(err.message || "Failed to load assessment results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [attemptId, assessmentId, token]);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted">Analyzing your submission...</p>
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
        <h2 className="text-2xl font-bold">Result Not Found</h2>
        <p className="text-muted mt-2">Could not retrieve results for the specified attempt ID.</p>
        <Link href={`/programs/${slug}`} className="mt-6 inline-block">
          <Button>Back to Program</Button>
        </Link>
      </div>
    );
  }

  const passed = result.passed;

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8">
      {/* Passing/Failing Banner */}
      <div
        className={`rounded-3xl p-8 text-center space-y-6 border transition-all duration-500 shadow-md ${
          passed
            ? "bg-linear-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20"
            : "bg-linear-to-br from-red-500/10 via-red-500/5 to-transparent border-red-500/20"
        }`}
      >
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full mx-auto ${
            passed ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          }`}
        >
          {passed ? (
            <Trophy className="h-10 w-10 text-green-500 animate-bounce" />
          ) : (
            <XCircle className="h-10 w-10 text-red-500" />
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-on-surface">
            {passed ? "Congratulations! 🎉" : "Keep Trying!"}
          </h1>
          <p className="text-muted max-w-md mx-auto">
            {passed
              ? "You successfully cleared the assessment and advanced in your learning journey!"
              : "Review the question breakdowns, target your weak areas, and try again."}
          </p>
        </div>

        {/* Score metrics */}
        <div className="flex items-center justify-center gap-8 pt-4">
          <div className="text-center">
            <p className={`text-4xl font-extrabold ${passed ? "text-green-500" : "text-red-500"}`}>
              {result.score}%
            </p>
            <p className="text-xs text-muted font-medium uppercase tracking-wider mt-1">Score</p>
          </div>
          <div className="h-12 w-px bg-border/40" />
          <div className="text-center">
            <p className={`text-4xl font-extrabold text-on-surface`}>
              {passed ? "PASS" : "FAIL"}
            </p>
            <p className="text-xs text-muted font-medium uppercase tracking-wider mt-1">Status</p>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/programs/${slug}/assessment/${assessmentId}/review?attemptId=${attemptId}`}>
          <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 py-5">
            <Award className="h-5 w-5" />
            Review Correct Answers
          </Button>
        </Link>

        {!passed && (
          <Link href={`/programs/${slug}/assessment/${assessmentId}`}>
            <Button size="lg" className="w-full sm:w-auto gap-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-6 py-5">
              <RotateCcw className="h-5 w-5" />
              Retake Assessment
            </Button>
          </Link>
        )}

        <Link href={`/programs/${slug}`}>
          <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 rounded-xl px-6 py-5">
            <ArrowRight className="h-5 w-5" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Inline Recommendations Widget */}
      {recommendations && recommendations.success && recommendations.programId && (
        <Card className="p-6 bg-surface border border-border/40 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="h-5 w-5" />
            <h3 className="font-bold text-on-surface">Recommended Next Steps</h3>
          </div>

          {recommendations.completed ? (
            <p className="text-sm text-muted">
              Congratulations! You have completed all modules in the <strong>{recommendations.programTitle}</strong> program.
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-surface-variant/20 rounded-xl border border-border/30 gap-4">
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider block">
                  Next Module: {recommendations.trackType} Track
                </span>
                <h4 className="font-bold text-on-surface mt-1">{recommendations.moduleTitle}</h4>
                <p className="text-xs text-muted mt-1">
                  Continue learning: <strong>{recommendations.firstIncompleteLesson?.title}</strong>
                </p>
              </div>

              <Link href={`/programs/${slug}/learn/${recommendations.firstIncompleteLesson?.id}`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg">
                  <Play className="h-4 w-4" /> Start Lesson
                </Button>
              </Link>
            </div>
          )}
        </Card>
      )}

      {/* Attempt History Section */}
      <div className="space-y-4">
        <h3 className="font-bold text-on-surface text-lg">Attempt History</h3>
        <Card className="overflow-hidden border border-border/40 rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-variant/20 text-on-surface-variant font-semibold">
                <tr>
                  <th className="px-6 py-4">Attempt Date</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {history.map((h, idx) => (
                  <tr key={h.id} className={h.id === attemptId ? "bg-primary/5" : ""}>
                    <td className="px-6 py-4 text-muted">
                      {new Date(h.completedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 font-bold text-on-surface">
                      {h.score}%
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        h.passed
                          ? "bg-green-500/10 text-green-600"
                          : "bg-red-500/10 text-red-600"
                      }`}>
                        {h.passed ? "PASS" : "FAIL"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/programs/${slug}/assessment/${assessmentId}/review?attemptId=${h.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:underline">
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted">
                      No attempts registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
