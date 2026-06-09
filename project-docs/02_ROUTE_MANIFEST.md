# Route Manifest

Routes are derived from three sources:

1. **Implemented pages** — Stitch HTML exports (static, no routing)
2. **Navigation links** — `href="#"` placeholders in prototypes
3. **Architecture docs** — Planned Next.js App Router structure

Legend: ✅ Designed (HTML) · 📋 Documented only · ❌ Missing · 🔄 Duplicate variant

---

## Public / Marketing Routes

| Route | Status | Source | Page / Screen |
|-------|--------|--------|---------------|
| `/` | ✅ | `dezai_ai_micro_credentials_platform/code.html` | Landing — hero, partners, how-it-works, categories, tiers, testimonials, FAQ, CTA |
| `/about` | ❌ | Nav link on landing | "About Us" — no design |
| `/institutions` | ❌ | Nav + footer links | Partner universities listing — no design |
| `/catalog` | ❌ | Nav "Course Catalog" | Implied by landing categories; no dedicated catalog page |
| `/accreditation` | ❌ | Footer link | Accreditation info — no design |
| `/enterprise` | ❌ | Footer link | B2B sales — no design |
| `/help` | ❌ | Footer "Help Center" | Support portal — no design |
| `/terms` | ❌ | Footer | Legal — no design |
| `/privacy` | ❌ | Footer (all pages) | Privacy policy — no design |
| `/verify/[certId]` | 📋 | `project_architecture_database_schema.md` | Public certificate verification — **no UI** |

---

## Authentication Routes

| Route | Status | Source | Notes |
|-------|--------|--------|-------|
| `/login` | 📋 | `dezai_ai_technical_implementation_plan.md` | Sign In button on landing; **no screen design** |
| `/signup` | 📋 | Implementation plan | **No screen design** |
| `/forgot-password` | ❌ | — | Not referenced |
| `/api/auth/[...nextauth]` | 📋 | Implementation plan | NextAuth handler — not implemented |

---

## Student Portal Routes `(student)` — RBAC: `STUDENT`

| Route | Status | Source | Page / Screen |
|-------|--------|--------|---------------|
| `/dashboard` | ❌ | Nav on course details, profile, player | Student home — **referenced but not designed** |
| `/courses` | ❌ | Nav links | Enrolled / browse courses list — no design |
| `/courses/[slug]` | ✅ | `course_details_dezai_ai_updated_logo` | Course details — enroll, syllabus, FAQ |
| `/courses/[slug]` | 🔄 | `course_details_dezai_ai` | Duplicate without img logo (use updated_logo) |
| `/courses/[slug]/learn` | ✅ | `course_player_dezai_ai_2` | Video player, notes, module sidebar |
| `/courses/[slug]/learn/[lessonId]` | 📋 | Implied by player | Dynamic lesson — single static lesson shown |
| `/courses/[slug]/quiz/[quizId]` | ✅ | `active_quiz_dezai_ai` | Proctored timed quiz |
| `/profile` | ✅ | `student_profile_dezai_ai` | Profile, stats, certificates, activity, settings |
| `/certificates` | ❌ | Nav links | Certificate list page — partial content on profile only |
| `/certificates/[id]` | ❌ | Profile "View" buttons | Single certificate detail — no design |
| `/institutions` | ❌ | Nav on course details | Student-facing institutions — no design |
| `/settings/profile` | ❌ | Profile settings nav | Edit profile form — no design |
| `/settings/notifications` | ❌ | Profile settings nav | Notification prefs — no design |
| `/settings/billing` | ❌ | Profile settings nav | Billing & subscriptions — no design |
| `/settings/security` | ❌ | Profile settings nav | Privacy & security — no design |
| `/checkout/[courseSlug]` | ❌ | "Enroll Now" CTA | Razorpay checkout — no design |
| `/assignments/[id]` | ❌ | Course player "Go to Assignment" | Assignment submission — no design |
| `/community` | ❌ | Profile activity feed | Community/discussion — no design |

### Student Mobile Bottom Nav (Course Player)

| Tab | Route (implied) | Status |
|-----|-----------------|--------|
| Dashboard | `/dashboard` | ❌ |
| Courses | `/courses` | ❌ |
| Curriculum | `/courses/[slug]/learn` | ✅ |
| Certificates | `/certificates` | ❌ |

---

## University Admin Routes `(university)` — RBAC: `UNIVERSITY_ADMIN`

| Route | Status | Source | Page / Screen |
|-------|--------|--------|---------------|
| `/university/dashboard` | ✅ | `university_dashboard_dezai_ai` | Institution overview dashboard |
| `/university/courses` | 📋 | Sidebar nav + implementation plan | Course management — **nav only, no page** |
| `/university/certificates` | ❌ | Sidebar nav | Certificate oversight — no design |
| `/university/institutions` | ❌ | Sidebar nav | Institutional settings — no design |
| `/university/instructors` | ❌ | "Manage Directory" button | Instructor CRUD — no design |
| `/university/courses/[id]` | ❌ | "View All Courses" link | Course detail admin — no design |
| `/university/reports` | ❌ | Export Report button | Report generation — no design |
| `/university/certifications/[id]` | ❌ | Table "visibility" action | Cert detail view — no design |

### University Sidebar Navigation

| Label | Implied Route | Active in Prototype |
|-------|---------------|---------------------|
| Dashboard | `/university/dashboard` | ✅ |
| Courses | `/university/courses` | — |
| Certificates | `/university/certificates` | — |
| Institutions | `/university/institutions` | — |

---

## Dezai Admin Routes `(admin)` — RBAC: `DEZAI_ADMIN`

| Route | Status | Source | Page / Screen |
|-------|--------|--------|---------------|
| `/admin/dashboard` | ❌ | Nav "Dashboard" on revenue page | System health overview — **no design** |
| `/admin/revenue` | ✅ | `revenue_analytics_dezai_admin` | Global revenue analytics |
| `/admin/universities` | 📋 | Implementation plan | University registry — **no design** |
| `/admin/partners` | ❌ | Nav "Partners" | Partner directory — no design |
| `/admin/settings` | ❌ | Nav "Settings" | Platform settings — no design |
| `/admin/transactions` | ❌ | Revenue page ledger section | Could be sub-route of revenue |
| `/admin/users` | ❌ | — | User management — not referenced |

### Dezai Admin Top Nav

| Label | Implied Route | Active in Prototype |
|-------|---------------|---------------------|
| Dashboard | `/admin/dashboard` | — |
| Revenue | `/admin/revenue` | ✅ |
| Partners | `/admin/partners` | — |
| Settings | `/admin/settings` | — |

---

## API Routes (Planned)

From `project_architecture_database_schema.md` and `dezai_ai_technical_implementation_plan.md`:

| Method | Route | Status | Purpose |
|--------|-------|--------|---------|
| `GET` | `/api/courses` | 📋 | Search & filter courses |
| `GET` | `/api/courses/[slug]` | 📋 | Course details |
| `POST` | `/api/enroll` | 📋 | Enrollment + Razorpay |
| `POST` | `/api/quiz/submit` | 📋 | Validate answers, log attempt |
| `GET` | `/api/verify/[certId]` | 📋 | Public cert verification |
| `GET` | `/api/admin/analytics` | 📋 | Revenue + student trends |
| `POST` | `/api/auth/[...nextauth]` | 📋 | Authentication |
| `POST` | `/api/payments/razorpay` | 📋 | Payment webhook/handler |
| `POST` | `/api/certificates/generate` | 📋 | PDF cert generation |

### API Routes Implied by UI (Not Documented)

| Method | Route | Triggered By |
|--------|-------|--------------|
| `GET` | `/api/profile` | Student profile page |
| `PATCH` | `/api/profile` | Edit profile |
| `GET` | `/api/enrollments` | Student dashboard (missing) |
| `PATCH` | `/api/lessons/[id]/progress` | Mark as complete (player) |
| `GET` | `/api/lessons/[id]/notes` | Personal notes panel |
| `POST` | `/api/lessons/[id]/notes` | Save notes |
| `GET` | `/api/quiz/[id]` | Load quiz questions |
| `GET` | `/api/university/analytics` | University dashboard |
| `GET` | `/api/university/courses` | Course performance table |
| `GET` | `/api/university/instructors` | Instructor directory |
| `GET` | `/api/university/certifications` | Recent certifications |
| `GET` | `/api/admin/transactions` | Transaction ledger |
| `POST` | `/api/admin/reports/export` | Export report button |
| `GET` | `/api/notifications` | Notification bell (all roles) |

---

## Dashboard Summary

| Dashboard | Route | Role | Status |
|-----------|-------|------|--------|
| **Marketing Home** | `/` | Public | ✅ Designed |
| **Student Dashboard** | `/dashboard` | Student | ❌ Missing |
| **Student Profile** | `/profile` | Student | ✅ Designed (partial dashboard) |
| **Course Player** | `/courses/[slug]/learn` | Student | ✅ Designed |
| **University Institution Overview** | `/university/dashboard` | University Admin | ✅ Designed |
| **Dezai Revenue Analytics** | `/admin/revenue` | Dezai Admin | ✅ Designed |
| **Dezai System Dashboard** | `/admin/dashboard` | Dezai Admin | ❌ Missing |

---

## Route Group Architecture (Target)

Per implementation plan — **not yet created**:

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── (student)/
│   ├── dashboard/page.tsx
│   └── courses/[slug]/...
├── (admin)/
│   ├── admin/dashboard/page.tsx
│   ├── admin/universities/page.tsx
│   └── admin/revenue/page.tsx
├── (university)/
│   ├── university/dashboard/page.tsx
│   └── university/courses/page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── payments/razorpay/route.ts
│   ├── quiz/submit/route.ts
│   └── certificates/generate/route.ts
└── verify/[id]/page.tsx
```

---

## Route Coverage Matrix

| Category | Designed | Documented | Missing | Coverage |
|----------|----------|------------|---------|----------|
| Public/Marketing | 1 | 1 | 8 | 10% |
| Auth | 0 | 2 | 1 | 0% |
| Student | 4 | 3 | 12 | 25% |
| University Admin | 1 | 1 | 6 | 14% |
| Dezai Admin | 1 | 2 | 4 | 17% |
| API | 0 | 9 | 14+ | 0% |
| **Total unique routes** | **7 pages** | **18+** | **45+** | **~18%** |

---

## Canonical Page Mapping (HTML → Next.js)

| HTML Export Folder | Target Route | Priority |
|--------------------|--------------|----------|
| `dezai_ai_micro_credentials_platform` | `app/(marketing)/page.tsx` | P0 |
| `course_details_dezai_ai_updated_logo` | `app/(student)/courses/[slug]/page.tsx` | P0 |
| `course_player_dezai_ai_2` | `app/(student)/courses/[slug]/learn/[lessonId]/page.tsx` | P0 |
| `active_quiz_dezai_ai` | `app/(student)/courses/[slug]/quiz/[quizId]/page.tsx` | P1 |
| `student_profile_dezai_ai` | `app/(student)/profile/page.tsx` | P1 |
| `university_dashboard_dezai_ai` | `app/(university)/university/dashboard/page.tsx` | P1 |
| `revenue_analytics_dezai_admin` | `app/(admin)/admin/revenue/page.tsx` | P2 |
| `course_details_dezai_ai` | — | Deprecate (use updated_logo) |
