# Dezai V1 — Implementation Status & Architecture Walkthrough

This document lists everything that has been implemented in the **Dezai AI platform** during the production-grade scaffolding phase and describes how the architecture operates.

---

## 1. Directory Structure Scaffolding

We successfully migrated the project from a prototype layout to a modular, feature-sliced, production-grade folder structure for both the frontend (Next.js) and backend (NestJS).

```
DEZAI/
├── frontend/             # Next.js 15 Web Application
├── backend/              # NestJS-style API Server
├── database/             # ERDs, schemas, seeders, and SQL migrations
├── docs/                 # Documentation directory
└── scripts/              # Setup, maintenance, and deployment scripts
```

---

## 2. Frontend Restructuring (Next.js App Router)

The frontend is structured to strictly isolate the Next.js App Router (which serves as a thin routing layer) from feature-specific logic and shared UI primitives.

### Implemented Scaffolds
* **App Layer**: Scaffolded `src/app/providers/`, `src/app/layouts/`, and `src/app/guards/` to handle React Context providers, reusable layout containers, and Role-Based Access Control route guards.
* **Feature Modules**: Created empty subdirectories (`pages/`, `components/`, `hooks/`, `services/`, `store/`, `types/`, `validations/`, `utils/`) for the following domains:
  * `dashboard/` (student dashboard core logic)
  * `academy/` (partner university indexes)
  * `programs/` (track and course list components)
  * `learning/` (content blocks and notebooks)
  * `assessments/` (exam player and anti-cheat layer)
  * `credentials/` (cert generator and verification lookup)
  * `projects/` (sandbox workspaces)
  * `ai-mentor/` (context-aware chatbot client)
  * `institution/` (university stats dashboard)
  * `settings/` (profile configurations)
  * `notifications/` (dedicated notification widgets)
  * `uploads/` (dropzones and upload managers)
* **Shared Components**: Restructured UI components under domain-agnostic folders inside `shared/components/` (e.g. `button/`, `input/`, `textarea/`, `select/`, `modal/`, `drawer/`, `table/`, `pagination/`, `empty-state/`, `page-header/`, `breadcrumbs/`, `search-bar/`, `filters/`, `loader/`, `toast/`, `dialog/`).
* **Core Configuration Engine**: Created `src/core/` wrappers to configure API clients, theme variables, RBAC mappings, and session handlers.
* **Compilation Status**: Run **Next.js production build compiler** which compiled all 15 routes (`/login`, `/signup`, `/dashboard`, `/catalog`, `/profile`, `/certificates`, `/verify/[id]`, etc.) with **100% success** and zero errors.

---

## 3. Backend Restructuring (NestJS)

The backend is built around a NestJS modular dependency-injection framework. It has been successfully bootstrapped with standard packages, type definitions, and compilation engines.

### Operational Setup
* **Dependencies Configured**: Node modules installed include NestJS core framework packages (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`), RxJS, Reflect-Metadata, TypeScript compiling definitions, and Prisma client engines.
* **App Compilation Configured**: Created `tsconfig.json` (defining decorator metadata emission settings) and `nest-cli.json` (deleteOutDir option).
* **Module Registries**: Created and activated 13 distinct feature modules. The root `AppModule` class inside `backend/src/app.module.ts` imports the following modules:
  * `AuthModule`
  * `UsersModule`
  * `InstitutionsModule`
  * `AcademyModule`
  * `ProgramsModule`
  * `LearningModule`
  * `AssessmentsModule`
  * `CredentialsModule`
  * `ProjectsModule`
  * `AnalyticsModule`
  * `AiModule`
  * `UploadsModule`
  * `NotificationsModule`
* **Compilation Status**: Running `npm run build` succeeds cleanly, confirming the TS compile targets are fully set up.

---

## 4. Prisma Database Schema & Model Blueprint

We finalized and compiled the Prisma database schema inside [backend/prisma/schema.prisma](file:///f:/Dezai%20Prototype/backend/prisma/schema.prisma) mapping models with strict relations and types:

### Core Database Models
1. **User & Roles**:
   * Enforced roles via `UserRole` (`STUDENT`, `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`).
   * XP profile and Daily streak tracking attributes.
2. **Institution Registry**:
   * Maps partner universities (`Institution`), admins (`InstitutionAdmin`), and instructors (`FacultyMember`).
3. **ProgramTrack Curriculum Engine**:
   * Replaced simple layers with `ProgramTrack` (ROOTS or EDGE types), which groups curriculum modules, lessons, and assessments to support transition path calculations.
4. **Learning Progress**:
   * Maps student progresses (`Progress`), bookmarked slides (`Bookmark`), and notebooks (`Note`) with explicit foreign key relations back to the target `User` model.
5. **Decoupled Question Pool**:
   * `QuestionBank` stores questions (`QuestionBankQuestion`) and options (`QuestionOption`) independently of exams.
   * `Assessment` links to a module and references a bank, pulling a randomized `sampleSize` of questions during tests.
   * `AssessmentAttempt` logs scores, passing statuses, proctoring violations (`ViolationLog`), and specific answers (`AttemptAnswer`).
6. **Verifiable Credentials**:
   * `Credential` logs unique `verificationCode`, `verificationUrl`, `verificationStatus` (active, revoked, suspended), and approval/signature templates.
7. **Polymorphic Upload Logs**:
   * `Upload` stores URLs and size metrics with optional `entityType` and `entityId` parameters to link files back to programs or certificates.
8. **AI Sessions**:
   * `ChatSession` stores conversation logs and tracks the student's `activeProgramId`, `activeModuleId`, and `activeLessonId` to inject lesson-specific instructions into prompts.
9. **Notifications**:
   * `Notification` models manage system notices and program updates.

---

---

## 5. Phase 1: Authentication & RBAC System (V1)

We implemented a secure, provider-abstracted authentication flow utilizing NextAuth.js v5 (Auth.js) on the frontend, standard JWT cryptography on the backend, and a centralized RBAC enforcement model.

### Key Architectural Implementations
1. **NextAuth.js v5 Integration**:
   * Setup provider-agnostic OAuth flow. Currently configured with Google OAuth, with placeholders ready to add Microsoft or custom University SSO without touching business logic.
   * Leveraged JWT callback to inject user role and onboarding status into standard sessions.
2. **Centralized RBAC Engine**:
   * Created `permissions.ts` defining user roles (`STUDENT`, `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`), hierarchy checks, and role group presets.
   * Created `route-permissions.ts` containing the application's central path-to-role mappings.
3. **Route & Layout Guards**:
   * Modified `AuthGuard` to look up route permissions dynamically and handle access denials.
   * Added Next.js `middleware.ts` to gate access to all non-public routes and redirect un-onboarded users to onboarding.
4. **Onboarding Role Assignment Flow**:
   * Designed the `OnboardingPage` client view permitting role selection on first-time login.
   * Triggers a POST to `/api/auth/onboarding` on the NestJS backend to register the user record and link them to institutions, then refreshes the active NextAuth session.
5. **Backend Guarding & Security**:
   * Bootstrapped `PrismaService` and a global `DatabaseModule` on the backend to link to PostgreSQL.
   * Implemented `JwtAuthGuard` that extracts Bearer headers and decrypts JWTs using `jose` and the shared `AUTH_SECRET` (HS256).
   * Implemented `RolesGuard` and a custom `@Roles()` decorator to enforce role metadata validation on NestJS controllers.

---

## 6. Phase 2 Pre-Requisites & Foundation Setup

Before coding active components of Phase 2, we successfully completed the structural pre-requisite configurations:
1. **Renamed Course Routes to Program Routes**:
   * Renamed frontend routes from `/courses/...` to `/programs/...` at directory level.
   * Updated all page templates, links, loaders, and router redirections to align with `/programs/[slug]`.
2. **Centralized XP Service**:
   * Created `XpService` inside the NestJS `users` module to handle user XP allocation, Daily streak computations, and database transaction logs under the `XpTransaction` model.
3. **Polymorphic Upload Support**:
   * Setup `UploadsService` and `UploadsController` on the backend to accommodate polymorphic tag files (`entityType`, `entityId`) like `LessonResource` linking.
4. **Environment Template Alignment**:
   * Standardized `frontend/.env.example` and `backend/.env.example` templates to contain the exact key placeholders (`DATABASE_URL`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_API_URL`).
5. **Operational Audit Module**:
   * Created the global `AuditModule` and `AuditService` in the backend to record system interactions under the `AuditLog` table.
   * Wired audit hooks for `LOGIN` (via backend `POST /api/auth/login-audit` and frontend callback fetch), `ROLE_CHANGED` (during onboarding role assignment), and `PROGRAM_CREATED`/`PROGRAM_UPDATED` (inside programs service).

6. **Credentials-Based Authentication**:
   * Modified the database schema (`schema.prisma`) to add `passwordHash` and `onboarded` fields in the `User` model, supporting both password-based and social logins.
   * Created local password hashing and verification utilities (`password.utils.ts`) using Node's standard `crypto` library.
   * Exposed public `/api/auth/register`, `/api/auth/login`, and `/api/auth/session-sync` endpoints on the NestJS backend to sign up, verify credentials, and align user sessions.
   * Configured NextAuth's `CredentialsProvider` on the frontend and updated the session callback to dynamically synchronize social profiles and credentials.
   * Restored responsive, fully typed sign-in and registration forms on the `LoginPage` and `SignupPage`.

---

## 7. Phase 3: Curriculum & Program Management (Sprint 1)

Implemented full backend support for Curriculum and Program Management (assigned to Manan Panchal, Curriculum & Program Management Lead).

### Assigned Tasks
* **Program CRUD**: Creation (bootstraps foundational ROOTS and EDGE tracks), editing, deletion (cascading), and status tracking.
* **Track CRUD**: Creating and editing tracks.
* **Module CRUD**: Creation, editing, deletion, and transactional reordering of modules within a track.
* **Lesson CRUD**: Full CRUD support and ordering within modules.
* **Access Control**: Faculty ownership verification and institution check guards for university admins and faculty roles.

### How it was Completed
* **DTO Validation**: Created [programs.dto.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/programs/dto/programs.dto.ts) with `class-validator` attributes enforcing title lengths, mandatory fields, and formatting rules.
* **Route Controllers**: Bootstrapped [programs.controller.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/programs/controllers/programs.controller.ts) to define and route requests under `/api/programs` protected by `JwtAuthGuard` and `RolesGuard`.
* **Business Logic & Guards**: Integrated [programs.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/programs/services/programs.service.ts) using Prisma Client database models, transactional batch updates (`$transaction`) for module reordering, and security validation in `validateProgramOwnership`.
* **Audit Logging**: Integrated creation, update, and deletion audits via `AuditService.logAction`.
* **Wiring Modules**: Configured [programs.module.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/programs/programs.module.ts) to import `AuditModule` while preserving existing `EnrollmentService` and `EnrollmentController` exports.

---

## 8. Phase 4: Analytics Module (V1)

Implemented the Analytics Module backend and documentation (assigned to Krish Parmar, Analytics & Quality Lead).

### Features Delivered

* Faculty Analytics Dashboard
* Program Analytics Dashboard
* Student Metrics Reporting
* Role-Based Access Control (RBAC)
* Analytics API Documentation

### Analytics Endpoints

| Method | Endpoint                             |
| ------ | ------------------------------------ |
| GET    | /api/analytics/faculty               |
| GET    | /api/analytics/programs/:id          |
| GET    | /api/analytics/programs/:id/students |

### Key Capabilities

* Faculty-level student engagement metrics
* Program-level enrollment and completion statistics
* Per-student progress and XP reporting
* 30-day active learner tracking
* Secure access using JwtAuthGuard and RolesGuard

### Files Added / Modified

| Action   | File                                                              |
| -------- | ----------------------------------------------------------------- |
| CREATED  | docs/API/analytics.md                                             |
| CREATED | backend/src/modules/analytics/analytics.module.ts                 |
| CREATED  | backend/src/modules/analytics/controllers/analytics.controller.ts |
| CREATED  | backend/src/modules/analytics/services/analytics.service.ts       |

### Notes

* No database schema changes required.
* Analytics uses existing Prisma models (User, Enrollment, Program, FacultyMember, Institution, XpTransaction).
* Detailed feature documentation is available in API/analytics.md.

---

## 9. Phase 5: Student Location Selection & Faculty Onboarding (Sprint 2)

Implemented full backend support for Student Location Selection (Cascading Filters) and Faculty Onboarding, Profile, Dashboard, and Admin Verification.

### Features Delivered

* **Student Location Cascading Selection**: Added hierarchical location retrieval API (`GET /api/institutions/locations`) that returns unique `country` -> `state` -> `city` -> `name` (universities) groupings, allowing students to filter institutions dynamically.
* **Google Sign-In Sync**: Created `/api/auth/session-sync` on the backend to synchronize Google profile details (id, email, name) with local user records and generate/sign backend tokens.
* **Faculty Role Onboarding**: Implemented `POST /api/auth/onboarding` to allow newly signed-in users to choose the `FACULTY` role, link to an institution, department, and designation, setting status to `PENDING`.
* **Faculty Profile & Dashboard**: Created `/api/users/faculty/profile` and `/api/users/faculty/dashboard` to retrieve faculty metadata and statistics (total programs, students taught, pending quiz reviews).
* **Admin Verification Interface**: Exposed a protected `/api/institutions/faculty/:facultyMemberId/verify` endpoint (restricted to `DEZAI_ADMIN` and `UNIVERSITY_ADMIN` roles) to approve or reject faculty member verification status.
* **Automated Audit Logging**: Integrated logs for `LOGIN`, `ROLE_CHANGED` (on onboarding), and verification state updates via `AuditService`.

### Files Added / Modified

| Action | File |
|---|---|
| MODIFIED | [backend/prisma/schema.prisma](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/prisma/schema.prisma) |
| MODIFIED | [backend/src/main.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/main.ts) |
| MODIFIED | [backend/src/modules/auth/auth.module.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/auth/auth.module.ts) |
| MODIFIED | [backend/src/modules/auth/controllers/auth.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/auth/controllers/auth.controller.ts) |
| CREATED | [backend/src/modules/auth/dto/auth.dto.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/auth/dto/auth.dto.ts) |
| MODIFIED | [backend/src/modules/auth/services/auth.service.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/auth/services/auth.service.ts) |
| MODIFIED | [backend/src/modules/institutions/institutions.module.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/institutions/institutions.module.ts) |
| CREATED | [backend/src/modules/institutions/controllers/institutions.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/institutions/controllers/institutions.controller.ts) |
| CREATED | [backend/src/modules/institutions/dto/institution.dto.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/institutions/dto/institution.dto.ts) |
| CREATED | [backend/src/modules/institutions/services/institutions.service.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/institutions/services/institutions.service.ts) |
| MODIFIED | [backend/src/modules/users/users.module.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/users/users.module.ts) |
| CREATED | [backend/src/modules/users/controllers/users.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/users/controllers/users.controller.ts) |
| CREATED | [backend/src/modules/users/services/users.service.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/users/services/users.service.ts) |
| CREATED | [frontend/.env](file:///d:/Project/Dezai-ai/Dezai-Prototype/frontend/.env) |
| CREATED | [frontend/.env.example](file:///d:/Project/Dezai-ai/Dezai-Prototype/frontend/.env.example) |

---

## 10. Summary of Verified Targets

* **Frontend Build**: Passed (successful Next.js production build, all routes compiled).
* **Backend Build**: Passed (successful NestJS production build).
* **Prisma Schema Format**: Passed.
* **Prisma Client Generation**: Passed.
* **Active Port**: Development server listening at [http://localhost:3000](http://localhost:3000).


---

## 9. Sprint 3: Assessment Engine (Manan Panchal)

Implemented the complete Assessment Engine module as the backbone of Dezai's evaluation system. This covers Question Bank management, Question CRUD, Assessment Builder with the 100:15 dynamic selection architecture, and Faculty Analytics.

### Module Ownership
* **Scope:** `modules/assessments/*` — Question Banks, Questions, Assessments, Dynamic Selection, Analytics.
* **Schema:** All Prisma models (`QuestionBank`, `QuestionBankQuestion`, `QuestionOption`, `Assessment`, `AssessmentAttempt`, `AttemptAnswer`, `ViolationLog`) were pre-defined in the locked schema. No migrations required.

### Implemented Components

1. **DTOs** ([assessment.dto.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/dto/assessment.dto.ts)):
   * 7 DTO classes: `CreateQuestionBankDto`, `UpdateQuestionBankDto`, `CreateQuestionOptionDto`, `CreateQuestionDto`, `UpdateQuestionDto`, `CreateAssessmentDto`, `UpdateAssessmentDto`.
   * All follow `Action + Entity + Dto` naming convention with `class-validator` decorators.

2. **AssessmentService** ([assessment.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/assessment.service.ts)):
   * Question Bank CRUD with institution-scoped ownership validation (mirrors `validateProgramOwnership` pattern).
   * Question CRUD with deep-copy duplication (appends "(Copy)" suffix).
   * Assessment CRUD with **100-question gate** — `BadRequestException` thrown if the referenced `QuestionBank` has fewer than 100 questions.
   * Faculty Analytics aggregation computing `total`, `passRate`, `averageScore`, `highestScore`, `lowestScore` from completed `AssessmentAttempt` rows.
   * All write operations log via `AuditService.logAction()` using `ASSESSMENT_PUBLISHED` action.

3. **QuestionSelectionService** ([question-selection.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/question-selection.service.ts)):
   * Dedicated injectable service implementing the **100:15 Architecture** from the blueprint.
   * Fisher-Yates (Knuth) shuffle on the full question pool → slices `sampleSize` questions → independently shuffles options per question.
   * Each call produces a unique permutation — no two students see the same order.
   * `isCorrect` field intentionally stripped from response to prevent answer leakage.

4. **AssessmentController** ([assessment.controller.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/controllers/assessment.controller.ts)):
   * 16 route handlers under `@Controller('assessments')`.
   * Protected by `JwtAuthGuard` + `RolesGuard` with `@Roles()` decorator.
   * All responses follow `{ success: true, data }` shape.

5. **Module Wiring** ([assessments.module.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/assessments.module.ts)):
   * Imports `AuditModule`, registers `AssessmentController`, provides and exports `AssessmentService` and `QuestionSelectionService`.
   * `AssessmentsModule` was already registered in `AppModule` — no changes to `app.module.ts` required.

6. **API Documentation** ([assessments.md](file:///d:/git/dezai/Dezai-Prototype/docs/API/assessments.md)):
   * Full API contract for all 16 endpoints: method, route, request body, response shape, auth requirements, and error cases.

### Endpoint Summary (16 Total)

| # | Method | Route | Auth |
|---|---|---|---|
| 1 | GET | `/api/assessments/question-banks` | JWT |
| 2 | GET | `/api/assessments/question-banks/:id` | JWT |
| 3 | POST | `/api/assessments/question-banks` | JWT + FACULTY/UNIV_ADMIN/DEZAI_ADMIN |
| 4 | PUT | `/api/assessments/question-banks/:id` | JWT + ownership |
| 5 | DELETE | `/api/assessments/question-banks/:id` | JWT + ownership |
| 6 | POST | `/api/assessments/question-banks/:bankId/questions` | JWT + ownership |
| 7 | PUT | `/api/assessments/questions/:questionId` | JWT + FACULTY/UNIV_ADMIN/DEZAI_ADMIN |
| 8 | DELETE | `/api/assessments/questions/:questionId` | JWT + FACULTY/UNIV_ADMIN/DEZAI_ADMIN |
| 9 | POST | `/api/assessments/questions/:questionId/duplicate` | JWT + FACULTY/UNIV_ADMIN/DEZAI_ADMIN |
| 10 | GET | `/api/assessments/modules/:moduleId` | JWT |
| 11 | GET | `/api/assessments/:id` | JWT |
| 12 | POST | `/api/assessments` | JWT + FACULTY/UNIV_ADMIN/DEZAI_ADMIN |
| 13 | PUT | `/api/assessments/:id` | JWT + FACULTY/UNIV_ADMIN/DEZAI_ADMIN |
| 14 | DELETE | `/api/assessments/:id` | JWT + FACULTY/UNIV_ADMIN/DEZAI_ADMIN |
| 16 | GET | `/api/assessments/:id/analytics` | JWT + FACULTY/UNIV_ADMIN/DEZAI_ADMIN |

---

## 10. Sprint 4: Assessment Lifecycle & Results (Manan Panchal)

Implemented the complete Assessment Attempt lifecycle, proctoring integration, detailed student results & reviews, and the recommendation engine.

### Implemented Components

1. **DTOs** ([attempt.dto.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/dto/attempt.dto.ts)):
   * `StartAttemptDto` for initiating student attempts.
   * `AutoSaveAnswersDto` for autosaving answers dynamically.

2. **AttemptService** ([attempt.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/attempt.service.ts)):
   * `startAttempt` — Initiates a proctoring session, checks attempt limits, creates/restores a `AssessmentAttempt` row, shuffles questions.
   * `resumeAttempt` — Restores questions deterministically, computes remaining time, returns existing answers.
   * `autoSaveAnswers` — Programmatically upserts answers to avoid duplicate rows without unique database constraints.
   * `submitAttempt` — Grades answers, applies proctoring score deductions, updates exam session to `SUBMITTED`, logs audits, and awards XP on first pass.
   * `getAttemptResult` — Returns score and breakdown of questions showing student selected answers, correct answers, and category-derived explanations.
   * `getAttemptHistory` — Returns history of all completed attempts for a specific assessment.

3. **RecommendationService** ([recommendation.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/recommendation.service.ts)):
   * `getNextModule` — Returns the next uncompleted module in order and its first incomplete lesson.
   * `getContinueLearning` — Returns the most recently active module/program continue learning card payload.
   * `getRecommendedAssessments` — Recommends ready-to-take assessments for completed modules.

4. **AttemptController** ([attempt.controller.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/controllers/attempt.controller.ts)):
   * Exposes REST endpoints for the attempt lifecycle. Protected by `JwtAuthGuard` + `RolesGuard` with `@Roles(STUDENT)`.
   * Enforces top-to-bottom static route priority (`attempts/history/:assessmentId` registered before `:id` parameters) to prevent resolution conflicts.

5. **Frontend UI Integration** (under [src/features/assessments/](file:///d:/git/dezai/Dezai-Prototype/frontend/src/features/assessments/)):
   * [AssessmentPlayer.tsx](file:///d:/git/dezai/Dezai-Prototype/frontend/src/features/assessments/pages/AssessmentPlayer.tsx) — Instructions, navigator, countdown timer, auto-save status, and warning/lockout blocking dialogs.
   * [AssessmentResult.tsx](file:///d:/git/dezai/Dezai-Prototype/frontend/src/features/assessments/pages/AssessmentResult.tsx) — Displays passed/failed banners, scores, and integrated next-step recommendations.
   * [AssessmentReview.tsx](file:///d:/git/dezai/Dezai-Prototype/frontend/src/features/assessments/pages/AssessmentReview.tsx) — Correct/incorrect reviews with explanation texts.
   * [useAttempt.ts](file:///d:/git/dezai/Dezai-Prototype/frontend/src/features/assessments/hooks/useAttempt.ts) — State and logic hook.
   * [assessment-attempt.service.ts](file:///d:/git/dezai/Dezai-Prototype/frontend/src/features/assessments/services/assessment-attempt.service.ts) — Fetch API wrapper.
   * Route configurations wired in `src/app/(student)/programs/[slug]/assessment/`.

### Endpoint Summary

| # | Method | Route | Auth | Description |
|---|---|---|---|---|
| 1 | POST | `/api/assessments/attempts/start` | JWT + STUDENT | Start new attempt |
| 2 | GET | `/api/assessments/attempts/history/:assessmentId` | JWT + STUDENT | Fetch student's prior attempts |
| 3 | GET | `/api/assessments/attempts/:id/resume` | JWT + STUDENT | Resume unfinished attempt |
| 4 | POST | `/api/assessments/attempts/:id/auto-save` | JWT + STUDENT | Autosave in-progress answers |
| 5 | POST | `/api/assessments/attempts/:id/submit` | JWT + STUDENT | Grade and finalize attempt |
| 6 | GET | `/api/assessments/attempts/:id/result` | JWT + STUDENT | Get graded breakdown |
| 7 | GET | `/api/assessments/:id/results` | JWT + FACULTY/ADMIN | List student scores (Faculty) |
| 8 | GET | `/api/assessments/recommendations/next-module/:programId` | JWT + STUDENT | Get recommended next module |
| 9 | GET | `/api/assessments/recommendations/continue-learning` | JWT + STUDENT | Get continue learning widget |
| 10 | GET | `/api/assessments/recommendations/ready-assessments` | JWT + STUDENT | Get ready assessments list |

---

## 11. Sprint 4: Faculty Experience & Dashboard 2.0 (Nil)

Implemented the complete Faculty Experience, Dashboard 2.0, Notification Center, Profile Settings, and Diagnostic Analytics.

### Key Deliverables

1. **Faculty Dashboard 2.0 Interface** (`FacultyDashboard.tsx`):
   - Interactive multi-tab layout (Console Overview, Cohort Analytics, Instructor Profile).
   - High-fidelity metrics cards showing Programs count, Enrolled Students, Pending Reviews, and Completion Rate.
   - Quick Action triggers to Publish Programs and Assessments in modals.
   - Recent Student Activity Feed tracking enrollments, completions, and attempts chronologically.

2. **Faculty Analytics Widgets** (leaderboard & diagnostic cards):
   - **Top Students Leaderboard**: Lists the top 5 students in programs taught by the faculty based on XP.
   - **Weak Students Focus List**: Identifies students with progress below 20% who need attention.
   - **Difficult Modules Widget**: Flags modules where assessment pass rates are low and lists average scores and attempt volumes.

3. **Notification Center**:
   - Backend module `notifications` fully wired with `NotificationsService` and `NotificationsController` exposing endpoints to fetch user alerts, mark as read, and mark all as read.
   - Slide-over notification drawer on the frontend displaying unread alerts and triggering marking actions.

4. **Faculty Profile System**:
   - Exposed `PATCH /api/users/faculty/profile` endpoint on the NestJS backend to update faculty member fields atomically.
   - Interactive settings form on the frontend to update instructor name, department, designation, and view affiliated institution details.

### Files Added / Modified

| Action | File |
|---|---|
| MODIFIED | [backend/src/modules/users/controllers/users.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/users/controllers/users.controller.ts) |
| MODIFIED | [backend/src/modules/users/services/users.service.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/users/services/users.service.ts) |
| CREATED | [backend/src/modules/users/dto/users.dto.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/users/dto/users.dto.ts) |
| MODIFIED | [backend/src/modules/analytics/controllers/analytics.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/analytics/controllers/analytics.controller.ts) |
| MODIFIED | [backend/src/modules/analytics/services/analytics.service.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/analytics/services/analytics.service.ts) |
| MODIFIED | [backend/src/modules/notifications/notifications.module.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/notifications/notifications.module.ts) |
| CREATED | [backend/src/modules/notifications/controllers/notifications.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/notifications/controllers/notifications.controller.ts) |
| CREATED | [backend/src/modules/notifications/services/notifications.service.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/notifications/services/notifications.service.ts) |
| MODIFIED | [frontend/src/features/dashboard/components/FacultyDashboard.tsx](file:///d:/Project/Dezai-ai/Dezai-Prototype/frontend/src/features/dashboard/components/FacultyDashboard.tsx) |

---

## 11. Sprint 5: Assessment Module Completion (Manan Panchal)

Implemented the assessment module completion covering rich result retrieval, attempt tracking with limits, centralised pass/fail evaluation, faculty analytics, and credential eligibility signalling.

### Module Ownership
* **Scope:** `modules/assessments/*` — Results, History, Attempt Status, Analytics, Credential Eligibility.
* **Schema:** No changes — all Prisma models were pre-defined in the locked schema.

### Implemented Components

1. **PassFailEvaluationService** ([pass-fail-evaluation.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/pass-fail-evaluation.service.ts)):
   * Pure computation service with zero database dependencies.
   * `evaluate()` — Full scoring: score, percentage, passed, status, missedQuestions.
   * `getStatus()` — Derives `NOT_STARTED | IN_PROGRESS | PASSED | FAILED`.
   * `calculatePercentage()` — Rounded to 2 decimal places.
   * `getMissedQuestions()` — Extracts incorrect answers sorted by category.

2. **Response DTOs** ([result.dto.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/dto/result.dto.ts)):
   * `GetAttemptResultResponseDto`, `AttemptHistoryResponseDto`, `MyHistoryResponseDto`, `AttemptStatusResponseDto`, `ResultAnalyticsResponseDto`, `MissedQuestionsAnalyticsResponseDto`.

3. **Enhanced AttemptService** ([attempt.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/attempt.service.ts)):
   * `startAttempt()` — Enforces `MAX_ATTEMPTS_DEFAULT = 3` and active attempt detection.
   * `submitAttempt()` — Delegates scoring to PassFailEvaluationService, fires audit log, checks credential eligibility.
   * `getAttemptResult()` — Rich result with percentage, timeTaken, faculty access.
   * `getAttemptHistory()` — Dual-role: students see own, faculty see all.
   * `getMyHistory()` — Cross-assessment history for student.
   * `getAttemptStatus()` — Remaining attempts, best score, active attempt.
   * `checkCredentialEligibility()` — Traverses Module → Track → Program, creates notification.

4. **Enhanced AssessmentService** ([assessment.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/assessment.service.ts)):
   * `validateAssessmentFacultyOwnership()` — Traverses Assessment → Module → Track → Program → Faculty.
   * `getResultAnalytics()` — Pass rate, score distribution, unique students.
   * `getMissedQuestionsAnalytics()` — Per-question wrong rates sorted DESC.

5. **ResultsController** ([results.controller.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/controllers/results.controller.ts)):
   * 4 route handlers for attempt-status, attempt history, result analytics, missed questions.
   * Multi-segment paths avoid collision with existing `:id` routes.

6. **Updated AttemptController** ([attempt.controller.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/controllers/attempt.controller.ts)):
   * Added `my-history` route before parameterised routes.
   * Enhanced `getAttemptResult` with dual-role support.

7. **Module Wiring** ([assessments.module.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/assessments.module.ts)):
   * Registered `ResultsController` and `PassFailEvaluationService`.

8. **API Documentation** ([assessment-results.md](file:///d:/git/dezai/Dezai-Prototype/docs/API/assessment-results.md)):
   * Full contract for all 6 new endpoints.

### Endpoint Summary (6 New)

| # | Method | Route | Auth | Description |
|---|---|---|---|---|
| 1 | GET | `/api/assessments/attempts/:attemptId/result` | JWT + STUDENT/FACULTY | Full attempt result with question breakdown |
| 2 | GET | `/api/assessments/:assessmentId/attempts/history` | JWT + STUDENT/FACULTY | Assessment-scoped attempt history |
| 3 | GET | `/api/assessments/attempts/my-history` | JWT + STUDENT | Cross-assessment student history |
| 4 | GET | `/api/assessments/:assessmentId/attempt-status` | JWT + STUDENT | Remaining attempts & status |
| 5 | GET | `/api/assessments/:assessmentId/result-analytics` | JWT + FACULTY | Pass rate, score distribution |
| 6 | GET | `/api/assessments/:assessmentId/missed-questions-analytics` | JWT + FACULTY | Per-question wrong rates |

## 11. Sprint 4: Leaderboards & Notifications (Leaderboards & Notifications Lead)

Implemented the backend modules, database schema migrations, and documentation for Leaderboards & Notifications.(by Krish Parmar)

### Features Delivered

1. **Notification Center:**
   - Active inbox retrieval (non-archived notifications).
   - Filtered queries for `unread` and `archived` states.
   - Dual-guard ownership verification (users can only access or manage their own notifications).
   - Individual notifications can be marked as read, unread, or archived.
   - Bulk "mark all read" action (exempts archived notifications).

2. **Ranked Leaderboards:**
   - **Student Leaderboard:** Scoped by range (weekly = 7 days XP, monthly = 30 days XP, all-time = running total on User).
   - **University Leaderboard:** Aggregated total XP of unique students per institution, active students (30-day window), and fastest completion speed.
   - **Program Leaderboard:** Scoped to individual programs showing total XP, active students, and fastest completion speed.
   - **Standard Competition Ranking:** Enforced tie-breaking logic (e.g. 1, 2, 2, 4).
   - **User Deduplication:** Resolved multiple program enrollment conflicts at the university level to prevent double-counting of XP and active students.

3. **Dashboard Widgets:**
   - **Student Widget:** Compact top-N widget showing leading students (all-time XP), highlighting the requesting student, and resolving their exact current rank in the database.
   - **Faculty Widget:** Compact top-N widget scoped to the faculty's most recently created program or a pinned program. Restricted to `FACULTY`, `UNIVERSITY_ADMIN`, and `DEZAI_ADMIN` roles.

### Endpoint Summary (10 Total)

| # | Method | Route | Auth | Roles | Description |
|---|---|---|---|---|---|
| 1 | GET | `/api/notifications` | JWT | All | Get notification inbox (supports ?filter=all\|unread\|archived) |
| 2 | PATCH | `/api/notifications/mark-all-read` | JWT | All | Mark all non-archived notifications as read |
| 3 | PATCH | `/api/notifications/:id/read` | JWT | All | Mark single notification as read |
| 4 | PATCH | `/api/notifications/:id/unread` | JWT | All | Mark single notification as unread |
| 5 | PATCH | `/api/notifications/:id/archive` | JWT | All | Archive single notification |
| 6 | GET | `/api/leaderboards/students` | JWT | All | Ranked student list (?range=weekly\|monthly\|all&limit=) |
| 7 | GET | `/api/leaderboards/universities` | JWT | All | Ranked institution list (?limit=) |
| 8 | GET | `/api/leaderboards/programs` | JWT | All | Ranked program list (?limit=) |
| 9 | GET | `/api/leaderboards/widgets/student` | JWT | All | Student dashboard widget |
| 10 | GET | `/api/leaderboards/widgets/faculty` | JWT | FACULTY, UNIV_ADMIN, DEZAI_ADMIN | Faculty dashboard widget |

### Files Added / Modified

| Action | File |
|---|---|
| MODIFIED | [backend/prisma/schema.prisma](file:///d:/Dezai-Prototype-main/backend/prisma/schema.prisma) |
| MODIFIED | [backend/src/app.module.ts](file:///d:/Dezai-Prototype-main/backend/src/app.module.ts) |
| MODIFIED | [backend/src/modules/notifications/notifications.module.ts](file:///d:/Dezai-Prototype-main/backend/src/modules/notifications/notifications.module.ts) |
| CREATED | [backend/src/modules/notifications/dto/notification.dto.ts](file:///d:/Dezai-Prototype-main/backend/src/modules/notifications/dto/notification.dto.ts) |
| CREATED | [backend/src/modules/notifications/services/notifications.service.ts](file:///d:/Dezai-Prototype-main/backend/src/modules/notifications/services/notifications.service.ts) |
| CREATED | [backend/src/modules/notifications/controllers/notifications.controller.ts](file:///d:/Dezai-Prototype-main/backend/src/modules/notifications/controllers/notifications.controller.ts) |
| CREATED | [backend/src/modules/leaderboards/leaderboards.module.ts](file:///d:/Dezai-Prototype-main/backend/src/modules/leaderboards/leaderboards.module.ts) |
| CREATED | [backend/src/modules/leaderboards/dto/leaderboard.dto.ts](file:///d:/Dezai-Prototype-main/backend/src/modules/leaderboards/dto/leaderboard.dto.ts) |
| CREATED | [backend/src/modules/leaderboards/services/leaderboards.service.ts](file:///d:/Dezai-Prototype-main/backend/src/modules/leaderboards/services/leaderboards.service.ts) |
| CREATED | [backend/src/modules/leaderboards/controllers/leaderboards.controller.ts](file:///d:/Dezai-Prototype-main/backend/src/modules/leaderboards/controllers/leaderboards.controller.ts) |
| CREATED | [docs/API/notifications.md](file:///d:/Dezai-Prototype-main/docs/API/notifications.md) |
| CREATED | [docs/API/leaderboards.md](file:///d:/Dezai-Prototype-main/docs/API/leaderboards.md) |

---

## 12. Sprint 5: Leaderboard Frontend Components (Krish Parmar)

**Sprint:** 5 | **Date:** 2026-06-22

### Overview

Sprint 5 extended the leaderboard backend (completed in Sprint 4) with two new student-facing frontend components that surface XP rankings and top performers directly on the student dashboard.

All 5 backend leaderboard API endpoints were already production-complete from Sprint 4. No backend, schema, or route changes were required in Sprint 5.

### Components Added

1. **`StudentRankingCard`** (`frontend/src/features/leaderboards/components/student-ranking-card.tsx`)
   - Displays the authenticated student's global rank (`#N`), total XP, and streak count.
   - Rank badge adapts color: gold (rank 1), silver (rank 2), bronze (rank 3), Top 10, or default.
   - Reads data from `useEnrollmentStore()` → `globalRank`, `xpEarned`, `streakCount` — all already populated by `fetchStats()` on dashboard mount via `GET /api/learning/stats`.
   - Conditionally rendered: only shown when `globalRank > 0` and data is loaded.

2. **`TopPerformerList`** (`frontend/src/features/leaderboards/components/top-performer-list.tsx`)
   - Shows the top 10 globally ranked students with a Monthly / All-Time tab switcher.
   - Calls the existing `GET /api/leaderboards/students?range=<monthly|all>&limit=10` endpoint.
   - Each row: rank badge (gold/silver/bronze/default), student name, institution, XP.
   - Highlights the current user's own row with a blue `You` badge.
   - Includes loading skeleton, empty state, and error/retry state.

### Integration

Both components were integrated into the right sidebar column (`xl:col-span-1`) of the existing `StudentDashboardPage` (`frontend/src/features/learning/pages/StudentDashboardPage.tsx`):

```
Right sidebar (xl:col-span-1):
  ↳ StudentRankingCard    ← NEW — above activity feed
  ↳ Activity Feed         ← unchanged
  ↳ TopPerformerList      ← NEW — below activity feed
```

### Data Sources (No New Endpoints)

| Component | Data Source | Endpoint |
|---|---|---|
| `StudentRankingCard` | `useEnrollmentStore()` (already loaded) | `GET /api/learning/stats` (existing) |
| `TopPerformerList` | Direct `apiClient.get()` call | `GET /api/leaderboards/students` (existing, Sprint 4) |

### Files Added / Modified

| Action | File |
|---|---|
| CREATED | [frontend/src/features/leaderboards/components/student-ranking-card.tsx](file:///d:/Dezai-Prototype-main/frontend/src/features/leaderboards/components/student-ranking-card.tsx) |
| CREATED | [frontend/src/features/leaderboards/components/top-performer-list.tsx](file:///d:/Dezai-Prototype-main/frontend/src/features/leaderboards/components/top-performer-list.tsx) |
| MODIFIED | [frontend/src/features/learning/pages/StudentDashboardPage.tsx](file:///d:/Dezai-Prototype-main/frontend/src/features/learning/pages/StudentDashboardPage.tsx) |
| MODIFIED | [docs/IMPLEMENTED.md](file:///d:/Dezai-Prototype-main/docs/IMPLEMENTED.md) |
| MODIFIED | [docs/CHANGELOG.md](file:///d:/Dezai-Prototype-main/docs/CHANGELOG.md) |

### Sprint 5 Completion Status

| Sprint 5 Task | Status |
|---|---|
| Global Leaderboards | ✅ Complete (Sprint 4 backend) |
| Institution Leaderboards | ✅ Complete (Sprint 4 backend) |
| Monthly Leaderboards | ✅ Complete (Sprint 4 backend — `?range=monthly`) |
| XP Ranking Logic & APIs | ✅ Complete (Sprint 4 backend) |
| Leaderboard Dashboard Widgets | ✅ Complete (Sprint 4 backend + Faculty UI) |
| Student Ranking Cards | ✅ Complete (Sprint 5 — `StudentRankingCard`) |
| Top Performer Components | ✅ Complete (Sprint 5 — `TopPerformerList`) |
| Faculty Monitoring Module | ✅ Complete (Sprint 5) |
| Faculty Insights & Intervention System | ✅ Complete (Sprint 5) |

---

## 13. Sprint 5: Faculty Monitoring, Insights & Interventions (Faculty Experience & Dashboard Lead)

**Sprint:** 5 | **Date:** 2026-06-23

### Overview

Sprint 5 added the **Faculty Monitoring Module** and the **Faculty Insights & Intervention System**, equipping faculty members with real-time tools to audit student learning paths, analyze cohort bottlenecks, automatically flag at-risk behaviors, and log outreach intervention notifications.

No database migrations or schema alterations were required. Sent student outreach communications are logged under the existing `Notification` model of type `REMINDER` using a distinct `[Intervention]` title prefix, and audit actions are registered under the `AuditLog` table.

### Features Delivered

1. **Faculty Program Listing & Stats Dashboard:**
   - Populates a simplified dropdown of all programs owned or taught by the faculty.
   - Computes progress bars reflecting average cohort completion per module within the selected program.
   - Shows active widgets for overall program statistics (enrolled students, progress metrics, at-risk/warning breakdowns).

2. **Cohort Student Monitoring List:**
   - Displays a clean data table containing student names, emails, enrollment dates, XP, last active timestamps, and progress indicators.
   - Provides status filtering triggers (e.g. at-risk, completed, active).

3. **Detailed Student Audit Panel (Slide-over):**
   - Renders a deep-dive drawer for auditing individual students.
   - Renders a hierarchical curriculum track checklist showing lesson-by-lesson completions.
   - Displays a comprehensive exam and quiz assessment attempt history showing scores, date submitted, and proctoring violations.
   - Features a chronological timeline log detailing specific proctoring violations (tab switching, copy-pasting, focus loss).

4. **Cohort Health Insights & At-Risk Flags:**
   - Automatically evaluates and flags at-risk students using three criteria:
     - **Inactive**: No login activity in the last 7 days.
     - **Low Progress**: Overall syllabus progress is below 25%.
     - **Repeated Failures**: Failed the same assessment 2 or more times.
   - Automatically updates cohort health counters (Healthy vs. Warning vs. Critical).

5. **Direct Student Intervention Outreach:**
   - Faculty members can click "Outreach" to open a modal drafting a custom message.
   - Sends a reminder notification to the student and appends it to the "Interventions Sent History" timeline logs on the dashboard.

### Endpoint Summary (6 New Endpoints)

| # | Method | Route | Auth | Roles | Description |
|---|---|---|---|---|---|
| 1 | GET | `/api/analytics/faculty/programs` | JWT | FACULTY, UNIV_ADMIN, DEZAI_ADMIN | List of programs taught by faculty |
| 2 | GET | `/api/analytics/programs/:id/modules/stats` | JWT | FACULTY, UNIV_ADMIN, DEZAI_ADMIN | Module completion rate metrics |
| 3 | GET | `/api/analytics/programs/:programId/students/:userId` | JWT | FACULTY, UNIV_ADMIN, DEZAI_ADMIN | Deep student syllabus/quiz audit data |
| 4 | GET | `/api/analytics/programs/:id/insights` | JWT | FACULTY, UNIV_ADMIN, DEZAI_ADMIN | Flagged at-risk students list and metrics |
| 5 | POST | `/api/analytics/programs/:id/interventions` | JWT | FACULTY, UNIV_ADMIN, DEZAI_ADMIN | Create outreach reminder notification & audit log |
| 6 | GET | `/api/analytics/programs/:id/interventions` | JWT | FACULTY, UNIV_ADMIN, DEZAI_ADMIN | Get sent intervention history log |

### Files Added / Modified

| Action | File |
|---|---|
| MODIFIED | [backend/src/modules/analytics/services/analytics.service.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/analytics/services/analytics.service.ts) |
| MODIFIED | [backend/src/modules/analytics/controllers/analytics.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/analytics/controllers/analytics.controller.ts) |
| MODIFIED | [frontend/src/features/dashboard/components/FacultyDashboard.tsx](file:///d:/Project/Dezai-ai/Dezai-Prototype/frontend/src/features/dashboard/components/FacultyDashboard.tsx) |
| MODIFIED | [docs/API/analytics.md](file:///d:/Project/Dezai-ai/Dezai-Prototype/docs/API/analytics.md) |

---

## 13. Sprint 7 — V1 Production Hardening & SSE Insights

### Features Implemented

1. **Real-time SSE Insights Streaming**:
   - Implemented a Server-Sent Events (SSE) route `GET /api/assessments/faculty-insights/stream` pushing real-time summaries and at-risk alerts.
   - Designed corresponding React client integration in the Faculty Dashboard with smooth state management (`connected`, `reconnecting`, `offline`).

2. **Access Isolation & Program Ownership Verification**:
   - Hardened all program-related endpoints in the `AnalyticsController` to restrict visibility strictly to the assigned instructor or university admin, throwing `403 Forbidden` on breach attempts.

3. **Data Access Audit Logging**:
   - Activated a global-class auditing interceptor `FacultyDataAccessInterceptor` across all primary faculty controllers. Logs detailed audit contexts of every allowed/denied operation.

4. **UX Loader Polish**:
   - Refactored the dashboard layouts so the sidebar remains fixed on page-load, while local content blocks animate smoothly using the modular `PageSkeleton` component.

### Endpoint Summary

| Method | Route | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/assessments/faculty-insights/stream` | JWT | FACULTY, UNIV_ADMIN, DEZAI_ADMIN | SSE real-time cohort at-risk alerts stream |

### Files Added / Modified

| Action | File |
|---|---|
| MODIFIED | [backend/src/modules/analytics/analytics.module.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/analytics/analytics.module.ts) |
| MODIFIED | [backend/src/modules/analytics/controllers/analytics.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/analytics/controllers/analytics.controller.ts) |
| MODIFIED | [backend/src/modules/assessments/controllers/assessment.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/assessments/controllers/assessment.controller.ts) |
| MODIFIED | [backend/src/modules/assessments/services/assessment.service.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/assessments/services/assessment.service.ts) |
| MODIFIED | [backend/src/modules/programs/controllers/programs.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/programs/controllers/programs.controller.ts) |
| MODIFIED | [backend/src/modules/users/services/xp.service.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/users/services/xp.service.ts) |
| MODIFIED | [frontend/src/features/dashboard/components/FacultyDashboard.tsx](file:///d:/Project/Dezai-ai/Dezai-Prototype/frontend/src/features/dashboard/components/FacultyDashboard.tsx) |
| NEW | [frontend/src/features/dashboard/hooks/useFacultyInsightsStream.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/frontend/src/features/dashboard/hooks/useFacultyInsightsStream.ts) |
| NEW | [backend/src/common/interceptors/faculty-data-access.interceptor.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/common/interceptors/faculty-data-access.interceptor.ts) |


