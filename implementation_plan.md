# Dezai AI — MVP Prototype Implementation Plan (v2)

## Goal

Build a **complete, demo-ready MVP prototype** of Dezai AI — a university-grade EdTech SaaS platform targeting the **Gujarat education market**. Frontend-only with mock services. Every page works, every navigation path resolves, every dashboard shows meaningful data.

---

## Key Changes from v1

1. **Universities**: Gujarat-focused — KPGU Vadodara, Parul University, CHARUSAT, Navrachana University, MSU Baroda + 1 international (Stanford) for visual appeal
2. **Priority ordering**: Strict P0 → P1 → P2. The student flow must work end-to-end before any admin panel code is written
3. **Build verification**: Each priority tier is self-contained and demoable before moving to the next

---

## Decisions (Confirmed)

| Decision | Choice |
|----------|--------|
| Shadcn style | **New York** (sharper, SaaS-appropriate) |
| Demo credentials | `student@dezai.com` / `admin@kpgu.edu` / `superadmin@dezai.com` |
| Mock universities | KPGU Vadodara (primary), Parul, CHARUSAT, Navrachana, MSU Baroda, Stanford |
| Tailwind version | v4 (CSS-based `@theme` config) |
| Architecture | Feature-based per ARCHITECTURE.md |

---

## Priority Map

### P0 — Must Build First (Complete Student Flow)

| Phase | Feature | Deliverable |
|-------|---------|-------------|
| 1 | Foundation & Design System | Runnable app with design tokens, Shadcn, shared layouts |
| 2 | Mock Data & Stores | Realistic Gujarat-market data, Zustand stores |
| 3 | Authentication | Login, signup, RBAC, route protection |
| 4 | Student Dashboard | Enrolled courses, continue learning, stats |
| 5 | Course Catalog & Details | Browse, search, filter, enroll with mock payment |
| 6 | Learning Player | Video player, module nav, progress, notes |
| 7 | Quiz Engine | Timed quiz, scoring, tab-switch warnings |
| 8 | Certificates & Profile | Certificate gallery, PDF, verification, student profile |

**P0 exit criteria**: A student can register → browse courses → enroll → learn → take quiz → earn certificate. The entire path works end-to-end.

### P1 — Build After P0 Works

| Phase | Feature | Deliverable |
|-------|---------|-------------|
| 9 | University Admin Panel | Dashboard, courses, instructors, certificates |
| 10 | Dezai Admin Panel | Revenue, transactions, university/user management |
| 11 | Analytics & Charts | Recharts dashboards across all panels |
| 12 | Notifications | Bell, dropdown, notification center |

**P1 exit criteria**: All three roles have complete experiences with real-looking data.

### P2 — Polish

| Phase | Feature | Deliverable |
|-------|---------|-------------|
| 13 | Marketing Landing Page | Hero, partners, tiers, testimonials, FAQ |

**P2 exit criteria**: Public-facing marketing page matches prototype designs.

---

## Proposed Changes

---

### P0 — PHASE 1: Foundation & Design System

Migrate to `src/` structure, install all dependencies, configure the Academic Intelligence design system, set up Shadcn UI, create shared layout components.

---

#### [MODIFY] [tsconfig.json](file:///f:/Dezai%20Prototype/frontend/tsconfig.json)
Update `@/*` path alias from `./*` to `./src/*`

#### [MODIFY] [package.json](file:///f:/Dezai%20Prototype/frontend/package.json)
Add all dependencies:
- `zustand`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`
- `recharts`, `lucide-react`, `clsx`, `tailwind-merge`, `class-variance-authority`
- `date-fns`, `qrcode.react`, `jspdf`, `sonner`, `next-themes`

#### [MOVE] `frontend/app/` → `frontend/src/app/`

#### [MODIFY] globals.css → `src/app/globals.css`
Academic Intelligence design system tokens via Tailwind v4 `@theme`:
- Colors: primary `#0057cd`, secondary `#0051d5`, surfaces, error, semantic tokens
- Typography: Geist (headlines), Inter (body), full scale
- Spacing, radius, elevation, custom utilities

#### [NEW] Shadcn UI in `src/shared/ui/`
~20 primitives: button, card, input, label, select, table, dialog, dropdown-menu, avatar, badge, tabs, separator, progress, checkbox, textarea, tooltip, accordion, sheet, scroll-area, skeleton

#### [NEW] `src/shared/utils/cn.ts` — className merger
#### [NEW] `src/shared/types/common.types.ts` — UserRole, Tier, ApiResponse enums
#### [NEW] `src/shared/components/top-app-bar.tsx` — Sticky header (role-adaptive)
#### [NEW] `src/shared/components/footer.tsx` — Site footer
#### [NEW] `src/shared/components/page-container.tsx` — Max-width wrapper
#### [NEW] `src/shared/components/empty-state.tsx` — Generic empty state
#### [NEW] `src/shared/components/loading-skeleton.tsx` — Skeleton loading
#### [NEW] `src/shared/components/stat-card.tsx` — Metric card (icon, value, trend)
#### [NEW] `src/shared/components/data-table.tsx` — Sortable/filterable table
#### [NEW] `src/shared/hooks/useDebounce.ts`
#### [NEW] `src/shared/hooks/useLocalStorage.ts`
#### [NEW] `src/lib/providers.tsx` — Query provider, Zustand, Sonner toaster

**Exit criteria**: `npm run dev` serves styled page with correct fonts/colors, TopAppBar + Footer render.

---

### P0 — PHASE 2: Mock Data & Stores

Gujarat-focused mock data that makes the platform feel alive.

---

#### [NEW] `src/lib/mock-data/universities.ts`
6 universities:
- **KPGU Vadodara** (Krishna Patel Gyansagar University) — primary
- **Parul University** — Vadodara
- **CHARUSAT** — Charotar University, Anand
- **Navrachana University** — Vadodara
- **MSU Baroda** — Maharaja Sayajirao University
- **Stanford Institute for AI** — international partner

Each with: name, logo placeholder, location, accreditation, description, revenueShare, stats

#### [NEW] `src/lib/mock-data/instructors.ts`
12 instructors across Gujarat universities with Indian names, bios, specializations

#### [NEW] `src/lib/mock-data/courses.ts`
12 courses across 3 categories (AI, Commerce, Design):
- **AI**: Generative AI for Leaders (₹899), Machine Learning Fundamentals (₹1,299), Deep Learning Masterclass (₹1,499), AI Ethics & Governance (₹699)
- **Commerce**: Digital Marketing Strategy (₹799), Financial Technology (₹999), E-Commerce Operations (₹599), Business Analytics (₹899)
- **Design**: UI/UX Design Principles (₹699), Design Thinking (₹499), Visual Communication (₹599), Product Design (₹799)

Each with full module trees (4-6 modules, 3-5 lessons each), INR pricing, ratings, enrollment counts

#### [NEW] `src/lib/mock-data/students.ts`
15 students with Indian names, Gujarat universities, enrollment history, progress data

#### [NEW] `src/lib/mock-data/quizzes.ts`
Quiz banks: 10-25 MCQ questions per quiz, point values, correct answers

#### [NEW] `src/lib/mock-data/certificates.ts`
25 certificates across all 3 tiers with verification UUIDs, dates, grades

#### [NEW] `src/lib/mock-data/notifications.ts`
40+ notifications (enrollment confirmations, quiz reminders, certificate issued, system alerts)

#### [NEW] `src/lib/mock-data/transactions.ts`
80+ transactions in INR with realistic dates, statuses (success/pending/failed)

#### [NEW] `src/lib/mock-data/index.ts` — Central export

#### [NEW] `src/lib/stores/auth.store.ts` — Auth state, login/logout, current user
#### [NEW] `src/lib/stores/enrollment.store.ts` — Enrolled courses, progress
#### [NEW] `src/lib/stores/quiz.store.ts` — Active quiz state, answers, timer, flags
#### [NEW] `src/lib/stores/notification.store.ts` — Notifications, unread count
#### [NEW] `src/lib/stores/index.ts` — Central export

**Exit criteria**: All mock data importable, stores functional, data feels realistic for Gujarat market demo.

---

### P0 — PHASE 3: Authentication

Login, signup, password reset (mock), RBAC route protection.

---

#### [NEW] `src/features/auth/types/auth.types.ts` — User, Session, Credentials types
#### [NEW] `src/features/auth/schemas/login.schema.ts` — Zod login validation
#### [NEW] `src/features/auth/schemas/signup.schema.ts` — Zod signup validation
#### [NEW] `src/features/auth/services/auth.service.ts` — Mock auth: login, signup, logout
#### [NEW] `src/features/auth/hooks/useAuth.ts` — Auth hook with role checks
#### [NEW] `src/features/auth/components/login-form.tsx` — Email/password + demo credential buttons
#### [NEW] `src/features/auth/components/signup-form.tsx` — Registration with role selection
#### [NEW] `src/features/auth/components/forgot-password-form.tsx` — Mock reset flow
#### [NEW] `src/features/auth/components/auth-guard.tsx` — Client-side route protection
#### [NEW] `src/features/auth/pages/LoginPage.tsx` — Full login page
#### [NEW] `src/features/auth/pages/SignupPage.tsx` — Full signup page
#### [NEW] `src/features/auth/index.ts` — Barrel exports

#### [NEW] `src/app/(auth)/login/page.tsx` — Thin route → LoginPage
#### [NEW] `src/app/(auth)/signup/page.tsx` — Thin route → SignupPage
#### [NEW] `src/app/(auth)/layout.tsx` — Centered auth layout
#### [NEW] `src/app/(student)/layout.tsx` — Student shell with AuthGuard, TopAppBar
#### [NEW] `src/app/(university)/layout.tsx` — University shell with AuthGuard, sidebar
#### [NEW] `src/app/(admin)/layout.tsx` — Admin shell with AuthGuard, top nav

**Exit criteria**: 3 demo accounts log in, RBAC redirects work, unauthorized access blocked.

---

### P0 — PHASE 4: Student Dashboard

Student home showing enrolled courses, continue learning, academic stats.

---

#### [NEW] `src/features/learning/types/learning.types.ts` — LessonProgress, PlayerState, Note types
#### [NEW] `src/features/learning/services/learning.service.ts` — Mock: getEnrolledCourses, getProgress
#### [NEW] `src/features/learning/hooks/useProgress.ts` — Progress data hook
#### [NEW] `src/features/learning/components/continue-learning-card.tsx` — Resume course card
#### [NEW] `src/features/learning/components/enrolled-course-card.tsx` — Enrolled course with progress bar
#### [NEW] `src/features/learning/components/course-progress-pill.tsx` — Inline progress indicator
#### [NEW] `src/features/learning/pages/StudentDashboardPage.tsx` — Full dashboard
#### [NEW] `src/features/learning/index.ts` — Barrel exports

#### [NEW] `src/app/(student)/dashboard/page.tsx` — Thin route → StudentDashboardPage

**Exit criteria**: Logged-in student sees dashboard with enrolled courses and stats.

---

### P0 — PHASE 5: Course Catalog & Details

Browse, search, filter courses. View details. Enroll with mock payment.

---

#### [NEW] `src/features/courses/types/course.types.ts` — Course, Module, Lesson, Category types
#### [NEW] `src/features/courses/services/course.service.ts` — Mock: getCourses, getBySlug, search, enroll
#### [NEW] `src/features/courses/hooks/useCourses.ts` — TanStack Query hooks
#### [NEW] `src/features/courses/hooks/useEnrollment.ts` — Enrollment actions
#### [NEW] `src/features/courses/components/course-card.tsx` — Card with title, instructor, university, duration, tier, price
#### [NEW] `src/features/courses/components/course-hero.tsx` — Course detail hero
#### [NEW] `src/features/courses/components/syllabus-accordion.tsx` — Module/lesson tree
#### [NEW] `src/features/courses/components/instructor-card.tsx` — Instructor info
#### [NEW] `src/features/courses/components/enrollment-cta.tsx` — Enroll button
#### [NEW] `src/features/courses/components/course-filters.tsx` — Category, tier, university, price filters
#### [NEW] `src/features/courses/components/checkout-modal.tsx` — Mock payment (success/failure/free)
#### [NEW] `src/features/courses/components/related-courses.tsx` — Related courses grid
#### [NEW] `src/features/courses/pages/CatalogPage.tsx` — Full catalog
#### [NEW] `src/features/courses/pages/CourseDetailPage.tsx` — Full detail page
#### [NEW] `src/features/courses/index.ts` — Barrel exports

#### [NEW] `src/app/catalog/page.tsx` — Thin route → CatalogPage (public)
#### [NEW] `src/app/(student)/courses/[slug]/page.tsx` — Thin route → CourseDetailPage

**Exit criteria**: Browse catalog → filter → view details → enroll with mock payment. All 12 courses display correctly.

---

### P0 — PHASE 6: Learning Player

Course player with video, module navigation, lesson completion, progress, notes.

---

#### [NEW] `src/features/learning/services/lesson.service.ts` — Mock: markComplete, saveNote, getResources
#### [NEW] `src/features/learning/hooks/useNotes.ts` — Notes CRUD hook
#### [NEW] `src/features/learning/components/video-player.tsx` — Simulated video player
#### [NEW] `src/features/learning/components/course-module-sidebar.tsx` — Module/lesson tree with progress
#### [NEW] `src/features/learning/components/lesson-content.tsx` — Rich lesson content
#### [NEW] `src/features/learning/components/personal-notes-panel.tsx` — Notes textarea
#### [NEW] `src/features/learning/components/mark-complete-button.tsx` — Complete + XP toast
#### [NEW] `src/features/learning/pages/CoursePlayerPage.tsx` — Full player layout

#### [NEW] `src/app/(student)/courses/[slug]/learn/[lessonId]/page.tsx` — Thin route → CoursePlayerPage

**Exit criteria**: Enrolled student can navigate modules, view lessons, mark complete, write notes, see progress update.

---

### P0 — PHASE 7: Quiz Engine

Timed quizzes with question banks, scoring, tab-switch/fullscreen warnings.

---

#### [NEW] `src/features/quizzes/types/quiz.types.ts` — Quiz, Question, Attempt types
#### [NEW] `src/features/quizzes/constants/quiz.constants.ts` — Timer, thresholds, max retakes
#### [NEW] `src/features/quizzes/services/quiz.service.ts` — Mock: getQuiz, submitQuiz, score, attempts
#### [NEW] `src/features/quizzes/hooks/useQuiz.ts` — Quiz state hook
#### [NEW] `src/features/quizzes/hooks/useTimer.ts` — Countdown timer hook
#### [NEW] `src/features/quizzes/components/quiz-timer.tsx` — Countdown with warning at ≤5 min
#### [NEW] `src/features/quizzes/components/question-card.tsx` — Question display
#### [NEW] `src/features/quizzes/components/radio-option.tsx` — Styled radio options
#### [NEW] `src/features/quizzes/components/question-navigator.tsx` — Grid nav (answered/flagged/current)
#### [NEW] `src/features/quizzes/components/quiz-navigation-bar.tsx` — Previous/Flag/Next
#### [NEW] `src/features/quizzes/components/security-toast.tsx` — Tab-switch warning
#### [NEW] `src/features/quizzes/components/fullscreen-toggle.tsx` — Fullscreen control
#### [NEW] `src/features/quizzes/pages/QuizPage.tsx` — Full quiz experience
#### [NEW] `src/features/quizzes/pages/QuizResultsPage.tsx` — Results with score/pass-fail
#### [NEW] `src/features/quizzes/index.ts` — Barrel exports

#### [NEW] `src/app/(student)/courses/[slug]/quiz/[quizId]/page.tsx` — Thin route → QuizPage

**Exit criteria**: Student can take timed quiz, navigate questions, flag items, submit, see results with pass/fail.

---

### P0 — PHASE 8: Certificates & Profile

Certificate gallery, PDF generation, public verification, student profile.

---

#### [NEW] `src/features/certificates/types/certificate.types.ts` — Certificate, Tier, Verification types
#### [NEW] `src/features/certificates/services/certificate.service.ts` — Mock: getCerts, verify, generatePDF
#### [NEW] `src/features/certificates/hooks/useCertificates.ts` — Certificate data hook
#### [NEW] `src/features/certificates/components/certificate-gallery-card.tsx` — Card with tier badge
#### [NEW] `src/features/certificates/components/certificate-tier-card.tsx` — Tier info card
#### [NEW] `src/features/certificates/components/certificate-preview.tsx` — Visual certificate
#### [NEW] `src/features/certificates/components/certificate-qr-code.tsx` — QR verification link
#### [NEW] `src/features/certificates/pages/CertificateListPage.tsx` — Gallery
#### [NEW] `src/features/certificates/pages/CertificateDetailPage.tsx` — Detail + download + QR
#### [NEW] `src/features/certificates/pages/VerifyPage.tsx` — Public verification
#### [NEW] `src/features/certificates/index.ts` — Barrel exports

#### [NEW] `src/features/users/types/user.types.ts` — UserProfile, Activity types
#### [NEW] `src/features/users/services/user.service.ts` — Mock: getProfile, updateProfile
#### [NEW] `src/features/users/hooks/useProfile.ts` — Profile hook
#### [NEW] `src/features/users/components/profile-header-card.tsx` — Photo, name, tags
#### [NEW] `src/features/users/components/profile-stat-bento.tsx` — Academic stats
#### [NEW] `src/features/users/components/activity-timeline.tsx` — Recent activity
#### [NEW] `src/features/users/components/account-settings-panel.tsx` — Settings rows
#### [NEW] `src/features/users/pages/ProfilePage.tsx` — Full profile
#### [NEW] `src/features/users/index.ts` — Barrel exports

#### [NEW] `src/app/(student)/certificates/page.tsx` → CertificateListPage
#### [NEW] `src/app/(student)/certificates/[id]/page.tsx` → CertificateDetailPage
#### [NEW] `src/app/verify/[id]/page.tsx` → VerifyPage (public)
#### [NEW] `src/app/(student)/profile/page.tsx` → ProfilePage

**P0 EXIT CRITERIA**: Complete student journey works: register → browse → enroll → learn → quiz → earn certificate → view profile. Platform is demoable.

---

### P1 — PHASE 9: University Admin Panel

Dashboard with institutional analytics, scoped to university.

---

#### [NEW] `src/features/universities/types/university.types.ts`
#### [NEW] `src/features/universities/services/university.service.ts`
#### [NEW] `src/features/universities/hooks/useUniversityDashboard.ts`
#### [NEW] `src/features/universities/components/navigation-drawer.tsx` — Sidebar nav
#### [NEW] `src/features/universities/components/dashboard-intro.tsx` — Welcome + date filter
#### [NEW] `src/features/universities/components/course-performance-table.tsx`
#### [NEW] `src/features/universities/components/instructor-list-item.tsx`
#### [NEW] `src/features/universities/components/certifications-table.tsx`
#### [NEW] `src/features/universities/pages/UniversityDashboardPage.tsx`
#### [NEW] `src/features/universities/pages/UniversityCoursesPage.tsx`
#### [NEW] `src/features/universities/pages/UniversityInstructorsPage.tsx`
#### [NEW] `src/features/universities/pages/UniversityCertificatesPage.tsx`
#### [NEW] `src/features/universities/index.ts`

#### [NEW] `src/app/(university)/university/dashboard/page.tsx`
#### [NEW] `src/app/(university)/university/courses/page.tsx`
#### [NEW] `src/app/(university)/university/instructors/page.tsx`
#### [NEW] `src/app/(university)/university/certificates/page.tsx`

---

### P1 — PHASE 10: Dezai Admin Panel

Platform-wide admin with revenue, transactions, university/user management.

---

#### [NEW] `src/features/admin/types/admin.types.ts`
#### [NEW] `src/features/admin/services/admin.service.ts`
#### [NEW] `src/features/admin/hooks/useAdminDashboard.ts`
#### [NEW] `src/features/admin/components/admin-top-nav.tsx`
#### [NEW] `src/features/admin/components/admin-page-header.tsx`
#### [NEW] `src/features/admin/components/transaction-ledger.tsx`
#### [NEW] `src/features/admin/components/university-management-table.tsx`
#### [NEW] `src/features/admin/components/user-management-table.tsx`
#### [NEW] `src/features/admin/pages/AdminDashboardPage.tsx`
#### [NEW] `src/features/admin/pages/RevenueAnalyticsPage.tsx`
#### [NEW] `src/features/admin/pages/TransactionsPage.tsx`
#### [NEW] `src/features/admin/pages/UniversityRegistryPage.tsx`
#### [NEW] `src/features/admin/pages/UserManagementPage.tsx`
#### [NEW] `src/features/admin/index.ts`

#### [NEW] `src/app/(admin)/admin/dashboard/page.tsx`
#### [NEW] `src/app/(admin)/admin/revenue/page.tsx`
#### [NEW] `src/app/(admin)/admin/transactions/page.tsx`
#### [NEW] `src/app/(admin)/admin/universities/page.tsx`
#### [NEW] `src/app/(admin)/admin/users/page.tsx`

---

### P1 — PHASE 11: Analytics & Charts

Recharts dashboards powering university and admin panels.

---

#### [NEW] `src/features/analytics/types/analytics.types.ts`
#### [NEW] `src/features/analytics/services/analytics.service.ts`
#### [NEW] `src/features/analytics/components/enrollment-chart.tsx`
#### [NEW] `src/features/analytics/components/completion-chart.tsx`
#### [NEW] `src/features/analytics/components/revenue-chart.tsx`
#### [NEW] `src/features/analytics/components/quiz-performance-chart.tsx`
#### [NEW] `src/features/analytics/components/certificate-issuance-chart.tsx`
#### [NEW] `src/features/analytics/components/allocation-breakdown.tsx`
#### [NEW] `src/features/analytics/components/date-range-filter.tsx`
#### [NEW] `src/features/analytics/index.ts`

---

### P1 — PHASE 12: Notifications

Bell, dropdown, notification center, mark-as-read.

---

#### [NEW] `src/features/notifications/types/notification.types.ts`
#### [NEW] `src/features/notifications/services/notification.service.ts`
#### [NEW] `src/features/notifications/hooks/useNotifications.ts`
#### [NEW] `src/features/notifications/components/notification-bell.tsx`
#### [NEW] `src/features/notifications/components/notification-dropdown.tsx`
#### [NEW] `src/features/notifications/components/notification-item.tsx`
#### [NEW] `src/features/notifications/pages/NotificationCenterPage.tsx`
#### [NEW] `src/features/notifications/index.ts`

---

### P2 — PHASE 13: Marketing Landing Page

Public-facing landing page with hero, partners, tiers, testimonials.

---

Components distributed per ARCHITECTURE.md feature ownership:
- `features/courses/components/hero-section.tsx`
- `features/universities/components/partner-logo-strip.tsx`
- `features/certificates/components/certification-tier-list.tsx`
- `features/courses/components/testimonial-card.tsx`
- `shared/components/faq-accordion.tsx`
- `shared/components/animated-counter.tsx`
- `shared/components/marketing-header.tsx`
- `src/app/(marketing)/page.tsx`

---

## Verification Plan

### After Each Priority Tier

```bash
cd frontend
npm run build   # Zero TypeScript errors
npm run dev     # Manual smoke test all routes
```

### P0 Smoke Test Checklist
- [ ] Login with all 3 demo accounts
- [ ] RBAC redirects unauthorized users
- [ ] Catalog displays 12 courses with filters
- [ ] Course detail page loads by slug
- [ ] Mock payment modal completes enrollment
- [ ] Dashboard shows enrolled courses
- [ ] Course player navigates modules/lessons
- [ ] Mark lesson complete updates progress
- [ ] Notes save and persist
- [ ] Quiz timer counts down
- [ ] Quiz submission calculates score
- [ ] Tab-switch warning fires
- [ ] Certificate gallery shows earned certs
- [ ] Certificate detail has QR code
- [ ] /verify/[id] resolves publicly
- [ ] Profile page shows student data

### Architecture Compliance
- [ ] No business components in `shared/`
- [ ] No business logic in `app/` (thin routes only)
- [ ] All features export through `index.ts` barrels
- [ ] No deep cross-feature imports
- [ ] Import direction: features → shared ✅, shared → features ❌
