# Dezai AI — Architecture Contract

> **This document is the single source of truth for the codebase structure.**
> Every file, every import, every component must respect the rules defined here.
> Violations break the architecture and must be rejected in code review.

---

## Core Principle: Feature-Based Architecture

This project uses **FEATURE-BASED ARCHITECTURE**. Every domain concern is encapsulated within its own feature folder. There are no root-level business folders.

### What This Means

- ✅ Business logic lives inside `features/<name>/`
- ✅ Each feature owns its components, hooks, services, validation schemas, stores, types, and pages
- ✅ Features expose a public API through `index.ts` barrel files
- ✅ Cross-feature imports go through barrel files only
- ❌ **FORBIDDEN**: Root-level `src/components/`, `src/hooks/`, `src/services/`, `src/pages/` for business logic

---

## Frontend Structure

```
frontend/src/
│
├── app/                          # Next.js 16 App Router (THIN LAYER)
│   ├── (admin)/                  # Admin sub-routes (users, settings)
│   ├── (auth)/                   # Auth route group
│   ├── (marketing)/              # Public marketing pages
│   ├── (student)/                # Shared Authenticated Area
│   │   ├── dashboard/            # UNIFIED DASHBOARD (Role-Aware Switcher)
│   │   ├── courses/[slug]/
│   │   │   ├── learn/[lessonId]/
│   │   │   └── quiz/[quizId]/
│   │   ├── profile/
│   │   └── settings/
│   ├── (university)/             # University/Faculty sub-routes
│   ├── verify/[id]/              # Public certificate verification
│   ├── catalog/                  # Public course catalog
│   ├── proxy.ts                  # Edge Proxy (Auth & RBAC Routing)
│   ├── guards/                   # Route protection helpers
│   ├── layouts/                  # Shared layout shells
│   ├── providers/                # React Context Providers
│   └── globals.css               # Global CSS & Tailwind configuration
│
├── features/                     # BUSINESS LOGIC LIVES HERE
│   ├── auth/                     # Authentication & authorization
│   ├── users/                    # User profiles & account management
│   ├── dashboard/                # Main student dashboard
│   ├── academy/                  # Universities & academic institutions
│   ├── programs/                 # Degree programs & course syllabus
│   ├── learning/                 # Course player & progress tracking
│   ├── assessments/              # Quiz engine & assessments
│   ├── credentials/              # Certificate issuance & verification
│   ├── projects/                 # Sandbox and project submissions
│   ├── ai-mentor/                # AI study assistant chatbot interface
│   ├── institution/              # University admin dashboard views
│   ├── settings/                 # Settings panel (profile, billing, notifications)
│   │
│   # -- Existing Prototype Modules (to be merged incrementally) --
│   ├── courses/                  # Prototype courses module
│   ├── certificates/             # Prototype certificates module
│   ├── quizzes/                  # Prototype quizzes module
│   ├── universities/             # Prototype universities module
│   ├── analytics/                # Prototype analytics charts
│   ├── notifications/            # Prototype notification center
│   └── admin/                    # Prototype administrative dashboards
│
├── shared/                       # GENERIC reusable code ONLY
│   ├── components/               # Generic composed components
│   │   ├── button/               # Extracted button component wrappers
│   │   ├── input/                # Inputs and form selectors
│   │   ├── textarea/             # Multi-line input panels
│   │   ├── select/               # Dropdowns and selectors
│   │   ├── modal/                # Dialog wrappers
│   │   ├── drawer/               # Sheets & sliding drawers
│   │   ├── table/                # Reusable tables
│   │   ├── pagination/           # Pagination controls
│   │   ├── empty-state/          # Empty status indicators
│   │   ├── page-header/          # Dynamic page headers
│   │   ├── breadcrumbs/          # Location navigations
│   │   ├── search-bar/           # Search query input widgets
│   │   ├── filters/              # Filter chip containers
│   │   ├── loader/               # Loading indicators / skeletons
│   │   ├── toast/                # Status alert/toasts
│   │   └── dialog/               # Confirmation overlays
│   ├── ui/                       # Shadcn UI primitives (Button, Input, Card, etc.)
│   ├── hooks/                    # Generic hooks (useDebounce, useLocalStorage, etc.)
│   ├── utils/                    # Utility functions (cn.ts, formatDate, etc.)
│   ├── constants/                # Project constants & settings
│   ├── types/                    # Shared type definitions (global enums, API responses)
│   └── services/                 # Common services
│
├── core/                         # ENGINE CONFIGURATION
│   ├── api/                      # Axios/Fetch client config
│   ├── auth/                     # Core session handling
│   ├── permissions/              # Permission matrix definitions
│   ├── storage/                  # Storage accessor keys
│   ├── config/                   # Global env variables & flags
│   └── theme/                    # Color scales & styling tokens
│
├── assets/                       # Static design files (images, vectors, fonts)
├── styles/                       # CSS theme files
└── lib/                          # Third-party wrappers & configuration (mock data, stores)
```

---

## Feature Internal Structure

Every feature follows the same internal structure:

```
features/<feature-name>/
│
├── components/                   # React components owned by this feature
├── hooks/                        # Custom React hooks for this feature
├── services/                     # API calls, business logic services
├── store/                        # Custom Zustand stores
├── validations/                  # Zod validation schemas
├── constants/                    # Feature-specific constants & config
├── types/                        # TypeScript type definitions
├── pages/                        # Page-level components (imported by app/)
├── utils/                        # Feature-specific helpers
└── index.ts                      # Barrel file — PUBLIC API of this feature
```

---

## App Router Rules

### `app/` is a thin routing layer. It contains ONLY:

- `page.tsx` — imports and renders a feature page component
- `layout.tsx` — layout wrappers (auth guards, navigation shells)
- `loading.tsx` — loading states
- `error.tsx` — error boundaries
- `not-found.tsx` — 404 pages

### ❌ NO business logic in `app/`

- No inline components
- No API calls
- No state management
- No form handling
- No business constants

---

## Shared Folder Rules

`shared/` is **exclusively** for generic, domain-agnostic reusable code.

### The Test

> **"Can this component work in ANY project with ZERO domain knowledge?"**
>
> - `Button` → Yes → `shared/ui/` or `shared/components/`
> - `Modal` → Yes → `shared/components/`
> - `CourseCard` → No, it knows about courses → `features/programs/components/`
> - `QuizTimer` → No, it knows about quizzes → `features/assessments/components/`

---

## Import Rules

### 1. Feature → Shared: ✅ ALLOWED
```tsx
import { Button } from '@/shared/ui/button';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { cn } from '@/shared/utils/cn';
```

### 2. Feature → Feature (via barrel): ✅ ALLOWED (with caution)
```tsx
// Cross-feature import through public API ONLY
import { CourseCard } from '@/features/programs';
import type { Certificate } from '@/features/credentials';
```

### 3. Feature → Feature (deep import): ❌ FORBIDDEN
```tsx
// NEVER reach into another feature's internals
import { CourseCard } from '@/features/programs/components/course-card'; // ❌ BAD
```

### 4. Shared → Feature: ❌ FORBIDDEN
```tsx
// shared/ must NEVER import from features/
import { QuizTimer } from '@/features/assessments'; // ❌ FORBIDDEN in shared/
```

### Import Direction Summary
```
app/ ──────────►  features/
                     │
                     ▼
                  shared/  ◄──── lib/ ◄──── core/
```

---

## Backend Structure

```
backend/src/
│
├── modules/                      # BUSINESS LOGIC LIVES HERE
│   ├── auth/                     # Authentication & authorization module
│   │   ├── controllers/          # Endpoint controllers
│   │   ├── services/             # Logic handlers
│   │   ├── repositories/         # Prisma DB adapters
│   │   ├── dto/                  # Data Transfer Objects
│   │   ├── entities/             # DB schema mapping entities
│   │   ├── validators/           # Zod parameter validators
│   │   └── auth.module.ts        # Module config
│   ├── users/
│   ├── institutions/             # University partners
│   ├── academy/                  # Institutional courses metadata
│   ├── programs/                 # Curriculums & courses modules
│   ├── learning/                 # Lesson status and player logic
│   ├── assessments/              # Quizzes & grading models
│   ├── credentials/              # Verified credentials & cert issuance
│   ├── projects/                 # Sandbox repositories and capstones
│   ├── ai/                       # LLM-based proctoring and mentor interfaces
│   └── analytics/                # Revenue ledgers & admin stats
│
├── common/                       # CROSS-CUTTING CONCERNS
│   ├── decorators/               # Custom controllers decorators (e.g. UserAuth)
│   ├── guards/                   # Guards for routes & tokens
│   ├── interceptors/             # Response/timing wrappers
│   ├── filters/                  # System-wide exception filters
│   ├── middleware/               # Logs, request identifiers
│   ├── constants/                # Global config limits
│   └── utils/                    # Data formatters, parsers
│
├── config/                       # NestJS environment registers
├── database/                     # PostgreSQL database instances
├── jobs/                         # Queue handlers & tasks
└── main.ts                       # Entry point file
```

---

## Backend Module Interactivity

### Cross-Module Communication (Event-Driven vs Dependency Injection)

When an action in one domain (e.g., passing an assessment) must automatically trigger a side-effect in another domain (e.g., minting a credential), the project follows these guidelines:

1. **Direct Dependency Injection (Current Standard):**
   - For simple, immediate side-effects, the target module (e.g., `CredentialsModule`) should be imported into the acting module (e.g., `AssessmentsModule`).
   - The acting service (e.g., `AttemptService`) injects the target service (e.g., `CredentialGenerationService`) and triggers the logic securely.
   - Example: Automatic generation of Program/Assessment Credentials happens by directly injecting `CredentialGenerationService` into `EnrollmentService` and `AttemptService` respectively.

2. **Avoiding Circular Dependencies:**
   - If injecting the module creates a circular dependency, you MUST use `forwardRef()` or shift to an asynchronous Event-Emitter architecture (`@nestjs/event-emitter`).
   - Deep imports across module boundaries without exporting the module are strictly forbidden.

---

## Enforcement

1. **Code Review**: Every PR must be checked against the Feature Boundary Checklist.
2. **ESLint**: Configure boundaries to enforce import rules.
3. **CI**: Add lint rules checking for forbidden import directories.
