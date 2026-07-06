"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Save, StickyNote } from "lucide-react";
import { toast } from "sonner";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";

interface PersonalNotesPanelProps {
  courseId: string;
  lessonId: string;
}

export function PersonalNotesPanel({ courseId, lessonId }: PersonalNotesPanelProps) {
  const { getNote, saveNote, fetchNote } = useEnrollmentStore();
  const [text, setText] = useState(getNote(courseId, lessonId));
  const [isSaved, setIsSaved] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      setIsSyncing(true);
      try {
        const content = await fetchNote(courseId, lessonId);
        if (!cancelled && content) setText(content);
      } catch {
        if (!cancelled) toast.error("Failed to load notes");
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    };
    sync();
    return () => { cancelled = true; };
  }, [courseId, lessonId, fetchNote]);

  const handleSave = async () => {
    setIsSyncing(true);
    try {
      await saveNote(courseId, lessonId, text);
      setIsSaved(true);
      toast.success("Notes saved to your profile");
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor="personal-notes" className="flex items-center gap-2 text-sm font-medium text-on-surface">
          <StickyNote className="h-4 w-4 text-warning" aria-hidden="true" />
          Personal Notes
        </label>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaved || isSyncing}
          className="gap-1.5"
        >
          <Save className="h-3 w-3" aria-hidden="true" />
          {isSyncing ? "Saving..." : isSaved ? "Saved" : "Save"}
        </Button>
      </div>
      <Textarea
        id="personal-notes"
        placeholder="Take notes for this lesson..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setIsSaved(false);
        }}
        rows={6}
        disabled={isSyncing}
        className="resize-none text-sm"
      />
    </div>
  );
}
