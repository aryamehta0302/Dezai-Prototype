"use client";

import { useState, useEffect, useRef, useCallback, startTransition } from "react";
import { assessmentAttemptService } from "../services/assessment-attempt.service";
import { Attempt } from "../types/assessment.types";
import { useTimer } from "../../quizzes/hooks/useTimer";
import { toast } from "sonner";

export function useAttempt(assessmentId: string, accessToken?: string) {
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

  // Sync answers ref
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

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
          answers,
          accessToken
        );
        hasUnsavedChanges.current = false;
      }

      setSaveStatus("saving");
      const res = await assessmentAttemptService.submitAttempt(attempt.attemptId, accessToken);
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

  // Load or Restore Attempt
  const initializeAttempt = useCallback(async () => {
    if (!accessToken) return;

    try {
      setSaveStatus("idle");
      // 1. Try starting/getting an active attempt
      const data = await assessmentAttemptService.startAttempt(assessmentId, accessToken);
      
      setAttempt(data);
      setWarningsCount(data.warningsCount);
      setScoreDeduction(data.scoreDeduction);

      // Use server-provided timeLimit if available
      if (data.timeLimit) {
        timer.reset(data.timeLimit);
      }

      if (data.status === "TERMINATED") {
        setIsTerminated(true);
        timer.pause();
        return;
      }

      // If there are pre-saved answers (e.g. from a resumed attempt)
      if (data.answers) {
        setAnswers(data.answers);
      }

      // Restore warning modal / lockout if active on the server
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

      // Adjust timer if remainingTime was returned
      if (data.remainingTime !== undefined) {
        timer.reset(data.remainingTime);
        timer.start();
      }
    } catch (err) {
      console.error("Failed to initialize attempt:", err);
      const message = err instanceof Error ? err.message : "Failed to load assessment";
      toast.error(message);
    }
  }, [assessmentId, accessToken]);

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

  // Periodic Auto-Save interval (every 30s)
  useEffect(() => {
    const interval = setInterval(() => {
      saveCurrentAnswers();
    }, 30000);

    return () => clearInterval(interval);
  }, [saveCurrentAnswers]);

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
      if (!attempt || isTerminated || !accessToken) return;

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
  };
}
