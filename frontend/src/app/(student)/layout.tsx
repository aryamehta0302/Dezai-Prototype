"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { TopAppBar } from "@/shared/components/top-app-bar";

import { UserRole } from "@/shared/types/common.types";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotificationStore } from "@/lib/stores/notification.store";
import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Shield } from "lucide-react";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { useProgramsStore } from "@/lib/stores/programs.store";
import { AchievementNotificationWatcher } from "@/features/achievements/components/achievement-notification-watcher";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const { logout, session } = useAuth();
  const { unreadCount, initialize } = useNotificationStore();
  const [activeSession, setActiveSession] = useState<{
    assessmentId?: string;
    id?: string;
    [key: string]: unknown;
  } | null>(null);
  const { fetchEnrollments, fetchStats } = useEnrollmentStore();
  const { programs, fetchPrograms } = useProgramsStore();
  const pathname = usePathname();

  // Use a ref to prevent double initialization in development strict mode 
  // or due to dependency instability
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    initialize();
    fetchEnrollments();
    fetchStats();
    fetchPrograms();
  }, []); // Run once on mount

  const isProgramPage = pathname.startsWith("/programs/");

  const getVariant = () => {
    if (!user) return "default";
    switch (user.role) {
      case UserRole.DEZAI_ADMIN: return "admin";
      case UserRole.FACULTY:
      case UserRole.UNIVERSITY_ADMIN: return "university";
      default: return "student";
    }
  };

  const accessToken = (session as { accessToken?: string })?.accessToken;

  // Query database for any active proctoring session
  useEffect(() => {
    if (!accessToken) return;

    let lastCheck = 0;

    const checkActiveSession = async () => {
      const now = Date.now();
      if (now - lastCheck < 5000) return; // throttle: 5s cooldown
      lastCheck = now;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const response = await fetch(`${apiUrl}/assessments/sessions/active`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setActiveSession(data.session || null);
        }
      } catch (err) {
        console.error("StudentLayout: Failed to check active proctoring session:", err);
      }
    };

    checkActiveSession();

    window.addEventListener("focus", checkActiveSession);
    document.addEventListener("visibilitychange", checkActiveSession);

    return () => {
      window.removeEventListener("focus", checkActiveSession);
      document.removeEventListener("visibilitychange", checkActiveSession);
    };
  }, [accessToken, pathname]);

  const isOnAssessmentPath = pathname.includes("/assessment/");
  const isOnQuizPath = pathname.includes("/quiz/") && !pathname.includes("/results");
  const isTakingQuiz = isOnAssessmentPath || isOnQuizPath;
  const isCurrentlyOnQuizPage = activeSession && (pathname.includes(`/assessment/${activeSession.assessmentId}`) || pathname.includes(`/quiz/${activeSession.assessmentId}`));
  const activeCourse = activeSession ? programs.find((c) => c.id === activeSession.assessmentId) : null;
  const redirectSlug = activeCourse ? activeCourse.id : "digital-marketing-strategy";
  const redirectUrl = `/programs/${redirectSlug}/assessment/${activeSession?.assessmentId}`;

  return (
    <AuthGuard>
      <AchievementNotificationWatcher />
      <div className="flex min-h-screen flex-col">
        {!isTakingQuiz && (
          <TopAppBar
            variant={getVariant()}
            user={
              user
                ? {
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  avatar: user.avatar,
                }
                : null
            }
            onLogout={logout}
            notificationCount={unreadCount}
          />
        )}
        {activeSession && !isCurrentlyOnQuizPage ? (
          <div className="fixed inset-0 bg-background/95 z-[99999] flex flex-col items-center justify-center p-6">
            <div className="w-[480px] max-w-full mx-auto flex flex-col items-center justify-center text-center space-y-6">
              <div className="h-16 w-16 bg-warning/10 rounded-full flex items-center justify-center animate-bounce">
                <Shield className="h-8 w-8 text-warning" />
              </div>
              <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Assessment In Progress</h1>
              <p className="text-muted">
                You have an active exam session for <strong>{activeCourse?.title || activeSession.assessmentId}</strong>.
                You are not permitted to navigate to other pages until you complete or submit this assessment.
              </p>
              <Link href={redirectUrl} className="w-full">
                <Button size="lg" className="w-full bg-primary hover:bg-primary-hover text-white">
                  Resume Assessment
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <main className="flex-1 bg-background">{children}</main>
        )}
      </div>
    </AuthGuard>
  );
}
