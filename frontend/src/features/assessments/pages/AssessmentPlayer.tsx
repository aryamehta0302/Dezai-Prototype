"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAttempt } from "../hooks/useAttempt";
import { AssessmentPlayerSkeleton } from "../components/AssessmentSkeleton";
import { SecurityToast } from "../../quizzes/components/security-toast";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { HelpCircle, AlertTriangle, Shield, Lock, XOctagon, Clock, CheckCircle, Flag, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface AssessmentPlayerProps {
  slug: string;
  assessmentId: string;
}

export function AssessmentPlayer({ slug, assessmentId }: AssessmentPlayerProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.accessToken;

  const {
    attempt,
    currentIndex,
    setCurrentIndex,
    answers,
    selectOption,
    flagged,
    toggleFlag,
    timer,
    saveStatus,
    submit,
    error,
    errorType,
    attemptStatus,
    
    // Proctoring
    warningsCount,
    scoreDeduction,
    showWarningModal,
    setShowWarningModal,
    isScreenLocked,
    isTerminated,
    lockoutCountdown,
    isFullscreenActive,
    setIsFullscreenActive,
    handleViolation,
    initializeAttempt,
  } = useAttempt(assessmentId, token, slug);

  const [started, setStarted] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  // Initialize assessment attempt once token is loaded
  useEffect(() => {
    if (token) {
      initializeAttempt();
    }
  }, [token, initializeAttempt]);

  // Redirect to results page if already passed or max attempts reached
  useEffect(() => {
    if (errorType === "already_completed" || errorType === "max_attempts") {
      router.replace(`/programs/${slug}/assessment/${assessmentId}/results`);
    }
  }, [errorType, slug, assessmentId, router]);

  // Request fullscreen when entering the assessment
  const handleStart = async () => {
    if (!attempt) return;
    setStarted(true);
    timer.start();
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request rejected:", err);
      });
    }
  };

  // Exit fullscreen on submit / terminate
  useEffect(() => {
    if (isTerminated) {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [isTerminated]);

  // Monitor fullscreen escapes
  useEffect(() => {
    if (!started || isTerminated) return;

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreenActive(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && !showWarningModal && !isScreenLocked && !isSubmittingRef.current) {
        handleViolation("FOCUS_LOSS");
        toast.warning("Exiting fullscreen is a proctoring violation!");
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    setIsFullscreenActive(!!document.fullscreenElement);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [started, isTerminated, showWarningModal, isScreenLocked, handleViolation, setIsFullscreenActive]);

  // Re-request fullscreen on warning dismissal
  const handleAcknowledgeWarning = () => {
    if (attempt && typeof window !== "undefined") {
      localStorage.setItem(`ack_warnings_${attempt.sessionId}`, "1");
    }
    setShowWarningModal(false);
    timer.start();
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  // Submission handler
  const handleSubmitClick = async () => {
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const res = await submit();
      if (res && res.success) {
        // Invalidate cached queries so the results page fetches fresh data
        queryClient.invalidateQueries({ queryKey: ["assessments", "attempt-status", assessmentId] });
        queryClient.invalidateQueries({ queryKey: ["assessments", "history", assessmentId] });
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen().catch(() => {});
        }
        toast.success("Assessment submitted successfully!");
        router.push(`/programs/${slug}/assessment/${assessmentId}/results?attemptId=${res.attemptId}`);
        // Don't reset isSubmittingRef — component will unmount, keep guard active
        return;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit assessment";
      toast.error(message);
    }
    isSubmittingRef.current = false;
    setIsSubmitting(false);
    setShowConfirmSubmit(false);
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mx-auto text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold">{errorType === "max_attempts" ? "Maximum Attempts Reached" : "Assessment Unavailable"}</h2>
        <p className="text-muted text-sm">{error}</p>
        <div className="pt-2 flex flex-col gap-2">
          <Link href={`/programs/${slug}/assessment/${assessmentId}/results`}>
            <Button className="w-full rounded-xl">View Results & History</Button>
          </Link>
          <Link href={`/programs/${slug}`}>
            <Button variant="outline" className="w-full rounded-xl">Back to Program</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return <AssessmentPlayerSkeleton />;
  }

  const questions = attempt.questions || [];
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const isResume = Object.keys(attempt.answers ?? {}).length > 0;

  // 1. Pre-take Instruction Screen
  if (!started && attempt.status !== "TERMINATED") {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 space-y-8">
        {isResume && (
          <div className="p-4 rounded-2xl bg-warning/5 border border-warning/20 flex items-center gap-3 text-sm">
            <Clock className="h-5 w-5 text-warning shrink-0" />
            <span className="text-on-surface">
              You have an active session with {Object.keys(attempt.answers ?? {}).length} answer(s) saved.
              Remaining time: <strong>{timer.formatted}</strong>
            </span>
          </div>
        )}
        <div className="text-center space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto">
            <HelpCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface">{attempt.assessmentTitle}</h1>
          <p className="text-muted max-w-md mx-auto">
            {isResume ? "You have an incomplete attempt. Review the guidelines and resume." : "Welcome to the assessment player. Please read the guidelines below before beginning."}
          </p>
        </div>

        <div className="card-elevation p-6 space-y-4 bg-surface-variant/20 rounded-2xl border border-border">
          <h3 className="font-semibold text-on-surface">Attempt Specifications</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted">Questions to Solve</p>
              <p className="font-medium text-on-surface">{attempt.sampleSize}</p>
            </div>
            {attempt.timeLimitEnabled !== false && (
              <div>
                <p className="text-muted">Total Time Limit</p>
                <p className="font-medium text-on-surface">{Math.floor((attempt.timeLimit || 1800) / 60)} minutes</p>
              </div>
            )}
            {attemptStatus && (
              <div>
                <p className="text-muted">Attempts Remaining</p>
                <p className="font-medium text-on-surface">{attemptStatus.attemptsRemaining} / {attemptStatus.maxAttempts}</p>
              </div>
            )}
            <div>
              <p className="text-muted">Required Passing Grade</p>
              <p className="font-medium text-on-surface">{attempt.passingScore}%</p>
            </div>
            <div>
              <p className="text-muted">Deduction Penalty</p>
              <p className="font-medium text-on-surface text-orange-500">15% on 2nd switch</p>
            </div>
          </div>
        </div>

        <div className="card-elevation p-6 space-y-3 bg-warning/5 border border-warning/20 rounded-2xl">
          <div className="flex items-center gap-2 text-warning">
            <Shield className="h-5 w-5" />
            <h3 className="font-semibold">Live Proctoring & Anti-Cheat System</h3>
          </div>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warning mt-2" />
              Do not switch tabs, minimize, or click out of the viewport.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warning mt-2" />
              This assessment will lock and execute fullscreen view. Leaving fullscreen is logged.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warning mt-2" />
              Copying, pasting, or right-clicking options is disabled and flagged immediately.
            </li>
          </ul>
        </div>

        <Button onClick={handleStart} className="w-full py-6 text-base font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-300 rounded-xl shadow-lg">
          {isResume ? "Resume Assessment" : "Acknowledge & Begin Assessment"}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[80vh] py-8">
      {/* Dynamic Security Toast */}
      <SecurityToast onViolation={handleViolation} isActive={started && !isTerminated} />

      {/* YELLOW Warning Modal (First Violation) */}
      {showWarningModal && (
        <>
          <div 
            className="fixed inset-0 pointer-events-none z-[99999] animate-pulse" 
            style={{ 
              boxShadow: "inset 0 0 30px rgba(245, 158, 11, 0.5), 0 0 20px rgba(245, 158, 11, 0.3)",
            }} 
          />
          <div className="fixed inset-0 bg-background/30 backdrop-blur-sm z-40 pointer-events-auto cursor-not-allowed" />
          <Dialog open={showWarningModal} onOpenChange={() => {}}>
            <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-2rem)] sm:w-[32rem] p-6 rounded-2xl bg-surface border-warning/30 shadow-2xl pointer-events-auto" showCloseButton={false}>
              <DialogHeader className="space-y-3 text-center">
                <div className="h-12 w-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto text-warning animate-bounce">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <DialogTitle className="text-xl font-bold text-warning">Proctoring Warning: Focus Lost</DialogTitle>
                <DialogDescription className="text-muted text-sm">
                  You switched tabs or lost window focus. The assessment timer has been halted.
                  Please return to the fullscreen tab to resume. Repeated violations will result in score deductions or termination.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-6">
                <Button onClick={handleAcknowledgeWarning} className="w-full bg-warning text-black hover:bg-warning/90 font-bold rounded-xl py-5">
                  I Acknowledge and Will Keep Focus
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* ORANGE Screen Lockout (Second Violation) */}
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
            <p className="text-sm text-muted">Please maintain focus on the assessment window to prevent assessment termination.</p>
          </div>
        </div>
      )}

      {/* RED Assessment Terminated (Third Violation) */}
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

      {/* Fullscreen Required Blocking Screen */}
      {started && !isFullscreenActive && !showWarningModal && !isScreenLocked && !isTerminated && (
        <div className="fixed inset-0 bg-background/95 z-50 flex flex-col items-center justify-center p-6 pointer-events-auto">
          <div className="w-[440px] max-w-full text-center space-y-6">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary animate-pulse">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-on-surface">Fullscreen Mode Required</h2>
            <p className="text-muted">
              To guarantee assessment integrity, you must remain in fullscreen mode. Please click the button below to resume.
            </p>
            <Button onClick={() => {
              if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
              }
            }} className="w-full py-5 rounded-xl bg-primary text-primary-foreground font-bold">
              Enter Fullscreen Mode
            </Button>
          </div>
        </div>
      )}

      {/* Main taking screen */}
      <div className={showWarningModal ? "pointer-events-none select-none blur-sm" : ""}>
        {/* Header bar */}
        <div className="flex items-center justify-between mb-6 bg-surface-variant/10 p-4 rounded-2xl border border-border/40">
          <div>
            <h1 className="text-lg font-bold text-on-surface">{attempt.assessmentTitle}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted">
                {answeredCount}/{attempt.sampleSize} answered
              </span>
              {scoreDeduction > 0 && (
                <Badge variant="destructive" className="bg-orange-500 text-black">
                  -{scoreDeduction}% Penalty Applied
                </Badge>
              )}
              {saveStatus === "saving" && (
                <span className="text-xs text-muted flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-ping" />
                  Saving...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Saved
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted animate-pulse" />
            <span className={`text-xl font-bold font-mono tracking-wider ${timer.timeRemaining <= 300 ? "text-red-500 animate-bounce" : "text-on-surface"}`}>
              {timer.formatted}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Display Card */}
          <div className="lg:col-span-3 card-elevation p-6 bg-surface rounded-2xl border border-border/40 space-y-6">
            {currentQuestion ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                    Question {currentIndex + 1} of {attempt.sampleSize}
                  </span>
                  {currentQuestion.category && (
                    <Badge variant="secondary" className="rounded-full">
                      {currentQuestion.category}
                    </Badge>
                  )}
                </div>

                <h2 className="text-xl font-bold text-on-surface leading-snug">
                  {currentQuestion.text}
                </h2>

                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = answers[currentQuestion.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => selectOption(currentQuestion.id, opt.id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                          isSelected
                            ? "border-primary bg-primary/10 text-on-surface shadow-md"
                            : "border-border/60 bg-surface/50 hover:bg-surface-variant/10 text-on-surface-variant"
                        }`}
                      >
                        <span className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted"
                        }`}>
                          {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-white" />}
                        </span>
                        <span className="text-sm md:text-base font-medium">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted">No questions available in this attempt.</p>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-border/40">
              <Button
                variant="outline"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
                className="gap-2 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => toggleFlag(currentQuestion.id)}
                  className={`gap-2 rounded-xl ${
                    flagged.has(currentQuestion?.id) ? "border-amber-500 text-amber-500 bg-amber-500/5 hover:bg-amber-500/10" : ""
                  }`}
                >
                  <Flag className="h-4 w-4" />
                  {flagged.has(currentQuestion?.id) ? "Flagged" : "Flag"}
                </Button>

                {currentIndex < attempt.sampleSize - 1 ? (
                  <Button
                    onClick={() => setCurrentIndex((i) => Math.min(i + 1, attempt.sampleSize - 1))}
                    className="gap-2 bg-primary hover:bg-primary/90 rounded-xl"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowConfirmSubmit(true)}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl"
                  >
                    Submit Assessment
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Question Navigator Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-elevation p-4 bg-surface rounded-2xl border border-border/40 sticky top-24 space-y-4">
              <h3 className="font-bold text-on-surface">Navigator</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isAnswered = !!answers[q.id];
                  const isFlagged = flagged.has(q.id);

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-10 rounded-xl font-bold text-sm flex items-center justify-center transition-all ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-2 ring-primary/30 shadow-md scale-105"
                          : isFlagged
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                          : isAnswered
                          ? "bg-green-500/10 text-green-600 border border-green-500/20"
                          : "bg-surface-variant/20 hover:bg-surface-variant/40 text-on-surface-variant"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-border/40 space-y-2 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded bg-primary" />
                  <span>Current Question</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded bg-green-500/10 border border-green-500/20" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded bg-amber-500/10 border border-amber-500/30" />
                  <span>Flagged for Review</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SUBMISSION CONFIRMATION DIALOG */}
      <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-2rem)] sm:w-[30rem] p-6 rounded-2xl bg-surface border border-border shadow-2xl">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">Submit Assessment?</DialogTitle>
            <DialogDescription className="text-muted text-sm">
              You have answered {answeredCount} out of {attempt.sampleSize} questions.
              Are you sure you are ready to finalize and grade your assessment attempt? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setShowConfirmSubmit(false)} disabled={isSubmitting} className="rounded-xl">
              Keep Working
            </Button>
            <Button onClick={handleSubmitClick} disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl">
              {isSubmitting ? "Submitting..." : "Yes, Submit Grade"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
