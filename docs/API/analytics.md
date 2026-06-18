# Analytics API — Dezai Backend

> **Base URL**: `/api/analytics`
> **Auth**: All endpoints require a valid `Bearer <JWT>` token in the `Authorization` header.
> **Allowed Roles**: `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`

---

## Endpoints

---

### 1. `GET /api/analytics/faculty`

**Description**: Returns aggregate analytics for the currently logged-in faculty member's programs.
The faculty user is identified automatically from the JWT token — no params needed.

**Auth Required**: Yes
**Roles**: `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`

**Example Request**:
```http
GET /api/analytics/faculty
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "totalStudents": 42,
    "activeStudents": 28,
    "completionRate": 67
  }
}
```

**Field Definitions**:
| Field | Type | Description |
|---|---|---|
| `totalStudents` | `number` | All students enrolled in any of this faculty's programs |
| `activeStudents` | `number` | Students whose `lastActiveAt` is within the last 30 days |
| `completionRate` | `number` | Percentage of enrollments where `completedAt` is set (0–100) |

**Error Responses**:
| Status | Reason |
|---|---|
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | User does not have the required role |
| `404 Not Found` | Logged-in user has no `FacultyMember` profile |

---

### 2. `GET /api/analytics/programs/:id`

**Description**: Returns aggregate analytics for a specific Program by its UUID.

**Auth Required**: Yes
**Roles**: `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`

**URL Params**:
| Param | Type | Description |
|---|---|---|
| `id` | `string (UUID)` | The Program's unique identifier |

**Example Request**:
```http
GET /api/analytics/programs/3f7a1c88-9b2e-4d71-a8e3-0c5b12f3d901
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "programId": "3f7a1c88-9b2e-4d71-a8e3-0c5b12f3d901",
    "programTitle": "Machine Learning Fundamentals",
    "totalEnrollments": 100,
    "activeLearners": 73,
    "completionPercent": 45,
    "totalXp": 12500
  }
}
```

**Field Definitions**:
| Field | Type | Description |
|---|---|---|
| `programId` | `string` | The UUID of the program |
| `programTitle` | `string` | Title of the program |
| `totalEnrollments` | `number` | Total students enrolled in this program |
| `activeLearners` | `number` | Students active in the last 30 days |
| `completionPercent` | `number` | % of enrollments with `completedAt` set (0–100) |
| `totalXp` | `number` | Sum of all XP transactions for enrolled students |

**Error Responses**:
| Status | Reason |
|---|---|
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | User does not have the required role |
| `404 Not Found` | Program with the given ID does not exist |

---

### 3. `GET /api/analytics/programs/:id/students`

**Description**: Returns a per-student metrics table for all students enrolled in a specific Program.
Useful for faculty to see each student's progress, XP, and institution at a glance.

**Auth Required**: Yes
**Roles**: `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`

**URL Params**:
| Param | Type | Description |
|---|---|---|
| `id` | `string (UUID)` | The Program's unique identifier |

**Example Request**:
```http
GET /api/analytics/programs/3f7a1c88-9b2e-4d71-a8e3-0c5b12f3d901/students
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "programId": "3f7a1c88-9b2e-4d71-a8e3-0c5b12f3d901",
    "programTitle": "Machine Learning Fundamentals",
    "institutionName": "IIT Bombay",
    "totalStudents": 3,
    "students": [
      {
        "userId": "a1b2c3d4-...",
        "name": "Aanya Sharma",
        "email": "aanya@example.com",
        "institution": "IIT Bombay",
        "progress": 72,
        "xp": 350,
        "lastActiveAt": "2026-06-15T10:30:00.000Z",
        "enrolledAt": "2026-05-01T00:00:00.000Z",
        "completedAt": null
      },
      {
        "userId": "e5f6g7h8-...",
        "name": "Rohan Mehta",
        "email": "rohan@example.com",
        "institution": "IIT Bombay",
        "progress": 100,
        "xp": 650,
        "lastActiveAt": "2026-06-16T08:15:00.000Z",
        "enrolledAt": "2026-05-01T00:00:00.000Z",
        "completedAt": "2026-06-10T14:00:00.000Z"
      }
    ]
  }
}
```

**Top-Level Response Fields**:
| Field | Type | Description |
|---|---|---|
| `programId` | `string` | UUID of the program |
| `programTitle` | `string` | Title of the program |
| `institutionName` | `string` | Institution that owns this program (`"Unknown Institution"` if missing) |
| `totalStudents` | `number` | Total number of enrolled students |
| `students` | `StudentMetricDto[]` | Array of per-student metric objects |

**Student Object Fields**:
| Field | Type | Description |
|---|---|---|
| `userId` | `string` | Student's unique user ID |
| `name` | `string` | Student's name (`"Unknown"` if null) |
| `email` | `string` | Student's email address |
| `institution` | `string` | Institution name (same as `institutionName` above) |
| `progress` | `number` | Completion progress 0–100 |
| `xp` | `number` | Total XP earned by this student |
| `lastActiveAt` | `string \| null` | ISO timestamp of last activity |
| `enrolledAt` | `string` | ISO timestamp of enrollment |
| `completedAt` | `string \| null` | ISO timestamp of completion, or `null` if not done |

**Edge Cases**:
- If a program has zero enrollments, `students` will be an empty array `[]` and `totalStudents` will be `0`.
- `name` will return `"Unknown"` if the user's name is null.
- `institution` will return `"Unknown Institution"` if the institution data is missing.

**Error Responses**:
| Status | Reason |
|---|---|
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | User does not have the required role |
| `404 Not Found` | Program with the given ID does not exist |

---

### 4. `GET /api/analytics/faculty/extended`

**Description**: Returns extended metrics and cohort diagnostics for the currently logged-in faculty member: total programs count, total students count, active students count, average program completion rate, top 5 performing students (leaderboard), low-progress/weak students list (focus alerts), and modules with low assessment pass rates (difficult modules).

**Auth Required**: Yes
**Roles**: `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`

**Example Request**:
```http
GET /api/analytics/faculty/extended
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "totalPrograms": 4,
    "totalStudents": 25,
    "activeStudents": 18,
    "completionRate": 36,
    "topStudents": [
      {
        "userId": "usr-8a9b...",
        "name": "Jane Doe",
        "email": "jane@university.edu",
        "xp": 1250,
        "progress": 85,
        "programTitle": "Advanced Deep Learning"
      }
    ],
    "weakStudents": [
      {
        "userId": "usr-3c4d...",
        "name": "John Smith",
        "email": "john@university.edu",
        "xp": 50,
        "progress": 12,
        "programTitle": "Generative AI for Leaders"
      }
    ],
    "difficultModules": [
      {
        "moduleId": "mod-9e8f...",
        "moduleTitle": "Neural Architecture",
        "programTitle": "Advanced Deep Learning",
        "passRate": 45,
        "averageScore": 62,
        "totalAttempts": 15
      }
    ]
  }
}
```

---

### 5. `GET /api/analytics/faculty/activity`

**Description**: Returns a unified, chronological activity feed of student events within programs taught by the faculty. Includes recent enrollments, program/micro-credential completions, and assessment attempt completions/submissions (limited to top 15 items).

**Auth Required**: Yes
**Roles**: `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`

**Example Request**:
```http
GET /api/analytics/faculty/activity
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": "attempt-att-5f6g...",
      "type": "SUBMISSION",
      "timestamp": "2026-06-18T12:30:00.000Z",
      "studentName": "Jane Doe",
      "programTitle": "Neural Architecture Quiz",
      "detail": "Submitted assessment \"Neural Architecture Quiz\" — Score: 87% (PASSED)"
    },
    {
      "id": "enrollment-enr-2a3b...",
      "type": "ENROLLMENT",
      "timestamp": "2026-06-18T10:15:00.000Z",
      "studentName": "John Smith",
      "programTitle": "Generative AI for Leaders",
      "detail": "Enrolled in \"Generative AI for Leaders\""
    }
  ]
}
```

---

## Data Sources

| Metric | Source Table | Key Fields |
|---|---|---|
| Total / Active Students | `enrollments`, `users` | `Enrollment.programId`, `User.lastActiveAt` |
| Completion Rate / % | `enrollments` | `Enrollment.completedAt`, `Enrollment.progress` |
| Total XP | `xp_transactions` | `XpTransaction.amount`, `XpTransaction.userId` |
| Student Name | `users` | `User.name` |
| Institution | `institutions` | `Institution.name` via `Program.institutionId` |
| Progress % | `enrollments` | `Enrollment.progress` (0–100, stored integer) |

---

## Backend Files

| Type | File Path |
|---|---|
| Service | `backend/src/modules/analytics/services/analytics.service.ts` |
| Controller | `backend/src/modules/analytics/controllers/analytics.controller.ts` |
| Module | `backend/src/modules/analytics/analytics.module.ts` |
