# Ansh Dhanani — Dezai Contribution Log

**Role**: Learning System Lead for the Dezai EdTech platform.

---

## Daily Log

### 2026-06-17 — Sprint 1: Backend Integration

**What I told the agent to do:**
Wire the Dezai frontend to the NestJS backend API instead of mock data for enrollment, progress, lesson completion, notes, bookmarks, and XP tracking.

**Constraints I set:**
- Preserve existing `/programs/[slug]` route structure
- Backend uses UUIDs; generate slugs client-side from titles
- Enrollment store persist key must be new (`dezai-enrollments-v3`) to flush stale mock data
- No quiz/certificate/auth work — those have no backend endpoints

**Bugs I found by testing:**
| Bug | What I saw | What was done |
|-----|------------|---------------|
| Empty module names | Modules showed up in syllabus but had no title | Fixed `getPrograms()` to select lesson `title`, `order`, `videoUrl` |
| Generic "Introduction" module still visible | Player showed stale welcome lessons before real ones | Deleted all Introduction modules and re-numbered |
| Only ROOTS tracks | Programs had no EDGE track at all | Added edge-track creation to the curriculum seed |
| Progress stuck at 100% | Had completed 2/2 old lessons, persisted store never synced | Layout now calls `fetchEnrollments()` on mount |
| No header on catalog page | `/catalog` was outside `(student)` route group | Moved `app/catalog/` → `app/(student)/catalog/` |
| Footer on player pages | Footer visible during lesson watching | Conditional footer via `usePathname()` |
| Full reload on Mark Complete | Page flashed and refetched everything | Removed `fetchEnrollments()` from `markLessonComplete` |
| Full reload on lesson navigation | Previous/Next caused re-fetch cascade | Replaced `router.replace()` with `window.history.replaceState` |
| No course thumbnails | Cards showed generic gradient with BookOpen icon | Added picsum.photos + gradient fallback |
| Empty curriculum broke UI | "0 lessons" badge, broken syllabus | Added empty states, disabled Start button |

**Key decisions I made:**
- Local-first state pattern (Zustand persist + sync on page load)
- `window.history.replaceState` over `router.replace()` for silent URL updates
- Delete old modules rather than try to merge them
- Category/tier hardcoded to AI / Tier 1 (backend has no fields for these)

**Files changed (frontend):**
- `program.types.ts` — new API types
- `programs-api.service.ts` — new HTTP client
- `course.service.ts` — rewritten from sync mock → async
- `enrollment.store.ts` — rewritten with new persist key
- `slug.ts` / `thumbnail.ts` — new utils
- `CoursePlayerPage.tsx` — no router.replace, silent URL
- `(student)/layout.tsx` — fetch enrollments + XP on mount, conditional footer
- `course-card.tsx`, `course-hero.tsx`, `enrollment-cta.tsx`, `syllabus-accordion.tsx`, `mark-complete-button.tsx`, `course-module-sidebar.tsx`, `related-courses.tsx`, `course-filters.tsx` — migrated from MockCourse to ApiProgram
- `learning.service.ts`, `lesson.service.ts` — rewritten for API calls

**Files changed (backend):**
- `programs.service.ts` — getPrograms returns lesson details
- `users.controller.ts` — new GET /api/users/me/xp
- Seed files: `seed-lessons.ts`, `cleanup-modules.ts`, `seed-edge-tracks.ts`, `seed-full-curriculum.ts`, `finish-vcs.ts`, `check-status.ts`

**What's still broken/blocked:**
- Nothing in Sprint 1 scope

---

### 2026-06-XX — [Next session title]

**What I told the agent to do:**

**Constraints I set:**

**Bugs I found by testing:**

**Key decisions I made:**

**Files changed:**

**What's still broken/blocked:**

---

## Archive: Sprint 1 Detail

### Problems Found & Decisions Made

#### 1. Backend `getPrograms()` didn't return lesson titles
The list endpoint only selected `{ id: true }` for lessons. The detail endpoint (`getProgramById`) was fine.

**Decision**: Updated the Prisma query to select `{ id, title, order, videoUrl }` and added `orderBy` for modules and tracks.

#### 2. No curriculum content in the database
The original seed only created 1 generic module ("Introduction") with 2 generic lessons per program. 12 programs had no real content.

**Decision**: Build a seed script. First attempt (`seed-lessons.ts`) added 3 modules per ROOTS track. After review, expanded to 5 ROOTS + 5 EDGE modules (10 total, ~28 lessons per program) with real Google sample video URLs and markdown content.

#### 3. Old "Introduction" module was still visible
The original seed's "Introduction" module with "Welcome to the Course" / "Course Overview" persisted alongside the new curriculum. The player picked its stale lessons first.

**Decision**: Delete all modules named "Introduction" (cascade-deletes their lessons) and re-number remaining modules per track.

#### 4. Programs only had ROOTS tracks (no EDGE)
The original seed used `prisma.program.create` directly (bypassing the service that auto-creates both ROOTS and EDGE). Only 1 track existed per program.

**Decision**: Added edge-track creation to the full curriculum seed. Now every program has both tracks.

#### 5. Progress showed 100% after curriculum grew
The user had completed 2/2 original lessons (100%). After seeding 28+ lessons, the persisted store still showed `progress: 100`. The backend recalculated correctly via `updateEnrollmentProgress`, but the frontend never re-fetched on page load.

**Decision**: Call `fetchEnrollments()` and `fetchXp()` in the `(student)` layout's `useEffect` (runs on every student page load). This syncs progress from the backend's recalculated value. Also removed the internal `fetchEnrollments()` call from `markLessonComplete` to avoid double API calls and full re-renders.

#### 6. Catalog page had no header
`/catalog` was at `app/catalog/page.tsx` (root level), outside the `(student)` route group. It didn't inherit the layout with `TopAppBar`.

**Decision**: Moved `app/catalog/` → `app/(student)/catalog/`. URL stays `/catalog`, but now it inherits the header.

#### 7. Footer on course player / detail pages
The `(student)` layout always rendered `<Footer />`. It was distracting on the learning pages.

**Decision**: Added `usePathname()` check — only render `<Footer />` when path doesn't start with `/programs/`.

#### 8. Full page reload on "Mark as Complete"
`markLessonComplete` called `fetchEnrollments()` internally, which set `isLoading: true`, made a GET request, and replaced the entire `enrollments` map. This caused a full re-render cascade.

**Decision**: Removed the `fetchEnrollments()` call from `markLessonComplete`. The layout already syncs enrollment data on page load.

#### 9. Full page reload on lesson navigation (Previous/Next)
`goToLesson` called `router.replace(...)`, which caused the Next.js App Router to re-run the mount `useEffect` — refetching course data (from cache) and lesson content. Two `useEffect` hooks subscribed to `lessonId` changes, causing duplicate API calls.

**Decision**: 
- Removed `router.replace()` from lesson navigation
- Replaced with `window.history.replaceState(null, "", url)` for silent URL updates
- Removed the duplicate `useEffect` that watched `lessonId`
- Added a `fetchLesson` callback that only fetches lesson content (no course re-fetch)

#### 10. Thumbnails
Course cards showed a generic gradient with a `BookOpen` icon. No course imagery.

**Decision**: Added `shared/utils/thumbnail.ts` with picsum.photos URLs seeded by course ID hash, and a CSS gradient fallback.

#### 11. Empty curriculum UI
When programs had no modules/lessons, the UI showed nothing or broken "0 lessons" badges.

**Decision**: Added "Curriculum coming soon" / "No modules added yet" empty states. Disabled "Start Learning" button when no lessons exist. Show "Coming soon" badge instead of "0 lessons".

### Key Technical Decisions

| Decision | Why |
|----------|-----|
| **Slugs from title** (client-side slugify) | Avoid DB migration. No backend `slug` column needed for MVP. |
| **Category/tier hardcoded** | Backend Program model has no `category`/`tier`/`price`/`rating` fields. |
| **Persist key `dezai-enrollments-v3`** | Guarantees no stale mock data leaks through. |
| **Zustand persist (local-first)** | Enrollments cached in localStorage. Backend synced on page load. |
| **`window.history.replaceState` over `router.replace()`** | `router.replace()` triggered full re-render cascade. `replaceState` is silent. |
| **`fetchEnrollments` in layout, not in `markLessonComplete`** | Avoids double API call on every lesson completion. |
| **picsum.photos for thumbnails** | No DB schema change needed. Fallback to gradient on error. |
| **Delete old "Introduction" modules** | Simpler than renaming/reconciling. |

### What Was Intentionally Skipped

| Feature | Reason |
|---------|--------|
| Quiz engine | Backend assessments module is empty. |
| Certificate issuance | Schema exists, no generation logic. |
| Auth mock data | NextAuth + JWT flow was already working. |
| Payments / Razorpay | Not in Sprint 1 scope. |
| Profile settings | Layout scaffolded, no pages. |
| Notifications | Schema exists, no UI integration. |

### Verification

- `npx tsc --noEmit` — zero errors
- `npm run build` (backend) — clean compile
- 12 programs with 10 modules each visible in catalog
- Enroll → course detail → lesson player → mark complete → XP update flows end-to-end
- Lesson navigation is instant, no page reload
