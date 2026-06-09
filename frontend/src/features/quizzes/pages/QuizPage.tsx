"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { quizService } from "../services/quiz.service";
import { useTimer } from "../hooks/useTimer";
import { QuizTimer } from "../components/quiz-timer";
import { QuestionCard } from "../components/question-card";
import { QuestionNavigator } from "../components/question-navigator";
import { QuizNavigationBar } from "../components/quiz-navigation-bar";
import { SecurityToast } from "../components/security-toast";
import { EmptyState } from "@/shared/components/empty-state";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { HelpCircle, AlertTriangle, Shield } from "lucide-react";
import { QUIZ_CONSTANTS } from "../constants/quiz.constants";
import Link from "next/link";

interface QuizPageProps {
  slug: string;
  quizId: string;
}

export function QuizPage({ slug, quizId }: QuizPageProps) {
  const router = useRouter();
  const quiz = quizService.getQuiz(quizId);

  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleTimeUp = useCallback(() => {
    if (!submitted && quiz) {
      const result = quizService.calculateScore(quiz, answers);
      setSubmitted(true);
      router.push(
        `/courses/${slug}/quiz/${quizId}/results?score=${result.score}&total=${result.totalPoints}&pct=${result.percentage}&passed=${result.passed}`
      );
    }
  }, [submitted, quiz, answers, router, slug, quizId]);

  const { timeRemaining, formatted, start } = useTimer(
    quiz?.duration ? quiz.duration * 60 : 1800,
    handleTimeUp
  );

  useEffect(() => {
    if (quiz) {
      const initial: Record<string, number | null> = {};
      quiz.questions.forEach((q) => {
        initial[q.id] = null;
      });
      setAnswers(initial);
    }
  }, [quiz]);

  if (!quiz) {
    return (
      <div className="py-16">
        <EmptyState
          icon={HelpCircle}
          title="Quiz not found"
          description="This assessment doesn't exist or has been removed."
          action={
            <Link href={`/courses/${slug}`}>
              <Button>Back to Course</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const answeredCount = quizService.getAnsweredCount(answers);

  const handleSubmit = () => {
    const result = quizService.calculateScore(quiz, answers);
    setSubmitted(true);
    router.push(
      `/courses/${slug}/quiz/${quizId}/results?score=${result.score}&total=${result.totalPoints}&pct=${result.percentage}&passed=${result.passed}`
    );
  };

  // Pre-quiz screen
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface">{quiz.title}</h1>
          <p className="text-muted max-w-md mx-auto">{quiz.description}</p>
        </div>

        <div className="card-elevation p-6 space-y-4">
          <h3 className="font-semibold text-on-surface">Assessment Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted">Questions</p>
              <p className="font-medium text-on-surface">{quiz.questions.length}</p>
            </div>
            <div>
              <p className="text-muted">Duration</p>
              <p className="font-medium text-on-surface">{quiz.duration} minutes</p>
            </div>
            <div>
              <p className="text-muted">Passing Score</p>
              <p className="font-medium text-on-surface">{quiz.passingScore}%</p>
            </div>
            <div>
              <p className="text-muted">Total Points</p>
              <p className="font-medium text-on-surface">
                {quiz.questions.reduce((s, q) => s + q.points, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card-elevation p-6 space-y-3 border-warning/30">
          <div className="flex items-center gap-2 text-warning">
            <Shield className="h-5 w-5" />
            <h3 className="font-semibold">Important Guidelines</h3>
          </div>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warning mt-2" />
              Do not switch tabs during the quiz. You have {QUIZ_CONSTANTS.MAX_TAB_SWITCHES} warnings before auto-submission.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warning mt-2" />
              The timer starts immediately and cannot be paused.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warning mt-2" />
              You can flag questions and return to them later.
            </li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={() => {
              setStarted(true);
              start();
            }}
            className="gap-2 px-8"
          >
            <HelpCircle className="h-5 w-5" />
            Start Assessment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-6">
      <SecurityToast
        isActive={started && !submitted}
        onTabSwitch={() => setTabSwitchCount((c) => c + 1)}
        tabSwitchCount={tabSwitchCount}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-on-surface">{quiz.title}</h1>
          <p className="text-sm text-muted">
            {answeredCount}/{quiz.questions.length} answered
          </p>
        </div>
        <QuizTimer formatted={formatted} timeRemaining={timeRemaining} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Area */}
        <div className="lg:col-span-3 card-elevation p-6 space-y-6">
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={quiz.questions.length}
              selectedAnswer={answers[currentQuestion.id]}
              onSelectAnswer={(index) =>
                setAnswers((prev) => ({ ...prev, [currentQuestion.id]: index }))
              }
            />
          )}

          <QuizNavigationBar
            currentIndex={currentIndex}
            totalQuestions={quiz.questions.length}
            isFlagged={currentQuestion ? flagged.has(currentQuestion.id) : false}
            onPrev={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
            onNext={() => setCurrentIndex((i) => Math.min(i + 1, quiz.questions.length - 1))}
            onFlag={() => {
              if (!currentQuestion) return;
              setFlagged((prev) => {
                const next = new Set(prev);
                if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
                else next.add(currentQuestion.id);
                return next;
              });
            }}
            onSubmit={() => setShowConfirmSubmit(true)}
          />
        </div>

        {/* Navigator Sidebar */}
        <div className="lg:col-span-1">
          <div className="card-elevation p-4 sticky top-24">
            <QuestionNavigator
              questions={quiz.questions}
              currentIndex={currentIndex}
              answers={answers}
              flaggedQuestions={flagged}
              onGoToQuestion={setCurrentIndex}
            />
          </div>
        </div>
      </div>

      {/* Confirm Submit Dialog */}
      <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Assessment?</DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} of {quiz.questions.length} questions.
              {answeredCount < quiz.questions.length && (
                <span className="block mt-1 text-warning font-medium">
                  ⚠ {quiz.questions.length - answeredCount} question(s) are unanswered.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
              Continue Quiz
            </Button>
            <Button onClick={handleSubmit}>Submit Now</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
