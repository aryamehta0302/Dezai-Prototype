"use client";

/**
 * InstitutionDashboardPage
 *
 * Dashboard for UNIVERSITY_ADMIN users.
 * Sprint 6 deliverable: Institution Analytics Widgets
 *
 * Data source: GET /api/leaderboards/universities (no new endpoint needed)
 * The university leaderboard returns: rank, institutionName, totalXp, activeStudents,
 * fastestCompletionDays for ALL institutions.
 * We find the current institution by matching the user's institution from their profile.
 *
 * Additionally uses: GET /api/analytics/faculty/programs (available to UNIVERSITY_ADMIN
 * via existing RolesGuard: FACULTY | UNIVERSITY_ADMIN | DEZAI_ADMIN)
 * to show program count for the institution.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Zap,
  TrendingUp,
  Trophy,
  Clock,
  BarChart3,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";
import { apiClient } from "@/core/api/client";
import { useAuthStore } from "@/lib/stores/auth.store";
import { PageContainer } from "@/shared/components/page-container";
import { analyticsService } from "@/features/analytics/services/analytics.service";
import type { UniversityLeaderboardEntry } from "@/features/analytics/types/analytics.types";

// ─── Local types ──────────────────────────────────────────────────────────────

interface ProgramSummary {
  id: string;
  title: string;
  institutionName: string;
}

interface InstitutionStats {
  institutionName: string;
  totalXp: number;
  activeStudents: number;
  fastestCompletionDays: number | null;
  globalRank: number;
  programCount: number;
}

// ─── Stat Card helper ─────────────────────────────────────────────────────────

function StatWidget({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  delay,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="bg-white border border-border-light rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
    >
      <div className="space-y-1">
        <span className="text-2xs font-bold text-muted uppercase tracking-wider">{title}</span>
        <h2 className="text-2xl font-black text-on-surface">{value}</h2>
        <span className="text-3xs text-muted flex items-center gap-1 font-semibold">{subtitle}</span>
      </div>
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-all ${color}`}>
        <Icon className="h-6 w-6" />
      </div>
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InstitutionDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<InstitutionStats | null>(null);
  const [programs, setPrograms] = useState<ProgramSummary[]>([]);
  const [topInstitutions, setTopInstitutions] = useState<UniversityLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch university leaderboard — contains our institution's stats
        const lbRes = await analyticsService.getUniversityLeaderboard(20);

        if (lbRes?.entries) {
          setTopInstitutions(lbRes.entries.slice(0, 5));

          // Find own institution by name from user profile (fallback: first entry)
          const profileRes = await apiClient.get<any>("/users/faculty/profile").catch(() => null);
          const ownInstitutionName = profileRes?.institution?.name ?? "";

          const own = lbRes.entries.find(
            (e) => e.institutionName === ownInstitutionName
          ) ?? lbRes.entries[0];

          if (own) {
            setStats({
              institutionName: own.institutionName,
              totalXp: own.totalXp,
              activeStudents: own.activeStudents,
              fastestCompletionDays: own.fastestCompletionDays,
              globalRank: own.rank,
              programCount: 0, // updated below
            });
          }
        }

        // 2. Fetch programs accessible to this UNIVERSITY_ADMIN (via analytics/faculty/programs)
        const progRes = await apiClient.get<any>("/analytics/faculty/programs").catch(() => null);
        if (progRes?.success && Array.isArray(progRes.data)) {
          setPrograms(progRes.data);
          setStats((prev) =>
            prev ? { ...prev, programCount: progRes.data.length } : prev
          );
        }
      } catch (err) {
        console.error("Failed to load institution dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <PageContainer className="py-8 space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-on-surface">
              {greeting()},{" "}
              {isLoading ? (
                <span className="inline-block w-32 h-6 bg-surface-low animate-pulse rounded" />
              ) : (
                stats?.institutionName ?? user?.name ?? "Administrator"
              )}{" "}
              🏛️
            </h1>
            <p className="text-sm text-muted">
              Institution analytics overview — Sprint 6
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-surface-low animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <StatWidget
            title="Global Rank"
            value={stats ? `#${stats.globalRank}` : "—"}
            subtitle="By total XP earned"
            icon={Trophy}
            color="bg-warning/10 text-warning"
            delay={0}
          />
          <StatWidget
            title="Active Students"
            value={stats?.activeStudents ?? 0}
            subtitle="Interacted in last 30 days"
            icon={Users}
            color="bg-success/10 text-success"
            delay={0.05}
          />
          <StatWidget
            title="Total XP"
            value={(stats?.totalXp ?? 0).toLocaleString()}
            subtitle="Accumulated by all learners"
            icon={Zap}
            color="bg-primary/10 text-primary"
            delay={0.1}
          />
          <StatWidget
            title="Programs"
            value={stats?.programCount ?? programs.length}
            subtitle="Published micro-credentials"
            icon={GraduationCap}
            color="bg-info/10 text-info"
            delay={0.15}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program List */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white border border-border-light rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-border-light flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-extrabold text-on-surface">Published Programs</h3>
            <span className="ml-auto bg-primary/10 text-primary text-3xs font-bold px-2 py-0.5 rounded-full">
              {programs.length}
            </span>
          </div>
          <div className="divide-y divide-border-light max-h-64 overflow-y-auto">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-surface-low animate-pulse m-3 rounded-xl" />
              ))
            ) : programs.length === 0 ? (
              <div className="p-8 text-center text-muted">
                <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">No programs published yet.</p>
              </div>
            ) : (
              programs.map((prog) => (
                <div
                  key={prog.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 transition-all"
                >
                  <div>
                    <p className="text-xs font-bold text-on-surface">{prog.title}</p>
                    <p className="text-3xs text-muted font-medium">{prog.institutionName}</p>
                  </div>
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Global Institution Leaderboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="bg-white border border-border-light rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="p-5 border-b border-border-light flex items-center gap-2">
            <Trophy className="h-4 w-4 text-warning" />
            <h3 className="text-sm font-extrabold text-on-surface">
              Top Institutions by XP
            </h3>
          </div>
          <div className="divide-y divide-border-light">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-surface-low animate-pulse m-3 rounded-xl" />
              ))
            ) : topInstitutions.length === 0 ? (
              <div className="p-8 text-center text-muted">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">No leaderboard data yet.</p>
              </div>
            ) : (
              topInstitutions.map((inst, i) => {
                const isOwn = inst.institutionName === stats?.institutionName;
                return (
                  <div
                    key={inst.institutionId}
                    className={`flex items-center gap-3 px-5 py-3 transition-all ${
                      isOwn ? "bg-primary/5 border-l-2 border-primary" : "hover:bg-neutral-50"
                    }`}
                  >
                    <span
                      className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        i === 0
                          ? "bg-warning/20 text-warning border border-warning/30"
                          : i === 1
                          ? "bg-slate-200 text-slate-700"
                          : i === 2
                          ? "bg-amber-100 text-amber-800"
                          : "bg-neutral-100 text-muted"
                      }`}
                    >
                      {inst.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-on-surface truncate">
                        {inst.institutionName}
                        {isOwn && (
                          <span className="ml-2 text-3xs text-primary font-extrabold uppercase">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-3xs text-muted font-semibold">
                        {inst.activeStudents} active · {inst.totalXp.toLocaleString()} XP
                      </p>
                    </div>
                    {inst.fastestCompletionDays !== null && (
                      <div className="flex items-center gap-1 text-3xs text-muted font-semibold shrink-0">
                        <Clock className="h-3 w-3" />
                        {inst.fastestCompletionDays}d
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
}
