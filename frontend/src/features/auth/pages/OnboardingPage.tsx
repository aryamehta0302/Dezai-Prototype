"use client";

import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { UserRole } from "@/shared/types/common.types";
import { GraduationCap, ShieldAlert, BookOpen, Briefcase, ChevronRight } from "lucide-react";

export function OnboardingPage() {
  const { completeOnboarding, isSessionLoading, session } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rolesList = [
    {
      id: UserRole.STUDENT,
      title: "Student / Learner",
      description: "Gain skills, complete modules, take verified assessments, and earn university-grade credentials.",
      icon: BookOpen,
      color: "border-primary/20 bg-primary/5 text-primary",
      activeColor: "border-primary ring-2 ring-primary bg-primary/5",
    },
    {
      id: UserRole.FACULTY,
      title: "Faculty Member / Instructor",
      description: "Create programs, build lessons, design question banks, manage assessments, and grade submissions.",
      icon: GraduationCap,
      color: "border-secondary/20 bg-secondary/5 text-secondary",
      activeColor: "border-secondary ring-2 ring-secondary bg-secondary/5",
    },
    {
      id: UserRole.UNIVERSITY_ADMIN,
      title: "University Administrator",
      description: "Manage institution details, approve programs, add faculty, and track student outcomes.",
      icon: Briefcase,
      color: "border-tertiary/20 bg-tertiary/5 text-tertiary",
      activeColor: "border-tertiary ring-2 ring-tertiary bg-tertiary/5",
    },
    {
      id: UserRole.DEZAI_ADMIN,
      title: "Dezai Super Administrator",
      description: "Monitor platform metrics, manage all universities, verify new credentials, and adjust global settings.",
      icon: ShieldAlert,
      color: "border-error/20 bg-error/5 text-error",
      activeColor: "border-error ring-2 ring-error bg-error/5",
    },
  ];

  const handleComplete = async () => {
    if (!selectedRole || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Send selected role to backend to sync/store
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"}/auth/onboarding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.accessToken || ""}`,
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to store onboarding details on backend.");
      }

      // Complete NextAuth session update on client
      await completeOnboarding(selectedRole);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-level-1">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-on-surface">
            Select Your Role
          </h1>
          <p className="mx-auto max-w-md text-base text-muted leading-relaxed">
            Welcome to Dezai! Tell us how you plan to use the platform. This will customize your workspace dashboard.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {rolesList.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedRole === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedRole(item.id)}
                className={`relative flex flex-col text-left p-6 rounded-2xl border transition-all duration-200 hover:shadow-level-2 group ${
                  isSelected ? item.activeColor : "border-border-light bg-white"
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-4 transition-colors ${item.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed flex-1">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            disabled={!selectedRole || isSubmitting || isSessionLoading}
            onClick={handleComplete}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-primary-hover focus:outline-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <span>Complete Onboarding</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
