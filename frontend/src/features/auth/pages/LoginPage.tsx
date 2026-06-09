"use client";

import Link from "next/link";
import { LoginForm } from "../components/login-form";
import { GraduationCap } from "lucide-react";

export function LoginPage() {
  return (
    <div className="flex w-full min-h-screen flex-col xl:flex-row">
      {/* Left Panel — Branding */}
      <div className="hidden xl:flex xl:w-[48%] 2xl:w-[50%] relative bg-linear-to-br from-primary via-primary-container to-secondary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-white/20 blur-3xl animate-float" />
          <div className="absolute bottom-32 right-16 h-56 w-56 rounded-full bg-white/15 blur-2xl animate-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-10 2xl:px-16 text-white w-full max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <GraduationCap className="h-7 w-7" />
            </div>
            <span className="text-2xl font-bold">Dezai.ai</span>
          </div>
          <h1 className="text-3xl 2xl:text-4xl font-bold leading-tight mb-4">
            University-grade micro-credentials
          </h1>
          <p className="text-base 2xl:text-lg text-white/80 leading-relaxed">
            Bridging academic theory and industry demand through AI-powered learning experiences with Gujarat&apos;s top universities.
          </p>
          <div className="mt-10 flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl 2xl:text-3xl font-bold">12+</p>
              <p className="text-sm text-white/70">Courses</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl 2xl:text-3xl font-bold">6</p>
              <p className="text-sm text-white/70">Universities</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl 2xl:text-3xl font-bold">3-Tier</p>
              <p className="text-sm text-white/70">Certificates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
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
            <h2 className="text-2xl font-bold text-on-surface">Welcome back</h2>
            <p className="mt-2 text-sm text-muted">
              Sign in to continue your learning journey
            </p>
          </div>

          {/* Form Container */}
          <div className="rounded-2xl border border-border-light bg-white p-6 sm:p-8 shadow-level-1">
            <LoginForm />
          </div>

          {/* Sign up link */}
          <p className="text-center text-sm text-muted mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
