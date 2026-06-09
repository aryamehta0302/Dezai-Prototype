# Dezai AI — Project Overview

## Executive Summary

Dezai AI is a **university-grade EdTech SaaS platform** for micro-credentials, proctored assessments, and multi-tier certification. The authoritative source of truth lives in `stitch_dezai_ai_edtech_platform/` and consists of **static HTML page exports** (Google Stitch), a **design system specification**, and **architecture/schema documentation**. There is **no runnable application**, **no database**, and **no API layer** in the repository today.

The product targets three personas with role-based access:

| Persona | Primary Goals |
|---------|----------------|
| **Student** | Discover courses, enroll, learn, take proctored quizzes, earn verifiable certificates |
| **University Admin** | Monitor institutional performance, courses, instructors, certifications, revenue share |
| **Dezai Admin** | Global platform oversight, partner universities, revenue analytics, transaction ledger |

## Product Vision

Bridge academic theory and industry demand through **accredited digital micro-credentials** delivered in three learning modes:

1. **Foundational Sprints** — 7-day intensive modules
2. **Medium-Term Cohorts** — 4-week collaborative projects
3. **Proctored Quizzes** — standardized assessments with live proctoring

Credentials are tiered:

| Tier | Name | Description |
|------|------|-------------|
| Tier 1 | Dezai Core (FOUNDATIONAL) | Skill-based micro-badges |
| Tier 2 | University Accredited (ACADEMIC) | Transferable university credits |
| Tier 3 | Industry Verified (PROFESSIONAL) | Fortune 500–endorsed certificates |

## Repository Inventory

```
stitch_dezai_ai_edtech_platform/
├── academic_intelligence_system/
│   └── DESIGN.md                          # Design system (colors, typography, components)
├── dezai_ai_technical_implementation_plan.md
├── project_architecture_database_schema.md
├── active_quiz_dezai_ai/code.html
├── course_details_dezai_ai/code.html
├── course_details_dezai_ai_updated_logo/code.html
├── course_player_dezai_ai_2/code.html
├── dezai_ai_micro_credentials_platform/code.html
├── revenue_analytics_dezai_admin/code.html
├── student_profile_dezai_ai/code.html
└── university_dashboard_dezai_ai/code.html
```

**Total files:** 11 (3 documentation, 8 HTML prototypes)

## Technology Stack (Planned — Not Implemented)

Per `dezai_ai_technical_implementation_plan.md` and `project_architecture_database_schema.md`:

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Shadcn UI |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js with RBAC |
| Payments | Razorpay (INR default) |
| State | Zustand |
| Animation | Framer Motion (design system spec) |
| Fonts | Geist (headlines/labels), Inter (body) |
| Icons | Material Symbols Outlined |

## Current Maturity Assessment

| Area | Status | Notes |
|------|--------|-------|
| Visual design / UI prototypes | **Strong** | 8 polished Stitch HTML exports |
| Design system | **Documented** | Academic Intelligence System tokens defined |
| Information architecture | **Partial** | Nav links imply routes not yet designed |
| Database schema | **Specified** | Prisma schema in markdown only |
| API design | **Outlined** | 6 endpoints documented |
| Application code | **None** | Zero `.tsx`, `.ts`, or `package.json` |
| Authentication | **None** | Login/signup screens not designed |
| Backend / integrations | **None** | Razorpay, proctoring, video, PDF certs absent |
| Tests / CI | **None** | — |
| Deployment config | **None** | — |

### Overall Completion: **~18%** toward working MVP

Breakdown:

- **Design & UX prototype:** ~72% of core student + admin visual flows
- **Architecture documentation:** ~40% (schema exists; API surface minimal)
- **Implementation:** ~0%

### Estimated Remaining Work: **14–20 engineer-weeks** (1 senior full-stack + 1 frontend)

Assumes MVP scope: auth, course catalog, enrollment + Razorpay, course player with progress, quiz engine, certificate issuance + public verify, university dashboard (read), Dezai admin revenue (read), PostgreSQL + Prisma, basic RBAC.

## Key Risks & Gaps

1. **Duplicate course details export** — `course_details_dezai_ai` vs `course_details_dezai_ai_updated_logo`; logo variant should be canonical.
2. **Broken logo placeholders** — Landing page header/footer embed raw Google URLs as text instead of `<img>` tags.
3. **No auth screens** — Sign In button exists on marketing page; no login/signup/reset designs.
4. **No student dashboard** — Referenced in nav across multiple pages but not exported.
5. **No certificate verification page** — Schema and architecture reference `/verify/[id]`; no UI.
6. **Proctoring is visual-only** — Quiz page simulates webcam feed and tab-switch detection client-side only.
7. **Payment flow absent** — Enroll buttons show static prices; no checkout UI.
8. **Notification model** — Mentioned as "to be added" in implementation plan.
9. **External image dependency** — All imagery hosted on `lh3.googleusercontent.com` (AIDA/Stitch); must be migrated to owned CDN/storage.

## Document Index

| File | Purpose |
|------|---------|
| [01_EXISTING_ASSETS.md](./01_EXISTING_ASSETS.md) | Design assets, fonts, images, design tokens |
| [02_ROUTE_MANIFEST.md](./02_ROUTE_MANIFEST.md) | Discovered and implied routes |
| [03_COMPONENT_MANIFEST.md](./03_COMPONENT_MANIFEST.md) | UI components across all pages |
| [04_GAP_ANALYSIS.md](./04_GAP_ANALYSIS.md) | Missing backend, DB, auth, integrations, API |
| [05_IMPLEMENTATION_PLAN.md](./05_IMPLEMENTATION_PLAN.md) | Phased roadmap to MVP |

## Recommended Build Order (Summary)

See [05_IMPLEMENTATION_PLAN.md](./05_IMPLEMENTATION_PLAN.md) for full detail.

1. **Foundation** — Next.js scaffold, design tokens, shared layout components
2. **Data layer** — Prisma schema, migrations, seed data
3. **Auth + RBAC** — NextAuth, role middleware, login/signup pages
4. **Public marketing** — Landing page from micro-credentials export
5. **Course discovery** — Catalog, course details, search/filter API
6. **Enrollment + payments** — Razorpay integration
7. **Learning experience** — Course player, progress tracking, notes
8. **Quiz engine** — Timed assessments, attempts, scoring
9. **Certificates** — PDF generation, public verification
10. **Admin dashboards** — University + Dezai admin with live analytics
11. **Polish** — Notifications, proctoring integration, asset migration
