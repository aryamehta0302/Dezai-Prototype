"use client";

import { useState, useEffect, useMemo } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import "react-activity-calendar/tooltips.css";
import { learningApi } from "@/features/learning/services/learning-api.service";
import type { DailyActivityEntry } from "@/features/learning/types/learning-intelligence.types";

function computeLevel(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

function buildEmptyYear(year: number): DailyActivityEntry[] {
  const result: DailyActivityEntry[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const cursor = new Date(start);
  while (cursor <= end) {
    result.push({ date: cursor.toISOString().slice(0, 10), count: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}

export function ActivityChart() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [rawData, setRawData] = useState<DailyActivityEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    learningApi.getDailyActivity(year).then((res) => {
      if (!cancelled) {
        setRawData(res.data);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        setRawData(buildEmptyYear(year));
        setLoading(false);
        setError(true);
      }
    });
    return () => { cancelled = true; };
  }, [year]);

  const data = useMemo(() => {
    if (!rawData) return [];
    return rawData.map((d) => ({ ...d, level: computeLevel(d.count) }));
  }, [rawData]);

  const totalActive = useMemo(() => data.filter((d) => d.count > 0).length, [data]);
  const maxStreak = useMemo(() => {
    let best = 0, cur = 0;
    for (const d of data) {
      if (d.count > 0) { cur++; best = Math.max(best, cur); }
      else cur = 0;
    }
    return best;
  }, [data]);

  const years = useMemo(() => {
    const now = currentYear;
    return [now, now - 1, now - 2, now - 3, now - 4].filter((y) => y >= 2020);
  }, [currentYear]);

  return (
    <div className="card-elevation p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-on-surface">Activity</h3>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="text-xs bg-transparent border border-border-light rounded-md px-2 py-1 text-on-surface outline-hidden focus:border-primary"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          {loading ? (
            <span className="text-xs text-muted">Loading...</span>
          ) : (
            <span className="text-xs text-muted">
              {totalActive} days &middot; {maxStreak}-day streak
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data.length > 0 ? (
        <ActivityCalendar
          data={data}
          colorScheme="light"
          blockSize={11}
          blockMargin={3}
          fontSize={11}
          showWeekdayLabels={["mon", "wed", "fri"]}
          showTotalCount={false}
          tooltips={{
            activity: {
              text: (a) => `${a.count} activity on ${a.date}`,
            },
          }}
          theme={{
            light: ["hsl(0, 0%, 95%)", "#d0e4ff", "#77b5fe", "#3388ff", "#0055cc"],
          }}
        />
      ) : (
        <div className="h-32 flex items-center justify-center">
          <p className="text-sm text-muted">No activity recorded yet.</p>
        </div>
      )}
    </div>
  );
}
