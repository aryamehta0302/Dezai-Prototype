"use client";

import { useState } from "react";
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

  // Fetch note from backend on mount
  useState(() => {
    const sync = async () => {
      setIsSyncing(true);
      const content = await fetchNote(courseId, lessonId);
      if (content) setText(content);
      setIsSyncing(false);
    };
    sync();
  });

  const handleSave = async () => {
    setIsSyncing(true);
    await saveNote(courseId, lessonId, text);
    setIsSaved(true);
    setIsSyncing(false);
    toast.success("Notes saved to your profile");
  };


  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
          <StickyNote className="h-4 w-4 text-warning" />
          Personal Notes
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaved}
          className="gap-1.5"
        >
          <Save className="h-3 w-3" />
          {isSaved ? "Saved" : "Save"}
        </Button>
      </div>
      <Textarea
        placeholder="Take notes for this lesson..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setIsSaved(false);
        }}
        rows={6}
        className="resize-none text-sm"
      />
    </div>
  );
}
