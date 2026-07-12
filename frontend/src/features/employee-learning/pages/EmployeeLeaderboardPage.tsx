"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Loader2 } from "lucide-react";
import { employeeLearningApi } from "../services/employee-learning-api.service";
import { EmployeeLeaderboard } from "../components/EmployeeLeaderboard";
import type { LeaderboardEntry } from "../types/employee-learning.types";

export default function EmployeeLeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [organization, setOrganization] = useState("");
  const [currentUser, setCurrentUser] = useState<{ rank: number; xp: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await employeeLearningApi.getLeaderboard(50);
      const data = res as unknown as {
        entries: LeaderboardEntry[];
        currentUser: { rank: number; xp: number } | null;
        organization: string;
      };
      setEntries(data.entries);
      setCurrentUser(data.currentUser);
      setOrganization(data.organization);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          See how you rank among your colleagues
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <EmployeeLeaderboard entries={entries} organization={organization} currentUser={currentUser} />
      )}
    </div>
  );
}
