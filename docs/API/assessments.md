# Dezai API — Assessment Engine

**Base URL:** `/api/assessments`  
**Auth:** All endpoints require a valid JWT Bearer token.  
**Roles:** Write operations require `FACULTY`, `UNIVERSITY_ADMIN`, or `DEZAI_ADMIN`.

---

## Question Banks

### `GET /api/assessments/question-banks`

List all question banks, optionally filtered by institution.

**Auth:** JWT only  
**Query Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `institutionId` | string (UUID) | No | Filter by institution |

**Response:**
```json
{
  "success": true,
  "questionBanks": [
    {
      "id": "uuid",
      "title": "Data Structures MCQs",
      "description": "...",
      "institutionId": "uuid",
      "facultyId": "uuid",
      "createdAt": "2026-01-01T00:00:00.000Z",
      "updatedAt": "2026-01-01T00:00:00.000Z",
      "institution": { "name": "MIT", "logoUrl": "..." },
      "faculty": { "user": { "name": "Dr. Smith" } },
      "_count": { "questions": 120 }
    }
  ]
}
```

---

### `GET /api/assessments/question-banks/:id`

Get a single question bank with all its questions and options.

**Auth:** JWT only  
**URL Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `id` | string (UUID) | Question bank ID |

**Response:**
```json
{
  "success": true,
  "questionBank": {
    "id": "uuid",
    "title": "...",
    "description": "...",
    "questions": [
      {
        "id": "uuid",
        "text": "What is a binary tree?",
        "category": "Trees",
        "timerSeconds": 60,
        "options": [
          { "id": "uuid", "text": "A tree with max 2 children", "isCorrect": true },
          { "id": "uuid", "text": "A tree with max 3 children", "isCorrect": false }
        ]
      }
    ],
    "_count": { "questions": 120 }
  }
}
```

---

### `POST /api/assessments/question-banks`

Create a new question bank.

**Auth:** JWT + `FACULTY` / `UNIVERSITY_ADMIN` / `DEZAI_ADMIN`  
**Request Body:**
```json
{
  "title": "Data Structures MCQs",
  "description": "Question bank for DS module assessments",
  "institutionId": "uuid (optional, auto-resolved for FACULTY/UNIVERSITY_ADMIN)"
}
```

**Response:** `200 OK` — Full question bank object

---

### `PUT /api/assessments/question-banks/:id`

Update an existing question bank. Requires ownership.

**Auth:** JWT + `FACULTY` / `UNIVERSITY_ADMIN` / `DEZAI_ADMIN` + ownership check  
**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

**Response:** `200 OK` — Updated question bank object

---

### `DELETE /api/assessments/question-banks/:id`

Delete a question bank. Cascade deletes all questions and options.

**Auth:** JWT + `FACULTY` / `UNIVERSITY_ADMIN` / `DEZAI_ADMIN` + ownership check  
**Response:**
```json
{ "success": true, "message": "Question bank deleted" }
```

---

## Questions

### `POST /api/assessments/question-banks/:bankId/questions`

Add a question with options to a question bank.

**Auth:** JWT + `FACULTY` / `UNIVERSITY_ADMIN` / `DEZAI_ADMIN` + bank ownership  
**Request Body:**
```json
{
  "text": "What is the time complexity of binary search?",
  "category": "Algorithms",
  "timerSeconds": 90,
  "options": [
    { "text": "O(log n)", "isCorrect": true },
    { "text": "O(n)", "isCorrect": false },
    { "text": "O(n²)", "isCorrect": false },
    { "text": "O(1)", "isCorrect": false }
  ]
}
```

**Validation Rules:**
- `text` — required, non-empty string
- `options` — required, minimum 2 options
- `timerSeconds` — optional, 5–600 seconds (default: 60)

**Response:** `200 OK` — Created question with options

---

### `PUT /api/assessments/questions/:questionId`

Update a question's text, category, or timer.

**Auth:** JWT + `FACULTY` / `UNIVERSITY_ADMIN` / `DEZAI_ADMIN`  
**Request Body:**
```json
{
  "text": "Updated question text",
  "category": "Updated Category",
  "timerSeconds": 120
}
```

**Response:** `200 OK` — Updated question with options

---

### `DELETE /api/assessments/questions/:questionId`

Delete a question. Cascade deletes all option rows.

**Auth:** JWT + `FACULTY` / `UNIVERSITY_ADMIN` / `DEZAI_ADMIN`  
**Response:**
```json
{ "success": true, "message": "Question deleted" }
```

---

### `POST /api/assessments/questions/:questionId/duplicate`

Deep copy a question and all its options. Appends "(Copy)" to the question text.

**Auth:** JWT + `FACULTY` / `UNIVERSITY_ADMIN` / `DEZAI_ADMIN`  
**Response:** `200 OK` — The duplicated question with options

---

## Assessments

### `GET /api/assessments/modules/:moduleId`

List all assessments for a specific module.

**Auth:** JWT only  
**Response:**
```json
{
  "success": true,
  "assessments": [
    {
      "id": "uuid",
      "moduleId": "uuid",
      "questionBankId": "uuid",
      "title": "Module 1 Assessment",
      "passingScore": 80,
      "sampleSize": 15,
      "questionBank": {
        "id": "uuid",
        "title": "DS MCQs",
        "_count": { "questions": 120 }
      }
    }
  ]
}
```

---

### `GET /api/assessments/:id`

Get a single assessment with its linked question bank.

**Auth:** JWT only  
**Response:**
```json
{
  "success": true,
  "assessment": {
    "id": "uuid",
    "title": "Module 1 Assessment",
    "passingScore": 80,
    "sampleSize": 15,
    "module": { "id": "uuid", "title": "Module 1" },
    "questionBank": {
      "id": "uuid",
      "title": "DS MCQs",
      "_count": { "questions": 120 }
    }
  }
}
```

---

### `POST /api/assessments`

Create a new assessment. **Enforces the 100-question gate**: the referenced QuestionBank must have ≥ 100 questions.

**Auth:** JWT + `FACULTY` / `UNIVERSITY_ADMIN` / `DEZAI_ADMIN`  
**Request Body:**
```json
{
  "moduleId": "uuid",
  "questionBankId": "uuid",
  "title": "Module 1 Assessment",
  "passingScore": 80,
  "sampleSize": 15
}
```

**Error — Insufficient Questions:**
```json
{
  "statusCode": 400,
  "message": "Question bank must have at least 100 questions to create an assessment. Current count: 47"
}
```

**Response:** `200 OK` — Full assessment object. Logs `ASSESSMENT_PUBLISHED` audit event.

---

### `PUT /api/assessments/:id`

Update an assessment's title, passing score, or sample size.

**Auth:** JWT + `FACULTY` / `UNIVERSITY_ADMIN` / `DEZAI_ADMIN`  
**Request Body:**
```json
{
  "title": "Updated Assessment Title",
  "passingScore": 75,
  "sampleSize": 20
}
```

**Response:** `200 OK` — Updated assessment object

---

### `DELETE /api/assessments/:id`

Delete an assessment.

**Auth:** JWT + `FACULTY` / `UNIVERSITY_ADMIN` / `DEZAI_ADMIN`  
**Response:**
```json
{ "success": true, "message": "Assessment deleted" }
```

---

## Dynamic Question Selection

### `GET /api/assessments/:id/questions/select`

Dynamically select a randomized subset of questions from the assessment's question bank. Each call produces a **unique permutation** — no two students see the same order.

**Auth:** JWT only  
**Algorithm:** Fisher-Yates shuffle on the full pool → slice `sampleSize` → independently shuffle each question's options.

**Response:**
```json
{
  "success": true,
  "selection": {
    "assessmentId": "uuid",
    "assessmentTitle": "Module 1 Assessment",
    "sampleSize": 15,
    "totalAvailable": 120,
    "questions": [
      {
        "id": "uuid",
        "text": "What is a linked list?",
        "category": "Data Structures",
        "timerSeconds": 60,
        "options": [
          { "id": "uuid", "text": "A linear data structure" },
          { "id": "uuid", "text": "A tree structure" }
        ]
      }
    ]
  }
}
```

> **Note:** `isCorrect` is intentionally excluded from the response to prevent leaking answers.

---

## Faculty Analytics

### `GET /api/assessments/:id/analytics`

Get performance analytics for an assessment based on completed attempts.

**Auth:** JWT + `FACULTY` / `UNIVERSITY_ADMIN` / `DEZAI_ADMIN`  
**Response:**
```json
{
  "success": true,
  "analytics": {
    "total": 45,
    "passRate": 73.33,
    "averageScore": 78.5,
    "highestScore": 100,
    "lowestScore": 20
  }
}
```

---

---

## Assessment Attempt Lifecycle

### `POST /api/assessments/attempts/start`

Start a new assessment attempt. Checks attempt limits (maximum 3 free attempts), initializes an active proctoring session if one does not exist, and creates an in-progress attempt log.

**Auth:** JWT + `STUDENT`  
**Request Body:**
```json
{
  "assessmentId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "attemptId": "uuid",
  "sessionId": "uuid",
  "startedAt": "2026-06-18T12:00:00.000Z",
  "warningsCount": 0,
  "scoreDeduction": 0,
  "lockoutUntil": null,
  "status": "ACTIVE",
  "assessmentId": "uuid",
  "assessmentTitle": "Strategic AI Leadership",
  "passingScore": 80,
  "sampleSize": 15,
  "totalAvailable": 120,
  "questions": [
    {
      "id": "uuid",
      "text": "Question Text",
      "category": "Ethics",
      "options": [
        { "id": "uuid", "text": "Option A" },
        { "id": "uuid", "text": "Option B" }
      ]
    }
  ]
}
```

---

### `GET /api/assessments/attempts/:id/resume`

Resume an in-progress assessment attempt. Returns the same question selection and option shuffles (seeded by the attempt ID) and recalculates the remaining time.

**Auth:** JWT + `STUDENT`  
**Response:** `200 OK`
```json
{
  "success": true,
  "attemptId": "uuid",
  "sessionId": "uuid",
  "startedAt": "2026-06-18T12:00:00.000Z",
  "warningsCount": 1,
  "scoreDeduction": 0,
  "lockoutUntil": null,
  "status": "ACTIVE",
  "remainingTime": 1420,
  "answers": {
    "question-uuid": "option-uuid"
  },
  "questions": [...]
}
```

---

### `POST /api/assessments/attempts/:id/auto-save`

Autosave the student's selected answers during the attempt. Updates or inserts option selections programmatically.

**Auth:** JWT + `STUDENT`  
**Request Body:**
```json
{
  "answers": {
    "question-uuid-1": "option-uuid-A",
    "question-uuid-2": "option-uuid-D"
  }
}
```

**Response:**
```json
{ "success": true }
```

---

### `POST /api/assessments/attempts/:id/submit`

Grade and submit the attempt. Resolves the scores percentage, applies proctoring deductions from the warning history, completes the session, and awards 100 XP if it is the first passing attempt.

**Auth:** JWT + `STUDENT`  
**Response:**
```json
{
  "success": true,
  "attemptId": "uuid",
  "score": 85,
  "passed": true
}
```

---

### `GET /api/assessments/attempts/:id/result`

Get a detailed completed attempt results breakdown with option selections, correct options, and category explanations.

**Auth:** JWT + `STUDENT`  
**Response:**
```json
{
  "success": true,
  "attemptId": "uuid",
  "assessmentTitle": "Strategic AI Leadership",
  "score": 85,
  "passed": true,
  "startedAt": "2026-06-18T12:00:00.000Z",
  "completedAt": "2026-06-18T12:15:00.000Z",
  "breakdown": [
    {
      "questionId": "uuid",
      "text": "What is the primary advantage of transformer architecture?",
      "category": "Deep Learning",
      "options": [...],
      "selectedOptionId": "opt-uuid-A",
      "selectedOptionText": "Parallelization",
      "correctOptionId": "opt-uuid-A",
      "correctOptionText": "Parallelization",
      "isCorrect": true,
      "explanation": "Concept category: Deep Learning. Review this topic to master the question context."
    }
  ]
}
```

---

### `GET /api/assessments/attempts/history/:assessmentId`

Get all of the student's completed attempts for an assessment.

**Auth:** JWT + `STUDENT`  
**Response:**
```json
{
  "success": true,
  "attempts": [
    {
      "id": "uuid",
      "userId": "uuid",
      "assessmentId": "uuid",
      "score": 85,
      "passed": true,
      "startedAt": "2026-06-18T12:00:00.000Z",
      "completedAt": "2026-06-18T12:15:00.000Z"
    }
  ]
}
```

---

## Faculty Result Management

### `GET /api/assessments/:id/results`

Retrieve all student attempts, scores, and proctoring violations for an assessment (Faculty tracking).

**Auth:** JWT + `FACULTY` / `UNIVERSITY_ADMIN` / `DEZAI_ADMIN`  
**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "uuid",
      "studentName": "John Doe",
      "studentEmail": "john@university.edu",
      "score": 85,
      "passed": true,
      "startedAt": "2026-06-18T12:00:00.000Z",
      "completedAt": "2026-06-18T12:15:00.000Z",
      "violationCount": 1
    }
  ]
}
```

---

## Recommendations Engine

### `GET /api/assessments/recommendations/next-module/:programId`

Get the next incomplete module and its first incomplete lesson in sequential order for a program.

**Auth:** JWT + `STUDENT`  
**Response:**
```json
{
  "success": true,
  "nextModule": {
    "moduleId": "uuid",
    "moduleTitle": "Core AI Frameworks",
    "moduleOrder": 1,
    "trackType": "ROOTS",
    "firstIncompleteLesson": {
      "id": "uuid",
      "title": "Introduction to Transformers",
      "order": 1
    },
    "completedLessonsCount": 0,
    "totalLessonsCount": 5
  }
}
```

---

### `GET /api/assessments/recommendations/continue-learning`

Get the continue learning dashboard widget payload containing the user's most recently active module details.

**Auth:** JWT + `STUDENT`  
**Response:**
```json
{
  "success": true,
  "programId": "uuid",
  "programTitle": "Strategic AI Leadership",
  "moduleId": "uuid",
  "moduleTitle": "Core AI Frameworks",
  "moduleOrder": 1,
  "trackType": "ROOTS",
  "firstIncompleteLesson": {
    "id": "uuid",
    "title": "Introduction to Transformers"
  },
  "completedLessonsCount": 2,
  "totalLessonsCount": 5,
  "completed": false
}
```

---

### `GET /api/assessments/recommendations/ready-assessments`

Get assessments linked to modules where the user has completed all lessons but has not passed the assessment yet.

**Auth:** JWT + `STUDENT`  
**Response:**
```json
{
  "success": true,
  "assessments": [
    {
      "assessmentId": "uuid",
      "assessmentTitle": "Module 1 Assessment",
      "moduleId": "uuid",
      "moduleTitle": "Core AI Frameworks",
      "passingScore": 80
    }
  ]
}
```

---

### `GET /api/assessments/faculty-insights/stream`

Establish a Server-Sent Events (SSE) connection pushing real-time student cohort at-risk alerts. Updates are computed and pushed every 10 seconds.

**Auth:** JWT + `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`  
**Query Parameters:** None  
**Headers:**
- `Accept: text/event-stream`
- `Authorization: Bearer <JWT>`

**Success Event Stream Chunk:**
```json
data: {
  "timestamp": "2026-07-06T12:00:00.000Z",
  "summary": {
    "totalAtRisk": 2,
    "totalLowProgress": 4,
    "totalInactive": 1,
    "totalStudentsMonitored": 18
  },
  "alerts": [
    {
      "type": "INACTIVE",
      "userId": "3f7a1c88-9b2e-4d71-a8e3-0c5b12f3d901",
      "userName": "John Doe",
      "detail": "Inactive for 9 days"
    },
    {
      "type": "AT_RISK",
      "userId": "2a6b2c89-0d3e-5f72-b8f4-1c6b22f4d902",
      "userName": "Sarah Smith",
      "detail": "Repeated quiz failures (2+ attempts)"
    }
  ]
}
```

---

## Ownership Rules

| Role | Access Rule |
|---|---|
| `DEZAI_ADMIN` | Bypasses all ownership checks |
| `UNIVERSITY_ADMIN` | Must belong to the same institution as the QuestionBank |
| `FACULTY` | Must belong to the same institution as the QuestionBank |
| `STUDENT` | Read-only access to assessments and question selection |
