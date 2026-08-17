"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellRing,
  Award,
  Info,
  ShieldCheck,
  Megaphone,
  Check,
  CheckCheck,
  Archive,
  ArchiveRestore,
  RefreshCw,
  BellOff,
  MailOpen,
  Loader2,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { PageContainer } from "@/shared/components/page-container";
import { EmptyState } from "@/shared/components/empty-state";
import { formatRelativeTime } from "@/shared/utils/format";
import { notificationsApi } from "../services/notifications-api.service";
import { useNotificationStore } from "@/lib/stores/notification.store";
import type {
  NotificationItem,
  NotificationFilter,
  NotificationSummary,
  NotificationType,
} from "../types/notification.types";
import { NOTIFICATION_TYPE_META, NOTIFICATION_TYPE_ORDER } from "../types/notification.types";

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

const FILTER_TABS: { value: NotificationFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "archived", label: "Archived" },
];

function NotificationSkeleton() {
  return (
    <div className="card-elevation flex gap-3 rounded-xl border border-border-light p-4 animate-pulse">
      <div className="h-10 w-10 shrink-0 rounded-full bg-surface-low" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded bg-surface-low" />
        <div className="h-3 w-full rounded bg-surface-low/70" />
        <div className="h-3 w-2/3 rounded bg-surface-low/70" />
      </div>
    </div>
  );
}

export function NotificationsCenterPage() {
  const store = useNotificationStore();

  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [activeType, setActiveType] = useState<NotificationType | "ALL">("ALL");
  const [view, setView] = useState<{
    filter: NotificationFilter;
    activeType: NotificationType | "ALL";
    items: NotificationItem[];
  } | null>(null);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [reloadToken, setReloadToken] = useState(0);

  // Derived loading — shows a skeleton while the cached view is stale.
  const loading =
    view === null ||
    view.filter !== filter ||
    view.activeType !== activeType;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await notificationsApi.getList(
          filter,
          activeType === "ALL" ? undefined : activeType
        );
        if (cancelled) return;
        const list = res?.data?.notifications ?? res?.notifications ?? [];
        setView({ filter, activeType, items: list });
        setError(null);
      } catch {
        if (cancelled) return;
        setError("Could not load notifications. Please try again.");
        setView({ filter, activeType, items: [] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filter, activeType, reloadToken]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await notificationsApi.getSummary();
        if (!cancelled) setSummary(res?.data ?? null);
      } catch {
        // Non-critical — badges degrade gracefully
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const items = view?.items ?? [];
  const totalUnread = summary?.unreadCount ?? items.filter((n) => !n.read && !n.archived).length;

  const refreshSummary = async () => {
    try {
      const res = await notificationsApi.getSummary();
      setSummary(res?.data ?? null);
    } catch {
      // Non-critical
    }
  };

  const applyLocal = (id: string, patch: Partial<NotificationItem>) => {
    setView((prev) =>
      prev
        ? { ...prev, items: prev.items.map((n) => (n.id === id ? { ...n, ...patch } : n)) }
        : prev
    );
  };

  const toggleRead = async (n: NotificationItem) => {
    if (busyIds.has(n.id)) return;
    setBusyIds((prev) => new Set(prev).add(n.id));
    const nextRead = !n.read;
    try {
      if (nextRead) {
        await notificationsApi.markAsRead(n.id);
        store.markAsRead(n.id);
      } else {
        await notificationsApi.markAsUnread(n.id);
        store.markAsUnread(n.id);
      }
      applyLocal(n.id, { read: nextRead });
    } catch {
      // Keep UI unchanged on failure
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(n.id);
        return next;
      });
      void refreshSummary();
    }
  };

  const handleArchive = async (n: NotificationItem) => {
    if (busyIds.has(n.id)) return;
    setBusyIds((prev) => new Set(prev).add(n.id));
    try {
      await notificationsApi.archive(n.id);
      store.archive(n.id);
      if (!n.read) store.markAsRead(n.id);
      if (filter === "archived") {
        applyLocal(n.id, { archived: true });
      } else {
        setView((prev) =>
          prev ? { ...prev, items: prev.items.filter((x) => x.id !== n.id) } : prev
        );
      }
    } catch {
      // Keep UI unchanged on failure
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(n.id);
        return next;
      });
      void refreshSummary();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      store.markAllAsRead();
      setView((prev) =>
        prev ? { ...prev, items: prev.items.map((n) => ({ ...n, read: true })) } : prev
      );
      void refreshSummary();
    } catch {
      // Keep UI unchanged on failure
    }
  };

  const handleRefresh = () => {
    setReloadToken((t) => t + 1);
  };

  const typeCount = (t: NotificationType) => summary?.byType?.[t] ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b border-border-light">
        <PageContainer className="py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-on-surface">Notifications</h1>
              <p className="text-muted mt-1">
                All your important updates in one place — credentials, reminders,
                announcements and system notices.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/notifications/settings"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-light bg-white px-3 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-low"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              {totalUnread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-light bg-white px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                >
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </button>
              )}
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-light bg-white px-3 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-low"
                aria-label="Refresh notifications"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </PageContainer>
      </div>

      <PageContainer className="py-6 space-y-6">
        {/* Summary chips */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-border-light bg-white p-4">
            <p className="text-xs font-medium text-muted">Total</p>
            <p className="mt-1 text-2xl font-bold text-on-surface">
              {summary?.total ?? items.length}
            </p>
          </div>
          <div className="rounded-xl border border-border-light bg-white p-4">
            <p className="text-xs font-medium text-muted">Unread</p>
            <p className="mt-1 text-2xl font-bold text-primary">{totalUnread}</p>
          </div>
          <div className="rounded-xl border border-border-light bg-white p-4">
            <p className="text-xs font-medium text-muted">Archived</p>
            <p className="mt-1 text-2xl font-bold text-on-surface">
              {summary?.archivedCount ?? 0}
            </p>
          </div>
          {NOTIFICATION_TYPE_ORDER.slice(0, 3).map((t) => (
            <div key={t} className="rounded-xl border border-border-light bg-white p-4">
              <p className="text-xs font-medium text-muted">
                {NOTIFICATION_TYPE_META[t].label}
              </p>
              <p className="mt-1 text-2xl font-bold text-on-surface">{typeCount(t)}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                filter === tab.value
                  ? "bg-primary text-white"
                  : "bg-surface-low text-secondary hover:bg-surface-low/70 hover:text-on-surface"
              )}
            >
              {tab.label}
            </button>
          ))}

          <span className="mx-2 hidden h-5 w-px bg-border-light sm:block" />

          {/* Type filter chips */}
          <button
            onClick={() => setActiveType("ALL")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              activeType === "ALL"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border-light text-muted hover:border-border hover:text-on-surface-variant"
            )}
          >
            All types
          </button>
          {NOTIFICATION_TYPE_ORDER.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(activeType === t ? "ALL" : t)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                activeType === t
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border-light text-muted hover:border-border hover:text-on-surface-variant"
              )}
            >
              {NOTIFICATION_TYPE_META[t].label}
              {typeCount(t) > 0 && (
                <span className="ml-1.5 text-[10px] opacity-70">{typeCount(t)}</span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={BellOff}
            title="Something went wrong"
            description={error}
            action={
              <button
                onClick={handleRefresh}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover"
              >
                Try again
              </button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={filter === "archived" ? ArchiveRestore : Bell}
            title={
              filter === "archived"
                ? "No archived notifications"
                : filter === "unread"
                  ? "You're all caught up"
                  : "No notifications yet"
            }
            description={
              filter === "unread"
                ? "No unread notifications in this view."
                : filter === "archived"
                  ? "Notifications you archive will appear here."
                  : "When credentials, reminders, announcements and system notices arrive, they'll show up here."
            }
          />
        ) : (
          <div className="space-y-3">
            {items.map((n) => {
              const TypeIcon = TYPE_ICONS[n.type] ?? Bell;
              const isBusy = busyIds.has(n.id);
              return (
                <div
                  key={n.id}
                  className={cn(
                    "card-elevation flex gap-3 rounded-xl border p-4 transition-colors",
                    n.read
                      ? "border-border-light bg-white"
                      : "border-primary/20 bg-primary/[0.04]"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      TYPE_TONES[n.type] ?? "bg-surface-low text-muted"
                    )}
                  >
                    <TypeIcon className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p
                        className={cn(
                          "text-sm font-semibold text-on-surface",
                          n.read && "font-medium text-on-surface-variant"
                        )}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                      <span className="ml-auto shrink-0 text-[11px] text-muted">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{n.message}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <button
                        onClick={() => void toggleRead(n)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-secondary transition-colors hover:bg-surface-low hover:text-on-surface disabled:opacity-50"
                      >
                        {isBusy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : n.read ? (
                          <MailOpen className="h-3.5 w-3.5" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        {n.read ? "Mark unread" : "Mark read"}
                      </button>
                      <button
                        onClick={() => void handleArchive(n)}
                        disabled={isBusy}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-secondary transition-colors hover:bg-surface-low hover:text-on-surface disabled:opacity-50"
                      >
                        <Archive className="h-3.5 w-3.5" />
                        {filter === "archived" ? "Archived" : "Archive"}
                      </button>
                      <span className="ml-auto rounded-full bg-surface-low px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
                        {NOTIFICATION_TYPE_META[n.type]?.label ?? n.type}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
