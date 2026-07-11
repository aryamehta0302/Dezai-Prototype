"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getSession } from "next-auth/react";

// ─────────────────── TYPES ───────────────────

export type InsightAlertType = "AT_RISK" | "LOW_PROGRESS" | "INACTIVE";

export interface InsightAlert {
  type: InsightAlertType;
  userId: string;
  userName: string;
  detail: string;
}

export interface InsightStreamSummary {
  totalAtRisk: number;
  totalLowProgress: number;
  totalInactive: number;
  totalStudentsMonitored: number;
}

export interface InsightStreamEvent {
  timestamp: string;
  summary: InsightStreamSummary;
  alerts: InsightAlert[];
}

export type ConnectionState = "connecting" | "connected" | "reconnecting" | "disconnected" | "error";

// ─────────────────── CONSTANTS ───────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001/api";
const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;

// ─────────────────── HOOK ───────────────────

/**
 * useFacultyInsightsStream — SSE listener for real-time faculty insights
 *
 * Provides:
 * - Automatic connection/disconnection tied to component lifecycle
 * - Reconnection with exponential backoff on network drop
 * - Connection state tracking for UI indicators
 * - Error boundary support (degrades gracefully)
 * - No memory leaks or duplicate listeners on re-render
 *
 * Sprint 7 — V1 Production Hardening
 */
export function useFacultyInsightsStream() {
  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [latestEvent, setLatestEvent] = useState<InsightStreamEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!isMountedRef.current) return;

    // Clean up any existing connection (aborts previous controller)
    cleanup();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Get auth token for SSE connection
      const session = await getSession();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const token = (session as any)?.accessToken;

      if (!token) {
        if (!controller.signal.aborted) {
          setConnectionState("error");
          setError("Authentication required for real-time updates");
        }
        return;
      }

      if (controller.signal.aborted) return;

      const streamUrl = `${BASE_URL}/assessments/faculty-insights/stream`;

      setConnectionState(reconnectAttemptRef.current > 0 ? "reconnecting" : "connecting");

      // Use fetch-based SSE to support Authorization header
      const response = await fetch(streamUrl, {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // Auth failure — don't retry (token expired or no access)
          if (!controller.signal.aborted) {
            setConnectionState("error");
            setError("Session expired. Please refresh the page.");
          }
          return;
        }
        throw new Error(`SSE connection failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error("SSE response has no body");
      }

      if (controller.signal.aborted) return;

      setConnectionState("connected");
      setError(null);
      reconnectAttemptRef.current = 0;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const readStream = async () => {
        try {
          while (isMountedRef.current && !controller.signal.aborted) {
            const { done, value } = await reader.read();

            if (done) {
              // Server closed the connection — attempt reconnect
              if (isMountedRef.current && !controller.signal.aborted) {
                scheduleReconnect();
              }
              break;
            }

            buffer += decoder.decode(value, { stream: true });

            // Parse SSE events from buffer
            const events = buffer.split("\n\n");
            buffer = events.pop() || ""; // Keep incomplete event in buffer

            for (const eventText of events) {
              if (!eventText.trim()) continue;

              const lines = eventText.split("\n");
              let eventType = "message";
              let dataStr = "";

              for (const line of lines) {
                if (line.startsWith("event:")) {
                  eventType = line.slice(6).trim();
                } else if (line.startsWith("data:")) {
                  dataStr += line.slice(5).trim();
                }
              }

              if (!dataStr) continue;

              try {
                const data = JSON.parse(dataStr);

                if (eventType === "error") {
                  setError(data.error || "Stream error occurred");
                } else if (eventType === "session_expired") {
                  setError("Session expired. Please refresh the page.");
                  setConnectionState("disconnected");
                  cleanup();
                  break;
                } else {
                  setLatestEvent(data as InsightStreamEvent);
                  setError(null);
                }
              } catch {
                // Ignore malformed JSON — continue processing
              }
            }
          }
        } catch (readError: any) {
          if (readError?.name === "AbortError" || controller.signal.aborted) {
            return;
          }
          if (isMountedRef.current) {
            scheduleReconnect();
          }
        }
      };

      readStream();
    } catch (connectError: any) {
      if (connectError?.name === "AbortError" || controller.signal.aborted) {
        return;
      }
      if (isMountedRef.current) {
        scheduleReconnect();
      }
    }
  }, [cleanup]);

  const scheduleReconnect = useCallback(() => {
    if (!isMountedRef.current) return;

    reconnectAttemptRef.current++;

    if (reconnectAttemptRef.current > MAX_RECONNECT_ATTEMPTS) {
      setConnectionState("error");
      setError("Unable to connect to real-time updates after multiple attempts.");
      return;
    }

    setConnectionState("reconnecting");

    // Exponential backoff with jitter
    const backoff = Math.min(
      INITIAL_BACKOFF_MS * Math.pow(2, reconnectAttemptRef.current - 1),
      MAX_BACKOFF_MS,
    );
    const jitter = backoff * 0.1 * Math.random();

    reconnectTimerRef.current = setTimeout(() => {
      connect();
    }, backoff + jitter);
  }, [connect]);

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      cleanup();
      setConnectionState("disconnected");
    };
  }, [connect, cleanup]);

  return {
    /** Current connection state for UI indicator */
    connectionState,
    /** Latest insight event received from the stream */
    latestEvent,
    /** Error message if the stream encountered an issue */
    error,
    /** Whether the stream is actively receiving data */
    isConnected: connectionState === "connected",
    /** Whether the stream is trying to reconnect */
    isReconnecting: connectionState === "reconnecting",
    /** Whether the stream has a fatal error */
    hasError: connectionState === "error",
    /** Manually trigger a reconnect */
    reconnect: connect,
  };
}
