# Gap Analysis

Comparison of **current prototype state** vs **MVP requirements** derived from designs, architecture docs, and implied product behavior.

---

## 1. Application & Infrastructure Gaps

| Gap | Current State | Required for MVP | Severity |
|-----|---------------|------------------|----------|
| No application runtime | Static HTML only | Next.js 15 App Router project | **Critical** |
| No package manager / dependencies | No `package.json` | npm/pnpm workspace with TS, Tailwind, Prisma | **Critical** |
| No environment configuration | No `.env.example` | DATABASE_URL, NEXTAUTH_SECRET, Razorpay keys | **Critical** |
| No CI/CD pipeline | None | Lint, typecheck, test, deploy | High |
| No hosting / deployment config | None | Vercel/Railway + managed Postgres | High |
| No monorepo / folder structure | Flat Stitch exports | Planned `app/`, `components/`, `lib/` tree | **Critical** |
| No error monitoring | None | Sentry or equivalent | Medium |
| No logging / observability | None | Structured logs, audit trail | Medium |

---

## 2. Authentication Gaps

| Gap | Current State | Required for MVP | Severity |
|-----|---------------|------------------|----------|
| Login page | Button only ("Sign In") | Email/password or OAuth login UI | **Critical** |
| Signup page | Not designed | Registration with role assignment | **Critical** |
| NextAuth integration | Documented only | `api/auth/[...nextauth]`, session JWT | **Critical** |
| Password reset | Not referenced | Forgot password flow | High |
| Email verification | Not referenced | Verify email on signup | High |
| Session management | None | Persistent sessions, logout | **Critical** |
| RBAC middleware | Enum defined in schema | Route guards for `(student)`, `(university)`, `(admin)` | **Critical** |
| Role assignment logic | `UserRole` enum only | Default STUDENT; admin promotes university admins | High |
| OAuth providers | Not specified | Google/Microsoft for institutional SSO | Medium |
| MFA | Not referenced | Optional for admin roles | Low (post-MVP) |
| Profile "Log Out" button | UI only, no handler | Server-side session destroy | **Critical** |

### RBAC Matrix (Specified vs Enforced)

| Role | Specified Permissions | Enforced |
|------|----------------------|----------|
| STUDENT | Courses, enroll, learn, quiz, certificates | ❌ |
| UNIVERSITY_ADMIN | Manage university courses, revenue, students | ❌ |
| DEZAI_ADMIN | All universities, global revenue, users | ❌ |

---

## 3. Database Gaps

| Gap | Current State | Required for MVP | Severity |
|-----|---------------|------------------|----------|
| Prisma schema file | Markdown only | `prisma/schema.prisma` on disk | **Critical** |
| Database instance | None | PostgreSQL (local + staging + prod) | **Critical** |
| Migrations | None | `prisma migrate` history | **Critical** |
| Seed data | None | Universities, courses, demo users, quizzes | **Critical** |
| Notification model | "To be added" per impl plan | `Notification` table for bell icon | High |
| Payment ↔ Course link | `Payment` has no `courseId` | FK to Course for ledger accuracy | High |
| Payment ↔ University settlement | No payout tracking | Settlement records, revenue share calc | High |
| Lesson progress tracking | `Enrollment.progress` only | Per-lesson completion table | **Critical** |
| Student notes | Not in schema | `LessonNote` model | Medium |
| Assignment model | UI references assignments | `Assignment`, `Submission` models | Medium |
| Instructor model | UI shows instructors | Dedicated model or User extension | High |
| Course reviews/ratings | UI shows 4.9 stars | `Review` model | Medium |
| Activity feed | Profile timeline | `Activity` or event log | Medium |
| Quiz answer storage | `QuizAttempt.score` only | Per-question response records | High |
| Flagged questions | UI feature | `QuizAttempt.flaggedQuestions` JSON | Medium |
| Proctoring events | Client-side blur only | `ProctoringEvent` audit log | Medium |
| Soft deletes | None | `deletedAt` on Course, User | Low |
| Indexes | None specified | slug, email, razorpayId, verifyUrl | High |
| File/media references | URLs in HTML | `Asset` or S3 keys on models | High |

### Schema Models — Implementation Status

| Model | In Schema Doc | Implemented |
|-------|---------------|-------------|
| User | ✅ | ❌ |
| StudentProfile | ✅ | ❌ |
| University | ✅ | ❌ |
| Course | ✅ | ❌ |
| CourseModule | ✅ | ❌ |
| Lesson | ✅ | ❌ |
| Enrollment | ✅ | ❌ |
| Quiz | ✅ | ❌ |
| Question | ✅ | ❌ |
| QuizAttempt | ✅ | ❌ |
| Certificate | ✅ | ❌ |
| Payment | ✅ | ❌ |
| Notification | 📋 planned | ❌ |

---

## 4. Backend / Business Logic Gaps

| Gap | Current State | Required for MVP | Severity |
|-----|---------------|------------------|----------|
| Course catalog API | Static HTML cards | `GET /api/courses` with filter/search | **Critical** |
| Course detail API | Hardcoded "Generative AI for Leaders" | `GET /api/courses/[slug]` | **Critical** |
| Enrollment logic | "Enroll Now" button | Create enrollment after payment | **Critical** |
| Progress calculation | Static 65% bar | Compute from completed lessons | **Critical** |
| Quiz scoring | No logic | Compare answers, set pass threshold | **Critical** |
| Certificate issuance | UI mockups only | Auto-issue on course+quiz completion | **Critical** |
| Certificate verification | Route documented | Public lookup by verifyUrl | **Critical** |
| Revenue share calculation | Static 70/30 display | `University.revenueShare` on payments | High |
| University analytics | Static numbers | Aggregate queries per universityId | High |
| Global admin analytics | Static charts | `GET /api/admin/analytics` | High |
| Report export | Button only | CSV/PDF generation | Medium |
| Search | UI inputs only | Full-text or filtered search | High |
| Pagination | Static "1 of 1280" | Cursor/offset pagination | High |
| Tier enforcement | Badge display only | `Tier` enum gates content access | Medium |
| Prerequisite / locked lessons | Lock icon in player | Unlock rules based on progress | High |
| XP / gamification | Toast only | Optional; remove or implement | Low |

---

## 5. API Architecture Gaps

### Documented Endpoints — All Missing

| Endpoint | Gap Detail |
|----------|------------|
| `GET /api/courses` | No handler, no query params spec (tier, university, search) |
| `GET /api/courses/[slug]` | No handler, no response DTO |
| `POST /api/enroll` | No Razorpay order creation, no webhook idempotency |
| `POST /api/quiz/submit` | No anti-cheat, no server-side timer validation |
| `GET /api/verify/[certId]` | No public page or API |
| `GET /api/admin/analytics` | No auth guard, no aggregation queries |
| `POST /api/payments/razorpay` | No webhook signature verification |
| `POST /api/certificates/generate` | No PDF pipeline |

### Missing API Infrastructure

| Concern | Gap |
|---------|-----|
| API versioning | Not defined |
| Rate limiting | Not defined |
| Request validation | No Zod schemas |
| Error response format | Not standardized |
| API documentation | No OpenAPI/Swagger |
| CORS policy | Not defined |
| Webhook retry handling | Not defined |
| Idempotency keys | Not defined for payments |
| Server Actions vs REST | Not decided for mutations |

### Recommended Additional Endpoints

```
GET    /api/me
PATCH  /api/me/profile
GET    /api/enrollments
GET    /api/enrollments/[id]/progress
POST   /api/lessons/[id]/complete
GET    /api/lessons/[id]/notes
PUT    /api/lessons/[id]/notes
GET    /api/quiz/[quizId]
POST   /api/quiz/[quizId]/start
POST   /api/quiz/[quizId]/submit
GET    /api/certificates
GET    /api/certificates/[id]
GET    /api/university/dashboard
GET    /api/university/courses
GET    /api/admin/transactions
POST   /api/admin/reports/export
GET    /api/notifications
PATCH  /api/notifications/[id]/read
```

---

## 6. Integration Gaps

| Integration | UI Reference | Current | MVP Need | Severity |
|-------------|--------------|---------|----------|----------|
| **Razorpay** | Enroll CTAs, billing settings | None | Checkout, webhooks, refunds | **Critical** |
| **Email (SMTP/Resend)** | None | None | Welcome, receipt, cert issued | High |
| **PDF generation** | Certificate images | None | Puppeteer/react-pdf for certs | **Critical** |
| **Video hosting** | Course player | Static image | Mux/Cloudflare Stream/Vimeo | **Critical** |
| **Object storage** | Remote Google URLs | None | S3/R2 for images, PDFs, uploads | High |
| **Proctoring** | Quiz proctor feed | Fake image | Proctorio/Honorlock or custom WebRTC | Medium |
| **Blockchain verify** | "Verified via Blockchain ID" copy | Marketing claim | Implement or remove claim | Medium |
| **LinkedIn sharing** | Certificate benefit bullet | None | OG meta + share URL | Low |
| **Analytics** | Dashboard charts | Static CSS | Product analytics (PostHog) | Medium |
| **SSO / SAML** | Enterprise footer link | None | University SSO (post-MVP) | Low |
| **CDN** | Googleusercontent | External dep | CloudFront/Vercel CDN | High |
| **Search** | Algolia-level UX implied | None | DB search or Algolia | Medium |

---

## 7. Frontend / UI Gaps

| Gap | Detail | Severity |
|-----|--------|----------|
| Student dashboard | Nav links everywhere, no design | **Critical** |
| Auth screens | Login, signup, forgot password | **Critical** |
| Course catalog page | Landing has cards, no list/filter page | High |
| Checkout / payment UI | No Razorpay modal or success page | **Critical** |
| Certificate verification page | Public trust endpoint | **Critical** |
| Dezai admin dashboard | Nav item with no page | High |
| University courses management | Sidebar link, no CRUD UI | High |
| University certificates page | Sidebar link, no design | Medium |
| Admin universities registry | In implementation plan only | High |
| Loading states | None | High |
| Error states | None | High |
| Empty states | None | High |
| 404 / 500 pages | None | Medium |
| Responsive audit | Mostly responsive; quiz/player need QA | Medium |
| Accessibility | No ARIA audit, keyboard nav on quiz | High |
| i18n | "English (US)" footer label only | Low |
| Dark mode | Partial `dark:` classes, inconsistent | Low |
| Logo bug on landing | URL as text in header/footer | High (quick fix) |
| Duplicate course details | Two HTML variants | Low (consolidate) |

---

## 8. Security Gaps

| Concern | Prototype Behavior | Production Requirement |
|---------|-------------------|------------------------|
| Quiz anti-cheat | Client-side blur listener only | Server session, IP logging, proctor integration |
| Answer exposure | Answers would be in client if not careful | Server-side grading only |
| Auth on API routes | N/A | JWT/session validation middleware |
| RBAC bypass | N/A | Per-route role checks |
| Payment webhook | N/A | HMAC signature verification |
| CSRF | N/A | Next.js built-in + SameSite cookies |
| XSS | innerHTML in some JS toasts | Sanitize, use React |
| SQL injection | N/A | Prisma parameterized queries |
| Rate limiting on quiz submit | N/A | Prevent brute-force |
| PII in logs | N/A | Redact email, payment IDs |
| HTTPS | N/A | Enforce TLS |
| Content Security Policy | CDN Tailwind script | Self-hosted assets, strict CSP |

---

## 9. Testing & Quality Gaps

| Area | Status |
|------|--------|
| Unit tests | None |
| Integration tests | None |
| E2E tests (Playwright) | None |
| API contract tests | None |
| Visual regression | None |
| Load testing | None |
| Seed data for QA | None |

---

## 10. DevOps & Data Gaps

| Gap | Detail |
|-----|--------|
| Staging environment | Not configured |
| Database backups | Not configured |
| Migration rollback strategy | Not defined |
| Feature flags | Not defined |
| Secrets management | Not defined |

---

## Gap Summary by Domain

| Domain | Gaps Identified | Critical | Complete |
|--------|-----------------|----------|----------|
| Application / Infra | 8 | 4 | 0% |
| Authentication | 11 | 7 | 0% |
| Database | 20 | 6 | 0% (schema doc only) |
| Backend / Business Logic | 16 | 7 | 0% |
| API Architecture | 25+ | 8 | 0% |
| Integrations | 12 | 4 | 0% |
| Frontend / UI | 18 | 5 | ~35% (designed pages) |
| Security | 12 | 6 | ~5% (quiz UI only) |
| Testing | 6 | 0 | 0% |
| DevOps | 5 | 0 | 0% |

---

## MVP Definition — Minimum to Ship

A working MVP must satisfy:

1. ✅ User can sign up / log in as Student
2. ✅ User can browse catalog and view course details
3. ✅ User can pay via Razorpay and enroll
4. ✅ User can watch lessons, mark complete, track progress
5. ✅ User can take timed quiz and receive score
6. ✅ User earns certificate PDF with public verify URL
7. ✅ University admin sees dashboard with real institutional data
8. ✅ Dezai admin sees revenue analytics with real payment data
9. ✅ RBAC prevents cross-tenant data access

**Currently satisfies:** 0 of 9 (UI mockups only, no live data or auth)

---

## Recommended Scope Cuts for Faster MVP

Defer to v1.1+:

- Live proctoring integration (keep timer + tab detection)
- Blockchain verification claim (use UUID verify URL)
- Assignment submission flow
- Community / discussion
- Report PDF export
- Instructor CRUD
- Enterprise SSO
- XP gamification
- Subscription billing model (UI mentions 10% allocation)
- Multi-language support
