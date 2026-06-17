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

## Ownership Rules

| Role | Access Rule |
|---|---|
| `DEZAI_ADMIN` | Bypasses all ownership checks |
| `UNIVERSITY_ADMIN` | Must belong to the same institution as the QuestionBank |
| `FACULTY` | Must belong to the same institution as the QuestionBank |
| `STUDENT` | Read-only access to assessments and question selection |
