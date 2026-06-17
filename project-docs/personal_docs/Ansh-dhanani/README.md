# Ansh Dhanani — Dezai Sprint 1 Contribution Log

**Role**: Full-stack developer & project lead for the Dezai EdTech platform.

## Workstyle

Ansh drives the "what" — gives high-level direction, reviews output, tests functionality, and flags inconsistencies. The AI agent handles the "how" (implementation, debugging, documentation).

## Sprint 1: Backend Integration (June 2026)

### What Ansh Directed

1. **Architecture**: Chose local-first pattern (Zustand persist + periodic backend sync) over fully-online or fully-offline.
2. **Constraints**: Preserve existing `/programs/[slug]` routes; use backend UUIDs but generate slugs client-side from titles.
3. **Scope cut**: Excluded quiz/certificate/auth mock data from Sprint 1 — those features have no backend endpoints.
4. **UX calls**: Identified empty module names, stale progress percentages, "Loading..." flashes, and full-page reloads as blockers.

### What Was Built (by agent)

| Area | Deliverable |
|------|------------|
| **API types** | `program.types.ts` — full response shapes for Program, Track, Module, Lesson, Enrollment |
| **API services** | `programs-api.service.ts` (GET programs), `learning-api.service.ts` (enrollments, lessons, XP, notes, bookmarks) |
| **Course service** | Async `course.service.ts` with cache + slug resolution; `useCourses`, `useEnrollment`, `useProgress` hooks |
| **Enrollment store** | Zustand `enrollment.store.ts` with persist key `dezai-enrollments-v3`, async enroll, XP sync |
| **Pages** | `CatalogPage` (skeleton loading), `CourseDetailPage` (tracks syllabus), `CoursePlayerPage` (no full reloads, silent URL updates) |
| **Components** | 9 components migrated from MockCourse to ApiProgram types |
| **Backend** | `GET /api/users/me/xp` endpoint; `getPrograms()` now returns lesson titles |
| **Curriculum seed** | 12 programs × 10 modules × ~28 lessons each, real video URLs, markdown content |
| **Thumbnails** | picsum.photos on cards + hero with gradient fallback |
| **UX polish** | Empty states, progress sync, no full reloads on lesson nav, footer hidden on player, header visible on catalog |

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| Slugs from title | Avoid migration; no backend slug column needed for MVP |
| Category/tier hardcoded | Backend Program model lacks these fields; extend later |
| Persist key v3 | Flush stale mock data from previous stores |
| No `router.replace()` | Was causing full page re-fetches; replaced with `window.history.replaceState` |

### Verification

- `npx tsc --noEmit` — zero errors
- Backend compiles with `npm run build`
- 12 programs with real curriculum visible in frontend
- Enrollment → lesson → mark complete → XP flows end-to-end
