# Implementation Plan — Prototype to MVP

Phased roadmap to transform Stitch HTML prototypes into a production Next.js 15 SaaS application.

**Assumptions:**
- Team: 1 senior full-stack engineer + 1 frontend engineer
- Timeline: 14–20 weeks to MVP
- Stack per architecture docs: Next.js 15, TypeScript, Prisma, PostgreSQL, NextAuth, Razorpay, Tailwind, Shadcn
- Designs are authoritative — **do not redesign UI**

---

## Phase 0: Foundation (Weeks 1–2)

**Goal:** Runnable application skeleton with design system wired.

### Tasks

| # | Task | Deliverable |
|---|------|-------------|
| 0.1 | Initialize Next.js 15 App Router + TypeScript + Tailwind | `package.json`, `app/layout.tsx` |
| 0.2 | Extract design tokens from `DESIGN.md` → `tailwind.config.ts` preset | Shared color, font, spacing tokens |
| 0.3 | Configure `next/font` for Geist + Inter | No Google Fonts CDN in prod |
| 0.4 | Install Shadcn UI, configure `components/ui/` | Button, Card, Input, Table base |
| 0.5 | Migrate logo to `public/brand/`, fix landing page logo bug | Local assets |
| 0.6 | Create `components/shared/TopAppBar`, `Footer`, `PageContainer` | Match HTML shells |
| 0.7 | Set up ESLint, Prettier, strict TypeScript | `tsconfig strict` |
| 0.8 | Create `.env.example` with documented vars | Template for team |
| 0.9 | Docker Compose for local PostgreSQL | `docker-compose.yml` |

### Exit Criteria
- [ ] `npm run dev` serves a styled blank page with correct fonts/colors
- [ ] TopAppBar + Footer render on a test route

---

## Phase 1: Data Layer (Weeks 2–3)

**Goal:** Persistent database with seed data matching prototype content.

### Tasks

| # | Task | Deliverable |
|---|------|-------------|
| 1.1 | Create `prisma/schema.prisma` from architecture doc | All 11 models |
| 1.2 | Extend schema: `LessonProgress`, `LessonNote`, `Notification` | Gap fixes |
| 1.3 | Add `courseId` to `Payment` model | Ledger accuracy |
| 1.4 | Run initial migration | `prisma/migrations/` |
| 1.5 | Build seed script: universities, courses, modules, lessons, quizzes | `prisma/seed.ts` |
| 1.6 | Seed demo users (student, university admin, dezai admin) | Test credentials |
| 1.7 | Create `lib/prisma.ts` singleton | DB client |
| 1.8 | Add database indexes (slug, email, verifyUrl, razorpayId) | Performance |

### Seed Content (from prototypes)
- Course: "Generative AI for Leaders: Strategic Implementation" — $899
- University: Stanford Institute for AI, MIT Global
- Instructor: Dr. Elena Rostova
- Quiz: Module 4 Assessment, 25 questions, 15 min
- Student: John Doe, Stanford, Year 3

### Exit Criteria
- [ ] `npx prisma db seed` populates dev database
- [ ] Prisma Studio shows relational data

---

## Phase 2: Authentication & RBAC (Weeks 3–4)

**Goal:** Secure multi-role access.

### Tasks

| # | Task | Deliverable |
|---|------|-------------|
| 2.1 | Configure NextAuth with credentials provider | `lib/auth-options.ts` |
| 2.2 | Build login page (new design — match design system) | `app/(auth)/login/page.tsx` |
| 2.3 | Build signup page | `app/(auth)/signup/page.tsx` |
| 2.4 | Implement session with `UserRole` in JWT | Role in session |
| 2.5 | Create middleware for route groups | `middleware.ts` |
| 2.6 | Protect `(student)`, `(university)`, `(admin)` layouts | Redirect unauthenticated |
| 2.7 | Wire profile logout button | Session destroy |
| 2.8 | Add `GET /api/me` endpoint | Current user + profile |

### Route Protection Map

```
/student/*     → STUDENT | DEZAI_ADMIN
/university/*  → UNIVERSITY_ADMIN | DEZAI_ADMIN
/admin/*       → DEZAI_ADMIN only
/verify/*      → Public
/              → Public
```

### Exit Criteria
- [ ] Three role types can log in with seeded credentials
- [ ] Unauthorized roles get 403/redirect

---

## Phase 3: Public Marketing & Catalog (Weeks 4–6)

**Goal:** Public-facing discovery flow.

### Tasks

| # | Task | Deliverable |
|---|------|-------------|
| 3.1 | Port landing page from `dezai_ai_micro_credentials_platform` | `app/(marketing)/page.tsx` |
| 3.2 | Extract marketing components: Hero, Partners, HowItWorks, etc. | `components/marketing/` |
| 3.3 | Build course catalog page `/catalog` | Grid with filters |
| 3.4 | Implement `GET /api/courses` with search, tier, university filters | API route |
| 3.5 | Port course details from `course_details_dezai_ai_updated_logo` | `app/(student)/courses/[slug]/page.tsx` |
| 3.6 | Implement `GET /api/courses/[slug]` | Include modules, instructor |
| 3.7 | Build SyllabusAccordion, InstructorCard, CertificateTierCard components | Reusable |
| 3.8 | Deprecate `course_details_dezai_ai` (non-logo variant) | Single canonical source |

### Exit Criteria
- [ ] Landing page matches Stitch export visually
- [ ] Catalog shows seeded courses from DB
- [ ] Course detail page loads dynamic data by slug

---

## Phase 4: Enrollment & Payments (Weeks 6–8)

**Goal:** Paid enrollment via Razorpay.

### Tasks

| # | Task | Deliverable |
|---|------|-------------|
| 4.1 | Set up Razorpay test account + `lib/razorpay.ts` | SDK wrapper |
| 4.2 | Build checkout flow (modal or redirect) | Triggered by Enroll CTA |
| 4.3 | `POST /api/enroll` — create order, return Razorpay options | Server-side amount |
| 4.4 | `POST /api/payments/razorpay` — webhook handler | Signature verify |
| 4.5 | Create `Enrollment` on successful payment | Idempotent webhook |
| 4.6 | Enrollment success / failure pages | User feedback |
| 4.7 | Revenue share calculation on payment record | universityId, share % |
| 4.8 | Wire mobile EnrollmentFAB | Course details |

### Exit Criteria
- [ ] Test payment creates enrollment in DB
- [ ] Failed payment does not enroll
- [ ] Payment appears in admin transaction data

---

## Phase 5: Learning Experience (Weeks 8–10)

**Goal:** Course player with real progress.

### Tasks

| # | Task | Deliverable |
|---|------|-------------|
| 5.1 | Integrate video provider (Mux recommended) | `videoUrl` on Lesson |
| 5.2 | Port course player from `course_player_dezai_ai_2` | Learn route |
| 5.3 | Build VideoPlayer, CourseModuleSidebar, PersonalNotesPanel | Components |
| 5.4 | `POST /api/lessons/[id]/complete` | LessonProgress record |
| 5.5 | `GET/PUT /api/lessons/[id]/notes` | LessonNote CRUD |
| 5.6 | Compute enrollment progress from completed lessons | Update `Enrollment.progress` |
| 5.7 | Lesson lock/unlock based on sequential completion | Lock icon logic |
| 5.8 | Build student dashboard (new — nav requires it) | Enrolled courses, progress |
| 5.9 | Mobile bottom nav on player | Four tabs |

### Exit Criteria
- [ ] Enrolled student can watch video and mark lessons complete
- [ ] Progress bar updates in header
- [ ] Notes persist across sessions
- [ ] Student dashboard lists enrollments

---

## Phase 6: Quiz Engine (Weeks 10–12)

**Goal:** Timed assessments with server-side grading.

### Tasks

| # | Task | Deliverable |
|---|------|-------------|
| 6.1 | Port quiz UI from `active_quiz_dezai_ai` | Quiz route |
| 6.2 | Build QuizTimer, QuestionCard, RadioOption, QuestionNavigator | Components |
| 6.3 | `GET /api/quiz/[quizId]` — questions without answers | Sanitized DTO |
| 6.4 | `POST /api/quiz/[quizId]/start` — create attempt, server start time | Anti-cheat base |
| 6.5 | `POST /api/quiz/submit` — grade server-side, store attempt | From architecture doc |
| 6.6 | Flag question state (client + optional server persist) | Flagged styling |
| 6.7 | Tab-switch logging to `ProctoringEvent` table | Audit trail |
| 6.8 | Auto-submit on timer expiry (server validates) | Time limit enforcement |
| 6.9 | Pass/fail threshold configuration per quiz | `passed` boolean |

### Exit Criteria
- [ ] Student can complete quiz, see score
- [ ] Answers not exposed in client bundle
- [ ] Attempt recorded in `QuizAttempt`
- [ ] Timer enforced server-side on submit

---

## Phase 7: Certificates (Weeks 12–13)

**Goal:** Verifiable credentials.

### Tasks

| # | Task | Deliverable |
|---|------|-------------|
| 7.1 | Issue certificate on course completion + quiz pass | Business rule |
| 7.2 | `POST /api/certificates/generate` — PDF via react-pdf or Puppeteer | `pdfUrl` stored |
| 7.3 | Generate unique `verifyUrl` per certificate | UUID-based |
| 7.4 | Build public `/verify/[id]` page | From architecture doc |
| 7.5 | `GET /api/verify/[certId]` | Public JSON + page |
| 7.6 | Port certificate gallery on student profile | Dynamic from DB |
| 7.7 | Upload PDFs to object storage (S3/R2) | Persistent `pdfUrl` |

### Exit Criteria
- [ ] Completing course issues downloadable PDF
- [ ] Public verify page confirms authenticity
- [ ] Profile shows earned certificates

---

## Phase 8: University Admin (Weeks 13–15)

**Goal:** Institutional dashboard with live data.

### Tasks

| # | Task | Deliverable |
|---|------|-------------|
| 8.1 | Port university dashboard from `university_dashboard_dezai_ai` | Dashboard route |
| 8.2 | Build NavigationDrawer, StatCard, DataTable components | Admin shell |
| 8.3 | `GET /api/university/dashboard` — scoped to `universityId` | Aggregations |
| 8.4 | Course performance table from real enrollment data | Dynamic rows |
| 8.5 | Instructor list (seeded or from User role extension) | Directory |
| 8.6 | Recent certifications table | From Certificate model |
| 8.7 | Export report — CSV download (MVP) | Button handler |
| 8.8 | University courses list page (basic) | Sidebar nav item |

### Exit Criteria
- [ ] University admin sees only their institution's data
- [ ] Stats match database aggregates
- [ ] Export produces valid CSV

---

## Phase 9: Dezai Admin (Weeks 15–17)

**Goal:** Global platform analytics.

### Tasks

| # | Task | Deliverable |
|---|------|-------------|
| 9.1 | Port revenue page from `revenue_analytics_dezai_admin` | `/admin/revenue` |
| 9.2 | `GET /api/admin/analytics` — revenue, payouts, trends | Documented endpoint |
| 9.3 | Replace CSS bar chart with Recharts | Live university breakdown |
| 9.4 | Transaction ledger with pagination + search | `GET /api/admin/transactions` |
| 9.5 | Build basic admin dashboard (new design, same system) | `/admin/dashboard` |
| 9.6 | University registry page — list/create/edit | `/admin/universities` |
| 9.7 | Date range filter on analytics | Query param support |

### Exit Criteria
- [ ] Dezai admin sees cross-university revenue
- [ ] Transaction ledger paginates real payments
- [ ] Can manage university records

---

## Phase 10: Profile, Notifications & Polish (Weeks 17–18)

**Goal:** Complete student account experience.

### Tasks

| # | Task | Deliverable |
|---|------|-------------|
| 10.1 | Port student profile from `student_profile_dezai_ai` | Profile route |
| 10.2 | `PATCH /api/me/profile` — edit name, bio, avatar | Settings backend |
| 10.3 | Activity timeline from event log | Recent actions |
| 10.4 | Notification model + bell icon dropdown | `GET /api/notifications` |
| 10.5 | Settings sub-pages (profile, notifications, billing stub) | Nav from profile |
| 10.6 | Email notifications (enrollment, cert issued) | Resend/SendGrid |
| 10.7 | Loading skeletons on all data pages | UX polish |
| 10.8 | Error boundaries + 404 page | Resilience |

### Exit Criteria
- [ ] Profile edits persist
- [ ] Notifications appear for key events
- [ ] No blank screens during data fetch

---

## Phase 11: Hardening & Launch (Weeks 18–20)

**Goal:** Production-ready deployment.

### Tasks

| # | Task | Deliverable |
|---|------|-------------|
| 11.1 | E2E tests: enroll → learn → quiz → cert | Playwright suite |
| 11.2 | API integration tests for payment webhook | Test coverage |
| 11.3 | Security audit: RBAC, quiz answers, webhooks | Checklist |
| 11.4 | Migrate all images to owned CDN/storage | No googleusercontent |
| 11.5 | Configure Vercel + managed Postgres (Neon/Supabase) | Staging + prod |
| 11.6 | Set up Sentry error tracking | Observability |
| 11.7 | Performance audit (Lighthouse) | >90 performance target |
| 11.8 | Accessibility audit on quiz + player | WCAG AA basics |
| 11.9 | Documentation: README, API docs, runbook | Team onboarding |
| 11.10 | Load test payment webhook + quiz submit | Capacity baseline |

### Exit Criteria
- [ ] Staging environment mirrors production
- [ ] E2E happy path passes in CI
- [ ] Production deployment successful

---

## Recommended Build Order (Condensed)

```
Week 1-2:   Foundation + Design System
Week 2-3:   Database + Seed
Week 3-4:   Auth + RBAC
Week 4-6:   Landing + Catalog + Course Details
Week 6-8:   Razorpay Enrollment
Week 8-10:  Course Player + Student Dashboard
Week 10-12: Quiz Engine
Week 12-13: Certificates + Verify
Week 13-15: University Admin
Week 15-17: Dezai Admin + Revenue
Week 17-18: Profile + Notifications
Week 18-20: Hardening + Launch
```

### Parallel Workstreams

| Stream A (Backend) | Stream B (Frontend) |
|------------------|---------------------|
| Prisma + seed | Design tokens + shared components |
| Auth + middleware | Landing page port |
| API routes | Course details + player |
| Razorpay webhooks | Quiz UI |
| Certificate PDF | Admin dashboards |
| Analytics queries | Profile + settings |

---

## Effort Estimates

| Phase | Duration | Engineer-Weeks |
|-------|----------|----------------|
| 0 Foundation | 2 weeks | 2 |
| 1 Data Layer | 1 week | 1.5 |
| 2 Auth | 1 week | 2 |
| 3 Marketing/Catalog | 2 weeks | 3 |
| 4 Payments | 2 weeks | 3 |
| 5 Learning | 2 weeks | 3 |
| 6 Quiz | 2 weeks | 3 |
| 7 Certificates | 1 week | 1.5 |
| 8 University Admin | 2 weeks | 2.5 |
| 9 Dezai Admin | 2 weeks | 2.5 |
| 10 Polish | 1 week | 2 |
| 11 Hardening | 2 weeks | 2 |
| **Total** | **~20 weeks** | **~28 EW** (with overlap → 14-20 cal weeks with 2 engineers) |

---

## Completion Tracking

| Milestone | % of MVP | Cumulative |
|-----------|----------|------------|
| Design prototypes (original) | 18% | 18% |
| + Foundation + DB + Seed | 12% | 30% |
| + Auth + RBAC + Onboarding | 10% | 40% |
| + Catalog + Course Details | 12% | **52%** ✅ |
| + Enrollment + Learning + Dashboard | 12% | **64%** ✅ |
| + Payments | 10% | 74% |
| + Quiz | 10% | 84% |
| + Certificates | 6% | 90% |
| + Admin dashboards | 6% | 96% |
| + Polish + Launch | 4% | 100% |

> **Sprint 1 (June 2026)** completed Foundation through Player phases — the app now has real data flow from NestJS backend to Next.js frontend for enrollment, progress, lessons, notes, bookmarks, and XP. Remaining: payments, quiz engine, certificates, admin dashboards, and polish.

---

## Post-MVP Roadmap (v1.1+)

1. Live proctoring SDK integration
2. Assignment submission workflow
3. Community / discussion forums
4. Enterprise SSO (SAML)
5. Subscription billing model
6. Advanced report PDF export
7. Instructor self-service portal
8. Mobile native app (React Native)
9. AI tutoring / recommendations
10. Multi-language (i18n)

---

## Decision Log (Resolve Early)

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Video hosting | Mux vs Cloudflare Stream vs Vimeo | **Mux** — dev experience |
| PDF generation | react-pdf vs Puppeteer | **react-pdf** for certs |
| File storage | S3 vs Cloudflare R2 | **R2** — cost |
| Email | Resend vs SendGrid | **Resend** — DX |
| Charts | Recharts vs Chart.js | **Recharts** — React-native |
| State management | Zustand vs React Query only | **TanStack Query** + minimal Zustand |
| Proctoring MVP | Real SDK vs audit log only | **Audit log only** for MVP |
| Blockchain verify | Implement vs remove claim | **Remove claim** for MVP |

---

## Sprint Log

### Sprint 1 — Backend Integration (June 2026)

**Role**: Architecture decisions involved setting constraints (preserve route structure, local-first state pattern, scope cut for quiz/cert/auth mock data), testing functionality in real time, and flagging UX gaps. The AI agent executed the implementation.

**Completed work:**

| Area | What Was Done |
|------|---------------|
| **API types & services** | Created `program.types.ts` (full API response types), `programs-api.service.ts` (HTTP layer for `/api/programs`), `programs-api.service.ts` (enrollments, lessons, notes, bookmarks, XP) |
| **Course service** | Rewrote `course.service.ts` (async, cache, slug resolution), `useCourses`, `useEnrollment`, `useProgress` hooks — all async, API-backed, with loading/error states |
| **Enrollment store** | Rewrote `enrollment.store.ts` with fresh persist key `dezai-enrollments-v3`, `fetchXp()`, async enroll returning boolean, XP sync from completeLesson response |
| **Learning services** | Rewrote `learning.service.ts` (builds CourseProgress from real enrollments), `lesson.service.ts` (fetches `GET /api/learning/lessons/:id`, markComplete syncs XP) |
| **Pages** | Rewrote `CatalogPage.tsx` (loading skeleton), `CourseDetailPage.tsx` (async getBySlug, tracks-based syllabus), `CoursePlayerPage.tsx` (fetches course + lesson from API, local state navigation, `window.history.replaceState` for URL, no full reloads) |
| **Components** | Rewrote `course-card`, `course-hero`, `enrollment-cta`, `checkout-modal`, `syllabus-accordion`, `related-courses`, `course-filters`, `course-module-sidebar`, `mark-complete-button` — all use `ApiProgram` types, no mock imports |
| **Backend XP endpoint** | Created `GET /api/users/me/xp` endpoint |
| **Curriculum seed** | Created `seed-full-curriculum.ts`: 12 programs each with 5 ROOTS + 5 EDGE modules (10 modules, ~28 lessons per program), real Google sample video URLs, markdown content |
| **Thumbnails** | Added picsum.photos thumbnails to course cards and hero, with CSS gradient fallback |
| **UX fixes** | Empty curriculum shows "Curriculum coming soon"; enrollment CTA disables when no lessons; course card shows "Coming soon" badge; progress synced from backend on page load; footer hidden on program pages; header visible on catalog |

**Files changed:**
- `frontend/`: `program.types.ts`, `programs-api.service.ts`, `course.service.ts`, `enrollment.store.ts`, `learning-api.service.ts`, `learning.service.ts`, `lesson.service.ts`, `slug.ts`, `thumbnail.ts`, 4 page components, 9 UI components, student layout
- `backend/`: `users.controller.ts`, `programs.service.ts`, `seed-full-curriculum.ts`, `cleanup-modules.ts`

**TypeScript:** Clean compile (`tsc --noEmit` passes).

### Sprint 4 — Student Experience Stabilization (June 2026)

**Completed work:**

| Area | What Was Done |
| :--- | :--- |
| **Backend Sync** | Developed `sync-progress.ts` script to fix stale DB percentages; updated per-program completion filtering. |
| **Global Leaderboard** | Implemented real XP-based global ranking logic replacing "#12" mock placeholders. |
| **Dashboard UI** | Built full-page skeleton system + premium course thumbnails (Picsum integration). |
| **Smart Navigation** | Optimized `CoursePlayerPage` to skip completed lessons and fixed title-based slug routing. |
| **Data Sync** | Unified XP, Streaks, and Hours metrics across Dashboard, Profile, and Activity Feed. |
| **Activity Feed** | Resolved live program titles instead of raw IDs for a professional event log. |

**Next sprint recommendations:**
- **Quiz Engine**: Implement assessment routes and timed grading.
- **Certificate Issuance**: Connect successful course completion to PDF generation.
- **University Admin**: Port institutional analytics dashboards to real data.
- **Notifications**: Add real-time event triggers for achievements and course updates.
