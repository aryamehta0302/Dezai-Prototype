"use client";

import { StudentDashboardPage } from "@/features/dashboard/pages/StudentDashboardPage";
import { AdminDashboard } from "@/features/dashboard/components/AdminDashboard";
import { FacultyDashboard } from "@/features/dashboard/components/FacultyDashboard";
import { useAuthStore } from "@/lib/stores/auth.store";
import { UserRole } from "@/shared/types/common.types";

export default function Page() {
  const { user } = useAuthStore();

  if (!user) return null;

  switch (user.role) {
    case UserRole.DEZAI_ADMIN:
      return <AdminDashboard />;
    case UserRole.FACULTY:
    case UserRole.UNIVERSITY_ADMIN:
      return <FacultyDashboard />;
    default:
      return <StudentDashboardPage />;
  }
}
