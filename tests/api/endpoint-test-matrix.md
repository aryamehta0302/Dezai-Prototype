---
sprint: 4
date: 2026-06-24
author: Hitarth
status: Verified
---

# API Endpoint Validation Test Matrix

This matrix defines the validation, authorization, and rate-limiting rules for key REST endpoints across the Dezai AI platform, based on sections 2, 5, 7, and 9 of the specifications blueprint.

## 1. REST Endpoints Specification Matrix

| Endpoint | Method | Blueprint Section | Auth/Roles Allowed | Request Body Schema | Rate Limit | Error Response Shape |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/payments/checkout` | `POST` | Section 2.1 | `STUDENT` | `{ courseId: string, voucherCode?: string }` | 10 req/min | `{ statusCode: 400, message: "Invalid courseId", error: "Bad Request", timestamp: "..." }` |
| `/api/learning/xp/threshold-unlock` | `POST` | Section 2.2 | `STUDENT` | `{ thresholdId: string, itemType: "CERTIFICATE" \| "COURSE" }` | 30 req/min | `{ statusCode: 403, message: "Insufficient XP points", error: "Forbidden", timestamp: "..." }` |
| `/api/assessments/attempts/start` | `POST` | Section 5.1 | `STUDENT` | `{ assessmentId: string }` | 5 req/min | `{ statusCode: 429, message: "Lockout active: 24h cooldown", error: "Too Many Requests", timestamp: "..." }` |
| `/api/assessments/attempts/:id/submit` | `POST` | Section 5.2 | `STUDENT` | `{ answers: Array<{ questionId: string, optionId: string }>, pasteFlags: Array<{ fieldId: string, count: number }> }` | 5 req/min | `{ statusCode: 400, message: "Malformatted response object", error: "Bad Request", timestamp: "..." }` |
| `/api/ai-mentor/chat` | `POST` | Section 7 | `STUDENT` | `{ message: string, sessionId: string }` | 60 req/min | `{ statusCode: 401, message: "Unauthorized token", error: "Unauthorized", timestamp: "..." }` |
| `/api/ai-mentor/summary` | `POST` | Section 7 / 9 | `STUDENT`, `FACULTY` | `{ lessonId: string, length: "short" \| "detailed" }` | 20 req/min | `{ statusCode: 404, message: "Lesson not found", error: "Not Found", timestamp: "..." }` |
| `/api/leaderboards/freeze` | `POST` | Section 2.3 / 8 | `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN` | `{ programId: string, cohortId: string }` | 5 req/min | `{ statusCode: 403, message: "Insufficient privileges", error: "Forbidden", timestamp: "..." }` |

---

## 2. Global Validation Specifications

### 2.1 Authentication & Authorization Header Enforcement
- **Constraint**: Every endpoint requires the `Authorization: Bearer <JWT>` header (except public catalog/verification).
- **Validation Route**: A global `JwtAuthGuard` intercepts incoming requests. If the header is missing, malformed, or has an expired token, the API returns:
  ```json
  {
    "statusCode": 401,
    "message": "Unauthorized",
    "error": "Unauthorized",
    "timestamp": "2026-06-24T07:09:17.000Z"
  }
  ```
- **RBAC Check**: A `RolesGuard` matches the user's role extracted from the decrypted JWT payload against the roles declared via the `@Roles()` decorator. If missing privileges, the API returns:
  ```json
  {
    "statusCode": 403,
    "message": "Forbidden resource",
    "error": "Forbidden",
    "timestamp": "2026-06-24T07:09:17.000Z"
  }
  ```

### 2.2 Schema & Payload Validation
- **Constraint**: Payloads are validated against a global `ValidationPipe` leveraging `class-validator` and `zod` schema resolvers.
- **Fail Pattern**: Sending unexpected datatypes or missing fields returns `400 Bad Request` with an array of specific constraints:
  ```json
  {
    "statusCode": 400,
    "message": [
      "courseId must be a UUID",
      "courseId should not be empty"
    ],
    "error": "Bad Request",
    "timestamp": "2026-06-24T07:09:17.000Z"
  }
  ```

### 2.3 Rate Limiting / Throttling Shape
- **Constraint**: Throttling guards configured via NestJS `ThrottlerModule` return `429 Too Many Requests` when limits are exceeded.
- **Payload Shape**:
  ```json
  {
    "statusCode": 429,
    "message": "Throttling limit exceeded. Please try again in 55 seconds.",
    "error": "Too Many Requests",
    "timestamp": "2026-06-24T07:09:17.000Z"
  }
  ```
