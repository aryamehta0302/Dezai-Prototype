"use client";

import { useState, useEffect, useCallback } from "react";
import { employeeLearningApi } from "../services/employee-learning-api.service";
import type { EmployeeNote } from "../types/employee-learning.types";

export function useEmployeeNotes() {
  const [notes, setNotes] = useState<EmployeeNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeLearningApi.getAllNotes();
      setNotes((res as unknown as { notes: EmployeeNote[] }).notes);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const upsertNote = useCallback(async (assessmentId: string, content: string) => {
    const res = await employeeLearningApi.upsertNote(assessmentId, content);
    const note = (res as unknown as { note: EmployeeNote }).note;
    setNotes((prev) => {
      const idx = prev.findIndex((n) => n.assessmentId === assessmentId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = note;
        return updated;
      }
      return [note, ...prev];
    });
    return note;
  }, []);

  return { notes, loading, error, upsertNote, refetch: fetchNotes };
}

export function useEmployeeNote(assessmentId: string) {
  const [note, setNote] = useState<EmployeeNote | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNote = useCallback(async () => {
    if (!assessmentId) return;
    setLoading(true);
    try {
      const res = await employeeLearningApi.getNote(assessmentId);
      setNote((res as unknown as { note: EmployeeNote | null }).note);
    } catch {
      setNote(null);
    } finally {
      setLoading(false);
    }
  }, [assessmentId]);

  useEffect(() => { fetchNote(); }, [fetchNote]);

  const save = useCallback(async (content: string) => {
    const res = await employeeLearningApi.upsertNote(assessmentId, content);
    const saved = (res as unknown as { note: EmployeeNote }).note;
    setNote(saved);
    return saved;
  }, [assessmentId]);

  return { note, loading, save, refetch: fetchNote };
}
