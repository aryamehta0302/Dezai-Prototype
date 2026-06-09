# Dezai AI — Architecture Contract

> **This document is the single source of truth for the codebase structure.**
> Every file, every import, every component must respect the rules defined here.
> Violations break the architecture and must be rejected in code review.

---

## Core Principle: Feature-Based Architecture

This project uses **FEATURE-BASED ARCHITECTURE**. Every domain concern is encapsulated within its own feature folder. There are no root-level business folders.

### What This Means

- ✅ Business logic lives inside `features/<name>/`
- ✅ Each feature owns its components, hooks, services, schemas, types, and pages
- ✅ Features expose a public API through `index.ts` barrel files
- ✅ Cross-feature imports go through barrel files only
- ❌ **FORBIDDEN**: Root-level `src/components/`, `src/hooks/`, `src/services/`, `src/pages/` for business logic

---

## Frontend Structure

```
frontend/src/
│
├── app/                          # Next.js 15 App Router (THIN LAYER)
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   └── signup/
│   ├── (marketing)/              # Public marketing pages
│   ├── (student)/                # Student-protected routes
│   │   ├── dashboard/
│   │   ├── courses/[slug]/
│   │   │   ├── learn/[lessonId]/
│   │   │   └── quiz/[quizId]/
│   │   ├── profile/
│   │   ├── certificates/
│   │   │   └── [id]/
│   │   └── settings/
│   │       ├── profile/
│   │       ├── notifications/
│   │       ├── billing/
│   │       └── security/
│   ├── (university)/             # University admin routes
│   │   └── university/
│   │       ├── dashboard/
│   │       ├── courses/
│   │       │   └── [id]/
│   │       ├── certificates/
│   │       └── instructors/
│   ├── (admin)/                  # Dezai admin routes
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── revenue/
│   │       ├── universities/
│   │       ├── partners/
│   │       ├── settings/
│   │       ├── transactions/
│   │       └── users/
│   ├── verify/[id]/              # Public certificate verification
│   ├── catalog/                  # Public course catalog
│   ├── about/
│   ├── institutions/
│   ├── help/
│   ├── terms/
│   ├── privacy/
│   └── api/                      # API route handlers
│       ├── auth/[...nextauth]/
│       ├── courses/
│       ├── enroll/
│       ├── payments/razorpay/
│       ├── quiz/
│       ├── certificates/
│       ├── verify/[certId]/
│       ├── me/
│       ├── enrollments/
│       ├── lessons/
│       ├── university/
│       ├── admin/
│       └── notifications/
│
├── features/                     # BUSINESS LOGIC LIVES HERE
│   ├── auth/                     # Authentication & authorization
│   ├── users/                    # User profiles & account management
│   ├── universities/             # Institutional dashboards & management
│   ├── courses/                  # Course catalog, details & enrollment
│   ├── learning/                 # Course player & progress tracking
│   ├── quizzes/                  # Quiz engine & assessments
│   ├── certificates/             # Certificate issuance & verification
│   ├── analytics/                # Charts, reports & data visualization
│   ├── notifications/            # Notification system
│   └── admin/                    # Dezai platform administration
│
├── shared/                       # GENERIC reusable code ONLY
│   ├── ui/                       # Shadcn UI primitives (Button, Input, Card, etc.)
│   ├── components/               # Generic composed components (Modal, DataTable, etc.)
│   ├── hooks/                    # Generic hooks (useDebounce, useLocalStorage, etc.)
│   ├── utils/                    # Utility functions (cn.ts, formatDate, etc.)
│   └── types/                    # Shared type definitions (global enums, API responses)
│
└── lib/                          # Third-party wrappers & configuration
                                  # (prisma.ts, auth-options.ts, razorpay.ts, etc.)
```

---

## Feature Internal Structure

Every feature follows the same internal structure:

```
features/<feature-name>/
│
├── components/                   # React components owned by this feature
│   ├── component-name.tsx
│   └── ...
│
├── hooks/                        # Custom React hooks for this feature
│   ├── useFeatureHook.ts
│   └── ...
│
├── services/                     # API calls, business logic services
│   ├── feature.service.ts
│   └── ...
│
├── schemas/                      # Zod validation schemas
│   ├── feature.schema.ts
│   └── ...
│
├── constants/                    # Feature-specific constants & config
│   ├── feature.constants.ts
│   └── ...
│
├── types/                        # TypeScript type definitions
│   ├── feature.types.ts
│   └── ...
│
├── pages/                        # Page-level components (imported by app/)
│   ├── FeaturePage.tsx
│   └── ...
│
└── index.ts                      # Barrel file — PUBLIC API of this feature
```

---

## Feature Ownership Map

Each feature is the **sole owner** of its domain. No other feature or shared folder may contain business logic for that domain.

### `features/auth/`
| Owns | Examples |
|------|----------|
| Login / signup UI | `LoginForm.tsx`, `SignupForm.tsx` |
| Auth hooks | `useAuth.ts`, `useSession.ts` |
| Auth services | `auth.service.ts` |
| Session management | JWT handling, logout |
| Role guards | `withRoleGuard.tsx` |
| Auth schemas | `login.schema.ts`, `signup.schema.ts` |

### `features/users/`
| Owns | Examples |
|------|----------|
| Student profile | `ProfileHeaderCard.tsx`, `ProfileStatBento.tsx` |
| Account settings | `AccountSettingsPanel.tsx` |
| Activity timeline | `ActivityTimeline.tsx` |
| Profile editing | `EditProfileButton.tsx` |
| Avatar management | `VerifiedBadge.tsx` |

### `features/universities/`
| Owns | Examples |
|------|----------|
| University dashboard | `UniversityDashboardPage.tsx` |
| Institutional stats | `InstitutionalStatusCard.tsx` |
| Course performance table | `CoursePerformanceTable.tsx` |
| Instructor directory | `InstructorListItem.tsx`, `ManageDirectoryButton.tsx` |
| University navigation | `NavigationDrawer.tsx`, `SidebarNavItem.tsx` |
| Certifications oversight | `CertificationsTable.tsx`, `TierFilterChips.tsx` |
| University search | `SearchInput.tsx` (university-specific) |

### `features/courses/`
| Owns | Examples |
|------|----------|
| Course catalog page | `CatalogPage.tsx` |
| Course detail page | `CourseDetailPage.tsx` |
| Course cards | `CourseCard.tsx`, `CategoryCard.tsx` |
| Course hero | `CourseHero.tsx` |
| Syllabus | `SyllabusAccordion.tsx`, `LessonRow.tsx` |
| Instructor card | `InstructorCard.tsx` |
| Enrollment CTA | `EnrollmentCTA.tsx`, `EnrollmentFAB.tsx` |
| Related courses | `RelatedCoursesCarousel.tsx` |
| University partner card | `UniversityPartnerCard.tsx` |
| Checkout / payment flow | `CheckoutModal.tsx` |

### `features/learning/`
| Owns | Examples |
|------|----------|
| Video player | `VideoPlayer.tsx` |
| Course module sidebar | `CourseModuleSidebar.tsx` |
| Lesson content | `LessonContent.tsx` |
| Personal notes | `PersonalNotesPanel.tsx` |
| Progress tracking | `CourseProgressPill.tsx`, `MarkCompleteButton.tsx` |
| Student dashboard | `StudentDashboardPage.tsx` |
| Assignments | `UpcomingAssignmentCard.tsx` |
| Mobile bottom nav | `MobileBottomNav.tsx` |
| Completion toast | `CompletionToast.tsx` |

### `features/quizzes/`
| Owns | Examples |
|------|----------|
| Quiz timer | `QuizTimer.tsx` |
| Question display | `QuestionCard.tsx`, `RadioOption.tsx` |
| Quiz navigation | `QuizNavigationBar.tsx`, `QuestionNavigator.tsx` |
| Question grid | `QuestionGridButton.tsx`, `QuestionLegend.tsx` |
| Proctoring feed | `ProctoringFeed.tsx` |
| Security toast | `SecurityToast.tsx` |
| Quiz focus header | `QuizFocusHeader.tsx` |
| Quiz results | `QuizResultsPage.tsx` |

### `features/certificates/`
| Owns | Examples |
|------|----------|
| Certificate gallery | `CertificateGalleryCard.tsx` |
| Certificate tier card | `CertificateTierCard.tsx` |
| Verification page | `VerifyPage.tsx` |
| PDF generation | `certificate.service.ts` |
| Certificate detail | `CertificateDetailPage.tsx` |

### `features/analytics/`
| Owns | Examples |
|------|----------|
| Bar charts | `BarChart.tsx` |
| Revenue charts | `RevenueChartCard.tsx` |
| Allocation breakdown | `AllocationBreakdown.tsx` |
| Financial summary | `FinancialSummaryCard.tsx` |
| Progress bars | `ProgressBar.tsx` |
| Sparkline trends | `SparklineTrend.tsx` |
| Date range filter | `DateRangeButton.tsx` |
| Export report | `ExportReportButton.tsx` |

### `features/notifications/`
| Owns | Examples |
|------|----------|
| Notification bell | `NotificationBell.tsx` |
| Notification dropdown | `NotificationDropdown.tsx` |
| Notification list | `NotificationList.tsx` |
| Notification preferences | `NotificationPrefsPage.tsx` |
| Mark-as-read | `useNotifications.ts` |

### `features/admin/`
| Owns | Examples |
|------|----------|
| Admin dashboard | `AdminDashboardPage.tsx` |
| Revenue analytics page | `RevenueAnalyticsPage.tsx` |
| Transaction ledger | `TransactionLedger.tsx`, `TransactionRow.tsx` |
| Admin navigation | `AdminTopNav.tsx`, `AdminPageHeader.tsx` |
| University registry | `UniversityRegistryPage.tsx` |
| User management | `UserManagementPage.tsx` |
| Ledger search/filter | `LedgerSearchFilter.tsx` |

---

## Landing / Marketing Components

Marketing and landing page components belong to the appropriate feature based on domain:

| Component | Feature |
|-----------|---------|
| `HeroSection` | `courses/` (discovery-facing) |
| `PartnerLogoStrip` | `universities/` |
| `HowItWorksStep` | `courses/` |
| `CertificationTierList` | `certificates/` |
| `TestimonialCard` | `courses/` |
| `FAQAccordion` | `shared/components/` (generic reusable) |
| `AnimatedCounter` | `shared/components/` (generic reusable) |
| `MarketingHeader` | `shared/components/` (layout shell) |
| `FinalCTASection` | `courses/` |

> If a marketing component is domain-specific (e.g., certification tiers), it belongs to that feature.
> If it's truly generic and used across domains (e.g., FAQ accordion), it goes in `shared/components/`.

---

## App Router Rules

### `app/` is a thin routing layer. It contains ONLY:

- `page.tsx` — imports and renders a feature page component
- `layout.tsx` — layout wrappers (auth guards, navigation shells)
- `loading.tsx` — loading states
- `error.tsx` — error boundaries
- `not-found.tsx` — 404 pages

### Example:

```tsx
// app/(student)/courses/[slug]/page.tsx

import { CourseDetailPage } from '@/features/courses/pages/CourseDetailPage';

export default function Page({ params }: { params: { slug: string } }) {
  return <CourseDetailPage slug={params.slug} />;
}
```

### ❌ NO business logic in `app/`

- No inline components
- No API calls
- No state management
- No form handling
- No business constants

---

## Shared Folder Rules

`shared/` is **exclusively** for generic, domain-agnostic reusable code.

### ✅ Allowed in `shared/`

| Folder | Contents |
|--------|----------|
| `shared/ui/` | Shadcn UI primitives: `Button`, `Input`, `Card`, `Dialog`, `Table`, `Select`, `Checkbox`, `Switch` |
| `shared/components/` | Generic composed: `Modal`, `DataGrid`, `Avatar`, `Toast`, `FAQAccordion`, `AnimatedCounter`, `LoadingSkeleton`, `EmptyState`, `TopAppBar`, `Footer`, `PageContainer`, `GlobalProgressBar` |
| `shared/hooks/` | Generic hooks: `useDebounce`, `useLocalStorage`, `useMediaQuery`, `useIntersectionObserver` |
| `shared/utils/` | Utilities: `cn.ts`, `formatDate.ts`, `formatCurrency.ts`, `slugify.ts` |
| `shared/types/` | Global types: `ApiResponse<T>`, `PaginatedResult<T>`, `UserRole` enum, `Tier` enum |

### ❌ NOT allowed in `shared/`

| Component | Correct Location |
|-----------|-----------------|
| `CourseCard` | `features/courses/components/` |
| `QuizTimer` | `features/quizzes/components/` |
| `CertificateCard` | `features/certificates/components/` |
| `EnrollmentForm` | `features/courses/components/` |
| `ProfileHeaderCard` | `features/users/components/` |
| `TransactionLedger` | `features/admin/components/` |
| `InstructorListItem` | `features/universities/components/` |
| `RevenueChartCard` | `features/admin/components/` |

### The Test

> **"Can this component work in ANY project with ZERO domain knowledge?"**
>
> - `Button` → Yes → `shared/ui/`
> - `Modal` → Yes → `shared/components/`
> - `CourseCard` → No, it knows about courses → `features/courses/components/`
> - `QuizTimer` → No, it knows about quizzes → `features/quizzes/components/`

---

## Import Rules

### 1. Feature → Shared: ✅ ALLOWED

```tsx
import { Button } from '@/shared/ui/button';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { cn } from '@/shared/utils/cn';
```

### 2. Feature → Lib: ✅ ALLOWED

```tsx
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth-options';
```

### 3. Feature → Feature (via barrel): ✅ ALLOWED (with caution)

```tsx
// Cross-feature import through public API ONLY
import { CourseCard } from '@/features/courses';
import type { Certificate } from '@/features/certificates';
```

### 4. Feature → Feature (deep import): ❌ FORBIDDEN

```tsx
// NEVER reach into another feature's internals
import { CourseCard } from '@/features/courses/components/course-card'; // ❌ BAD
```

### 5. Shared → Feature: ❌ FORBIDDEN

```tsx
// shared/ must NEVER import from features/
import { QuizTimer } from '@/features/quizzes'; // ❌ FORBIDDEN in shared/
```

### 6. App → Feature (pages): ✅ ALLOWED

```tsx
// app/ routes import feature page components
import { QuizPage } from '@/features/quizzes/pages/QuizPage';
```

### Import Direction Summary

```
app/ ──────────►  features/
                     │
                     ▼
                  shared/  ◄──── lib/
```

Arrows show allowed import directions. Imports NEVER flow upward.

---

## Backend Structure

```
backend/src/
│
├── modules/                      # BUSINESS LOGIC LIVES HERE
│   ├── auth/                     # Authentication & authorization
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── types/
│   ├── users/
│   ├── universities/
│   ├── courses/
│   ├── learning/
│   ├── quizzes/
│   ├── certificates/
│   ├── analytics/
│   ├── notifications/
│   └── admin/
│
└── shared/                       # Cross-cutting infrastructure
    ├── middleware/                # Auth middleware, rate limiting, error handler
    ├── utils/                    # Logger, response helpers, validators
    ├── types/                    # Global types, API response types
    ├── config/                   # Environment config, feature flags
    └── database/                 # Prisma client, connection manager
```

### Backend Module Internal Structure

Every backend module follows:

```
modules/<module-name>/
│
├── controllers/                  # Request handlers
│   └── feature.controller.ts
│
├── services/                     # Business logic
│   └── feature.service.ts
│
├── routes/                       # Route definitions
│   └── feature.routes.ts
│
├── schemas/                      # Zod validation schemas
│   └── feature.schema.ts
│
└── types/                        # TypeScript types
    └── feature.types.ts
```

### Backend Module Ownership

| Module | Owns |
|--------|------|
| `modules/auth/` | Login, signup, session, JWT, RBAC middleware |
| `modules/users/` | Profile CRUD, avatar, settings, activity log |
| `modules/universities/` | University CRUD, institutional analytics, instructor management |
| `modules/courses/` | Course CRUD, catalog search, enrollment, syllabus |
| `modules/learning/` | Lesson progress, notes, video integration, completion tracking |
| `modules/quizzes/` | Quiz CRUD, question banks, attempt tracking, scoring, proctoring events |
| `modules/certificates/` | Issuance logic, PDF generation, verification endpoint |
| `modules/analytics/` | Revenue aggregation, trend calculations, report generation |
| `modules/notifications/` | Notification creation, delivery, read status |
| `modules/admin/` | Platform-wide operations, user management, system health |

### Backend Import Rules

Same directional rules as frontend:

- ✅ `modules/` → `shared/`
- ✅ `modules/` → `modules/` (through service interfaces, not deep imports)
- ❌ `shared/` → `modules/` (NEVER)

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|-----------|---------|
| Components | kebab-case | `quiz-timer.tsx` |
| Hooks | camelCase with `use` prefix | `useQuiz.ts` |
| Services | kebab-case with `.service` | `quiz.service.ts` |
| Schemas | kebab-case with `.schema` | `quiz.schema.ts` |
| Types | kebab-case with `.types` | `quiz.types.ts` |
| Constants | kebab-case with `.constants` | `quiz.constants.ts` |
| Pages | PascalCase with `Page` suffix | `QuizPage.tsx` |

### Exports

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `export function QuizTimer()` |
| Hooks | camelCase | `export function useQuiz()` |
| Services | camelCase | `export const quizService` |
| Types | PascalCase | `export type Quiz` / `export interface QuizAttempt` |
| Constants | SCREAMING_SNAKE_CASE | `export const MAX_QUIZ_TIME` |

---

## Feature Boundary Checklist

Use this checklist when creating or moving files:

- [ ] **Does this file belong to a specific business domain?**
  - Yes → It goes in `features/<domain>/`
  - No → It might belong in `shared/`

- [ ] **Is this component generic enough for ANY project?**
  - Yes → `shared/ui/` or `shared/components/`
  - No → `features/<domain>/components/`

- [ ] **Am I importing from another feature's internals?**
  - Yes → ❌ STOP. Use the barrel file `@/features/<name>`
  - No → ✅ Proceed

- [ ] **Am I adding business logic to `app/`?**
  - Yes → ❌ STOP. Move it to the appropriate feature
  - No → ✅ Proceed

- [ ] **Am I adding a domain component to `shared/`?**
  - Yes → ❌ STOP. Move it to the owning feature
  - No → ✅ Proceed

---

## RBAC Route Protection

| Route Group | Required Role | Fallback |
|-------------|---------------|----------|
| `(auth)/*` | Unauthenticated only | Redirect to `/dashboard` |
| `(student)/*` | `STUDENT` or `DEZAI_ADMIN` | Redirect to `/login` |
| `(university)/*` | `UNIVERSITY_ADMIN` or `DEZAI_ADMIN` | Redirect to `/login` |
| `(admin)/*` | `DEZAI_ADMIN` only | Redirect to `/login` |
| `verify/*` | Public | — |
| `catalog` | Public | — |
| Marketing pages | Public | — |

---

## Decision Record

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture style | Feature-based | Scales with team, enforces ownership, prevents spaghetti |
| `app/` responsibility | Routing only | Keeps business logic testable and portable |
| `shared/` constraint | Generic only | Prevents feature leakage into shared space |
| Barrel files | Required per feature | Enforces public API surface, enables safe refactoring |
| Backend modules | Mirror frontend features | Consistent mental model across stack |

---

## Enforcement

1. **Code Review**: Every PR must be checked against the Feature Boundary Checklist
2. **ESLint**: Configure `eslint-plugin-import` boundaries to enforce import rules
3. **CI**: Add a lint step that checks for forbidden import patterns
4. **Documentation**: This file is the contract — update it when adding new features

### Recommended ESLint Import Boundaries

```
features/auth      → can import: shared/*, lib/*
features/users     → can import: shared/*, lib/*, features/auth
features/courses   → can import: shared/*, lib/*, features/auth, features/universities
features/learning  → can import: shared/*, lib/*, features/auth, features/courses
features/quizzes   → can import: shared/*, lib/*, features/auth, features/courses
features/certificates → can import: shared/*, lib/*, features/auth, features/courses, features/quizzes
features/analytics → can import: shared/*, lib/*
features/notifications → can import: shared/*, lib/*
features/universities → can import: shared/*, lib/*, features/auth, features/analytics
features/admin     → can import: shared/*, lib/*, features/auth, features/analytics, features/universities

shared/*           → can import: lib/* ONLY
app/*              → can import: features/*, shared/*, lib/*
```

---

> **Every future implementation must respect this architecture.**
> **If a file belongs to a feature, it MUST live inside that feature.**
> **No exceptions.**
