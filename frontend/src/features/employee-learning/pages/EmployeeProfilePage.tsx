"use client";

import { Loader2 } from "lucide-react";
import { useEmployeeProfile } from "../hooks/useEmployeeProfile";
import { EmployeeProfileCard } from "../components/EmployeeProfileCard";

export default function EmployeeProfilePage() {
  const { profile, loading, error } = useEmployeeProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">{error || "Profile not found"}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted-foreground">Your employee learning profile</p>
      </div>
      <EmployeeProfileCard profile={profile} />
    </div>
  );
}
