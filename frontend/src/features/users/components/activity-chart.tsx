"use client";

import { useState, useMemo } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";

export function ActivityChart() {
  const { enrollments } = useEnrollmentStore();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const data = useMemo(() => {
    const dailyMap = new Map<string, number>();

    for (const enrollment of Object.values(enrollments)) {
      if (!enrollment.lessonsCompleted) continue;
      for (const l of enrollment.lessonsCompleted) {
        if (l.completed && l.completedAt) {
          const key = l.completedAt.slice(0, 10);
          dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
        }
      }
    }

    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    const result: { date: string; count: number; level: number }[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const dateStr = cursor.toISOString().slice(0, 10);
      const count = dailyMap.get(dateStr) || 0;
      const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
      result.push({ date: dateStr, count, level });
      cursor.setDate(cursor.getDate() + 1);
    }

    return result;
  }, [enrollments, year]);

  const totalActive = data.filter((d) => d.count > 0).length;

  const maxStreak = useMemo(() => {
    let best = 0, cur = 0;
    for (const d of data) {
      if (d.count > 0) { cur++; best = Math.max(best, cur); }
      else cur = 0;
    }
    return best;
  }, [data]);

  const years = useMemo(() => {
    const set = new Set<number>();
    set.add(currentYear);
    for (const enrollment of Object.values(enrollments)) {
      if (!enrollment.lessonsCompleted) continue;
      for (const l of enrollment.lessonsCompleted) {
        if (l.completed && l.completedAt) {
          set.add(new Date(l.completedAt).getFullYear());
        }
      }
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [enrollments, currentYear]);

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
          <span className="text-xs text-muted">
            {totalActive} days &middot; {maxStreak}-day streak
          </span>
        </div>
      </div>

      <ActivityCalendar
        data={data}
        colorScheme="light"
        blockSize={11}
        blockMargin={3}
        fontSize={11}
        showWeekdayLabels={["mon", "wed", "fri"]}
        showTotalCount={false}
        theme={{
          light: ["hsl(0, 0%, 95%)", "#d0e4ff", "#77b5fe", "#3388ff", "#0055cc"],
        }}
      />
    </div>
  );
}
