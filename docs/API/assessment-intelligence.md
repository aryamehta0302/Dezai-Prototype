# Assessment Intelligence API — Sprint 6

> **Developer:** Manan Panchal · **Branch:** `feature/assessment-intelligence`

All endpoints are prefixed with `/api/assessments/`.

---

## Student Endpoints (STUDENT role)

### GET `/intelligence/my-weak-topics?assessmentId=:id`

Per-student weak topics for a specific assessment. A "weak topic" is a question category where the student's wrong-answer rate exceeds 40%.

**Guard:** `JwtAuthGuard`, `RolesGuard(STUDENT)`

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `assessmentId` | string (UUID) | Yes | Assessment to analyse |

**Response:**
```json
{
  "success": true,
  "weakTopics": [
    {
      "category": "Data Structures",
      "totalAnswered": 10,
      "totalWrong": 6,
      "wrongRate": 0.6,
      "isWeak": true,
      "difficulty": "MEDIUM"
    }
  ]
}
```

---

### GET `/intelligence/my-weak-topics/global`

Per-student weak topics across ALL assessments they have attempted.

**Guard:** `JwtAuthGuard`, `RolesGuard(STUDENT)`

**Response:** Same shape as above.

---

### GET `/intelligence/my-incorrect-analysis?assessmentId=:id`

Which specific questions the student gets wrong most, with distractor analysis (most commonly selected wrong option).

**Guard:** `JwtAuthGuard`, `RolesGuard(STUDENT)`

**Response:**
```json
{
  "success": true,
  "analysis": [
    {
      "questionId": "uuid",
      "questionText": "What is...",
      "category": "Algorithms",
      "difficulty": "HARD",
      "timesAnsweredWrong": 3,
      "timesAnswered": 4,
      "wrongRate": 0.75,
      "mostSelectedWrongOptionText": "Option B text"
    }
  ]
}
```

---

### GET `/intelligence/my-topic-accuracy-timeline?assessmentId=:id`

Per-category accuracy over time — one data point per attempt. Supports trend chart rendering.

**Guard:** `JwtAuthGuard`, `RolesGuard(STUDENT)`

**Response:**
```json
{
  "success": true,
  "timeline": [
    {
      "category": "Data Structures",
      "dataPoints": [
        {
          "attemptId": "uuid",
          "attemptDate": "2026-06-20T10:00:00.000Z",
          "accuracyRate": 0.4
        },
        {
          "attemptId": "uuid",
          "attemptDate": "2026-06-22T10:00:00.000Z",
          "accuracyRate": 0.7
        }
      ]
    }
  ]
}
```

---

### GET `/intelligence/my-topic-improvement?assessmentId=:id`

First attempt vs latest attempt accuracy delta per category.

**Guard:** `JwtAuthGuard`, `RolesGuard(STUDENT)`

**Response:**
```json
{
  "success": true,
  "improvement": [
    {
      "category": "Data Structures",
      "firstAttemptAccuracy": 0.4,
      "latestAttemptAccuracy": 0.7,
      "delta": 0.3,
      "improved": true
    }
  ]
}
```

---

## Faculty Endpoints (FACULTY role)

All faculty endpoints validate ownership through the Assessment → Module → Track → Program → Faculty chain.

### GET `/:assessmentId/intelligence/weak-topics`

Aggregated weak topics across all students for an assessment.

**Guard:** `JwtAuthGuard`, `RolesGuard(FACULTY)` + ownership validation

**Response:**
```json
{
  "success": true,
  "weakTopics": [
    {
      "category": "Data Structures",
      "affectedStudents": 15,
      "totalStudents": 40,
      "affectedRate": 0.375,
      "averageWrongRate": 0.52
    }
  ]
}
```

---

### GET `/:assessmentId/analytics/difficulty-breakdown`

Performance breakdown grouped by question difficulty (EASY/MEDIUM/HARD).

**Guard:** `JwtAuthGuard`, `RolesGuard(FACULTY)` + ownership validation

**Response:**
```json
{
  "success": true,
  "difficultyBreakdown": {
    "EASY": { "totalQuestions": 30, "totalAnswered": 120, "correctAnswers": 108, "accuracyRate": 0.9 },
    "MEDIUM": { "totalQuestions": 50, "totalAnswered": 200, "correctAnswers": 140, "accuracyRate": 0.7 },
    "HARD": { "totalQuestions": 20, "totalAnswered": 80, "correctAnswers": 32, "accuracyRate": 0.4 }
  }
}
```

---

### GET `/:assessmentId/analytics/trend`

Assessment performance over time — aggregated per calendar date.

**Guard:** `JwtAuthGuard`, `RolesGuard(FACULTY)` + ownership validation

**Response:**
```json
{
  "success": true,
  "trend": [
    {
      "date": "2026-06-20",
      "attemptsOnDate": 12,
      "averageScoreOnDate": 72.5,
      "passRateOnDate": 0.75
    }
  ]
}
```

---

### GET `/:assessmentId/analytics/performance-report`

Full performance report combining pass rate, difficulty breakdown, trend, and top 5 missed questions.

**Guard:** `JwtAuthGuard`, `RolesGuard(FACULTY)` + ownership validation

**Response:**
```json
{
  "success": true,
  "report": {
    "assessmentId": "uuid",
    "assessmentTitle": "Module 1 Assessment",
    "totalAttempts": 150,
    "uniqueStudents": 45,
    "overallPassRate": 0.73,
    "overallAverageScore": 71.2,
    "difficultyBreakdown": { "EASY": {}, "MEDIUM": {}, "HARD": {} },
    "trend": [],
    "topMissedQuestions": [],
    "generatedAt": "2026-06-23T10:00:00.000Z"
  }
}
```

---

### GET `/analytics/faculty-insight-summary`

Summary of all assessments owned by the faculty member, with trend direction (UP/DOWN/STABLE).

**Guard:** `JwtAuthGuard`, `RolesGuard(FACULTY)`

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalAssessments": 5,
    "totalAttempts": 320,
    "totalStudents": 80,
    "overallPassRate": 0.68,
    "assessments": [
      {
        "assessmentId": "uuid",
        "assessmentTitle": "Module 1 Assessment",
        "moduleTitle": "Core AI Frameworks",
        "totalAttempts": 64,
        "passRate": 0.72,
        "averageScore": 74.5,
        "trendDirection": "UP"
      }
    ]
  }
}
```

---

## Admin Endpoints (UNIVERSITY_ADMIN / DEZAI_ADMIN)

### GET `/analytics/institution-summary?institutionId=:id`

Institution-level assessment aggregation.

**Guard:** `JwtAuthGuard`, `RolesGuard(UNIVERSITY_ADMIN, DEZAI_ADMIN)`

**Response:**
```json
{
  "success": true,
  "summary": {
    "institutionId": "uuid",
    "totalAssessments": 20,
    "totalAttempts": 1200,
    "totalStudentsAttempted": 300,
    "institutionPassRate": 0.71,
    "topPerformingAssessment": { "id": "uuid", "title": "Assessment A", "passRate": 0.95 },
    "lowestPerformingAssessment": { "id": "uuid", "title": "Assessment B", "passRate": 0.42 }
  }
}
```

---

*Sprint 6 · Assessment Intelligence API Documentation*
*Developer: Manan Panchal · Generated: 2026-06-23*
