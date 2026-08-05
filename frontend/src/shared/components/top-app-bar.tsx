"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { Input } from "@/shared/ui/input";
import { useNotificationStore } from "@/lib/stores/notification.store";
import { formatDate } from "@/shared/utils/format";
import {
  Search,
  Bell,
  Check,
  Menu,
  X,
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Award,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from "lucide-react";

interface TopAppBarProps {
  variant?: "default" | "student" | "admin" | "university" | "employee" | "enterprise";
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  } | null;
  onLogout?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

const studentNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/catalog", label: "Courses", icon: BookOpen },
  { href: "/certificates", label: "Certificates", icon: Award },
  { href: "/profile", label: "Profile", icon: User },
];

const employeeNav = [
  { href: "/enterprise/credentials", label: "My Compliance", icon: Award },
];

const enterpriseNav = [
  { href: "/enterprise/dashboard", label: "Compliance Dashboard", icon: LayoutDashboard },
  { href: "/enterprise/admin/departments", label: "Departments", icon: BookOpen },
  { href: "/enterprise/admin/directory", label: "Org Directory", icon: User },
];

export function TopAppBar({
  variant = "default",
  user,
  onLogout,
  notificationCount = 0,
  onNotificationClick,
}: TopAppBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();
  const unread = unreadCount || notificationCount;

  const getNav = () => {
    if (variant === "employee") return employeeNav;
    if (variant === "enterprise") return enterpriseNav;
    if (variant === "student" || variant === "default") return studentNav;
    return [];
  };

  const nav = getNav();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white">
      <div className="mx-auto flex h-[72px] max-w-[var(--container-max)] items-center justify-between px-6 sm:px-8 lg:px-12">
        {/* Logo */}
        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-on-surface font-[family-name:var(--font-heading)]">
            Dezai<span className="text-primary">.ai</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        {user && nav.length > 0 && (
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 h-11 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary-container text-primary"
                      : "text-secondary hover:bg-surface-low hover:text-on-surface"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Search */}
        {user && (
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              const q = searchQuery.trim();
              router.push(q ? `/catalog?q=${encodeURIComponent(q)}` : "/catalog");
            }}
            className="relative hidden md:block"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="h-9 w-44 pl-9 lg:w-64"
            />
          </form>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-2">

          {/* Notifications */}
          {user && (
            <div className="relative">
              <button
                onClick={() => {
                  if (onNotificationClick) {
                    onNotificationClick();
                    return;
                  }
                  setNotifOpen((v) => !v);
                }}
                className="relative rounded-lg p-2 text-on-surface-variant hover:bg-surface-low transition-colors"
                aria-label="Notifications"
                aria-expanded={notifOpen}
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </button>

              {notifOpen && !onNotificationClick && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border-light bg-white p-1.5 shadow-level-3">
                    <div className="mb-1 flex items-center justify-between border-b border-border-light px-3 py-2">
                      <p className="text-sm font-semibold text-on-surface">Notifications</p>
                      {unread > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <Check className="h-3 w-3" />
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted">
                          <Bell className="h-8 w-8 opacity-30" />
                          <p className="text-xs font-medium">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          {notifications.map((n) => (
                            <button
                              key={n.id}
                              onClick={() => {
                                markAsRead(n.id);
                                setNotifOpen(false);
                                if (n.actionUrl) router.push(n.actionUrl);
                              }}
                              className={cn(
                                "flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors",
                                n.read ? "hover:bg-surface-low" : "bg-primary/5 hover:bg-primary/10"
                              )}
                            >
                              <span className="flex items-center gap-2 text-sm font-medium text-on-surface">
                                {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                                {n.title}
                              </span>
                              <span className="w-full truncate text-xs text-muted">{n.message}</span>
                              <span className="text-[10px] text-muted">{formatDate(n.createdAt)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="border-t border-border-light p-1.5">
                      <Link
                        href="/notifications"
                        onClick={() => setNotifOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
                      >
                        <Bell className="h-4 w-4" />
                        View all notifications
                      </Link>
                      <Link
                        href="/notifications/settings"
                        onClick={() => setNotifOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-low transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Notification settings
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Profile Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-surface-low transition-colors"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="hidden lg:block text-sm font-medium text-on-surface">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="hidden lg:block h-4 w-4 text-muted" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border-light bg-white p-1.5 shadow-level-3">
                    <div className="px-3 py-2 border-b border-border-light mb-1">
                      <p className="text-sm font-medium text-on-surface">{user.name}</p>
                      <p className="text-xs text-muted">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-low transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/profile/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-low transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => { setProfileOpen(false); onLogout?.(); }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-error-container/50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-low transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          {user && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden rounded-lg p-2 text-on-surface-variant hover:bg-surface-low"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && user && nav.length > 0 && (
        <div className="md:hidden border-t border-border-light bg-white px-4 py-3 space-y-1">
          {nav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-on-surface-variant hover:bg-surface-low"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
