"use client";

import Link from "next/link";
import { SignupForm } from "../components/signup-form";
import { GraduationCap } from "lucide-react";

export function SignupPage() {
  return (
    <div className="flex w-full min-h-screen flex-col xl:flex-row">
      {/* Left Panel — Branding */}
      <div className="hidden xl:flex xl:w-[48%] 2xl:w-[50%] relative bg-gradient-to-br from-secondary via-primary to-primary-container overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-32 right-20 h-64 w-64 rounded-full bg-white/20 blur-3xl animate-float" />
          <div className="absolute bottom-20 left-16 h-48 w-48 rounded-full bg-white/15 blur-2xl animate-float" style={{ animationDelay: "3s" }} />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-10 2xl:px-16 text-white w-full max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <GraduationCap className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold">Dezai.ai</span>
          </div>
          <h1 className="text-3xl 2xl:text-4xl font-bold leading-tight mb-4">
            Start your learning journey
          </h1>
          <p className="text-base 2xl:text-lg text-white/80 leading-relaxed">
            Join thousands of students earning industry-recognized certifications from Gujarat&apos;s premier universities.
          </p>
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">✓</div>
              <span className="text-white/90">AI-powered personalized learning</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">✓</div>
              <span className="text-white/90">University-accredited certificates</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm font-bold">✓</div>
              <span className="text-white/90">Learn at your own pace</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Signup Form */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-12 bg-background">
        <div className="w-full max-w-[420px] mx-auto">
          {/* Mobile / Tablet Logo (shown below xl) */}
          <div className="flex xl:hidden items-center gap-2.5 justify-center mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-on-surface">
              Dezai<span className="text-primary">.ai</span>
            </span>
          </div>

          {/* Header */}
          <div className="text-center xl:text-left mb-8">
            <h2 className="text-2xl font-bold text-on-surface">Create your account</h2>
            <p className="mt-2 text-sm text-muted">
              Start learning from Gujarat&apos;s top universities
            </p>
          </div>

          {/* Form Container */}
          <div className="rounded-2xl border border-border-light bg-white p-6 sm:p-8 shadow-level-1">
            <SignupForm />
          </div>

          {/* Sign in link */}
          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
