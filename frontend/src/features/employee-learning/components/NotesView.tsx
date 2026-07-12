"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { StickyNote, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import type { EmployeeNote } from "../types/employee-learning.types";

interface Props {
  notes: EmployeeNote[];
  loading: boolean;
  onSave: (assessmentId: string, content: string) => Promise<EmployeeNote>;
}

export function NotesView({ notes, loading, onSave }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async (assessmentId: string) => {
    setSaving(true);
    try {
      await onSave(assessmentId, editContent);
      setEditingId(null);
      setEditContent("");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="py-12 text-center">
        <StickyNote className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">
          No notes yet. Add notes while taking assessments.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => (
        <Card key={note.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">{note.assessmentTitle}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {editingId === note.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full rounded-md border p-2 text-sm"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSave(note.assessmentId)} disabled={saving}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(note.updatedAt).toLocaleDateString()}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(note.id);
                      setEditContent(note.content);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
