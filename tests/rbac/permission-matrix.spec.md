---
sprint: 4
date: 2026-06-24
author: Hitarth
status: Verified
---

# Role-Based Access Control (RBAC) Permission Matrix & Test Specification

This document defines the validation criteria and test matrix for role-based access control (RBAC) across the Dezai AI platform, referencing the multi-tenant cross-institutional framework (Section 1.1), the dynamic assessment engine (Section 5), the proctoring engine (Section 6), and the backend ledger (Section 8).

## 1. Role × Resource × Action Grid

Below is the authorization grid. Actions are defined as:
* **C**: Create
* **R**: Read
* **U**: Update
* **D**: Delete
* **X**: Execute / Special Action (e.g., Sync, Mint, Freeze, Attempt)
* **None**: Explicitly denied (expected status: `403 Forbidden` or `401 Unauthorized`)

| Role | Course Content | Quiz Question Bank | Leaderboard | XP Ledger | Student Profile/Grades | University Registry Sync | Payment/Voucher Issuance |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Student** | R | None (No CRUD; can only take quiz) | R (View own & board) | R (Own history) | R (Own), U (Own Profile) | None | None (Can only redeem) |
| **Faculty** | C, R, U, D | C, R, U, D | R, X (Freeze cohort board) | R (Cohort details) | R (Cohort details), U (Feedback) | None | None |
| **Partner-University** (University Admin) | C, R, U, D (Scoped) | C, R, U, D (Scoped) | R, U, D (Scoped) | R (Scoped) | R (Scoped), U (Scoped) | C, R, U (Scoped) | R, X (Request Vouchers) |
| **Admin** (Dezai Admin) | C, R, U, D (Global) | C, R, U, D (Global) | C, R, U, D (Global) | C, R, U, D (Global) | C, R, U, D (Global) | C, R, U, D (Global) | C, R, U, D, X (Mint/Issue) |

*Note: Scoped indicates that the access is strictly isolated to the admin's home institution (Section 1.1).*

---

## 2. Test Specifications

### 2.1 Negative Authorization Tests (Bypass Prevention)
These tests ensure that restricted endpoints reject unauthorized roles with `403 Forbidden` or `401 Unauthorized`.

| Test ID | Resource | Actor Role | Action Tried | Target Endpoint | Expected Status | Blueprint Ref |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-RBAC-NEG-001** | Quiz Question Bank | Student | Create Question Bank | `POST /api/assessments/question-banks` | `403 Forbidden` | Section 5.1 |
| **TC-RBAC-NEG-002** | Quiz Question Bank | Student | Delete Question | `DELETE /api/assessments/questions/:id` | `403 Forbidden` | Section 5.1 |
| **TC-RBAC-NEG-003** | Leaderboard | Student | Freeze Leaderboard | `POST /api/leaderboards/freeze` | `403 Forbidden` | Section 8.1 & 2.3 |
| **TC-RBAC-NEG-004** | Voucher Issuance | Student | Mint Voucher | `POST /api/credentials/vouchers/mint` | `403 Forbidden` | Section 2.1 |
| **TC-RBAC-NEG-005** | Voucher Issuance | Faculty | Mint Voucher | `POST /api/credentials/vouchers/mint` | `403 Forbidden` | Section 2.1 |
| **TC-RBAC-NEG-006** | Course Content | Anonymous | Create Program | `POST /api/programs` | `401 Unauthorized` | Section 8.2 |
| **TC-RBAC-NEG-007** | University Registry | Faculty | Registry Sync | `POST /api/universities/sync` | `403 Forbidden` | Section 1.1 |

---

## 2.2 Cross-University Isolation Tests (Multi-Tenancy)
Under the Section 1.1 cross-institutional model, users from University A must have zero visibility or write capability over University B's tenant data.

| Test ID | Actor Tenant | Target Tenant | Resource | Action Tried | Target Route | Expected Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-TEN-ISO-001** | Student (Uni A) | Uni B | Leaderboard | Read Uni B Board | `GET /api/analytics/programs/:uniB_programId` | `403 Forbidden` |
| **TC-TEN-ISO-002** | Faculty (Uni A) | Uni B | Question Bank | Read Uni B Bank | `GET /api/assessments/question-banks/:uniB_bankId` | `403 Forbidden` |
| **TC-TEN-ISO-003** | Faculty (Uni A) | Uni B | Quiz Pool | Edit Uni B Quiz | `PUT /api/assessments/:uniB_assessmentId` | `403 Forbidden` |
| **TC-TEN-ISO-004** | Uni Admin (Uni A) | Uni B | Student Profile | Read Uni B Student | `GET /api/users/:uniB_studentId` | `403 Forbidden` |
| **TC-TEN-ISO-005** | Uni Admin (Uni A) | Uni B | Registry Row | Sync Uni B Registry | `POST /api/universities/sync/:uniB_id` | `403 Forbidden` |

---

## 2.3 Session & Token Vulnerability Tests
Validates the backend token handling mechanics (JWT structure, signature verification, and expiration check).

| Test ID | Token Scenario | Details | Target Route | Expected Status | Blueprint Ref |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-TOK-VUL-001** | Expired Token | JWT `exp` timestamp is in the past | `GET /api/users/me` | `401 Unauthorized` | Section 8.2 |
| **TC-TOK-VUL-002** | Tampered Signature | JWT payload is modified (e.g. changing role from `STUDENT` to `DEZAI_ADMIN`) with invalid signature | `POST /api/assessments/question-banks` | `401 Unauthorized` | Section 8.2 |
| **TC-TOK-VUL-003** | Token Reuse Across Roles | Valid token of Student A used to access Student B's custom AI chat session context | `POST /api/ai-mentor/sessions/:sessionB_Id/context` | `403 Forbidden` | Section 8.2 |
| **TC-TOK-VUL-004** | Empty Authorization Header | Request submitted without `Authorization` bearer token header | `GET /api/notifications` | `401 Unauthorized` | Section 8.2 |
| **TC-TOK-VUL-005** | Malformed Header | Header formatted as `Authorization: Basic [hash]` or `Authorization: Bearer malformed...` | `GET /api/users/me` | `401 Unauthorized` | Section 8.2 |
