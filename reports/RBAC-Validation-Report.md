---
sprint: 4
date: 2026-06-24
author: Hitarth
status: Verified
---

# RBAC & Multi-Tenancy Validation Report

This report documents the validation results for Role-Based Access Control (RBAC), session vulnerability checks, and cross-university tenant isolation (Section 1.1).

---

## 1. Permission Matrix Validation Outcomes

Every resource endpoint was validated using mock and active role tokens. The outcomes verify that role boundaries are strictly enforced:

| Test ID | Resource Category | Action | Role | Status | Evidence Reference |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **TC-RBAC-001** | Course Content | CRUD | Student | **PASS** | Rejected with `403 Forbidden` |
| **TC-RBAC-002** | Course Content | CRUD | Faculty | **PASS** | Allowed: Scoped CRUD |
| **TC-RBAC-003** | Course Content | CRUD | Uni Admin | **PASS** | Allowed: Scoped CRUD |
| **TC-RBAC-004** | Course Content | CRUD | Dezai Admin | **PASS** | Allowed: Global CRUD |
| **TC-RBAC-005** | Question Bank | CRUD | Student | **PASS** | Rejected with `403 Forbidden` |
| **TC-RBAC-006** | Question Bank | CRUD | Faculty | **PASS** | Allowed: Scoped CRUD |
| **TC-RBAC-007** | Leaderboard | Freeze | Student | **PASS** | Rejected with `403 Forbidden` |
| **TC-RBAC-008** | Leaderboard | Freeze | Faculty | **PASS** | Allowed: Scoped freeze |
| **TC-RBAC-009** | Vouchers | Mint | Student | **PASS** | Rejected with `403 Forbidden` |
| **TC-RBAC-010** | Vouchers | Mint | Faculty | **PASS** | Rejected with `403 Forbidden` |

---

## 2. Negative Authorization Tests (Bypass Prevention)

These tests confirm that restricted routes reject unauthorized access:

| Test ID | Scenario | Expected | Result | Status |
| :--- | :--- | :--- | :---: | :---: |
| **TC-RBAC-NEG-001** | Student creating Question Bank | `403 Forbidden` | `403 Forbidden` | **PASS** |
| **TC-RBAC-NEG-002** | Student deleting Question | `403 Forbidden` | `403 Forbidden` | **PASS** |
| **TC-RBAC-NEG-003** | Student freezing Leaderboard | `403 Forbidden` | `403 Forbidden` | **PASS** |
| **TC-RBAC-NEG-004** | Student minting Voucher | `403 Forbidden` | `403 Forbidden` | **PASS** |
| **TC-RBAC-NEG-005** | Faculty minting Voucher | `403 Forbidden` | `403 Forbidden` | **PASS** |
| **TC-RBAC-NEG-006** | Anonymous creating Program | `401 Unauthorized` | `401 Unauthorized` | **PASS** |
| **TC-RBAC-NEG-007** | Faculty syncing Registry | `403 Forbidden` | `403 Forbidden` | **PASS** |

---

## 3. Multi-Tenant Isolation Results (Section 1.1)

Cross-university isolation tests were executed to ensure that University A users cannot view or mutate University B data.

| Test ID | Actor Scope | Target Scope | Action Tried | Expected | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **TC-TEN-ISO-001** | Student (Uni A) | Uni B | Read Leaderboard | `403 Forbidden` | **PASS** |
| **TC-TEN-ISO-002** | Faculty (Uni A) | Uni B | Read Question Bank | `403 Forbidden` | **PASS** |
| **TC-TEN-ISO-003** | Faculty (Uni A) | Uni B | Edit Quiz | `403 Forbidden` | **PASS** |
| **TC-TEN-ISO-004** | Uni Admin (Uni A) | Uni B | Read Student Profile | `403 Forbidden` | **PASS** |
| **TC-TEN-ISO-005** | Uni Admin (Uni A) | Uni B | Sync Registry | `403 Forbidden` | **PASS** |

---

## 4. Session & Token Vulnerability Audit

These tests validate the security of JWT authentication handles:

| Test ID | Scenario | Expected | Result | Status |
| :--- | :--- | :--- | :---: | :---: |
| **TC-TOK-VUL-001** | Expired Token | `401 Unauthorized` | `401 Unauthorized` | **PASS** |
| **TC-TOK-VUL-002** | Tampered Signature | `401 Unauthorized` | `401 Unauthorized` | **PASS** |
| **TC-TOK-VUL-003** | Token Reuse (Cross-Session) | `403 Forbidden` | `403 Forbidden` | **PASS** |
| **TC-TOK-VUL-004** | Empty Authorization Header | `401 Unauthorized` | `401 Unauthorized` | **PASS** |
| **TC-TOK-VUL-005** | Malformed Basic Header | `401 Unauthorized` | `401 Unauthorized` | **PASS** |

---

## 5. Role Sign-Off Matrix & Release Status

> [!IMPORTANT]
> **Conditional Sign-off Clause**: RBAC and Multi-Tenant components are approved for release and verified safe. However, overall platform release remains blocked pending audit-logging structure corrections and frontend modal layout fixes (see [QA-Report-Sprint-4.md](reports/QA-Report-Sprint-4.md)).

- **Student Role**: **SIGN-OFF (CONDITIONAL)** (All routes, dashboards, and quiz submissions are secure and restricted).
- **Faculty Role**: **SIGN-OFF (CONDITIONAL)** (Authorized for scoped CRUD and dashboard analytics).
- **Partner-University Admin**: **SIGN-OFF (CONDITIONAL)** (Authorized for scoped university sync and profile viewing).
- **Dezai Admin**: **SIGN-OFF (CONDITIONAL)** (Authorized for global adjustments and voucher management).
