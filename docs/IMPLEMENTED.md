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

## 7. Summary of Verified Targets

* **Frontend Build**: Passed (successful Next.js production build, all routes compiled).
* **Backend Build**: Passed (successful NestJS production build).
* **Prisma Schema Format**: Passed.
* **Prisma Client Generation**: Passed with new `AuditLog` model support.
* **Active Port**: Development server listening at [http://localhost:3000](http://localhost:3000).


