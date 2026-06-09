"use client";

import { useCallback } from "react";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";

export function useNotes(courseId: string) {
  const { saveNote, getNote } = useEnrollmentStore();

  const note = useCallback(
    (lessonId: string) => getNote(courseId, lessonId),
    [courseId, getNote]
  );

  const save = useCallback(
    (lessonId: string, text: string) => saveNote(courseId, lessonId, text),
    [courseId, saveNote]
  );

  return { getNote: note, saveNote: save };
}
