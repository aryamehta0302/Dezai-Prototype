"use client";

import { useEffect, useState, useCallback } from "react";
import { apiClient } from "@/core/api/client";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Trophy, Zap } from "lucide-react";
import { motion } from "framer-motion";

// ─── Types (mirrors backend StudentLeaderboardEntryDto) ──────────────────────

type LeaderboardRange = "monthly" | "all";

interface StudentLeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  xp: number;
  streakCount: number;
  institution: string;
}

interface StudentLeaderboardResponse {
  success: boolean;
  data: {
    range: LeaderboardRange;
    generatedAt: string;
    total: number;
    entries: StudentLeaderboardEntry[];
  };
}

// ─── Rank badge helper ────────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-black bg-yellow-400/20 text-yellow-700 border border-yellow-400/40 shrink-0">
        1
      </span>
    );
  if (rank === 2)
    return (
      <span className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-black bg-slate-200 text-slate-600 shrink-0">
        2
      </span>
    );
  if (rank === 3)
    return (
      <span className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-black bg-amber-100 text-amber-800 shrink-0">
        3
      </span>
    );
  return (
    <span className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold bg-surface-low text-muted border border-border-light shrink-0">
      {rank}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TopPerformerList() {
  const { user } = useAuthStore();
  const [range, setRange] = useState<LeaderboardRange>("monthly");
  const [entries, setEntries] = useState<StudentLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchLeaderboard = useCallback(
    async (selectedRange: LeaderboardRange) => {
      setIsLoading(true);
      setError(false);
      try {
        const res = await apiClient.get<StudentLeaderboardResponse>(
          "/leaderboards/students",
          { params: { range: selectedRange, limit: 10 } }
        );
        setEntries(res?.data?.entries ?? []);
      } catch {
        setError(true);
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLeaderboard(range);
  }, [range, fetchLeaderboard]);

  return (
    <div className="card-elevation p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
          <Trophy className="h-4 w-4 text-warning" />
          Top Performers
        </h3>
        {/* Range switcher */}
        <div className="flex bg-surface-low rounded-lg p-0.5 border border-border-light">
          {(["monthly", "all"] as LeaderboardRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-2xs font-bold px-2.5 py-1 rounded-md transition-all duration-200 ${
                range === r
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-on-surface"
              }`}
            >
              {r === "monthly" ? "Monthly" : "All-Time"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-2">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-2.5 rounded-xl animate-pulse"
            >
              <div className="h-7 w-7 rounded-full bg-surface-low shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 w-24 bg-surface-low rounded" />
                <div className="h-2 w-16 bg-surface-low rounded" />
              </div>
              <div className="h-2.5 w-12 bg-surface-low rounded" />
            </div>
          ))
        ) : error ? (
          <div className="text-center py-6 text-muted">
            <p className="text-xs font-semibold">Failed to load leaderboard.</p>
            <button
              onClick={() => fetchLeaderboard(range)}
              className="text-3xs text-primary font-bold mt-1 hover:underline"
            >
              Retry
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-xs font-semibold">No rankings yet.</p>
            <p className="text-2xs mt-0.5">
              Complete lessons to earn XP and climb the leaderboard.
            </p>
          </div>
        ) : (
          entries.map((entry, i) => {
            const isMe = entry.userId === user?.id;
            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  isMe
                    ? "bg-primary/5 border border-primary/20"
                    : "hover:bg-surface-low/50"
                }`}
              >
                <RankBadge rank={entry.rank} />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-bold truncate ${
                      isMe ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {entry.name}
                    {isMe && (
                      <span className="ml-1.5 text-3xs font-extrabold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-2xs text-muted truncate">
                    {entry.institution}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Zap className="h-3 w-3 text-warning fill-warning/20" />
                  <span className="text-xs font-bold text-on-surface">
                    {entry.xp.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
