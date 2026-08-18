"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  BellRing,
  Award,
  Info,
  ShieldCheck,
  Megaphone,
  UserRound,
  Users,
  BookOpen,
  Check,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/utils/cn";
import { PageContainer } from "@/shared/components/page-container";
import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
import { notificationsApi } from "../services/notifications-api.service";
import type {
  NotificationPreference,
  NotificationPreferences,
  NotificationType,
  FollowedFaculty,
} from "../types/notification.types";
import {
  NOTIFICATION_TYPE_META,
  NOTIFICATION_TYPE_ORDER,
  NOTIFICATION_ROLE_LABELS,
} from "../types/notification.types";

const TYPE_ICONS: Record<NotificationType, LucideIcon> = {
  REMINDER: BellRing,
  CREDENTIAL: Award,
  UPDATE: Info,
  SYSTEM: ShieldCheck,
  ANNOUNCEMENT: Megaphone,
};

const TYPE_TONES: Record<NotificationType, string> = {
  REMINDER: "bg-amber-500/10 text-amber-600",
  CREDENTIAL: "bg-primary/10 text-primary",
  UPDATE: "bg-sky-500/10 text-sky-600",
  SYSTEM: "bg-violet-500/10 text-violet-600",
  ANNOUNCEMENT: "bg-rose-500/10 text-rose-600",
};

function SettingsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="rounded-xl border border-border-light bg-white p-5">
        <div className="h-5 w-48 rounded bg-surface-low" />
        <div className="mt-3 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-surface-low/70" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingType, setSavingType] = useState<NotificationType | null>(null);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [following, setFollowing] = useState<FollowedFaculty[]>([]);
  const [followsLoading, setFollowsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FollowedFaculty[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyFollow, setBusyFollow] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setFollowsLoading(true);
    setError(null);
    try {
      const [prefsRes, followsRes] = await Promise.all([
        notificationsApi.getPreferences(),
        notificationsApi.getFollowing(),
      ]);
      setPrefs(prefsRes?.data ?? null);
      setFollowing(followsRes?.data?.following ?? []);
    } catch {
      setError("Could not load your notification settings. Please try again.");
    } finally {
      setLoading(false);
      setFollowsLoading(false);
    }
  }, []);

  const handleRefresh = () => {
    void loadAll();
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [prefsRes, followsRes] = await Promise.all([
          notificationsApi.getPreferences(),
          notificationsApi.getFollowing(),
        ]);
        if (cancelled) return;
        setPrefs(prefsRes?.data ?? null);
        setFollowing(followsRes?.data?.following ?? []);
      } catch {
        if (!cancelled) {
          setError("Could not load your notification settings. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setFollowsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleToggle = async (pref: NotificationPreference) => {
    if (savingType) return;
    setSavingType(pref.type);
    try {
      await notificationsApi.updatePreference(pref.type, !pref.enabled);
      setPrefs((prev) =>
        prev
          ? {
              ...prev,
              types: prev.types.map((t) =>
                t.type === pref.type
                  ? { ...t, enabled: !pref.enabled, isOverride: true }
                  : t
              ),
            }
          : prev
      );
    } catch {
      // Keep UI unchanged on failure
    } finally {
      setSavingType(null);
    }
  };

  const handleReset = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      const res = await notificationsApi.resetPreferences();
      setPrefs(res?.data ?? null);
    } catch {
      // Keep UI unchanged on failure
    } finally {
      setResetting(false);
    }
  };

  const runSearch = useCallback(async (q: string) => {
    setSearching(true);
    try {
      const res = await notificationsApi.searchFaculty(q);
      setResults(res?.data?.following ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      void runSearch(query);
    }, 300);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [query, runSearch]);

  const handleFollow = async (facultyUserId: string) => {
    if (busyFollow) return;
    setBusyFollow(facultyUserId);
    try {
      await notificationsApi.follow(facultyUserId);
      const res = await notificationsApi.getFollowing();
      setFollowing(res?.data?.following ?? []);
      setResults((prev) =>
        prev.map((f) =>
          f.facultyUserId === facultyUserId ? { ...f, isFollowing: true } : f
        )
      );
    } catch {
      // Ignore — optimistic revert below
    } finally {
      setBusyFollow(null);
    }
  };

  const handleUnfollow = async (facultyUserId: string) => {
    if (busyFollow) return;
    setBusyFollow(facultyUserId);
    try {
      await notificationsApi.unfollow(facultyUserId);
      setFollowing((prev) => prev.filter((f) => f.facultyUserId !== facultyUserId));
      setResults((prev) =>
        prev.map((f) =>
          f.facultyUserId === facultyUserId ? { ...f, isFollowing: false } : f
        )
      );
    } catch {
      // Keep UI unchanged on failure
    } finally {
      setBusyFollow(null);
    }
  };

  const roleLabel = NOTIFICATION_ROLE_LABELS[prefs?.role ?? ""] ?? prefs?.role ?? "";
  const isFaculty = prefs?.role === "FACULTY";

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border-light">
        <PageContainer className="py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link
                href="/notifications"
                className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-on-surface"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to inbox
              </Link>
              <h1 className="text-2xl font-bold text-on-surface">Notification Settings</h1>
              <p className="text-muted mt-1">
                Choose what reaches your inbox. Faculty follows notify you when a
                course you care about is released.
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-light bg-white px-3 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-low"
              aria-label="Refresh settings"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </PageContainer>
      </div>

      <PageContainer className="py-6 space-y-6">
        {error ? (
          <div className="rounded-xl border border-border-light bg-white p-10 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted opacity-40" />
            <p className="mt-3 text-sm text-muted">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
            >
              Try again
            </button>
          </div>
        ) : loading && !prefs ? (
          <SettingsSkeleton />
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            {/* ─── Notification types ─── */}
            <section className="lg:col-span-3">
              <div className="rounded-xl border border-border-light bg-white">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-light px-5 py-4">
                  <div>
                    <h2 className="text-base font-semibold text-on-surface">
                      Notification types
                    </h2>
                    <p className="mt-0.5 text-xs text-muted">
                      {roleLabel ? `Defaults for ${roleLabel} accounts are pre-set.` : "Choose what you want to see."}
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    disabled={resetting}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-surface-low disabled:opacity-50"
                  >
                    {resetting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    Reset to defaults
                  </button>
                </div>

                <div className="divide-y divide-border-light">
                  {NOTIFICATION_TYPE_ORDER.map((type) => {
                    const pref = prefs?.types.find((t) => t.type === type);
                    const TypeIcon = TYPE_ICONS[type] ?? Bell;
                    const saving = savingType === type;
                    return (
                      <div
                        key={type}
                        className="flex items-center justify-between gap-4 px-5 py-4"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                              TYPE_TONES[type] ?? "bg-surface-low text-muted"
                            )}
                          >
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-on-surface">
                                {NOTIFICATION_TYPE_META[type].label}
                              </p>
                              {pref?.isOverride ? (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                                  Custom
                                </span>
                              ) : (
                                <span className="rounded-full bg-surface-low px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-xs text-muted">
                              {NOTIFICATION_TYPE_META[type].description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={pref?.enabled ?? false}
                          onCheckedChange={() => pref && handleToggle(pref)}
                          disabled={saving || !pref}
                          aria-label={`Toggle ${NOTIFICATION_TYPE_META[type].label} notifications`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ─── Faculty follows ─── */}
            <section className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-border-light bg-white">
                <div className="border-b border-border-light px-5 py-4">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-on-surface">
                    <UserRound className="h-4 w-4 text-primary" />
                    Faculty I follow
                  </h2>
                  <p className="mt-0.5 text-xs text-muted">
                    Get an update the moment a faculty member you follow publishes a
                    new course.
                  </p>
                </div>

                <div className="p-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <Input
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search faculty to follow..."
                      className="h-9 pl-9"
                    />
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {searching && results.length === 0 ? (
                      <p className="flex items-center gap-2 px-2 py-2 text-xs text-muted">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Searching…
                      </p>
                    ) : query.trim() ? (
                      results.length === 0 ? (
                        <p className="px-2 py-2 text-xs text-muted">
                          No faculty found.
                        </p>
                      ) : (
                        results.map((f) => (
                          <div
                            key={f.facultyUserId}
                            className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-surface-low"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-on-surface">
                                {f.name}
                              </p>
                              <p className="truncate text-[11px] text-muted">
                                {f.designation || "Faculty member"}
                                {f.programCount > 0 && (
                                  <span className="ml-1.5 inline-flex items-center gap-0.5">
                                    <BookOpen className="h-3 w-3" />
                                    {f.programCount}
                                  </span>
                                )}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                f.isFollowing
                                  ? handleUnfollow(f.facultyUserId)
                                  : handleFollow(f.facultyUserId)
                              }
                              disabled={busyFollow === f.facultyUserId}
                              className={cn(
                                "inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
                                f.isFollowing
                                  ? "border border-border-light text-secondary hover:bg-surface-low"
                                  : "bg-primary text-white hover:bg-primary-hover"
                              )}
                            >
                              {busyFollow === f.facultyUserId ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : f.isFollowing ? (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  Following
                                </>
                              ) : (
                                "Follow"
                              )}
                            </button>
                          </div>
                        ))
                      )
                    ) : (
                      <div className="px-2 pt-1">
                        {followsLoading ? (
                          <div className="space-y-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                              <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-low/70" />
                            ))}
                          </div>
                        ) : following.length === 0 ? (
                          <p className="py-2 text-xs text-muted">
                            You aren&apos;t following anyone yet. Search above to start
                            following faculty for course-release updates.
                          </p>
                        ) : (
                          <div className="space-y-1.5">
                            {following.map((f) => (
                              <div
                                key={f.facultyUserId}
                                className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-surface-low"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-on-surface">
                                    {f.name}
                                  </p>
                                  <p className="truncate text-[11px] text-muted">
                                    {f.designation || "Faculty member"}
                                    {f.programCount > 0 && (
                                      <span className="ml-1.5 inline-flex items-center gap-0.5">
                                        <BookOpen className="h-3 w-3" />
                                        {f.programCount} course
                                        {f.programCount === 1 ? "" : "s"}
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleUnfollow(f.facultyUserId)}
                                  disabled={busyFollow === f.facultyUserId}
                                  className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border-light px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-surface-low disabled:opacity-50"
                                >
                                  {busyFollow === f.facultyUserId ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    "Unfollow"
                                  )}
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ─── Your followers (faculty only) ─── */}
              {isFaculty && <FacultyFollowers />}
            </section>
          </div>
        )}
      </PageContainer>
    </div>
  );
}

function FacultyFollowers() {
  const [followers, setFollowers] = useState<FollowedFaculty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await notificationsApi.getFollowers();
        if (!cancelled) setFollowers(res?.data?.following ?? []);
      } catch {
        // Degrade gracefully
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="rounded-xl border border-border-light bg-white">
      <div className="flex items-center justify-between border-b border-border-light px-5 py-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-on-surface">
            <Users className="h-4 w-4 text-primary" />
            Your followers
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            Students and colleagues who get notified when you publish a course.
          </p>
        </div>
        {followers.length > 0 && (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
            {followers.length}
          </span>
        )}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-low/70" />
            ))}
          </div>
        ) : followers.length === 0 ? (
          <p className="py-2 text-xs text-muted">
            No one is following you yet. When students follow you, they&apos;ll be
            notified the moment you publish a new course.
          </p>
        ) : (
          <div className="space-y-1.5">
            {followers.map((f) => (
              <div
                key={f.facultyUserId}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-surface-low"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-on-surface">{f.name}</p>
                  <p className="truncate text-[11px] text-muted">{f.email}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted">
                  Since {new Date(f.followedAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
