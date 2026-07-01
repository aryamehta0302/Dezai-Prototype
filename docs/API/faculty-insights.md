# Faculty Insights & Intervention API — Sprint 6

> **Developer:** Manan Panchal · **Branch:** `feature/assessment-intelligence`

All endpoints are prefixed with `/api/assessments/`.  
All endpoints require `FACULTY` role. Faculty can only view students enrolled in their own programs.

---

## At-Risk Detection

### GET `/faculty-insights/at-risk`

Students who have failed the same assessment ≥ 2 times.

**Guard:** `JwtAuthGuard`, `RolesGuard(FACULTY)`

**Response:**
```json
{
  "success": true,
  "atRiskStudents": [
    {
      "userId": "uuid",
      "userName": "John Doe",
      "assessmentId": "uuid",
      "assessmentTitle": "Module 1 Assessment",
      "failCount": 3,
      "lastAttemptDate": "2026-06-22T10:00:00.000Z",
      "lastScore": 45
    }
  ]
}
```

---

### GET `/faculty-insights/low-progress`

Students with enrollment progress ≤ 30%.

**Guard:** `JwtAuthGuard`, `RolesGuard(FACULTY)`

**Response:**
```json
{
  "success": true,
  "lowProgressStudents": [
    {
      "userId": "uuid",
      "userName": "Jane Smith",
      "programId": "uuid",
      "programTitle": "Strategic AI Leadership",
      "progressPercent": 15,
      "enrolledAt": "2026-05-01T00:00:00.000Z",
      "daysSinceEnrollment": 53
    }
  ]
}
```

---

### GET `/faculty-insights/inactive`

Students inactive for 7+ days who are enrolled in faculty's programs.

**Guard:** `JwtAuthGuard`, `RolesGuard(FACULTY)`

**Response:**
```json
{
  "success": true,
  "inactiveStudents": [
    {
      "userId": "uuid",
      "userName": "Alex Johnson",
      "lastActiveAt": "2026-06-10T08:00:00.000Z",
      "daysInactive": 13,
      "enrolledPrograms": ["Strategic AI Leadership", "Data Science Fundamentals"]
    }
  ]
}
```

---

## Dashboard & Health

### GET `/faculty-insights/dashboard`

Combined at-risk + low-progress + inactive students with summary counts.

**Guard:** `JwtAuthGuard`, `RolesGuard(FACULTY)`

**Response:**
```json
{
  "success": true,
  "dashboard": {
    "atRiskStudents": [],
    "lowProgressStudents": [],
    "inactiveStudents": [],
    "summary": {
      "totalAtRisk": 5,
      "totalLowProgress": 12,
      "totalInactive": 8,
      "totalStudentsMonitored": 20
    }
  }
}
```

---

### GET `/faculty-insights/student/:userId/academic-health`

Composite academic health score (0–100) with risk level for a student.

**Guard:** `JwtAuthGuard`, `RolesGuard(FACULTY)` + student must be enrolled in faculty's program

**Health Score Components:**
- `assessmentPassRate` (0–100): passed / total attempts × 100
- `progressRate` (0–100): average Enrollment.progress
- `activityScore` (0–100): 100 if active today, −10 per inactive day
- `streakScore` (0–100): streakCount / 30 × 100, capped

**Risk Levels:** LOW (≥70) · MEDIUM (40–69) · HIGH (<40)

**Response:**
```json
{
  "success": true,
  "academicHealth": {
    "userId": "uuid",
    "healthScore": 62.5,
    "components": {
      "assessmentPassRate": 75,
      "progressRate": 45,
      "activityScore": 80,
      "streakScore": 50
    },
    "riskLevel": "MEDIUM"
  }
}
```

---

## Failure Detection

### GET `/faculty-insights/repeated-failures?assessmentId=:id`

Students with repeated failures, optionally scoped to one assessment.

**Guard:** `JwtAuthGuard`, `RolesGuard(FACULTY)`

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `assessmentId` | string (UUID) | No | Scope to one assessment (omit for all) |

**Response:**
```json
{
  "success": true,
  "repeatedFailures": [
    {
      "userId": "uuid",
      "userName": "John Doe",
      "assessmentId": "uuid",
      "assessmentTitle": "Module 1 Assessment",
      "totalAttempts": 3,
      "failedAttempts": 3,
      "failRate": 1.0,
      "consecutiveFailures": 3,
      "averageScore": 38.67,
      "lastAttemptDate": "2026-06-22T10:00:00.000Z"
    }
  ]
}
```

---

### GET `/:assessmentId/faculty-insights/failure-pattern`

Assessment-level failure analysis: common weak categories, difficulty concentration, and average attempts before passing.

**Guard:** `JwtAuthGuard`, `RolesGuard(FACULTY)` + ownership validation

**Response:**
```json
{
  "success": true,
  "failurePattern": {
    "assessmentId": "uuid",
    "assessmentTitle": "Module 1 Assessment",
    "studentsWithRepeatedFailures": 8,
    "averageAttemptsBeforePass": 1.5,
    "commonWeakCategories": ["Data Structures", "Algorithms", "System Design"],
    "failureConcentrationByDifficulty": {
      "EASY": 10.5,
      "MEDIUM": 45.2,
      "HARD": 44.3
    }
  }
}
```

---

## Student Detail

### GET `/faculty-insights/student/:userId/detail`

Full per-student profile combining enrollment data, assessment stats, academic health, and weak topics.

**Guard:** `JwtAuthGuard`, `RolesGuard(FACULTY)` + student must be enrolled in faculty's program

**Response:**
```json
{
  "success": true,
  "studentInsight": {
    "userId": "uuid",
    "userName": "John Doe",
    "email": "john@example.com",
    "enrolledPrograms": [
      {
        "programId": "uuid",
        "programTitle": "Strategic AI Leadership",
        "progress": 45,
        "enrolledAt": "2026-05-01T00:00:00.000Z"
      }
    ],
    "assessmentStats": {
      "totalAttempts": 8,
      "passedAttempts": 5,
      "passRate": 62.5,
      "averageScore": 68.3,
      "weakTopics": ["Data Structures", "Algorithms"]
    },
    "academicHealth": {
      "userId": "uuid",
      "healthScore": 62.5,
      "components": {},
      "riskLevel": "MEDIUM"
    },
    "xp": 450,
    "streakCount": 12,
    "lastActiveAt": "2026-06-22T10:00:00.000Z"
  }
}
```

---

## Real-time SSE Stream

### GET `/api/faculty/insights/stream`

Establishes a Server-Sent Events (SSE) connection to push real-time cohort health updates and logged intervention outreach events.

**Guard:** `JwtAuthGuard`, `RolesGuard(FACULTY, UNIVERSITY_ADMIN, DEZAI_ADMIN)`

**Event Types:**
- `HEALTH_UPDATE`: Fired when a student completes/uncompletes a lesson or submits an assessment attempt.
- `INTERVENTION_SENT`: Fired when a faculty member logs an outreach intervention.

**Sample Stream Event payload (`HEALTH_UPDATE`):**
```json
{
  "type": "HEALTH_UPDATE",
  "data": {
    "userId": "student-uuid",
    "assessmentId": "assessment-uuid",
    "passed": true,
    "score": 85,
    "studentName": "John Doe",
    "programTitle": "Strategic AI Leadership",
    "programId": "program-uuid"
  }
}
```

---

*Sprint 7 · Faculty Insights & Intervention API Documentation*
*Developer: Antigravity · Generated: 2026-06-30*
