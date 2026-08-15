# Analytics API — Dezai Backend

> **Base URL**: `/api/analytics`
> **Auth**: All endpoints require a valid `Bearer <JWT>` token in the `Authorization` header.
> **Allowed Roles**: `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`

---

## Endpoints

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

---

### 4. `GET /api/analytics/faculty/extended`

**Description**: Returns extended metrics and cohort diagnostics for the currently logged-in faculty member.

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

**Description**: Returns a chronological activity feed of student events within programs taught by the faculty.

**Auth Required**: Yes
**Roles**: `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`

**Example Request**:
```http
GET /api/analytics/faculty/activity
Authorization: Bearer <your_jwt_token>
```

---

### 6. `GET /api/analytics/faculty/programs`

**Description**: Returns a simplified list of all micro-credential programs taught by the logged-in faculty member, along with institution name and enrollment counts.

**Auth Required**: Yes
**Roles**: `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`

**Example Request**:
```http
GET /api/analytics/faculty/programs
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": "prog-3f7a1c88-9b2e-...",
      "title": "Machine Learning Fundamentals",
      "institutionName": "IIT Bombay",
      "totalStudents": 42
    }
  ]
}
```

---

### 7. `GET /api/analytics/programs/:id/modules/stats`

**Description**: Calculates completion percentages for each module in a program (the percentage of enrolled students who finished all lessons within the module).

**Auth Required**: Yes
**Roles**: `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`

**URL Params**:
| Param | Type | Description |
|---|---|---|
| `id` | `string (UUID)` | The Program's unique identifier |

**Example Request**:
```http
GET /api/analytics/programs/prog-3f7a1c88-.../modules/stats
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "moduleId": "mod-a8e3-...",
      "title": "Supervised Learning",
      "completionRate": 82
    }
  ]
}
```

---

### 8. `GET /api/analytics/programs/:programId/students/:userId`

**Description**: Generates a deep learning audit log for a single student in a program. Includes lesson checklists grouped by syllabus tracks, quiz attempt history (with pass/fail states and proctoring violation counts), and detailed proctoring violation logs.

**Auth Required**: Yes
**Roles**: `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`

**URL Params**:
| Param | Type | Description |
|---|---|---|
| `programId` | `string (UUID)` | The Program's unique identifier |
| `userId` | `string (UUID)` | The Student's user identifier |

**Example Request**:
```http
GET /api/analytics/programs/prog-3f7a1c88-.../students/student-9b2e-...
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "userId": "student-9b2e-...",
    "name": "Jane Doe",
    "email": "jane@university.edu",
    "xp": 1250,
    "progress": 85,
    "syllabus": [
      {
        "trackId": "track-7a8e...",
        "trackTitle": "Core Track",
        "modules": [
          {
            "moduleId": "mod-9c8d...",
            "moduleTitle": "Neural Architecture",
            "lessons": [
              {
                "lessonId": "les-1a2b...",
                "title": "Forward Propagation Basics",
                "completed": true
              }
            ]
          }
        ]
      }
    ],
    "attempts": [
      {
        "id": "att-4f3e...",
        "assessmentId": "asm-8b2c...",
        "assessmentTitle": "Neural Architecture Quiz",
        "score": 80,
        "passed": true,
        "createdAt": "2026-06-22T14:32:00.000Z",
        "violationCount": 1
      }
    ],
    "violations": [
      {
        "id": "violation-5g6h...",
        "type": "TAB_SWITCH",
        "timestamp": "2026-06-22T14:30:15.000Z",
        "details": "User switched tabs to investigate other materials"
      }
    ]
  }
}
```

---

### 9. `GET /api/analytics/programs/:id/insights`

**Description**: Evaluates enrolled students and flags those meeting "At-Risk" criteria. Risk parameters:
- **Inactive**: No login activity in the last 7 days (`lastActiveAt` > 7 days ago).
- **Low Progress**: Overall syllabus progress is below 25%.
- **Repeated Failures**: Student has failed the same assessment 2 or more times.

Health status is calculated as:
- `CRITICAL`: Multiple risk factors or 2+ failed attempts on any quiz.
- `WARNING`: Exactly 1 risk factor.
- `HEALTHY`: No risk factors (not included in the atRiskStudents list).

**Auth Required**: Yes
**Roles**: `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`

**URL Params**:
| Param | Type | Description |
|---|---|---|
| `id` | `string (UUID)` | The Program's unique identifier |

**Example Request**:
```http
GET /api/analytics/programs/prog-3f7a1c88-.../insights
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "programId": "prog-3f7a1c88-...",
    "programTitle": "Machine Learning Fundamentals",
    "averageProgress": 42,
    "totalStudents": 25,
    "atRiskCount": 4,
    "healthyCount": 18,
    "warningCount": 3,
    "atRiskStudents": [
      {
        "userId": "student-1a2b...",
        "name": "Jane Doe",
        "email": "jane@university.edu",
        "progress": 15,
        "xp": 120,
        "lastActiveAt": "2026-06-12T10:00:00.000Z",
        "healthStatus": "CRITICAL",
        "riskReasons": [
          "Inactive for 11 days",
          "Low syllabus progress (15%)"
        ]
      }
    ]
  }
}
```

---

### 10. `POST /api/analytics/programs/:id/interventions`

**Description**: Sends a customized intervention/outreach reminder notification to an at-risk student. This creates a record of type `REMINDER` in the student's notification box and stores an action log in the database audit log.

**Auth Required**: Yes
**Roles**: `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`

**URL Params**:
| Param | Type | Description |
|---|---|---|
| `id` | `string (UUID)` | The Program's unique identifier |

**Body Parameters**:
| Param | Type | Description |
|---|---|---|
| `userId` | `string (UUID)` | Target student's user ID |
| `message` | `string` | Custom message text drafted by the faculty member |

**Example Request**:
```http
POST /api/analytics/programs/prog-3f7a1c88-.../interventions
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "userId": "student-1a2b-...",
  "message": "Hey Jane, I noticed your syllabus progress is slightly behind the cohort schedule. Let me know if you would like to schedule a one-on-one session to clear up any doubts!"
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": {
    "id": "notif-uuid-...",
    "userId": "student-1a2b-...",
    "title": "[Intervention] Outreach from your Instructor",
    "message": "Hey Jane, I noticed...",
    "type": "REMINDER",
    "read": false,
    "archived": false,
    "createdAt": "2026-06-23T10:45:00.000Z"
  }
}
```

---

### 11. `GET /api/analytics/programs/:id/interventions`

**Description**: Returns a timeline history of all sent outreach messages for students enrolled in the specified program.

**Auth Required**: Yes
**Roles**: `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`

**URL Params**:
| Param | Type | Description |
|---|---|---|
| `id` | `string (UUID)` | The Program's unique identifier |

**Example Request**:
```http
GET /api/analytics/programs/prog-3f7a1c88-.../interventions
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "data": [
    {
      "id": "notif-uuid-...",
      "studentId": "student-1a2b-...",
      "studentName": "Jane Doe",
      "studentEmail": "jane@university.edu",
      "message": "Hey Jane, I noticed...",
      "createdAt": "2026-06-23T10:45:00.000Z"
    }
  ]
}
```
