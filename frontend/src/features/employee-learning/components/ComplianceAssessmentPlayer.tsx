"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { Clock, ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";
import type { AssessmentQuestion, AttemptResult } from "../types/employee-learning.types";
import { employeeLearningService } from "../services/employee-learning.service";

interface Props {
  questions: AssessmentQuestion[];
  assessmentTitle: string;
  timeLimit: number;
  timeLimitEnabled: boolean;
  onSubmit: (answers: Record<string, string>, timeTakenSeconds: number) => Promise<AttemptResult>;
  onCancel: () => void;
}

export function ComplianceAssessmentPlayer({
  questions,
  assessmentTitle,
  timeLimit,
  timeLimitEnabled,
  onSubmit,
  onCancel,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const startTimeRef = useRef(Date.now());
  const [timeLeft, setTimeLeft] = useState(timeLimit);

  useEffect(() => {
    if (!timeLimitEnabled || result) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = timeLimit - elapsed;
      if (remaining <= 0) {
        clearInterval(interval);
        handleSubmit();
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLimitEnabled, timeLimit, result]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const selectAnswer = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const res = await onSubmit(answers, timeTaken);
      setResult(res);
    } catch (e) {
      setSubmitting(false);
    }
  }, [answers, onSubmit, submitting]);

  if (result) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4">
        <Card>
          <CardHeader className="text-center">
            <div className={`mx-auto mb-3 rounded-full p-3 ${result.passed ? "bg-emerald-50" : "bg-red-50"}`}>
              {result.passed ? (
                <CheckCircle className="h-8 w-8 text-emerald-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            <CardTitle className="text-xl">
              {result.passed ? "Assessment Passed!" : "Assessment Not Passed"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {result.passed
                ? "Congratulations! Your credential will be issued shortly."
                : `You needed ${result.passingScore}% to pass. Keep studying and try again.`}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{result.percentage}%</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{result.score}/{result.totalQuestions}</div>
                <div className="text-xs text-muted-foreground">Correct</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {result.timeTakenSeconds ? employeeLearningService.formatDuration(result.timeTakenSeconds) : "—"}
                </div>
                <div className="text-xs text-muted-foreground">Time</div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={onCancel}>
                Back to Assessments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ChevronLeft className="mr-1 h-4 w-4" />
          Exit
        </Button>
        {timeLimitEnabled && (
          <Badge variant={timeLeft < 60 ? "destructive" : "secondary"} className="tabular-nums">
            <Clock className="mr-1 h-3 w-3" />
            {employeeLearningService.formatDuration(timeLeft)}
          </Badge>
        )}
      </div>

      <Progress value={progress} className="h-1.5" />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              Question {currentIndex + 1} of {questions.length}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {currentQuestion.difficulty}
            </Badge>
          </div>
          {currentQuestion.category && (
            <p className="text-xs text-muted-foreground">{currentQuestion.category}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-base">{currentQuestion.text}</p>
          <div className="space-y-2">
            {currentQuestion.options.map((option) => {
              const selected = answers[currentQuestion.id] === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => selectAnswer(currentQuestion.id, option.id)}
                  className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                    selected
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {option.text}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 w-2 rounded-full transition-colors ${
                i === currentIndex
                  ? "bg-blue-600"
                  : answers[questions[i].id]
                    ? "bg-blue-300"
                    : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        {currentIndex < questions.length - 1 ? (
          <Button size="sm" onClick={() => setCurrentIndex((i) => i + 1)}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || answeredCount < questions.length}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        )}
      </div>
    </div>
  );
}
