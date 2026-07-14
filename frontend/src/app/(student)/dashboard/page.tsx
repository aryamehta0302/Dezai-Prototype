"use client";

import { StudentDashboardPage } from "@/features/dashboard/pages/StudentDashboardPage";
import { AdminDashboard } from "@/features/dashboard/components/AdminDashboard";
import { FacultyDashboard } from "@/features/dashboard/components/FacultyDashboard";
import { useAuthStore } from "@/lib/stores/auth.store";
import { UserRole } from "@/shared/types/common.types";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.role === UserRole.ORGANIZATION_ADMIN || user.role === UserRole.ORGANIZATION_MANAGER) {
      router.replace("/enterprise/dashboard");
    } else if (user.role === UserRole.EMPLOYEE) {
      router.replace("/enterprise/credentials");
    }
  }, [user, router]);

  if (!user) return null;

  switch (user.role) {
    case UserRole.DEZAI_ADMIN:
      return <AdminDashboard />;
    case UserRole.FACULTY:
    case UserRole.UNIVERSITY_ADMIN:
      return <FacultyDashboard />;
    case UserRole.ORGANIZATION_ADMIN:
    case UserRole.ORGANIZATION_MANAGER:
    case UserRole.EMPLOYEE:
      return null; // will redirect in useEffect
    default:
      return <StudentDashboardPage />;
  }
}
