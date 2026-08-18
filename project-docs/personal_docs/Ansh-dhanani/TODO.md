# TODO — Notification Center (Dezai)

> Focus: notification-related work only. Course search ranking and university bulk account creation are tracked separately.

## Done

- [x] Notification Center page at `/notifications` — All / Unread / Archived tabs, type filter chips, summary stat cards
- [x] Backend: `GET /api/notifications?filter=&type=`, `GET /api/notifications/summary`, `PATCH /:id/read|unread|archive`, mark-all-read
- [x] Frontend store (`notification.store.ts`), API service, shared types with `NOTIFICATION_TYPE_META`
- [x] Actions: mark read / unread, archive, mark all read, refresh
- [x] Bell dropdown in TopAppBar links to `/notifications`; route open to all roles
- [x] Seed: 120 sample notifications (8 per user) via `npm run seed:notifications`
- [x] Notification settings page (`/notifications/settings`) — opt-in/opt-out per notification type, Default/Custom badges, reset-to-defaults
- [x] Persist preferences per user (Prisma `NotificationPreference`) with role-based defaults (`ROLE_NOTIFICATION_DEFAULTS`); `shouldNotify()` gate honored at create time
- [x] University/admin accounts: no subscribe option in UI; role defaults restricted to UPDATE/SYSTEM/ANNOUNCEMENT (admin: SYSTEM/ANNOUNCEMENT)
- [x] Follow/subscribe to faculty (Prisma `Follow`, open to all roles), unfollow, search faculty
- [x] Notify followers when that faculty publishes a new course (fan-out on `createProgram`, UPDATE type, `actionUrl` → `/programs/<slug>`)
- [x] Faculty see "Your followers" panel on settings page (`getFollowers`)
- [x] Enroll → REMINDER "Welcome to your new course"; drop → UPDATE "Course dropped"
- [x] Role-aware seed (75 notifications across 15 users) via `npm run seed:notifications`
- [x] Verified: backend + frontend `tsc`, ESLint, `next build`

## Todo — Faculty Notification Policy

- [ ] Define the small set of events that notify faculty (e.g., course published to followers)
- [ ] Keep per-student metrics out of the notification stream — already served by course analytics (FacultyDashboard, `/analytics/programs/:id/students`)

## Todo — University Batches & Course Assignment (planned, NOT started)

> Replaces/coexists with faculty-follows. Decision pending: replace follow with batches, or keep both.

- [ ] Decide: replace the faculty-follow feature with batch/cohort assignment, or keep both (follow = public self-serve; batch = university-managed cohorts)
- [ ] Prisma models: `Batch` (institutionId, departmentId, name, code, description, startDate), `BatchMember` (batchId + userId), `BatchProgram` (batchId + programId + billing flag) + migration
- [ ] Bulk create university students with generated emails (no such endpoint today — students only exist after self-enroll)
- [ ] University admin assigns a program to a batch → auto-enroll every member + auto-notify them (actionUrl → course page)
- [ ] Unassign program from a batch → remove those enrollments
- [ ] University batches UI pages (`/university/batches`: list/create/detail, manage students + programs)
- [ ] Admin-side enrollment endpoint (today only student self-enroll `POST /enrollments/:programId` exists)

## Todo — Billing / Payment (planned, out of scope for now)

- [ ] Add billing flag on batch→program assignment: `UNIVERSITY_SPONSORED` (university pays) vs `STUDENT_PAID` (each student pays)
- [ ] Actual payment integration (Stripe or similar) — none exists today; only vestigial `PAYMENT_RECEIVED` / `VOUCHER_ISSUED` audit enum values
