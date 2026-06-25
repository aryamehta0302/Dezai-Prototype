"use client";

import Link from "next/link";
import { AttemptHistoryItem } from "../types/assessment.types";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

interface AttemptHistoryTableProps {
  history: AttemptHistoryItem[];
  slug: string;
  assessmentId: string;
  currentAttemptId?: string | null;
}

export function AttemptHistoryTable({ history, slug, assessmentId, currentAttemptId }: AttemptHistoryTableProps) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-3">
      <Card className="overflow-hidden border border-border/40 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-variant/20 text-on-surface-variant font-semibold">
              <tr>
                <th className="px-4 py-3">Attempt Date</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {history.map((h) => (
                <tr key={h.attemptId} className={h.attemptId === currentAttemptId ? "bg-primary/5" : ""}>
                  <td className="px-4 py-3 text-muted">
                    {new Date(h.completedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3 font-bold text-on-surface">
                    {h.percentage ?? h.score}%
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      h.passed
                        ? "bg-green-500/10 text-green-600"
                        : "bg-red-500/10 text-red-600"
                    }`}>
                      {h.passed ? "PASS" : "FAIL"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/programs/${slug}/assessment/${assessmentId}/review?attemptId=${h.attemptId}`}>
                      <Button variant="ghost" size="sm" className="text-primary hover:underline text-xs">
                        View Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
