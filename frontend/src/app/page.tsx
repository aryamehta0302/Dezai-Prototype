"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Grainient from "@/shared/components/Grainient";
import { PremiumButton } from "@/shared/ui/premium-button";

import {
  ArrowRight,
  Award,
  BarChart3,
  Brain,
  Check,
  CirclePlay,
  ChevronDown,
  Flame,
  GraduationCap,
  Menu,
  ShieldCheck,
  Sword,
  Trophy,
  Unlock,
  X,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Learning",
    copy: "Adaptive learning paths that detect weak concepts and spin up targeted side-quests to fix gaps before you move on.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Assessments",
    copy: "100-question pools randomized per session. Browser lockdown, clipboard disabled, tab-switch detection. Two students get different exams.",
  },
  {
    icon: Award,
    title: "Verified Credentials",
    copy: "University-branded, uniquely ID'd, instantly verifiable. Every certificate has a public verification page employers can trust.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Leaderboards",
    copy: "Student performance, cohort comparisons, XP tracking, campus rankings. Top 3 students monthly earn scholarship codes.",
  },
];

const comparisonRows = [
  { traditional: "PDF Certificate", dezai: "Verified Credential" },
  { traditional: "Recorded Videos", dezai: "AI Adaptive Learning" },
  { traditional: "Static Quizzes", dezai: "Secure Proctored Assessments" },
  { traditional: "Completion Rate", dezai: "Competency Score" },
  { traditional: "Resume Claims", dezai: "Employer Verification" },
  { traditional: "Passive Learning", dezai: "Gamified XP Progression" },
];

const roles = [
  {
    title: "University administrators",
    items: [
      "Launch new AI programs in weeks, not semesters",
      "Track enrollment, completion, and credential issuance",
      "Share analytics with faculty and accreditation boards",
      "Issue branded certificates with public verification",
    ],
  },
  {
    title: "Training partners",
    items: [
      "Resell or white-label proven curricula",
      "Run proctored assessments at scale",
      "Measure learner outcomes across cohorts",
      "Offer industry-recognized credentials",
    ],
  },
  {
    title: "Enterprise L&D teams",
    items: [
      "Compliance training with audit trails",
      "Track completion across departments",
      "Leaderboard-driven engagement",
      "Organization-specific credential templates",
    ],
  },
  {
    title: "Learners",
    items: [
      "Follow structured paths, not random YouTube rabbit holes",
      "Get AI help on topics you're weak at",
      "Earn certificates employers can actually verify",
      "Track your progress and streaks",
    ],
  },
];

const faqs = [
  {
    q: "What is Dezai AI?",
    a: "A platform for universities and training partners to teach, assess, and certify AI skills. Not another MOOC — every credential is backed by a proctored exam and has a public verification page.",
  },
  {
    q: "How is this different from Coursera or Udemy?",
    a: "Those platforms issue certificates anyone can buy. Dezai issues credentials that require passing identity-verified assessments. Employers can verify authenticity with a single code.",
  },
  {
    q: "Can we use our own curriculum?",
    a: "Yes. Upload your content, map it to assessments, and Dezai handles the rest — AI mentoring, progress tracking, proctoring, and credential issuance.",
  },
  {
    q: "What does compliance training look like?",
    a: "Employees complete program modules, pass timed assessments with security monitoring, and earn organization-specific credentials. Everything is audit-ready.",
  },
  {
    q: "Is there a free trial?",
    a: "The platform comes seeded with 12 programs and demo accounts. You can explore the full experience — courses, assessments, credentials — before committing.",
  },
];

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900 antialiased">
      {/* ── Grainient BG ── */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] overflow-hidden opacity-80">
        <Grainient
          color1="#60a5fa"
          color2="#1d4ed8"
          color3="#0f172a"
          timeSpeed={1.5}
          colorBalance={0.73}
          warpStrength={0}
          warpFrequency={0}
          warpSpeed={0}
          warpAmplitude={5}
          blendAngle={-142}
          blendSoftness={1}
          rotationAmount={500}
          noiseScale={2.35}
          grainAmount={0.14}
          grainScale={3.7}
          grainAnimated={false}
          contrast={2.5}
          gamma={1.8}
          saturation={1.65}
          centerX={1}
          centerY={1}
          zoom={1.3}
        />
        <div className="absolute inset-x-0 bottom-0 h-[400px] bg-gradient-to-t from-white to-transparent" />
      </div>
      {/* ── Nav ── */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${mobileOpen ? "bg-white shadow-sm" : scrolled ? "bg-white/70 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(0,0,0,0.05)]" : ""}`}>
        <div className={`mx-auto flex h-14 max-w-7xl items-center justify-between px-5 md:px-8 transition-colors duration-300`}>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-full bg-blue-600">
              <GraduationCap className="size-4 text-white" />
            </span>
            <span className={`text-[15px] font-semibold tracking-tight transition-colors duration-300 ${(scrolled || mobileOpen) ? "text-slate-900" : "text-white"}`}>Dezai AI</span>
          </Link>
          <nav className="hidden items-center gap-7 text-[13px] font-medium md:flex transition-colors duration-300">
            {[
              { href: "#features", label: "Platform" },
              { href: "#solutions", label: "Solutions" },
              { href: "#employer", label: "For Employers" },
              { href: "/verify", label: "Verify Credential" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`transition ${(scrolled || mobileOpen) ? "text-slate-500 hover:text-slate-900" : "text-white/70 hover:text-white"}`}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <Link href="/login" className={`hidden rounded-lg px-3 py-1.5 text-[13px] font-medium transition sm:inline-block ${(scrolled || mobileOpen) ? "text-slate-600 hover:text-slate-900" : "text-white/80 hover:text-white"}`}>
              Log in
            </Link>
            <Link href="/signup" className={`hidden rounded-lg px-3.5 py-1.5 text-[13px] font-medium backdrop-blur-sm transition sm:inline-block ${(scrolled || mobileOpen) ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white/10 text-white hover:bg-white/20"}`}>
              Get started
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`grid size-8 place-items-center rounded-lg transition md:hidden ${mobileOpen || scrolled ? "text-slate-900 hover:bg-slate-100" : "text-white hover:bg-white/10"}`}
            >
              {mobileOpen ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="absolute inset-x-0 top-14 border-t border-slate-200 bg-white shadow-xl shadow-slate-200/50 md:hidden">
            <div className="mx-auto max-w-7xl px-5 py-4">
              <div className="space-y-0.5">
                {[
                  { href: "#features", label: "Platform" },
                  { href: "#solutions", label: "Solutions" },
                  { href: "#employer", label: "For Employers" },
                  { href: "/verify", label: "Verify Credential" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-4 py-3 text-[15px] font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl border border-slate-200 py-3 text-center text-[14px] font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl bg-slate-900 py-3 text-center text-[14px] font-medium text-white transition hover:bg-slate-800"
                >
                  Get started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-8 md:pt-28 md:pb-12">
        {/* Grainient background */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[1400px] w-[720px] -translate-x-1/2 -translate-y-[450px] opacity-60 sm:h-[1800px] sm:w-[1200px] sm:-translate-y-[600px]">
            <Grainient
              color1="#8fc5ff"
              color2="#584ceb"
              color3="#000000"
              timeSpeed={1.5}
              colorBalance={0.73}
              warpStrength={0}
              warpFrequency={0}
              warpSpeed={0}
              warpAmplitude={5}
              blendAngle={-142}
              blendSoftness={1}
              rotationAmount={500}
              noiseScale={2.35}
              grainAmount={0.14}
              grainScale={3.7}
              grainAnimated={false}
              contrast={2.5}
              gamma={1.8}
              saturation={1.65}
              centerX={1}
              centerY={1}
              zoom={1.3}
            />
          </div>
          {/* Fade bottom to white */}
          <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-white to-transparent" />
          {/* Soft top edge */}
          <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-white/90 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/60 px-3 py-1 text-[12px] font-medium text-blue-700 sm:text-[13px]">
              Trusted by 6+ university partners
            </div>

            <h1 className="font-['Playfair_Display',serif] text-[36px] font-medium leading-[92%] tracking-[-0.03em] sm:text-[48px] md:text-[64px] lg:text-[80px] xl:text-[88px] text-white">
              Education That
              <br />
              <span className="text-white">
                Employers Trust
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-[16px] leading-[1.7] tracking-[-0.01em] text-white/70">
              Traditional platforms measure completion. Dezai measures competency — through AI-powered assessments, verified credentials, and employer-ready skill validation.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup">
                <PremiumButton size="sm" icon={<ArrowRight className="size-4" />}>
                  Start Building Your Future
                </PremiumButton>
              </Link>
              <button
                className="inline-flex h-[46px] items-center gap-2 rounded-full border border-white/15 px-6 text-[14px] font-medium text-white transition hover:bg-white/5"
              >
                <CirclePlay className="size-4 fill-white" />
                Watch Platform Demo
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard mockup — same section, sits on top of the BG */}
        <div className="mx-auto max-w-7xl px-5 md:px-8 mt-16">
          <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
            <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <span className="size-3 rounded-full bg-[#FF5F56]" />
              <span className="size-3 rounded-full bg-[#FFBD2E]" />
              <span className="size-3 rounded-full bg-[#27C93F]" />
              <div className="mx-auto flex items-center gap-1 rounded-md bg-slate-200/60 px-4 py-1 sm:px-24">
                <span className="text-[11px] font-medium text-slate-400">dezai.ai/learning</span>
              </div>
            </div>
            <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src="/landing_assets/vid3.mp4" type="video/mp4" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-slate-300">
                    <CirclePlay className="size-12" />
                    <span className="text-sm font-medium">Course preview video</span>
                  </div>
                </div>
              </video>
            </div>
          </div>
        </div>

      </section>

      {/* ── Trusted By / Stats ── */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pt-16 pb-8">
        <p className="text-center text-[12px] font-semibold uppercase tracking-[0.15em] text-slate-400 mb-8">Trusted by</p>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            { value: "6+", label: "Partner Universities" },
            { value: "200+", label: "Faculty Members" },
            { value: "10K+", label: "Assessments Completed" },
            { value: "100%", label: "Verifiable Credentials" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-20 lg:pt-32 pb-12 lg:pb-16">
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <h2 className="inline-block w-fit bg-gradient-to-r from-[#19191D] to-[#626275] bg-clip-text text-3xl leading-[1.25] font-medium tracking-[-1.28px] text-transparent lg:text-5xl xl:text-[56px]">
              Everything in one platform
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-[#8C929D] md:text-lg">
              AI learning, secure assessments, verified credentials, and employer verification — unified for universities, students, and employers.
            </p>
          </div>

          <div className="grid gap-6 lg:gap-8 md:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-4xl border border-white/25 bg-white p-5 sm:p-8 shadow-[inset_1px_1px_10px_2px_rgba(255,255,255,0.2)]"
                style={{
                  boxShadow: "inset 1px 1px 10px 2px rgba(255,255,255,0.2), inset 0px 0px 24px 0px rgba(148,163,184,0.1)",
                }}
              >
                <div className="grid size-9 place-items-center rounded-lg bg-blue-50 ring-1 ring-blue-100/50">
                  <f.icon className="size-[18px] text-blue-600" />
                </div>
                <h3 className="mt-5 text-xl font-medium tracking-[-0.3px] text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm font-medium leading-[1.6] tracking-[-0.01em] text-[#626275]">{f.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section>
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-20 lg:pt-32 pb-12 lg:pb-16">
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <h2 className="inline-block w-fit bg-gradient-to-r from-[#19191D] to-[#626275] bg-clip-text text-3xl leading-[1.25] font-medium tracking-[-1.28px] text-transparent lg:text-5xl xl:text-[56px]">
              Education is broken
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-[#8C929D] md:text-lg">
              Completion rates below 7%. PDFs anyone can fake. No way for employers to verify what a candidate actually knows.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { title: "PDF certificates", desc: "Anyone can upload one. Employers have no way to verify if the student actually possesses the skills.", color: "red" },
              { title: "Passive learning", desc: "Students watch videos. Completion rates stay below 7%. Knowledge retention disappears.", color: "red" },
              { title: "Weak assessments", desc: "Static quizzes, easy cheating, no real skill validation. Completion means nothing.", color: "red" },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-4xl border border-white/25 bg-white p-6 shadow-[inset_1px_1px_10px_2px_rgba(255,255,255,0.2)]"
                style={{ boxShadow: "inset 1px 1px 10px 2px rgba(255,255,255,0.2), inset 0px 0px 24px 0px rgba(148,163,184,0.1)" }}
              >
                <h3 className="text-xl font-medium tracking-[-0.3px] text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm font-medium leading-[1.6] tracking-[-0.01em] text-[#626275]">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Old vs Dezai flow */}
          <div className="mt-16 grid gap-8 lg:grid-cols-2">
            <div className="rounded-4xl bg-slate-50 p-6 sm:p-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-slate-400">Traditional</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">Learning</span>
                <span className="text-slate-300">&rarr;</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">Certificate</span>
                <span className="text-slate-300">&rarr;</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">Done</span>
              </div>
            </div>
            <div className="rounded-4xl bg-blue-50/50 p-6 sm:p-8">
              <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-blue-500">Dezai</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-700">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Learn</span>
                <span className="text-blue-300">&rarr;</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Practice</span>
                <span className="text-blue-300">&rarr;</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Assessment</span>
                <span className="text-blue-300">&rarr;</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Verify</span>
                <span className="text-blue-300">&rarr;</span>
                <span className="rounded-full bg-blue-600 px-3 py-1 text-white">Career</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How Dezai Works ── */}
      <section className="bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-20 lg:pt-32 pb-12 lg:pb-16">
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <h2 className="inline-block w-fit bg-gradient-to-r from-[#19191D] to-[#626275] bg-clip-text text-3xl leading-[1.25] font-medium tracking-[-1.28px] text-transparent lg:text-5xl xl:text-[56px]">
              How Dezai works
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-[#8C929D] md:text-lg">
              From university course to employer-verified credential. Five steps.
            </p>
          </div>

          <div className="relative mx-auto max-w-3xl">
            <div className="absolute left-[18px] top-0 bottom-0 w-px bg-slate-200" />
            <div className="space-y-8">
              {[
                { step: "01", title: "University creates course", desc: "Partner faculty provide syllabi and record major concept videos. Dezai handles AI mentoring, proctoring, and credential issuance." },
                { step: "02", title: "Students learn with AI", desc: "Adaptive learning paths, side-quests for weak topics, expressive typography that makes concepts stick." },
                { step: "03", title: "AI assesses competency", desc: "Randomized questions from 100+ pools. Browser lockdown. Time-bounded. Two students sitting side-by-side get different exams." },
                { step: "04", title: "Credential is issued", desc: "University-branded, uniquely ID'd, publicly verifiable. Includes assessment score, skills validated, and project portfolio." },
                { step: "05", title: "Employer verifies instantly", desc: "Paste the credential ID into the verification portal. See university, score, skills, projects, and status — no phone calls needed." },
              ].map((item) => (
                <div key={item.step} className="flex gap-5">
                  <div className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full bg-blue-600 text-[12px] font-bold text-white">
                    {item.step}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="text-lg font-medium text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Student Journey ── */}
      <section id="solutions">
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-20 lg:pt-32 pb-12 lg:pb-16">
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <h2 className="inline-block w-fit bg-gradient-to-r from-[#19191D] to-[#626275] bg-clip-text text-3xl leading-[1.25] font-medium tracking-[-1.28px] text-transparent lg:text-5xl xl:text-[56px]">
              A student&apos;s journey
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-[#8C929D] md:text-lg">
              Enroll. Learn. Earn. Get verified. Get hired.
            </p>
          </div>

          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3 sm:gap-4">
            {["Enroll", "Learn", "Earn XP", "Pass Assessment", "Get Credential", "Employer Verification", "Career"].map((step, i) => (
              <div key={step} className="flex items-center gap-3 sm:gap-4">
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">{step}</div>
                {i < 6 && <span className="hidden text-slate-300 sm:inline">&rarr;</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Employer Section ── */}
      <section id="employer" className="bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-20 lg:pt-32 pb-12 lg:pb-16">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="bg-gradient-to-r from-[#19191D] to-[#626275] bg-clip-text text-3xl leading-[1.25] font-medium tracking-[-1.28px] text-transparent lg:text-5xl xl:text-[56px]">
                Hire based on skills,<br />not PDFs
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-[#8C929D] md:text-lg">
                Stop guessing from resumes. Paste a credential ID and see the full picture — university, assessment score, skills, projects, and verification status.
              </p>
              <div className="mt-6">
                <Link href="/verify">
                  <PremiumButton size="sm" icon={<ShieldCheck className="size-4" />}>Verify a Credential</PremiumButton>
                </Link>
              </div>
            </div>

            {/* Verification mockup */}
            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-100/50">
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-mono text-slate-400">VD-2026-AI-8847</span>
                <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Verified</span>
              </div>
              <div className="mt-4 space-y-3">
                {[
                  { label: "University", value: "KPGU Vadodara" },
                  { label: "Assessment Score", value: "88%" },
                  { label: "Skills Validated", value: "AI, ML, Python" },
                  { label: "Projects Completed", value: "12" },
                  { label: "Issue Date", value: "March 2026" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between border-b border-slate-100 pb-2 text-sm">
                    <span className="text-slate-500">{row.label}</span>
                    <span className="font-medium text-slate-900">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── XP / Gamification ── */}
      <section>
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-20 lg:pt-32 pb-12 lg:pb-16">
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <h2 className="inline-block w-fit bg-gradient-to-r from-[#19191D] to-[#626275] bg-clip-text text-3xl leading-[1.25] font-medium tracking-[-1.28px] text-transparent lg:text-5xl xl:text-[56px]">
              Learning that feels like progress
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-[#8C929D] md:text-lg">
              XP, streaks, leaderboards, and guilds. Your daily focus converts into a globally verified professional asset.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {[
              { icon: Flame, title: "Daily Streaks", desc: "Consistency earns more XP. Break the streak, lose momentum." },
              { icon: Sword, title: "Boss Battles", desc: "End-of-module assessments styled as timed challenges with randomized questions." },
              { icon: Trophy, title: "Campus Rankings", desc: "Monthly leaderboards. Top 3 students earn automatic scholarship codes." },
              { icon: Unlock, title: "Unlock Tiers", desc: "High XP unlocks premium university co-branded and industry-aligned credentials." },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-4xl border border-white/25 bg-white p-6 shadow-[inset_1px_1px_10px_2px_rgba(255,255,255,0.2)]"
                style={{ boxShadow: "inset 1px 1px 10px 2px rgba(255,255,255,0.2), inset 0px 0px 24px 0px rgba(148,163,184,0.1)" }}
              >
                <div className="grid size-9 place-items-center rounded-lg bg-orange-50 ring-1 ring-orange-100/50">
                  <card.icon className="size-5 text-orange-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-slate-900">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-20 lg:pt-32 pb-12 lg:pb-16">
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <h2 className="inline-block w-fit bg-gradient-to-r from-[#19191D] to-[#626275] bg-clip-text text-3xl leading-[1.25] font-medium tracking-[-1.28px] text-transparent lg:text-5xl xl:text-[56px]">
              Why Dezai
            </h2>
          </div>

          <div className="mx-auto max-w-2xl overflow-hidden rounded-4xl border border-slate-200">
            <div className="grid grid-cols-2 bg-slate-50 text-sm font-semibold text-slate-500">
              <div className="px-6 py-4">Traditional LMS</div>
              <div className="border-l border-slate-200 px-6 py-4 text-blue-600">Dezai</div>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={row.traditional} className={`grid grid-cols-2 text-sm ${i !== comparisonRows.length - 1 ? "border-b border-slate-100" : ""}`}>
                <div className="px-6 py-4 text-slate-500">{row.traditional}</div>
                <div className="border-l border-slate-100 px-6 py-4 font-medium text-slate-900">{row.dezai}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section>
        <div className="mx-auto max-w-7xl px-5 md:px-8 pb-24 md:pb-32">
          <div className="relative overflow-hidden rounded-4xl bg-slate-900 px-5 py-12 text-center sm:px-8 md:px-16 md:py-20">
            {/* Subtle radial gradient overlay */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.15),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-[28px] sm:text-3xl lg:text-5xl xl:text-[56px] font-medium tracking-[-0.03em] text-white">
                Ready to try it with your cohort?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm font-medium leading-[1.6] tracking-[-0.01em] text-slate-400">
                12 programs, demo assessments, and sample credentials are already loaded. Create an account and start exploring.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href="/signup">
                  <PremiumButton size="sm" icon={<ArrowRight className="size-4" />}>
                    Create free account
                  </PremiumButton>
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-6 text-[14px] font-medium text-white transition hover:bg-white/5"
                >
                  Explore demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq">
        <div className="mx-auto max-w-2xl px-5 md:px-8 pb-24 md:pb-32">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <h2 className="inline-block w-fit bg-gradient-to-r from-[#19191D] to-[#626275] bg-clip-text text-3xl leading-[1.25] font-medium tracking-[-1.28px] text-transparent lg:text-5xl xl:text-[56px]">
              Questions worth asking
            </h2>
          </div>
          <div className="divide-y divide-slate-100">
            {faqs.map((faq) => (
              <details key={faq.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-medium text-slate-900">
                  {faq.q}
                  <ChevronDown className="size-4 shrink-0 text-slate-300 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-[14px] leading-relaxed text-slate-500">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-slate-900">
                  <GraduationCap className="size-4 text-white" />
                </span>
                <span className="text-[16px] font-semibold tracking-tight text-slate-900">Dezai AI</span>
              </Link>
              <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-slate-500">
                University-grade AI learning, assessment, and credentialing — built for institutions that care about outcomes.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-slate-400">Product</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="#features" className="text-[13px] text-slate-600 transition hover:text-slate-900">Features</a></li>
                <li><a href="#roles" className="text-[13px] text-slate-600 transition hover:text-slate-900">Who It&apos;s For</a></li>
                <li><a href="#faq" className="text-[13px] text-slate-600 transition hover:text-slate-900">FAQ</a></li>
                <li><Link href="/verify" className="text-[13px] text-slate-600 transition hover:text-slate-900">Verify Credential</Link></li>
                <li><Link href="/catalog" className="text-[13px] text-slate-600 transition hover:text-slate-900">Browse Programs</Link></li>
              </ul>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-slate-400">Platform</h4>
              <ul className="mt-4 space-y-2.5">
                <li><Link href="/dashboard" className="text-[13px] text-slate-600 transition hover:text-slate-900">Student Dashboard</Link></li>
                <li><Link href="/learning" className="text-[13px] text-slate-600 transition hover:text-slate-900">Employee Learning</Link></li>
                <li><Link href="/enterprise/dashboard" className="text-[13px] text-slate-600 transition hover:text-slate-900">Enterprise Admin</Link></li>
                <li><Link href="/leaderboard" className="text-[13px] text-slate-600 transition hover:text-slate-900">Leaderboard</Link></li>
                <li><Link href="/certificates" className="text-[13px] text-slate-600 transition hover:text-slate-900">Certificates</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-slate-400">Company</h4>
              <ul className="mt-4 space-y-2.5">
                <li><span className="text-[13px] text-slate-400">About (coming soon)</span></li>
                <li><span className="text-[13px] text-slate-400">Blog (coming soon)</span></li>
                <li><span className="text-[13px] text-slate-400">Careers (coming soon)</span></li>
                <li><a href="mailto:hello@dezai.ai" className="text-[13px] text-slate-600 transition hover:text-slate-900">Contact</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 py-6 sm:flex-row">
            <span className="text-[12px] text-slate-400">&copy; 2026 Dezai AI. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <span className="text-[12px] text-slate-400 transition hover:text-slate-600 cursor-pointer">Privacy Policy</span>
              <span className="text-[12px] text-slate-400 transition hover:text-slate-600 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
