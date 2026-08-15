"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { GoogleSignInButton } from "../components/provider-sign-in-button";
import { PremiumButton } from "@/shared/ui/premium-button";
import { GraduationCap } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid email or password.");
        setIsSubmitting(false);
      } else {
        toast.success("Successfully logged in!");
        router.refresh();
        router.push("/dashboard");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full min-h-screen flex-col xl:flex-row">
      {/* Left Panel — Branding */}
      <div className="hidden xl:flex xl:w-[48%] 2xl:w-[50%] relative bg-primary overflow-hidden">
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

      {/* Right Panel — Sign In */}
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

          {/* Sign In Container */}
          <div className="rounded-2xl border border-border-light bg-white p-6 sm:p-8 shadow-level-1 space-y-5">
            {/* Credentials Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface/80">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-sm outline-hidden focus:border-primary focus:bg-white transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface/80">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border-light bg-neutral-50 px-4 py-2.5 text-sm outline-hidden focus:border-primary focus:bg-white transition-all duration-200"
                />
              </div>

              <PremiumButton
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl px-4 py-2.5 text-sm"
              >
                {isSubmitting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white shrink-0" />
                )}
                {isSubmitting ? "Signing in\u2026" : "Sign In"}
              </PremiumButton>
            </form>

            <div className="relative flex items-center justify-center my-4">
              <div className="w-full border-t border-border-light" />
              <span className="absolute bg-white px-3 text-xs text-muted">Or continue with</span>
            </div>

            {/* OAuth Providers */}
            <GoogleSignInButton />

            {/* Info */}
            <p className="text-center text-xs text-muted mt-4">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
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
