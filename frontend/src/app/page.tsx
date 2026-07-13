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
  ChevronDown,
  CirclePlay,
  GraduationCap,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Mentor that actually teaches",
    copy: "Not a chatbot bolted onto a PDF viewer. It tracks weak topics per learner and adapts practice in real time.",
  },
  {
    icon: ShieldCheck,
    title: "Assessments people can't fake",
    copy: "Identity verification, browser lockdown, session recording. Your certificates mean something.",
  },
  {
    icon: Award,
    title: "Three tiers of credentials",
    copy: "Skill badges for completion. University-accredited certificates for rigor. Industry-verified for career proof.",
  },
  {
    icon: BarChart3,
    title: "Analytics you'll actually use",
    copy: "XP, streaks, completion rates, weak topics, cohort comparisons. See what's working and what isn't.",
  },
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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[650px] overflow-hidden opacity-80">
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
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />
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
              { href: "#features", label: "Features" },
              { href: "#roles", label: "Who It's For" },
              { href: "#faq", label: "FAQ" },
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
                  { href: "#features", label: "Features" },
                  { href: "#roles", label: "Who It's For" },
                  { href: "#faq", label: "FAQ" },
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
      <section className="relative pt-28 pb-20 md:pt-28 md:pb-28">
        {/* Grainient background */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-[100px] opacity-60 sm:h-[1080px] sm:w-[1080px] sm:-translate-y-[200px]">
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
              Trusted by 6 universities and counting
            </div>

            <h1 className="font-['Playfair_Display',serif] text-[36px] font-medium leading-[92%] tracking-[-0.03em] sm:text-[48px] md:text-[64px] lg:text-[80px] xl:text-[88px] text-white">
              Stop issuing certificates
              <br />
              <span className="text-white">
                no one believes
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-[16px] leading-[1.7] tracking-[-0.01em] text-white/70">
              Dezai helps universities and training partners teach AI skills with real assessments and credentials employers can verify. Not another MOOC handing out PDFs.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/signup">
                <PremiumButton size="sm" icon={<ArrowRight className="size-4" />}>
                  Create free account
                </PremiumButton>
              </Link>
              <Link
                href="/login"
                className="inline-flex h-[46px] items-center gap-2 rounded-full border border-white/15 px-6 text-[14px] font-medium text-white transition hover:bg-white/5"
              >
                Explore demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Preview ── */}
      <section className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
          {/* macOS title bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <span className="size-3 rounded-full bg-[#FF5F56]" />
            <span className="size-3 rounded-full bg-[#FFBD2E]" />
            <span className="size-3 rounded-full bg-[#27C93F]" />
            <div className="mx-auto flex items-center gap-1 rounded-md bg-slate-200/60 px-4 py-1 sm:px-24">
              <span className="text-[11px] font-medium text-slate-400">dezai.ai/learning</span>
            </div>
          </div>
          {/* App content placeholder */}
          <div className="relative aspect-[16/9] bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-300">
                <GraduationCap className="size-12" />
                <span className="text-sm font-medium">Platform preview</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Showcase ── */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pt-20 lg:pt-32 pb-12 lg:pb-16">
        <div className="mb-16 flex flex-col items-center gap-4 text-center">
          <h2 className="inline-block w-fit bg-gradient-to-r from-[#19191D] to-[#626275] bg-clip-text text-3xl leading-[1.25] font-medium tracking-[-1.28px] text-transparent lg:text-5xl xl:text-[56px]">
            From setup to first credential in days
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-[#8C929D] md:text-lg">
            Set up a cohort, let AI mentor your learners, and issue credentials that employers can actually verify. Three steps, no bureaucracy.
          </p>
        </div>

        <div className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 lg:grid lg:snap-none lg:grid-cols-3 lg:overflow-visible lg:pb-0 xl:gap-8">
          {/* Card 1: AI Mentor */}
          <div className="min-w-[85vw] snap-center sm:min-w-[60vw] md:min-w-[45vw] lg:min-w-0">
            <div>
              <div className="card-styles flex flex-col justify-between p-[18px] md:p-[19px] lg:p-[17px] xl:p-[22px] 2xl:p-6">
                <div className="pointer-events-none rounded-[6px] bg-[linear-gradient(180deg,rgba(255,255,255,0.7)_0%,#F9FAFB_100%)] p-3.5 md:rounded-[10px] lg:rounded-[9px] xl:rounded-xl xl:p-4.5">
                  <div className="relative h-[195px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-white to-indigo-50/30 px-[10px] py-[14px] md:h-[206px] md:rounded-[10px] lg:h-[185px] xl:h-[240px] 2xl:h-[260px]">
                    <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1">
                      <div className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-[10px] font-medium text-blue-700">AI Active</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="rounded-lg bg-white/80 p-3 shadow-sm backdrop-blur-sm">
                        <div className="flex items-start gap-2">
                          <div className="grid size-6 shrink-0 place-items-center rounded-full bg-blue-600">
                            <Brain className="size-3 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] leading-relaxed text-slate-600">I noticed you struggled with recursion in Quiz 3. Let me walk you through a simpler example...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mx-auto mt-[19px] max-w-[600px] text-base leading-snug tracking-[-0.02em] text-gray-500 sm:text-lg md:mt-5 xl:mt-[18px] xl:text-xl 2xl:mt-[26px]">
                  <p><strong className="mr-1 font-medium text-slate-900">Adapts to each learner.</strong>AI mentoring that tracks weak topics and adjusts practice in real time — not a chatbot bolted onto a PDF viewer.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Proctored Assessments */}
          <div className="min-w-[85vw] snap-center sm:min-w-[60vw] md:min-w-[45vw] lg:min-w-0">
            <div>
              <div className="card-styles flex flex-col justify-between p-[18px] md:p-[19px] lg:p-[17px] xl:p-[22px] 2xl:p-6">
                <div className="pointer-events-none rounded-[6px] bg-[linear-gradient(180deg,rgba(255,255,255,0.7)_0%,#F9FAFB_100%)] p-3.5 md:rounded-[10px] lg:rounded-[9px] xl:rounded-xl xl:p-4.5">
                  <div className="relative h-[195px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 via-white to-teal-50/30 px-[10px] py-[14px] md:h-[206px] md:rounded-[10px] lg:h-[185px] xl:h-[240px] 2xl:h-[260px]">
                    <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1">
                      <ShieldCheck className="size-3 text-emerald-600" />
                      <span className="text-[10px] font-medium text-emerald-700">Proctored</span>
                    </div>
                    <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-1">
                      <span className="text-[10px] font-medium text-amber-700">12:45</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 space-y-2">
                      <div className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm">
                        <div className="grid size-5 place-items-center rounded-full bg-emerald-100">
                          <Check className="size-3 text-emerald-600" />
                        </div>
                        <span className="text-[11px] font-medium text-slate-600">Identity verified</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-white/80 px-3 py-2 shadow-sm backdrop-blur-sm">
                        <div className="grid size-5 place-items-center rounded-full bg-blue-100">
                          <ShieldCheck className="size-3 text-blue-600" />
                        </div>
                        <span className="text-[11px] font-medium text-slate-600">Browser lockdown active</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mx-auto mt-[19px] max-w-[600px] text-base leading-snug tracking-[-0.02em] text-gray-500 sm:text-lg md:mt-5 xl:mt-[18px] xl:text-xl 2xl:mt-[26px]">
                  <p><strong className="mr-1 font-medium text-slate-900">Assessments people can&apos;t fake.</strong>Identity verification, browser lockdown, and session recording. Your certificates mean something.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Credentials */}
          <div className="min-w-[85vw] snap-center sm:min-w-[60vw] md:min-w-[45vw] lg:min-w-0">
            <div>
              <div className="card-styles flex flex-col justify-between p-[18px] md:p-[19px] lg:p-[17px] xl:p-[22px] 2xl:p-6">
                <div className="pointer-events-none rounded-[6px] bg-[linear-gradient(180deg,rgba(255,255,255,0.7)_0%,#F9FAFB_100%)] p-3.5 md:rounded-[10px] lg:rounded-[9px] xl:rounded-xl xl:p-4.5">
                  <div className="relative h-[195px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-violet-50 via-white to-purple-50/30 px-[10px] py-[14px] md:h-[206px] md:rounded-[10px] lg:h-[185px] xl:h-[240px] 2xl:h-[260px]">
                    <div className="absolute inset-x-4 top-4 rounded-lg border border-violet-100 bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="grid size-10 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-blue-600">
                          <Award className="size-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-slate-900">AI Fundamentals</p>
                          <p className="text-[10px] text-slate-500">University-Accredited Certificate</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2">
                        <span className="text-[9px] font-mono text-slate-400">VD-2026-AI-8847</span>
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[8px] font-medium text-emerald-700">Verified</span>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                      <div className="flex-1 rounded-md bg-white/80 px-2 py-1.5 text-center shadow-sm backdrop-blur-sm">
                        <p className="text-[14px] font-semibold text-slate-900">88%</p>
                        <p className="text-[8px] text-slate-500">Score</p>
                      </div>
                      <div className="flex-1 rounded-md bg-white/80 px-2 py-1.5 text-center shadow-sm backdrop-blur-sm">
                        <p className="text-[14px] font-semibold text-slate-900">12</p>
                        <p className="text-[8px] text-slate-500">Modules</p>
                      </div>
                      <div className="flex-1 rounded-md bg-white/80 px-2 py-1.5 text-center shadow-sm backdrop-blur-sm">
                        <p className="text-[14px] font-semibold text-slate-900">4.8</p>
                        <p className="text-[8px] text-slate-500">Rating</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mx-auto mt-[19px] max-w-[600px] text-base leading-snug tracking-[-0.02em] text-gray-500 sm:text-lg md:mt-5 xl:mt-[18px] xl:text-xl 2xl:mt-[26px]">
                  <p><strong className="mr-1 font-medium text-slate-900">Credentials that hold weight.</strong>Three tiers — skill badges, university-accredited, and industry-verified. Every certificate has a public verification page.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-20 lg:pt-32 pb-12 lg:pb-16">
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <h2 className="inline-block w-fit bg-gradient-to-r from-[#19191D] to-[#626275] bg-clip-text text-3xl leading-[1.25] font-medium tracking-[-1.28px] text-transparent lg:text-5xl xl:text-[56px]">
              The parts that matter
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-[#8C929D] md:text-lg">
              Every feature is built for credibility — AI mentoring that adapts, assessments that can&apos;t be gamed, and credentials anyone can verify.
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

      {/* ── Roles ── */}
      <section id="roles">
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-20 lg:pt-32 pb-12 lg:pb-16">
          <div className="mb-16 flex flex-col items-center gap-4 text-center">
            <h2 className="inline-block w-fit bg-gradient-to-r from-[#19191D] to-[#626275] bg-clip-text text-3xl leading-[1.25] font-medium tracking-[-1.28px] text-transparent lg:text-5xl xl:text-[56px]">
              Built for the people who actually do the work
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-[#8C929D] md:text-lg">
              Whether you&apos;re a university launching AI programs, a training partner certifying skills, or an enterprise running compliance — Dezai fits how you work.
            </p>
          </div>

          <div className="grid gap-6 lg:gap-8 md:grid-cols-2">
            {roles.map((r) => (
              <div
                key={r.title}
                className="rounded-4xl bg-gradient-to-br from-slate-50 to-white p-5 sm:p-8"
              >
                <h3 className="text-xl font-medium tracking-[-0.3px] text-slate-900">{r.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {r.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm font-medium leading-[1.6] tracking-[-0.01em] text-[#626275]">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
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
