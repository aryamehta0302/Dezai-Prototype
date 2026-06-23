import { Attempt, AttemptResult, AttemptHistoryItem, AttemptStatusResponse } from "../types/assessment.types";

const getApiUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
};

export const assessmentAttemptService = {
  async startAttempt(assessmentId: string, token: string): Promise<Attempt> {
    const res = await fetch(`${getApiUrl()}/assessments/attempts/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ assessmentId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to start assessment attempt");
    }

    return res.json();
  },

  async resumeAttempt(attemptId: string, token: string): Promise<Attempt> {
    const res = await fetch(`${getApiUrl()}/assessments/attempts/${attemptId}/resume`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to resume assessment attempt");
    }

    return res.json();
  },

  async autoSaveAnswers(
    attemptId: string,
    answers: Record<string, string>,
    token: string
  ): Promise<{ success: boolean }> {
    const res = await fetch(`${getApiUrl()}/assessments/attempts/${attemptId}/auto-save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ answers }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to autosave answers");
    }

    return res.json();
  },

  async submitAttempt(
    attemptId: string,
    token: string
  ): Promise<{ success: boolean; attemptId: string; score: number; passed: boolean }> {
    const res = await fetch(`${getApiUrl()}/assessments/attempts/${attemptId}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to submit assessment");
    }

    return res.json();
  },

  async getAttemptResult(attemptId: string, token: string): Promise<AttemptResult> {
    const res = await fetch(`${getApiUrl()}/assessments/attempts/${attemptId}/result`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to retrieve attempt result");
    }

    return res.json();
  },

  async getAttemptHistory(
    assessmentId: string,
    token: string
  ): Promise<{ success: boolean; attempts: AttemptHistoryItem[] }> {
    const res = await fetch(`${getApiUrl()}/assessments/attempts/history/${assessmentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to retrieve attempt history");
    }

    return res.json();
  },

  async getAttemptStatus(assessmentId: string, token: string): Promise<AttemptStatusResponse> {
    const res = await fetch(`${getApiUrl()}/assessments/${assessmentId}/attempt-status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to retrieve attempt status");
    }

    return res.json();
  },

  async logViolation(
    sessionId: string,
    type: "TAB_SWITCH" | "FOCUS_LOSS" | "COPY_PASTE",
    token: string
  ): Promise<{ session: { warningsCount: number; scoreDeduction: number; status: string; lockoutUntil: string | null } }> {
    const res = await fetch(`${getApiUrl()}/assessments/sessions/${sessionId}/violations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to log proctoring violation");
    }

    return res.json();
  },
};
