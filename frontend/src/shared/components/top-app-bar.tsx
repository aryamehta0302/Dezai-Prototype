"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/utils/cn";
import {
  Search,
  Bell,
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
  TrendingUp,
  Clock,
  Trophy,
  Medal,
  Users,
} from "lucide-react";
import { useState } from "react";

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
  { href: "/learning", label: "Dashboard", icon: LayoutDashboard },
  { href: "/learning/progress", label: "Progress", icon: TrendingUp },
  { href: "/learning/timeline", label: "History", icon: Clock },
  { href: "/learning/achievements", label: "Achievements", icon: Trophy },
  { href: "/learning/leaderboard", label: "Leaderboard", icon: Medal },
  { href: "/enterprise/credentials", label: "Credentials", icon: Award },
  { href: "/learning/profile", label: "Profile", icon: User },
];

const enterpriseNav = [
  { href: "/enterprise/dashboard", label: "Compliance Dashboard", icon: LayoutDashboard },
  { href: "/learning", label: "Team Learning", icon: Users },
  { href: "/learning/leaderboard", label: "Leaderboard", icon: Medal },
];

export function TopAppBar({
  variant = "default",
  user,
  onLogout,
  notificationCount = 0,
  onNotificationClick,
}: TopAppBarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Search */}
          {user && (
            <button className="hidden sm:flex items-center gap-2 rounded-xl border border-border bg-surface-low px-4 h-11 text-sm text-muted hover:border-outline transition-colors">
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline">Search courses...</span>
            </button>
          )}

          {/* Notifications */}
          {user && (
            <button
              onClick={onNotificationClick}
              className="relative rounded-lg p-2 text-on-surface-variant hover:bg-surface-low transition-colors"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>
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
