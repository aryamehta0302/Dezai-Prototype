"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { quizService } from "../services/quiz.service";
import { QuestionCard } from "../components/question-card";
import { EmptyState } from "@/shared/components/empty-state";
import { PageContainer } from "@/shared/components/page-container";
import {
  Trophy,
  XCircle,
  ArrowRight,
  RotateCcw,
  Award,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface QuizResultsPageProps {
  slug: string;
  quizId: string;
}

export function QuizResultsPage({ slug, quizId }: QuizResultsPageProps) {
  const searchParams = useSearchParams();
  const quiz = quizService.getQuiz(quizId);

  const score = Number(searchParams.get("score") || 0);
  const total = Number(searchParams.get("total") || 0);
  const pct = Number(searchParams.get("pct") || 0);
  const passed = searchParams.get("passed") === "true";

  if (!quiz) {
    return (
      <div className="py-16">
        <EmptyState icon={HelpCircle} title="Quiz not found" />
      </div>
    );
  }

  return (
    <PageContainer className="py-10 space-y-8 max-w-3xl">
      {/* Result Banner */}
      <div
        className={cn(
          "rounded-2xl p-8 text-center space-y-4",
          passed
            ? "bg-linear-to-br from-success/10 via-success/5 to-transparent border border-success/20"
            : "bg-linear-to-br from-destructive/10 via-destructive/5 to-transparent border border-destructive/20"
        )}
      >
        <div
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-full mx-auto",
            passed ? "bg-success/10" : "bg-destructive/10"
          )}
        >
          {passed ? (
            <Trophy className="h-10 w-10 text-success" />
          ) : (
            <XCircle className="h-10 w-10 text-destructive" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-on-surface">
          {passed ? "Congratulations! 🎉" : "Keep Trying!"}
        </h1>
        <p className="text-muted">
          {passed
            ? "You have passed the assessment and earned your certificate!"
            : `You need ${quiz.passingScore}% to pass. Review the material and try again.`}
        </p>

        {/* Score */}
        <div className="flex items-center justify-center gap-8 pt-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-on-surface">{pct}%</p>
            <p className="text-sm text-muted">Score</p>
          </div>
          <div className="h-12 w-px bg-border-light" />
          <div className="text-center">
            <p className="text-4xl font-bold text-on-surface">
              {score}/{total}
            </p>
            <p className="text-sm text-muted">Points</p>
          </div>
          <div className="h-12 w-px bg-border-light" />
          <div className="text-center">
            <p
              className={cn(
                "text-4xl font-bold",
                passed ? "text-success" : "text-destructive"
              )}
            >
              {passed ? "PASS" : "FAIL"}
            </p>
            <p className="text-sm text-muted">
              {quiz.passingScore}% required
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {passed ? (
          <Link href="/certificates">
            <Button size="lg" className="gap-2">
              <Award className="h-5 w-5" />
              View Certificates
            </Button>
          </Link>
        ) : (
          <Link href={`/courses/${slug}/quiz/${quizId}`}>
            <Button size="lg" className="gap-2">
              <RotateCcw className="h-5 w-5" />
              Retake Assessment
            </Button>
          </Link>
        )}
        <Link href={`/courses/${slug}`}>
          <Button variant="outline" size="lg" className="gap-2">
            <ArrowRight className="h-5 w-5" />
            Back to Course
          </Button>
        </Link>
      </div>
    </PageContainer>
  );
}
