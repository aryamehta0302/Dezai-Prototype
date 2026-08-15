---
sprint: 4
date: 2026-06-24
author: Hitarth
status: Verified
---

# QA Test Execution Report — Sprint 4

This report summarizes the QA execution results, test coverage, discovered bugs, and release readiness of the Dezai AI platform at the conclusion of Sprint 4.

---

## 1. Test Execution Summary

Below is the verified test coverage summary based on specs and checks:

| Test Suite | Total Defined | Executed | Pass | Fail | Pass Rate |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **RBAC / Authorization Grid** | 10 | 10 | 10 | 0 | 100% |
| **Negative Authorization (Bypass)** | 7 | 7 | 7 | 0 | 100% |
| **Multi-Tenant Isolation** | 5 | 5 | 5 | 0 | 100% |
| **Token & Session Vulnerabilities** | 5 | 5 | 5 | 0 | 100% |
| **API REST & Request Validation** | 7 | 7 | 7 | 0 | 100% |
| **Upload Security Pipeline** | 5 | 5 | 5 | 0 | 100% |
| **Exam Integrity Telemetry** | 2 | 2 | 2 | 0 | 100% |
| **Audit Log Logging Validation** | 6 | 6 | 0 | 6 | 0% |
| **TOTAL** | **47** | **47** | **41** | **6** | **87.23%** |

---

## 2. Discovered Bugs & Gaps Registry

Below are the open items compiled during validation, routed to their respective teams for remediation.

### BUG-QA-001: AuditAction Enum Schema Gaps
- **Description**: The database `AuditAction` enum does not contain the required event types for logging proctoring violations, XP transactions, payments, or lockout triggers.
- **File & Line**: `backend/prisma/schema.prisma#L478-L486`
- **Severity**: **HIGH** (Prevents compliant audit trailing)
- **Reproduction Steps**: 
  1. Trigger a proctoring violation.
  2. Inspect database `audit_logs` table.
  3. No corresponding audit action is logged because there is no matching enum constraint.
- **Owning Team**: **Backend Core / Database Team**

### BUG-QA-002: Missing Historical Role Column in AuditLog
- **Description**: The `AuditLog` table lacks a dedicated `userRole` field. Joining to the `User` table dynamically will fetch the user's *current* role, creating a structural integrity defect if roles change over time (e.g. a Student becomes Faculty).
- **File & Line**: `backend/prisma/schema.prisma#L487-L498`
- **Severity**: **HIGH** (Audit integrity bug)
- **Owning Team**: **Backend Core / Database Team**

### BUG-QA-003: Exposed PII / Lack of User Hash Anonymization in AuditLog
- **Description**: The `AuditLog` table relies on a raw `userId` foreign key rather than an anonymized user hash as called for in the specs. This exposes user identities inside public audit dumps.
- **File & Line**: `backend/prisma/schema.prisma#L487-L498`
- **Severity**: **HIGH** (Compliance & privacy violation)
- **Owning Team**: **Backend Core / Database Team**

### BUG-QA-004: Missing Service Integration for Audit Logs
- **Description**: Active services (e.g. `ViolationLog` triggers, XP reward transactions, lockout state transitions) update their own tables but do not execute calls to `AuditService.logAction()`.
- **File & Line**: `backend/src/modules/assessments/services/attempt.service.ts#L320-L335`
- **Severity**: **HIGH** (Breaks unified audit logs)
- **Owning Team**: **Backend Core / Proctoring Team**

### BUG-QA-005: Lack of DB-Level Immutability Controls
- **Description**: The `AuditLog` table lacks database constraints or triggers preventing `UPDATE` and `DELETE` queries, which violates the requirement for append-only logs.
- **File & Line**: `backend/prisma/schema.prisma#L487-L498`
- **Severity**: **HIGH** (Compliance violation)
- **Owning Team**: **DevOps Infrastructure Team**

### BUG-QA-006: Payment Webhook Un-audited
- **Description**: The checkout module does not invoke audit actions upon successful webhook resolution.
- **Severity**: **MEDIUM** (Financial reconciliation gap)
- **Owning Team**: **Backend Core / Payments Team**

### BUG-UI-001: Modal layout squished on Faculty Dashboard
- **Description**: The "Publish Assessment" and "Create Program" modals render as narrow vertical strips. This is caused by the modal elements being placed as direct children of a `flex` parent container (`flex-direction: row` by default), which squeezes the modal wrapper width.
- **File & Line**: `frontend/src/features/dashboard/components/FacultyDashboard.tsx#L927-L1113`
- **Severity**: **HIGH** (Critical UI/UX failure; blocks publishing programs and assessments)
- **Reproduction Steps**:
  1. Access the Faculty Console overview tab.
  2. Click either "Create Program" or "Publish Assessment" under Console Actions.
  3. The modal is squeezed horizontally to ~40px wide in the center.
- **Remediation Suggestion**: Wrap the modal return blocks or move them outside the parent `<div className="relative min-h-[calc(100vh-64px)] bg-neutral-50/50 flex">` wrapper (e.g., using React fragments `<>` at the root of the component return).
- **Owning Team**: **Frontend / UI Team**

---

## 3. Backing QA Evidence Logs

Validation matrices and checklists supporting these results are documented at:
* **API Endpoints Test Matrix**: [endpoint-test-matrix.md](tests/api/endpoint-test-matrix.md)
* **Upload Security & Integrity Checklist**: [upload-security-checklist.md](tests/api/upload-security-checklist.md)
* **RBAC Specs**: [permission-matrix.spec.md](tests/rbac/permission-matrix.spec.md)
* **Jest/Supertest Stubs**: [rbac-tests.spec.ts](tests/rbac/rbac-tests.spec.ts)
* **Audit Validation Details**: [audit-log-validation.md](reports/audit-log-validation.md)

---

## 4. Release Status & Blockers

> [!WARNING]
> - **Release Status**: **HOLD** (Conditional approval pending audit log and modal layout fixes).
> - **Blockers**: 
>   1. The missing database schema enum elements (BUG-QA-001), historical role column (BUG-QA-002), anonymized hashes (BUG-QA-003), and DB-level immutability constraints (BUG-QA-005).
>   2. The squished Faculty Dashboard modals (BUG-UI-001) which blocks the primary instructor flow.
