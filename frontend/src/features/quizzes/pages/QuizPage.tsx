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
import { HelpCircle, AlertTriangle, Shield, Lock, XOctagon } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import Link from "next/link";

interface QuizPageProps {
  slug: string;
  quizId: string;
}

export function QuizPage({ slug, quizId }: QuizPageProps) {
  const router = useRouter();
  const { session } = useAuth();
  const quiz = quizService.getQuiz(quizId, slug);

  // Core Quiz States
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Proctoring States
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [warningsCount, setWarningsCount] = useState(0);
  const [scoreDeduction, setScoreDeduction] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [isTerminated, setIsTerminated] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [lastViolationTime, setLastViolationTime] = useState(0);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);

  // Handler for Timer Expired
  const handleTimeUp = useCallback(async () => {
    if (!submitted && quiz && activeSessionId) {
      setSubmitted(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const response = await fetch(`${apiUrl}/assessments/sessions/${activeSessionId}/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ answers }),
        });

        if (response.ok) {
          const data = await response.json();
          router.push(
            `/programs/${slug}/quiz/${quizId}/results?score=${data.score}&total=100&pct=${data.score}&passed=${data.passed}`
          );
        }
      } catch (err) {
        console.error("Failed to auto-submit quiz on timeout:", err);
      }
    }
  }, [submitted, quiz, answers, activeSessionId, session, router, slug, quizId]);

  const { timeRemaining, formatted, start, pause, reset } = useTimer(
    quiz?.duration ? quiz.duration * 60 : 1800,
    handleTimeUp
  );

  // Initialize empty answers mapping
  useEffect(() => {
    if (quiz) {
      const initial: Record<string, number | null> = {};
      quiz.questions.forEach((q) => {
        initial[q.id] = null;
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAnswers(initial);
    }
  }, [quiz]);

  // Restore active session on mount
  useEffect(() => {
    const restoreSession = async () => {
      if (!session?.accessToken || started) return;

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const response = await fetch(`${apiUrl}/assessments/sessions/active?assessmentId=${quizId}`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.session) {
            const activeSession = data.session;
            setActiveSessionId(activeSession.id);
            setWarningsCount(activeSession.warningsCount);
            setScoreDeduction(activeSession.scoreDeduction);

            if (activeSession.status === "TERMINATED") {
              setIsTerminated(true);
              setSubmitted(true);
              setStarted(true);
              return;
            }

            // Calculate elapsed time and resume timer from accurate elapsed seconds
            const elapsed = Math.floor((Date.now() - new Date(activeSession.startedAt).getTime()) / 1000);
            const durationSeconds = quiz?.duration ? quiz.duration * 60 : 1800;
            const remaining = Math.max(0, durationSeconds - elapsed);

            reset(remaining);

            // Handle active lockouts or warnings
            const ackCount = typeof window !== "undefined" ? parseInt(localStorage.getItem("ack_warnings_" + activeSession.id) || "0", 10) : 0;

            if (activeSession.warningsCount === 1 && ackCount < 1) {
              setStarted(true);
              pause();
              setShowWarningModal(true);
            } else if (activeSession.lockoutUntil) {
              const lockoutRemaining = Math.floor((new Date(activeSession.lockoutUntil).getTime() - Date.now()) / 1000);
              if (lockoutRemaining > 0) {
                setStarted(true);
                setIsScreenLocked(true);
                setLockoutCountdown(lockoutRemaining);
              } else {
                setStarted(true);
                start();
              }
            } else {
              setStarted(true);
              start();
            }
          }
        }
      } catch (err) {
        console.error("Failed to restore active exam session:", err);
      }
    };

    restoreSession();
  }, [session, quizId, quiz, reset, start, started]);

  // Lockout Countdown Effect
  useEffect(() => {
    if (lockoutCountdown > 0 && isScreenLocked) {
      const timer = setTimeout(() => {
        setLockoutCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (lockoutCountdown === 0 && isScreenLocked) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsScreenLocked(false);
      start(); // Resume the timer
    }
  }, [lockoutCountdown, isScreenLocked, start]);



  // Start Assessment Handler
  const handleStartQuiz = async () => {
    if (!session?.accessToken) {
      toast.error("Please sign in to take the assessment.");
      return;
    }

    setIsApiLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const response = await fetch(`${apiUrl}/assessments/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ assessmentId: quizId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to initialize proctored session.");
        return;
      }

      const data = await response.json();
      setActiveSessionId(data.session.id);
      setWarningsCount(data.session.warningsCount);
      setScoreDeduction(data.session.scoreDeduction);
      if (typeof window !== "undefined") {
        localStorage.removeItem("ack_warnings_" + data.session.id);
      }

      if (data.session.status === "TERMINATED") {
        setIsTerminated(true);
        setSubmitted(true);
        setStarted(true);
        return;
      }

      setStarted(true);
      start();
      // Auto Request Fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn("Fullscreen request rejected:", err);
        });
      }
    } catch (err) {
      console.error("Error starting exam session:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setIsApiLoading(false);
    }
  };

  // Log Proctoring Violation Handler
  const handleViolation = useCallback(
    async (type: "TAB_SWITCH" | "FOCUS_LOSS" | "COPY_PASTE") => {
      if (!started || submitted || isTerminated || !activeSessionId) return;

      // Ignore FOCUS_LOSS violations while warning modal is shown or screen is locked to prevent native alert focus loop
      if ((showWarningModal || isScreenLocked) && type === "FOCUS_LOSS") return;

      // Throttle: ignore violations within 500ms of the last one
      const now = Date.now();
      if (now - lastViolationTime < 500) return;
      setLastViolationTime(now);

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const response = await fetch(`${apiUrl}/assessments/sessions/${activeSessionId}/violations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ type }),
        });

        if (!response.ok) return;

        const data = await response.json();
        const updatedSession = data.session;

        setWarningsCount(updatedSession.warningsCount);
        setScoreDeduction(updatedSession.scoreDeduction);

        if (updatedSession.warningsCount === 1) {
          pause(); // Pause countdown
          setShowWarningModal(true);
          toast.warning("First Offense: Timer halted. Focus warning.");
          // alert("PROCTORING WARNING (1/3):\n\nYou have lost focus on the assessment window. The timer has been halted.\n\nReturn to the assessment tab and click acknowledge to resume.");
        } else if (updatedSession.warningsCount === 2) {
          setShowWarningModal(false); // Close first warning if open
          pause(); // Pause countdown
          setIsScreenLocked(true);
          setLockoutCountdown(30);
          toast.error("Second Offense: 15% points deducted. Screen locked for 30s.");
          // alert("PROCTORING WARNING (2/3):\n\nFocus lost. A 15% point deduction has been applied, and your screen is locked for 30 seconds.");
        } else if (updatedSession.status === "TERMINATED" || updatedSession.warningsCount >= 3) {
          setShowWarningModal(false);
          setIsScreenLocked(false);
          setIsTerminated(true);
          pause();
          setSubmitted(true);
          toast.error("Third Offense: Exam terminated due to security violations.");
          // alert("PROCTORING VIOLATION (3/3):\n\nAssessment terminated due to repeated focus loss. A grade of 0% has been recorded.");
        }
      } catch (err) {
        console.error("Failed to log proctoring violation:", err);
      }
    },
    [started, submitted, isTerminated, activeSessionId, session, pause, lastViolationTime, showWarningModal, isScreenLocked]
  );

  // Fullscreen Change Monitor Effect
  useEffect(() => {
    if (!started || submitted || isTerminated) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreenActive(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && !showWarningModal && !isScreenLocked) {
        handleViolation("FOCUS_LOSS");
        toast.warning("Exiting fullscreen is a proctoring violation!");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    // Initial check
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsFullscreenActive(!!document.fullscreenElement);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [started, submitted, isTerminated, showWarningModal, isScreenLocked, handleViolation]);

  // Intercept tab closing / reloads
  useEffect(() => {
    if (!started || submitted || isTerminated) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "An active assessment is in progress. Are you sure you want to exit?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [started, submitted, isTerminated]);

  // Exit Fullscreen when Quiz Over Effect
  useEffect(() => {
    if (submitted || isTerminated) {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.warn("Failed to exit fullscreen:", err);
        });
      }
    }
  }, [submitted, isTerminated]);

  // Submit Handler
  const handleSubmit = async () => {
    if (!activeSessionId) return;
    setIsApiLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const response = await fetch(`${apiUrl}/assessments/sessions/${activeSessionId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        toast.error("Failed to submit assessment.");
        return;
      }

      const data = await response.json();
      setSubmitted(true);
      router.push(
        `/programs/${slug}/quiz/${quizId}/results?score=${data.score}&total=100&pct=${data.score}&passed=${data.passed}`
      );
    } catch (err) {
      console.error("Error submitting quiz:", err);
      toast.error("Network error. Could not submit quiz.");
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleAcknowledgeWarning = () => {
    if (activeSessionId && typeof window !== "undefined") {
      localStorage.setItem("ack_warnings_" + activeSessionId, "1");
    }
    setShowWarningModal(false);
    start(); // Resume timer
    // Re-request Fullscreen on acknowledgment click
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  if (!quiz) {
    return (
      <div className="py-16">
        <EmptyState
          icon={HelpCircle}
          title="Quiz not found"
          description="This assessment doesn't exist or has been removed."
          action={
            <Link href={`/programs/${slug}`}>
              <Button>Back to Program</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const answeredCount = quizService.getAnsweredCount(answers);

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
            <h3 className="font-semibold">Security & Proctoring Guidelines</h3>
          </div>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warning mt-2" />
              Do not switch tabs, minimize the window, or click outside the test area.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warning mt-2" />
              **First Offense**: Halts the countdown timer and triggers a warning modal.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warning mt-2" />
              **Second Offense**: Screen locks for 30 seconds and deducts **15%** of available points.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warning mt-2" />
              **Third Offense**: Immediate termination of the exam session with a **0%** grade.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warning mt-2" />
              Copying, cutting, or pasting text is strictly blocked and logged as a violation.
            </li>
          </ul>
        </div>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleStartQuiz}
            disabled={isApiLoading}
            className="gap-2 px-8"
          >
            <HelpCircle className="h-5 w-5" />
            {isApiLoading ? "Initializing..." : "Start Assessment"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto py-6 px-6 relative ${showWarningModal ? "min-h-screen" : ""}`}>
      {/* Visibility, Blur, and Clipboard violation listeners */}
      <SecurityToast
        isActive={started && !submitted && !isTerminated}
        onViolation={handleViolation}
      />

      {/* FULLSCREEN REQUIRED OVERLAY */}
      {started && !submitted && !isTerminated && !isFullscreenActive && !showWarningModal && !isScreenLocked && (
        <div className="fixed inset-0 bg-background/95 z-[99999] flex flex-col items-center justify-center p-6 pointer-events-auto">
          <div className="w-[480px] max-w-full mx-auto flex flex-col items-center justify-center text-center space-y-6">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Fullscreen Required</h1>
            <p className="text-muted">
              To maintain assessment integrity, you must view this assessment in fullscreen mode. Clicks outside or escaping fullscreen will register as focus violations.
            </p>
            <Button 
              size="lg" 
              className="w-full bg-primary hover:bg-primary-hover text-white"
              onClick={() => {
                if (document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
            >
              Enter Fullscreen & Resume
            </Button>
          </div>
        </div>
      )}

      {/* YELLOW ALERT BORDER OVERLAY (First Warning) */}
      {showWarningModal && (
        <div 
          className="fixed inset-0 pointer-events-none z-[99999] animate-pulse" 
          style={{ 
            boxShadow: "inset 0 0 30px rgba(245, 158, 11, 0.5), 0 0 20px rgba(245, 158, 11, 0.3)",
          }} 
        />
      )}

      {/* Backdrop overlay to completely block clicks/interactions behind the warning modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-background/30 backdrop-blur-sm z-40 pointer-events-auto cursor-not-allowed" />
      )}

      {/* ORANGE FLASH SCREEN LOCKOUT OVERLAY (Second Warning) */}
      {isScreenLocked && (
        <div 
          className="fixed inset-0 bg-background/90 z-50 flex flex-col items-center justify-center p-6 pointer-events-auto"
          style={{ 
            boxShadow: "inset 0 0 45px rgba(234, 88, 12, 0.6), 0 0 30px rgba(234, 88, 12, 0.4)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="w-[480px] max-w-full mx-auto flex flex-col items-center justify-center text-center space-y-6">
            <div className="h-16 w-16 bg-orange-500/10 rounded-full flex items-center justify-center animate-bounce">
              <Lock className="h-8 w-8 text-orange-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-orange-500 tracking-tight">Proctoring Violation: Focus Lost</h1>
            <p className="text-muted">
              You switched tabs or moved away from the assessment window. A **15% point deduction** has been applied to this attempt.
            </p>
            <div className="p-4 bg-orange-500/10 text-orange-500 font-semibold rounded-lg w-full">
              Screen Locked. Resuming in {lockoutCountdown} seconds...
            </div>
            <p className="text-sm text-muted">Please maintain focus on the quiz window to prevent exam termination.</p>
          </div>
        </div>
      )}

      {/* RED EXCLUSION FRAME SCREEN (Third Offense - Termination) */}
      {isTerminated && (
        <div 
          className="fixed inset-0 bg-background/95 z-50 flex flex-col items-center justify-center p-6 pointer-events-auto"
          style={{ 
            boxShadow: "inset 0 0 60px rgba(220, 38, 38, 0.7), 0 0 40px rgba(220, 38, 38, 0.5)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="w-[480px] max-w-full mx-auto flex flex-col items-center justify-center text-center space-y-6">
            <div className="h-20 w-20 bg-red-600/10 rounded-full flex items-center justify-center animate-pulse">
              <XOctagon className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-3xl font-black text-red-600 uppercase tracking-wider">Assessment Terminated</h1>
            <p className="text-muted text-lg">
              Security policy violated. You exceeded the maximum number of warnings.
            </p>
            <div className="p-4 bg-red-600/10 text-red-600 font-bold rounded-lg border border-red-600/20 w-full">
              A grade of 0% has been recorded.
            </div>
            <Link href={`/programs/${slug}`}>
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white mt-2 w-full">
                Return to Program Dashboard
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* A wrapper that blurs and blocks clicks to background questions when warning modal is active */}
      <div className={showWarningModal ? "pointer-events-none select-none blur-sm" : ""}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-on-surface">{quiz.title}</h1>
            <p className="text-sm text-muted">
              {answeredCount}/{quiz.questions.length} answered
              {scoreDeduction > 0 && (
                <span className="ml-3 text-orange-500 font-medium">
                  ({scoreDeduction}% Penalty Applied)
                </span>
              )}
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
      </div>

      {/* Confirm Submit Dialog */}
      <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assessment?</DialogTitle>
            <DialogDescription render={<div />}>
              <div className="text-sm text-muted-foreground">
                You have answered {answeredCount} of {quiz.questions.length} questions.
                {answeredCount < quiz.questions.length && (
                  <span className="block mt-1 text-warning font-medium">
                    ⚠ {quiz.questions.length - answeredCount} question(s) are unanswered.
                  </span>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
              Continue Quiz
            </Button>
            <Button onClick={handleSubmit} disabled={isApiLoading}>
              {isApiLoading ? "Submitting..." : "Submit Now"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Warning Modal (First Offense) */}
      <Dialog open={showWarningModal} onOpenChange={() => {}}>
        <DialogContent 
          className="ring-0" 
          style={{ border: "2px solid var(--color-warning, #f59e0b)" }}
          showCloseButton={false}
        >
          <DialogHeader>
            <div className="flex items-center gap-2 text-yellow-500 mb-2">
              <AlertTriangle className="h-6 w-6" />
              <DialogTitle className="text-xl">Proctoring Warning: Focus Lost</DialogTitle>
            </div>
            <DialogDescription render={<div />}>
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  The system detected you switched tabs or minimized the active assessment window.
                </p>
                <p className="font-semibold text-on-surface">
                  The exam countdown timer is currently **HALTED**.
                </p>
                <div className="p-3 bg-yellow-500/10 rounded text-yellow-600 text-sm">
                  **Notice**: A second offense will lock your screen for 30 seconds and deduct **15%** from your final points. A third offense will terminate the exam session.
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={handleAcknowledgeWarning}>
              I Acknowledge and Will Keep Focus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
