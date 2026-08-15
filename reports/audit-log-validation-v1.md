---
sprint: 5
date: 2026-07-01
author: Hitarth
status: Verified
---

# Audit Log Validation Report (V1)

This report evaluates the logging system against the requirement to log every state-changing event with a timestamp, user hash, role, action, and before/after states (where applicable).

---

## 1. Audit Log Database Structure Analysis

The database model is mapped via Prisma in `backend/prisma/schema.prisma`:

```prisma
model AuditLog {
  id        String      @id @default(uuid())
  userId    String?
  userHash  String      @default("")
  userRole  UserRole    @default(STUDENT)
  action    AuditAction
  details   String?     // Description or JSON metadata
  ipAddress String?
  createdAt DateTime    @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@map("audit_logs")
}
```

The `userHash` (SHA-256 with salt) and `userRole` columns have been verified to capture context dynamically at the time of the action, satisfying the PII/privacy anonymization requirement.

---

## 2. Event Validation Audit Matrix

Below is the verification status for each defined `AuditAction` enum value in `schema.prisma`:

| Event | Enum Value | Wired? | File:Line | Status |
| :--- | :--- | :---: | :--- | :--- |
| **User Login** | `LOGIN` | **YES** | `auth.controller.ts:63` | **PASS** |
| **Role Change / Onboarding** | `ROLE_CHANGED` | **YES** | `auth.service.ts:113` | **PASS** |
| **Program Creation** | `PROGRAM_CREATED` | **YES** | `programs.service.ts:194` | **PASS** |
| **Program Mutation** | `PROGRAM_UPDATED` | **YES** | `programs.service.ts:208,218` | **PASS** |
| **Assessment Publishing** | `ASSESSMENT_PUBLISHED` | **YES** | `assessment.service.ts:168,186,...` | **PASS** |
| **Credential Issuance** | `CREDENTIAL_ISSUED` | **YES** | `credentials.service.ts:48,79` | **PASS** |
| **Profile Mutation** | `PROFILE_UPDATED` | **YES** | `users.service.ts:191` | **PASS** |
| **Institution Creation** | `INSTITUTION_CREATED` | **YES** | `institutions.service.ts:122` | **PASS** |
| **Institution Mutation** | `INSTITUTION_UPDATED` | **YES** | `institutions.service.ts:136` | **PASS** |
| **Faculty Verification** | `FACULTY_VERIFIED` | **YES** | `institutions.service.ts:224` | **PASS** |
| **Enrollment Creation** | `ENROLLMENT_CREATED` | **YES** | `enrollment.service.ts:45` | **PASS** |
| **Lesson Creation** | `LESSON_CREATED` | **YES** | `learning.service.ts:76` | **PASS** |
| **Lesson Mutation** | `LESSON_UPDATED` | **YES** | `learning.service.ts:94` | **PASS** |
| **Lesson Completion** | `LESSON_COMPLETED` | **YES** | `learning.service.ts:168` | **PASS** |
| **Chat Session Creation** | `CHAT_SESSION_CREATED` | **YES** | `chat.service.ts:33` | **PASS** |
| **Chat Session Deletion** | `CHAT_SESSION_DELETED` | **YES** | `chat.service.ts:72` | **PASS** |
| **Notification Sent** | `NOTIFICATION_SENT` | **YES** | `notifications.service.ts:252` | **PASS** |
| **Bookmark Toggled** | `BOOKMARK_TOGGLED` | **YES** | `learning.service.ts:288` | **PASS** |
| **Note Created** | `NOTE_CREATED` | **YES** | `learning.service.ts:309` | **PASS** |
| **Proctoring Violation** | `PROCTORING_VIOLATION` | **NO** | - | **FAIL** (Med severity; logged in ViolationLog but not AuditLog) |
| **XP Reward Awarded** | `XP_AWARDED` | **NO** | - | **FAIL** (Low severity) |
| **XP Transaction** | `XP_TRANSACTION` | **NO** | - | **FAIL** (Low severity) |
| **XP Milestone Unlock** | `XP_THRESHOLD_UNLOCKED` | **NO** | - | **FAIL** (Low severity) |
| **Payment Received** | `PAYMENT_RECEIVED` | **NO** | - | **FAIL** (Med severity) |
| **Access Granted** | `ACCESS_GRANTED` | **NO** | - | **FAIL** (Low severity) |
| **Leaderboard Freeze** | `LEADERBOARD_FROZEN` | **NO** | - | **FAIL** (Low severity) |
| **Voucher Issued** | `VOUCHER_ISSUED` | **NO** | - | **FAIL** (Low severity) |
| **Exam Lockout Triggered** | `EXAM_LOCKOUT_TRIGGERED` | **NO** | - | **FAIL** (Med severity) |
| **Question Bank Created** | `QUESTION_BANK_CREATED` | **NO** | - | **FAIL** (Low severity) |
| **Question Bank Updated** | `QUESTION_BANK_UPDATED` | **NO** | - | **FAIL** (Low severity) |
| **Question Bank Deleted** | `QUESTION_BANK_DELETED` | **NO** | - | **FAIL** (Low severity) |

---

## 3. Core Focus Areas Sign-off

### 3.1 Credential Revocation
- **Status**: **PASS**
- **Details**: Every status update (e.g. patching to `REVOKED`) is handled by `CredentialsService.changeCredentialStatus` which triggers a `logAction` call with the actor's ID and status details.

### 3.2 Assessment Publishing
- **Status**: **PASS**
- **Details**: Handled inside `AssessmentService` which consistently triggers `logAction` under `AuditAction.ASSESSMENT_PUBLISHED` upon creation or status changes.

---

## 4. Closure of Sprint 4 Bugs

- **BUG-QA-001** (AuditAction Enum Schema Gaps): **CLOSED**. The enum in `schema.prisma` now includes all 31 actions.
- **BUG-QA-002** (Missing Historical Role Column): **CLOSED**. `userRole` column added and dynamically populated.
- **BUG-QA-003** (Exposed PII / Lack of User Hash): **CLOSED**. SHA-256 `userHash` implemented using environment salt.
