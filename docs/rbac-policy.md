---
sprint: 4
date: 2026-06-24
author: Hitarth
status: Verified
---

# Role-Based Access Control (RBAC) Policy

This document defines the platform access-control rules and contains the verified status badges for all active roles.

## 1. System Roles Definition
- **STUDENT**: Basic learner role. Can enroll in courses, view lessons, take assessments, track their own XP, and request AI assistance.
- **FACULTY**: Academic course author. Scoped to create programs, edit modules, CRUD question banks, write grading feedback, and freeze student leaderboards.
- **UNIVERSITY_ADMIN** (Partner-University): Institutional operator. Manages local university registry sync, requests student voucher lists, and reviews campus-wide student profiles.
- **DEZAI_ADMIN**: Global system administrator. Resolves cross-university disputes, issues/mints vouchers, reviews analytics, and modifies system configurations.

---

## 2. Resource Permissions & Verification Matrix

Below is the verified status matrix. Badges denote test coverage completeness:

| Resource | Student | Faculty | University Admin | Dezai Admin | QA Coverage Status |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Course Content** | Read-Only | CRUD | CRUD (Scoped) | Global CRUD | `[QA-VERIFIED]` |
| **Quiz Question Bank** | Attempt Only | CRUD | CRUD (Scoped) | Global CRUD | `[QA-VERIFIED]` |
| **Leaderboard** | Read-Only | Freeze Only | CRUD (Scoped) | Global CRUD | `[QA-VERIFIED]` |
| **XP Ledger** | Read-Only | Read-Only | Read-Only | Global CRUD | `[QA-VERIFIED]` |
| **Student Profiles** | Update Own | Read Cohort | CRUD (Scoped) | Global CRUD | `[QA-VERIFIED]` |
| **Registry Sync** | Denied | Denied | Sync Scoped | Global CRUD | `[QA-VERIFIED]` |
| **Payment/Vouchers** | Redeem Only | Denied | Request | Issue/Mint | `[QA-VERIFIED]` |

---

## QA Policy Verification Appendices
* **Session Vulnerability Coverage**: Complete. Validated that expired, malformed, or tampered signatures reject requests with `401 Unauthorized`.
* **Multi-Tenant Isolation**: Complete. Validated that cross-tenant access between University A and University B returns `403 Forbidden` on both reads and writes.
