# Assessment Results & Analytics API — Sprint 5

> **Base URL:** `/api/assessments`  
> **Authentication:** All endpoints require JWT Bearer token  
> **Developer:** Manan Panchal · Sprint 5 — Experience & Validation Sprint

---

## Endpoints Overview

| # | Method | Route | Auth | Description |
|---|---|---|---|---|
| 1 | GET | `/attempts/:attemptId/result` | JWT + STUDENT/FACULTY | Get full attempt result with question breakdown |
| 2 | GET | `/:assessmentId/attempts/history` | JWT + STUDENT/FACULTY | Get attempt history for an assessment |
| 3 | GET | `/attempts/my-history` | JWT + STUDENT | Get all attempts across all assessments |
| 4 | GET | `/:assessmentId/attempt-status` | JWT + STUDENT | Get remaining attempts & status |
| 5 | GET | `/:assessmentId/result-analytics` | JWT + FACULTY | Faculty analytics: pass rate, score distribution |
| 6 | GET | `/:assessmentId/missed-questions-analytics` | JWT + FACULTY | Faculty analytics: per-question wrong rates |

---

## 1. Get Attempt Result

```
GET /api/assessments/attempts/:attemptId/result
```

**Auth:** JWT + `STUDENT` (own attempt only) or `FACULTY` (via ownership chain validation)

### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `attemptId` | `string (UUID)` | Yes | The attempt to retrieve |

### Success Response (200)

```typescript
{
  attemptId: string;
  assessmentTitle: string;
  score: number;              // raw correct count
  percentage: number;         // (score / sampleSize) * 100, rounded to 2dp
  passed: boolean;
  passingScore: number;       // from Assessment.passingScore
  totalQuestions: number;     // from Assessment.sampleSize
  timeTaken: number;          // completedAt - startedAt in seconds
  startedAt: DateTime;
  completedAt: DateTime;
  questions: {
    questionId: string;
    questionText: string;
    selectedOptionId: string | null;
    selectedOptionText: string | null;
    isCorrect: boolean;
    correctOptionId: string;
    correctOptionText: string;
  }[];
}
```

### Error Responses

| Status | Condition |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Student attempting to view another student's result |
| `400` | Attempt is not yet completed |
| `404` | Attempt not found |

---

## 2. Get Assessment Attempt History

```
GET /api/assessments/:assessmentId/attempts/history
```

**Auth:** JWT + `STUDENT` (own history) or `FACULTY` (all students, via ownership validation)

### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `assessmentId` | `string (UUID)` | Yes | The assessment to get history for |

### Success Response (200)

```typescript
{
  assessmentId: string;
  assessmentTitle: string;
  totalAttempts: number;
  attempts: {
    attemptId: string;
    score: number;
    percentage: number;
    passed: boolean;
    startedAt: DateTime;
    completedAt: DateTime | null;
  }[];
}
```

### Error Responses

| Status | Condition |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Faculty does not own this assessment |
| `404` | Assessment not found |

---

## 3. Get My History (All Assessments)

```
GET /api/assessments/attempts/my-history
```

**Auth:** JWT + `STUDENT` — always scoped to the requesting user

### Success Response (200)

```typescript
{
  userId: string;
  attempts: {
    attemptId: string;
    assessmentId: string;
    assessmentTitle: string;
    moduleTitle: string;
    score: number;
    percentage: number;
    passed: boolean;
    startedAt: DateTime;
    completedAt: DateTime | null;
  }[];
}
```

### Error Responses

| Status | Condition |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Non-STUDENT role |

---

## 4. Get Attempt Status

```
GET /api/assessments/:assessmentId/attempt-status
```

**Auth:** JWT + `STUDENT`

### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `assessmentId` | `string (UUID)` | Yes | The assessment to check status for |

### Success Response (200)

```typescript
{
  assessmentId: string;
  attemptsUsed: number;
  attemptsRemaining: number;    // MAX_ATTEMPTS_DEFAULT (3) - attemptsUsed
  maxAttempts: number;          // 3
  hasActiveAttempt: boolean;    // any attempt with completedAt == null
  activeAttemptId: string | null;
  canAttempt: boolean;          // !hasActiveAttempt && attemptsRemaining > 0
  bestScore: number | null;     // highest score across completed attempts
  bestPercentage: number | null;
  everPassed: boolean;
}
```

### Error Responses

| Status | Condition |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Non-STUDENT role |
| `404` | Assessment not found |

---

## 5. Get Result Analytics (Faculty)

```
GET /api/assessments/:assessmentId/result-analytics
```

**Auth:** JWT + `FACULTY` + assessment ownership validation

### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `assessmentId` | `string (UUID)` | Yes | The assessment to get analytics for |

### Success Response (200)

```typescript
{
  assessmentId: string;
  totalAttempts: number;         // all completed attempts
  uniqueStudents: number;        // distinct userIds
  averageScore: number;
  averagePercentage: number;
  passRate: number;              // (passedAttempts / totalAttempts) * 100
  passedAttempts: number;
  failedAttempts: number;
  scoreDistribution: {
    range: string;               // "0-20%", "21-40%", "41-60%", "61-80%", "81-100%"
    count: number;
  }[];
}
```

### Error Responses

| Status | Condition |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Faculty does not own this assessment / non-FACULTY role |
| `404` | Assessment not found |

---

## 6. Get Missed Questions Analytics (Faculty)

```
GET /api/assessments/:assessmentId/missed-questions-analytics
```

**Auth:** JWT + `FACULTY` + assessment ownership validation

### Path Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| `assessmentId` | `string (UUID)` | Yes | The assessment to analyze |

### Success Response (200)

```typescript
{
  assessmentId: string;
  questions: {
    questionId: string;
    questionText: string;
    category: string | null;     // from QuestionBankQuestion.category
    totalAnswered: number;
    totalWrong: number;
    wrongRate: number;           // (totalWrong / totalAnswered) * 100
  }[];
  // Sorted by wrongRate DESC (hardest questions first)
}
```

### Error Responses

| Status | Condition |
|---|---|
| `401` | Missing or invalid JWT |
| `403` | Faculty does not own this assessment / non-FACULTY role |
| `404` | Assessment not found |

---

## Business Rules

### Attempt Limits (Task 2)

- `MAX_ATTEMPTS_DEFAULT = 3` — hardcoded until Assessment model gets a `maxAttempts` field
- A student may **not** start a new attempt if:
  - An in-progress attempt exists (`completedAt IS NULL`) → `409 Conflict`
  - Attempt count ≥ 3 → `403 Forbidden`
- A **passed** attempt does NOT block further attempts (students can re-attempt for improvement)

### XP Award

- 100 XP awarded via `XpService.awardXp(userId, XpType.ASSESSMENT_PASS)` on **first pass only**
- Subsequent passes do not re-award XP

### Credential Eligibility (Task 5)

- After a student passes an assessment, the system checks if they've completed all assessments in the track
- If all modules' assessments are passed → a `Notification` (type: `CREDENTIAL`) is created for the student
- An `AuditLog` (action: `CREDENTIAL_ISSUED`) is created to signal credential eligibility
- **No credential is issued** — that is handled by the Credentials module (Tirth Patel)

### PassFailEvaluationService (Task 3)

- Centralised scoring service: `evaluate()`, `getStatus()`, `calculatePercentage()`, `getMissedQuestions()`
- Pure computation — no database dependencies
- Used by `submitAttempt()`, result endpoints, and analytics endpoints

---

*Dezai Internal Document — Sprint 5 · API Documentation*  
*Developer: Manan Panchal · Branch: feature/assessment-completion*
