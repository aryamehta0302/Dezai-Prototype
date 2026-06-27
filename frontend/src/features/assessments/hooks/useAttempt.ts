"use client";

import { useState, useEffect, useRef, useCallback, startTransition } from "react";
import { assessmentAttemptService } from "../services/assessment-attempt.service";
import { Attempt } from "../types/assessment.types";
import { useTimer } from "../../quizzes/hooks/useTimer";
import { toast } from "sonner";

export function useAttempt(assessmentId: string, accessToken?: string, slug?: string) {
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  
  // Proctoring States
  const [warningsCount, setWarningsCount] = useState(0);
  const [scoreDeduction, setScoreDeduction] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [isTerminated, setIsTerminated] = useState(false);
  const [lastViolationTime, setLastViolationTime] = useState(0);
  const [isFullscreenActive, setIsFullscreenActive] = useState(false);

  // Auto-Save States
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const hasUnsavedChanges = useRef(false);
  const answersRef = useRef(answers);
  const isSubmittingRef = useRef(false);

  // Sync answers ref
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Guard to prevent initializeAttempt from running twice (React Strict Mode)
  const initializedRef = useRef(false);

  // Ref for timer to break circular dependency with handleTimeUp
  const handleTimeUpRef = useRef(async () => {});
  // Timer Setup (default 30 min = 1800s, overridden by attempt.timeLimit)
  const timer = useTimer(1800, () => handleTimeUpRef.current());

  // Submit attempt
  const submit = async () => {
    if (!attempt || !accessToken) return;

    try {
      // Perform a final autosave if needed
      if (hasUnsavedChanges.current) {
        await assessmentAttemptService.autoSaveAnswers(
          attempt.attemptId,
          answersRef.current,
          accessToken
        );
        hasUnsavedChanges.current = false;
      }

      setSaveStatus("saving");
      const res = await assessmentAttemptService.submitAttempt(attempt.attemptId, accessToken, answersRef.current);
      timer.pause();
      return res;
    } catch (err) {
      console.error("Failed to submit assessment:", err);
      const message = err instanceof Error ? err.message : "Failed to submit assessment";
      toast.error(message);
      throw err;
    }
  };

  // Handle Timeout Callback
  const handleTimeUp = useCallback(async () => {
    if (!attempt || isTerminated) return;
    toast.error("Time is up! Submitting your assessment...");
    await submit();
  }, [attempt, isTerminated, submit]);

  useEffect(() => {
    handleTimeUpRef.current = handleTimeUp;
  }, [handleTimeUp]);

  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<"max_attempts" | "already_completed" | "generic" | null>(null);
  const [attemptStatus, setAttemptStatus] = useState<{
    attemptsRemaining: number;
    maxAttempts: number;
    everPassed: boolean;
    canAttempt: boolean;
    bestScore: number | null;
    bestPercentage: number | null;
  } | null>(null);

  // Load or Restore Attempt
  const initializeAttempt = useCallback(async () => {
    if (!accessToken) return;
    if (initializedRef.current) return;
    initializedRef.current = true;

    let activeAttemptId: string | null = null;
    setError(null);

    let completedAttemptId: string | null = null;

    try {
      setSaveStatus("idle");

      // Check attempt status first
      const status = await assessmentAttemptService.getAttemptStatus(assessmentId, accessToken);
      setAttemptStatus({
        attemptsRemaining: status.attemptsRemaining,
        maxAttempts: status.maxAttempts,
        everPassed: status.everPassed,
        canAttempt: status.canAttempt,
        bestScore: status.bestScore,
        bestPercentage: status.bestPercentage,
      });

      if (!status.canAttempt) {
        if (status.hasActiveAttempt && status.activeAttemptId) {
          // Active attempt exists — let the resume flow handle it below
        } else if (status.attemptsRemaining === 0) {
          setError("Maximum attempts reached for this assessment.");
          setErrorType("max_attempts");
          return;
        } else if (status.everPassed) {
          setError("You have already passed this assessment.");
          setErrorType("already_completed");
          return;
        } else {
          setError("You cannot start a new attempt at this time.");
          setErrorType("generic");
          return;
        }
      }

      let data: Attempt;

      try {
        data = await assessmentAttemptService.startAttempt(assessmentId, accessToken);
      } catch (startErr) {
        const msg = startErr instanceof Error ? startErr.message : "";
        if (!msg.includes("active attempt already exists")) {
          setError(msg || "Failed to start assessment attempt");
          setErrorType("generic");
          return;
        }

        activeAttemptId = status.activeAttemptId ?? null;

        // Stale status — re-fetch to get the real activeAttemptId
        if (!status.hasActiveAttempt || !activeAttemptId) {
          const freshStatus = await assessmentAttemptService.getAttemptStatus(assessmentId, accessToken);
          activeAttemptId = freshStatus.activeAttemptId ?? null;
          if (!activeAttemptId) {
            setError("No active attempt found to resume");
            setErrorType("generic");
            return;
          }
        }

        data = await assessmentAttemptService.resumeAttempt(activeAttemptId, accessToken);
      }
      
      setAttempt(data);
      setWarningsCount(data.warningsCount);
      setScoreDeduction(data.scoreDeduction);

      if (data.timeLimit) {
        timer.reset(data.timeLimit);
      }

      if (data.status === "TERMINATED") {
        setIsTerminated(true);
        timer.pause();
        return;
      }

      if (data.answers) {
        setAnswers(data.answers);
      }

      const ackCount = typeof window !== "undefined"
        ? parseInt(localStorage.getItem(`ack_warnings_${data.sessionId}`) || "0", 10)
        : 0;

      if (data.warningsCount === 1 && ackCount < 1) {
        timer.pause();
        setShowWarningModal(true);
      } else if (data.lockoutUntil) {
        const remainingLockout = Math.floor(
          (new Date(data.lockoutUntil).getTime() - Date.now()) / 1000
        );
        if (remainingLockout > 0) {
          setIsScreenLocked(true);
          setLockoutCountdown(remainingLockout);
          timer.pause();
        } else {
          timer.start();
        }
      } else {
        timer.start();
      }

      if (data.remainingTime !== undefined) {
        timer.reset(data.remainingTime);
        timer.start();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("already completed")) {
        setError("This attempt has already been submitted. You can review it below.");
        setErrorType("already_completed");
        return;
      }
      console.error("Failed to initialize attempt:", err);
      setError(message || "Failed to load assessment");
      setErrorType("generic");
    }
  }, [assessmentId, accessToken, slug]);

  // Save Answers to Backend
  const saveCurrentAnswers = useCallback(async () => {
    if (!attempt || !accessToken || !hasUnsavedChanges.current) return;

    try {
      setSaveStatus("saving");
      await assessmentAttemptService.autoSaveAnswers(
        attempt.attemptId,
        answersRef.current,
        accessToken
      );
      hasUnsavedChanges.current = false;
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      console.error("Autosave failed:", err);
      setSaveStatus("error");
    }
  }, [attempt, accessToken]);

  // Debounced Auto-Save (2s after last change)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!hasUnsavedChanges.current) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      saveCurrentAnswers();
    }, 2000);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [answers, saveCurrentAnswers]);

  // Save on beforeunload / exit
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        saveCurrentAnswers();
        e.preventDefault();
        e.returnValue = "You have unsaved answers. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveCurrentAnswers]);

  // Answer selection handler
  const selectOption = (questionId: string, optionId: string) => {
    if (isScreenLocked || isTerminated) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
    hasUnsavedChanges.current = true;
    setSaveStatus("idle");
  };

  // Flag question handler
  const toggleFlag = (questionId: string) => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // Log Proctoring Violation
  const handleViolation = useCallback(
    async (type: "TAB_SWITCH" | "FOCUS_LOSS" | "COPY_PASTE") => {
      if (!attempt || isTerminated || !accessToken || isSubmittingRef.current) return;

      // Ignore FOCUS_LOSS while warning or lockout screen is active
      if ((showWarningModal || isScreenLocked) && type === "FOCUS_LOSS") return;

      const now = Date.now();
      if (now - lastViolationTime < 500) return; // throttle 500ms
      setLastViolationTime(now);

      try {
        const res = await assessmentAttemptService.logViolation(
          attempt.sessionId,
          type,
          accessToken
        );
        const updatedSession = res.session;

        setWarningsCount(updatedSession.warningsCount);
        setScoreDeduction(updatedSession.scoreDeduction);

        if (updatedSession.warningsCount === 1) {
          timer.pause();
          setShowWarningModal(true);
          toast.warning("Security Warning: Focus lost. Return and acknowledge.");
        } else if (updatedSession.warningsCount === 2) {
          setShowWarningModal(false);
          timer.pause();
          setIsScreenLocked(true);
          setLockoutCountdown(30);
          toast.error("Second Offense: Point deduction applied and screen locked.");
        } else if (
          updatedSession.status === "TERMINATED" ||
          updatedSession.warningsCount >= 3
        ) {
          setShowWarningModal(false);
          setIsScreenLocked(false);
          setIsTerminated(true);
          timer.pause();
          toast.error("Security Terminated: Multiple proctoring violations recorded.");
        }
      } catch (err) {
        console.error("Violation logging failed:", err);
      }
    },
    [attempt, isTerminated, accessToken, lastViolationTime, showWarningModal, isScreenLocked, timer]
  );

  // Lockout screen countdown
  useEffect(() => {
    if (lockoutCountdown > 0 && isScreenLocked) {
      const t = setTimeout(() => {
        setLockoutCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(t);
    } else if (lockoutCountdown === 0 && isScreenLocked) {
      startTransition(() => {
        setIsScreenLocked(false);
      });
      timer.start();
    }
  }, [lockoutCountdown, isScreenLocked, timer]);

  return {
    attempt,
    currentIndex,
    setCurrentIndex,
    answers,
    selectOption,
    flagged,
    toggleFlag,
    timer,
    saveStatus,
    saveCurrentAnswers,
    submit,
    error,
    errorType,
    attemptStatus,
    
    // Proctoring states/handlers
    warningsCount,
    setWarningsCount,
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
    isSubmittingRef,
  };
}
