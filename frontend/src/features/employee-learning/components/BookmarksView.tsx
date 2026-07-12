"use client";

import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Bookmark, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { EmployeeBookmark } from "../types/employee-learning.types";
import { COMPLIANCE_TRACK_LABELS } from "../types/employee-learning.types";

interface Props {
  bookmarks: EmployeeBookmark[];
  loading: boolean;
}

export function BookmarksView({ bookmarks, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="py-12 text-center">
        <Bookmark className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">
          No bookmarks yet. Bookmark assessments to revisit them later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bm) => (
        <Link key={bm.id} href={`/learning/${bm.assessmentId}`}>
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Bookmark className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="text-sm font-medium">{bm.assessmentTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {COMPLIANCE_TRACK_LABELS[bm.complianceTrack]}
                  </p>
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
