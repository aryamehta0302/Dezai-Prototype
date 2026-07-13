"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Medal, Zap, Target, Award, Crown } from "lucide-react";
import type { LeaderboardEntry } from "../types/employee-learning.types";
import { employeeLearningService } from "../services/employee-learning.service";

interface Props {
  entries: LeaderboardEntry[];
  organization: string;
  currentUser: { rank: number; xp: number } | null;
}

const RANK_STYLES: Record<number, string> = {
  1: "bg-yellow-100 text-yellow-800 border-yellow-300",
  2: "bg-slate-100 text-slate-600 border-slate-300",
  3: "bg-orange-50 text-orange-700 border-orange-300",
};

export function EmployeeLeaderboard({ entries, organization, currentUser }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Leaderboard</CardTitle>
          <Badge variant="outline">{organization}</Badge>
        </div>
        {currentUser && (
          <p className="text-xs text-muted-foreground">
            Your rank: <span className="font-medium text-foreground">#{currentUser.rank}</span> ({currentUser.xp.toLocaleString()} XP)
          </p>
        )}
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leaderboard data available.</p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => {
              const level = employeeLearningService.calculateLevel(entry.xp);
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    entry.isCurrentUser ? "border-blue-200 bg-blue-50" : ""
                  } ${RANK_STYLES[entry.rank] || ""}`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">
                    {entry.rank <= 3 ? (
                      <Medal className={`h-4 w-4 ${entry.rank === 1 ? "text-yellow-500" : entry.rank === 2 ? "text-slate-400" : "text-orange-400"}`} />
                    ) : (
                      entry.rank
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium truncate">{entry.name || "Employee"}</p>
                      {entry.isCurrentUser && <Badge variant="secondary" className="text-[10px]">You</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">Level {level.level}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Zap className="h-3 w-3 text-violet-500" />
                      {entry.xp.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
