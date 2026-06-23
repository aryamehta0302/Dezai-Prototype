"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { TopAppBar } from "@/shared/components/top-app-bar";
import { Footer } from "@/shared/components/footer";
import { UserRole } from "@/shared/types/common.types";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useNotificationStore } from "@/lib/stores/notification.store";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Shield } from "lucide-react";
import { mockCourses } from "@/lib/mock-data/courses";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthStore();
  const { logout, session } = useAuth();
  const { unreadCount, initialize } = useNotificationStore();
  const [activeSession, setActiveSession] = useState<any>(null);
  const { fetchEnrollments, fetchXp } = useEnrollmentStore();
  const pathname = usePathname();

  useEffect(() => {
    initialize();
    fetchEnrollments();
    fetchXp();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Query database for any active proctoring session
  useEffect(() => {
    const checkActiveSession = async () => {
      if (!session?.accessToken) {
        console.log("StudentLayout: No access token found.");
        return;
      }
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
        const response = await fetch(`${apiUrl}/assessments/sessions/active`, {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("StudentLayout: Active session data fetched:", data.session);
          setActiveSession(data.session || null);
        } else {
          console.warn("StudentLayout: Active session fetch failed with status", response.status);
        }
      } catch (err) {
        console.error("StudentLayout: Failed to check active proctoring session:", err);
      }
    };

    checkActiveSession();

    // Re-check whenever window gains focus or tab becomes active
    window.addEventListener("focus", checkActiveSession);
    document.addEventListener("visibilitychange", checkActiveSession);

    return () => {
      window.removeEventListener("focus", checkActiveSession);
      document.removeEventListener("visibilitychange", checkActiveSession);
    };
  }, [session?.accessToken, pathname]);

  const isTakingQuiz = pathname.includes("/quiz/") && !pathname.includes("/results");
  const isCurrentlyOnQuizPage = activeSession && pathname.includes(`/quiz/${activeSession.assessmentId}`);
  console.log("StudentLayout verification:", { pathname, isCurrentlyOnQuizPage, activeSessionId: activeSession?.id, isTakingQuiz });
  const activeCourse = activeSession ? mockCourses.find((c) => c.quizId === activeSession.assessmentId) : null;
  const redirectSlug = activeCourse ? activeCourse.slug : "digital-marketing-strategy";
  const redirectUrl = `/programs/${redirectSlug}/quiz/${activeSession?.assessmentId}`;

  return (
    <AuthGuard>
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
          <main className="flex-1 bg-surface-lowest">{children}</main>
        )}
        {!isTakingQuiz && !isProgramPage && <Footer />}
      </div>
    </AuthGuard>
  );
}
