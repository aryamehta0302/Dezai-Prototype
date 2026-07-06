# Session Logs — Student Experience Stabilization

## Session: June 25, 2026 — Auth Fixes, DB Resilience, Performance + Seed Data Cleanup

### 🫸 Context
Ansh directed: Fix Auth.js ClientFetchError (Next.js 16 + NextAuth v5 incompatibility), DB connection drops from Neon auto-suspend, slow lesson completion/video/progress bar updates, and lingering seed data issues where question banks had fewer questions than assessments required.

### Auth.js ClientFetchError (Next.js 16)
- **Root cause**: `export const { GET, POST } = handlers;` on a catch-all dynamic route (`[...nextauth]/route.ts`) fails in Next.js 16 because the framework passes 2 args (request + params Promise) but NextAuth v5 handlers expect only 1.
- **Fix**: Changed to explicit `export async function GET(request) { return handlers.GET(request); }` wrappers.
- **AUTH_URL pattern**: `http://127.0.0.1:3000/api/auth` is correct — `parseUrl()` in next-auth client derives `basePath` from the path.

### Neon Auto-Suspend (P1001 Errors)
- **Root cause**: Neon free-tier DB kills TCP after ~5 min idle. Any Prisma query after sleep gets P1001.
- **Fix**: Added `connect_timeout=15` to `DATABASE_URL`, removed non-standard `connection_lifetime=300`. Created `PrismaService.retryOnWakeup()` that catches P1001 at query time and retries 2x with 3s delay. Wrapped `authenticateUser`, `getNote`, `upsertNote`.

### Lesson Completion Timing
- **Problem**: `onComplete?.()` was called after the API call, making video transitions feel slow.
- **Fix**: `onComplete?.()` fires first (immediate video transition), then `await markLessonComplete`, then toast only on success. Changed from `.then()` fire-and-forget to proper `await` + re-throw.

### Video & Progress Bar Performance
- **Video**: Reads `videoUrl` from `currentLesson` (pre-loaded course data) instead of `lessonDetail?.videoUrl`. Added `key={currentLessonId}` to force clean `<video>` remount on navigation. Content area shows skeleton during `lessonDetail` fetch.
- **Progress bar**: Uses `completedCount / totalLessons` from local Zustand store (instant) instead of server-derived `enrollment?.progress` (needs POST + GET round-trip).

### Question Set Mismatch Bug (Critical Fix)
- **Discovery**: During scoring investigation, user showed "Unanswered" on Q2–Q5 despite having answered all 5 questions in the frontend. Backend diagnostic confirmed all 5 `attemptAnswers` were saved. The disconnect was that `startAttempt` calls both `createSession` (→ `generateQuestionSet`, stores set B in `session.questionSet`) and `selectQuestions` (returns set A to frontend). Both independently shuffle and sample from the same bank — producing DIFFERENT question sets.
- **Root cause**: `attempt.service.ts:81-90` — `createSession` and `selectQuestions` had no coordination. They each call `fisherYatesShuffle` on the bank independently, so the frontend showed different questions than what the session stored.
- **Fix**: Removed the `selectQuestions` call from `startAttempt`. Now reads `session.questionSet` (the set already stored during `createSession`) and formats it directly for the frontend response. This guarantees the frontend always displays the exact same questions that the session uses for scoring/review.
- **Cleanup**: Removed unused `QuestionSelectionService` import and constructor injection from `AttemptService` (was previously used in `startAttempt` only). TypeScript compiles clean with zero errors.
- **Lesson learned**: The `resumeAttempt` method already read from `session.questionSet` correctly — the bug was only in `startAttempt` which independently called `selectQuestions`.

### Seed Data Fix
- **Problem**: Diagnostic revealed `qb-genai-leaders` had only 8 questions (leftover from Sprint 5 seed) and `qb-product-design` had only 1 question (partial seed run). The seed's `if (!existingQb)` skip left stale underpopulated banks untouched — 11 out of 120 assessments had `sampleSize > bank question count`, causing "Assessment Unavailable" errors.
- **Fix**: Replaced skip-if-exists with check-and-repopulate: banks with wrong question count get old questions deleted and fresh ones created from the pool. Added stale attempt/session cleanup first to avoid FK constraint violations (`attempt_answers` references `question_options`).
- **Result**: All 12 banks now have 12 questions each. All 120 assessments verified OK (0 insufficient).

### Files Changed
```
backend/prisma/seeders/seed.ts
backend/prisma/scripts/fix-assessment-config.ts
backend/.env
backend/src/database/prisma.service.ts
backend/src/modules/auth/services/auth.service.ts
backend/src/modules/assessments/services/attempt.service.ts
backend/src/modules/learning/services/learning.service.ts
frontend/src/app/api/auth/[...nextauth]/route.ts
frontend/src/features/learning/components/mark-complete-button.tsx
frontend/src/lib/stores/enrollment.store.ts
frontend/src/features/learning/pages/CoursePlayerPage.tsx
```

### Verification
- Seed runs successfully: all 12 banks at 12 questions, 120 assessments with sufficient questions
- Diagnostic confirms 0 assessments with insufficient questions

## Session: June 24, 2026 — Assessment Settings, Seed Overhaul & Dashboard Progressive Loading

### 🫸 Context
Ansh directed: Make assessment settings per-assessment (not hardcoded), seed all modules with assessments, remove proctoring overlay (these are online course quizzes, not exams), make dashboard sections load independently.

### Backend
- **Prisma Schema** — Added `maxAttempts Int @default(8)`, `timeLimitEnabled Boolean @default(true)`, `allowResume Boolean @default(true)` to `Assessment` model. Pushed via `db push`.
- **DTOs** — `CreateAssessmentDto` / `UpdateAssessmentDto` accept the 3 new fields with validation.
- **Attempt Service** — `startAttempt` reads `assessment.maxAttempts` and `assessment.allowResume` instead of hardcoded `MAX_ATTEMPTS_DEFAULT=8`. `resumeAttempt` returns `maxAttempts`, `timeLimitEnabled`, `allowResume` in response. Added `ForbiddenException` when `allowResume=false` and resume attempted.
- **Removed Redundant Queries** — `submitAttempt`, `getAttemptResult`, `resumeAttempt` now build question list from `session.questionSet` instead of re-querying `selectQuestions` (3 redundant DB queries eliminated).
- **Seed Overhaul** — Replaced single question bank (course-1 only) with 12 banks (1 per program), each seeded from 3 themed pools (AI: 12 Qs, Business: 12 Qs, Design: 12 Qs). Created assessments for ALL 120 modules with 5 config tiers based on module order:
  - Order 1-2: strict (pass=80, attempts=3, timed, no resume)
  - Order 3-4: moderate (pass=70, attempts=5, timed, resume)
  - Order 5-6: relaxed (pass=60, attempts=8, untimed, resume)
  - Order 7-8: challenging (pass=85, attempts=2, timed 20min, no resume)
  - Order 9-10: practice (pass=50, attempts=10, untimed, resume)
- **Milestones Fix** — `NOT: { completedAt: null }` is invalid in Prisma 6. Removed NOT filter, filter nulls in JS via `.filter((d): d is Date => d !== null)`.

### Frontend
- **Proctoring Overlay Removed** — Deleted full-screen overlay ("Assessment In Progress") + sticky banner ("Exam in progress") + active session polling from `(student)/layout.tsx`. TopAppBar now shows consistently.
- **Attempt Types** — Added `maxAttempts`, `timeLimitEnabled`, `allowResume` optional fields to `Attempt` interface.
- **Pre-Take Screen** — Shows resume banner when `attempt.answers` has entries (remaining time + answer count). Button reads "Resume Assessment" vs "Acknowledge & Begin Assessment". Time limit row hidden when `timeLimitEnabled=false`.
- **Progressive Dashboard** — Removed universal `showSkeleton` variable. Each section uses its own loading state:
  - Greeting: renders instantly (uses `user` from auth store)
  - Subtitle, Continue Learning, Enrolled Courses, Stats: skeleton until both enrollment + program stores fetch
  - Milestones, Recommendations, Insights, Timeline: skeleton on their own loading state only
  - Achievements: skeleton on `achievementsLoading` (not `achievements.length === 0`)
  - Learning Analytics cards: each independently handles loading/empty/content
- **Empty State Fix** — "No courses in progress" / "No enrollments yet" now only appear after BOTH stores confirm no data (was flashing due to programs loading after enrollments).
- **CORS** — Backend `main.ts` allows both `localhost:3000` and `127.0.0.1:3000`.

### Files Changed (24)
```
backend/prisma/schema.prisma
backend/prisma/seeders/seed.ts
backend/src/main.ts
backend/src/modules/assessments/dto/assessment.dto.ts
backend/src/modules/assessments/services/attempt.service.ts
backend/src/modules/assessments/services/assessment.service.ts
backend/src/modules/learning/services/learning-milestone.service.ts
frontend/src/app/(student)/layout.tsx
frontend/src/features/assessments/hooks/useAttempt.ts
frontend/src/features/assessments/pages/AssessmentPlayer.tsx
frontend/src/features/assessments/types/assessment.types.ts
frontend/src/features/dashboard/components/FacultyDashboard.tsx
frontend/src/features/learning/pages/StudentDashboardPage.tsx
frontend/src/features/results/pages/AssessmentResult.tsx
```

### Verification
- `npx nest build` — zero errors
- `npx next build` — zero errors
- Seed creates 12 banks × 12 Qs = 144 questions, 120 assessments with varied settings

## Session: June 22, 2026 — Sprint 5 Full Audit & Fix

### 🔍 Audit Scope
- **Assessment Module** (Manan) — navigation links, types alignment, timer, error handling
- **Achievement System** (Ansh) — assessment trigger on attempt submit
- **Leaderboards** (Krish) — missing route page
- **AI Mentor** (Varun) — Zustand store mutations, session switching, conversation history
- **Credential System** (Tirth) — duplicate backend, Prisma schema, types, guards
- **Student Dashboard** (K.S.) — globalRank nullable
- **Platform Quality** (Hitarth) — RBAC coverage, test infra, audit logging

### 🛠️ Backend Fixes
- **Prisma Schema**: Added `description` and `defaultTier` to `CredentialTemplate` model
- **Credential Cleanup**: Removed duplicate `credential.controller.ts`/`credential.service.ts`/`credential.dto.ts` — frontend only used the unguarded `credentials.controller.ts` at `/api/credentials/`
- **JWT Guards**: Added `JwtAuthGuard` + `RolesGuard` to all credential mutation endpoints (issue, status change, list all)
- **Audit Logging**: Injected `AuditService` into `CredentialsService` — logs credential issuance and status changes
- **RBAC Hole**: Enrollment controller was wide open — added `@Roles(UserRole.STUDENT)` to both enroll and list endpoints
- **AI Conversation History**: `buildSystemPrompt()` now injects last 20 messages from DB instead of relying on external context
- **Timer Source**: Question-selection service returns `timeLimit` from backend instead of hardcoded 1800s
- **Program Queries**: `programs.service.ts` now includes `assessments` relation so frontend can render assessment links per module
- **Duplicate DTO Enum**: Removed `TemplateDto.ts` (had its own `CredentialType` enum); all code now uses Prisma's enum

### 🎨 Frontend Polish
- **Session Polling**: Disabled excessive `/api/auth/session` calls — `refetchInterval={0}`, `refetchOnWindowFocus={false}`
- **Types Alignment**: `AssessmentAttempt` frontend types matched to backend DTOs — added `timeLimit`, `percentage`, `passingScore`, `totalQuestions`; renamed `id` → `attemptId` in history items
- **Credential Types**: Fixed mapping — `credential.credentialType` → `credential.credentialTemplate?.type`, `templateId` → `credentialTemplateId` to match Prisma
- **CredentialCard**: Fixed `credential.template` → `credential.credentialTemplate` references
- **VerificationLookup**: Same rename fix
- **StudentDashboard**: `globalRank` type changed to `number | null`, displays `#-` when unset, rank card only renders when rank > 0
- **Student Layout**: Now handles both `/assessment/` and `/quiz/` paths for active assessment banner
- **Certificates Route**: Repointed `/certificates/` from mock-data `CertificateListPage` to real `StudentCredentialCenter` with `CredentialProvider` wrapper
- **Credential UI**: Stripped flashy gradient hero — replaced with simple title + search + grid layout
- **Response Unwrapping**: Frontend service handles `{ success, credential/credentials }` envelope from backend
- **PremiumButton**: Created shadcn-style premium CTA button component in `shared/ui/`

### 🧹 Removed Files
- `backend/.../credentials/controllers/credential.controller.ts`
- `backend/.../credentials/services/credential.service.ts`
- `backend/.../credentials/dto/credential.dto.ts`
- `backend/.../credentials/dto/TemplateDto.ts`

### ✅ Verification
- `npx tsc --noEmit` — **zero errors** on both frontend and backend
- All assessment/achievement/leaderboard/ai-mentor/credential modules audited and compiling
- RBAC enforced on credential + enrollment endpoints

### 🛠️ Backend Hardening
- **Schema Sync**: Resolved `P2021` and `P2022` errors by pushing updated `ExamSession` and `FacultyMember` schemas to the Neon database.
- **Progress Synchronization**: Developed and ran `scripts/sync-progress.ts` to recalculate stale enrollment progress percentages across all users.
- **Leaderboard API**: Implemented real global ranking logic in `LearningService.getStudentStats` by counting XP distribution among students.
- **Integrity Fix**: Updated `EnrollmentService.getStudentEnrollments` to filter `completedLessonIds` on a per-program basis, preventing cross-course lesson count leakage.

### 🎨 Frontend Polishing (Sprint 4)
- **Dashboard Skeletons**: Integrated animated pulse skeletons for every major dashboard section (Stats, Courses, Achievements, Activity Feed).
- **Asset Integration**: Generated and deployed premium AI-themed course thumbnails; updated the `getThumbnailUrl` utility for platform-wide visual consistency.
- **Core Stores**: Extended `EnrollmentStore` to track `globalRank`, `streakCount`, and `hoursLearned` from the backend stats response.
- **Service Logic**: 
    - Forced real-time frontend calculation of progress percentages to ensure 100% accuracy with lesson counts.
    - Updated `activityService` to resolve real program titles instead of using raw IDs in descriptions.
    - Standardized navigation slugs using `slugify(title)` to fix broken Deep Learning course links.

### 🕹️ Learning Experience
- **Smart Navigation**: Enhanced `CoursePlayerPage` to automatically skip already-completed lessons when using the "Next" button.
- **Visual Completion**: Added green checkmark indicators to the sidebar and a "Completed" badge to finished course cards.
- **Achievements**: Fixed logic for "Consistency is Key" and "Unstoppable" achievements by piping real streak data from the store hooks.

### ✅ Verification
- Checked end-to-end flow: Enrollment -> Lesson Completion -> Activity Log Update -> Achievement Progress Update.
- Verified that "Continue Learning" cards now lead to the actual next uncompleted lesson.
- Confirmed that the "Rank" indicator accurately reflects XP position (e.g., #1 or #2).

## Session: June 22, 2026 — Achievement System & Platform Gaps

### 🛠️ Backend
- **Daily Streak XP**: `updateStreak()` now awards 10 XP per new day of activity via `XpService.awardXp(DAILY_STREAK)` and triggers STREAK achievement check
- **ENGAGEMENT Achievements**: Added `notes_created` and `bookmarks_added` criteria types to `RulesEngineService`; seeded 4 ENGAGEMENT achievements (note-taker, prolific-note-taker, bookmarker, curator)
- **Award Triggers**: `toggleBookmark()` and `upsertNote()` now call `checkAndAward(ENGAGEMENT)` on create
- **Level System**: Added `XpService.computeLevel(xp)` returning `{ level, currentLevelXp, nextLevelXp, progress, totalXp }`; included in `getUserXpDetails()` response
- **RBAC Fix**: Enrollment controller locked down — now requires `@Roles(UserRole.STUDENT)` (was wide open to any authenticated user)
- **Lesson Complete**: `markLessonComplete()` now updates state optimistically and fires API in background — no more blocking spinner

### 🎨 Frontend
- **Level from Backend**: `useUserXp()` query fetches level from `GET /users/me/xp`; `LevelProgressCard` accepts optional `levelInfo` prop from API
- **Recent Unlocks Timeline**: Added recent unlocks section to AchievementsPage showing last 10 unlocked achievements with dates
- **Mark Complete**: Button no longer `await`s or shows spinner — fires immediately and lets user navigate

### 🔧 Files Changed
- `learning.service.ts` — streak XP, ENGAGEMENT award triggers, optimistic complete
- `rules-engine.service.ts` — `notes_created`, `bookmarks_added` cases
- `achievement.types.ts` — new criteria types
- `xp.service.ts` — `computeLevel()` method
- `users.controller.ts` — level in XP response
- `seed.ts` — 4 ENGAGEMENT achievements
- `enrollment.controller.ts` — added RolesGuard
- `enrollment.store.ts` — optimistic update in `markLessonComplete`
- `mark-complete-button.tsx` — no more blocking
- `achievements-query.service.ts` — `useUserXp()` hook
- `useAchievements.ts` — uses backend level
- `level-progress-card.tsx` — accepts `levelInfo` prop
- `AchievementsPage.tsx` — recent unlocks timeline

### ✅ Verification
- `npx tsc --noEmit` — zero errors on both frontend and backend
