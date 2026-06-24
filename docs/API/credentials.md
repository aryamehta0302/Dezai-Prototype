# Dezai API — Credentials Engine

**Base URL:** `/api/credentials`  
**Auth:** All endpoints require a valid JWT Bearer token unless otherwise specified.  
**Roles:** Specific operations require `DEZAI_ADMIN` or `FACULTY` roles.

---

## Credential Generation

### `POST /api/credentials/generate/program`

Generate a cryptographic credential upon program completion.
*Note: This is automatically triggered internally by the `EnrollmentService` when progress reaches 100%. Manual calls will return a 400 error if the credential already exists.*

**Auth:** JWT (`system` actor if internal)  
**Request Body:**
```json
{
  "studentId": "uuid",
  "programId": "uuid",
  "institutionId": "uuid (optional)",
  "tier": "FORGE"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "id": "uuid",
  "verificationCode": "ABC123XYZ",
  "verificationUrl": "https://dezai.com/verify/ABC123XYZ",
  "hashSignature": "sha256-hash",
  "issuedAt": "2026-06-24T12:00:00.000Z"
}
```

---

### `POST /api/credentials/generate/assessment`

Generate a cryptographic credential upon passing a track assessment.
*Note: This is automatically triggered internally by the `AttemptService` when an assessment is successfully passed.*

**Auth:** JWT (`system` actor if internal)  
**Request Body:**
```json
{
  "studentId": "uuid",
  "programId": "uuid",
  "assessmentId": "uuid",
  "institutionId": "uuid (optional)",
  "tier": "FORGE"
}
```

**Response:** `201 Created` — Full credential object

---

### `POST /api/credentials/generate/mock`

Developer endpoint to fabricate mock credentials. Bypasses standard business logic.

**Auth:** JWT + `DEZAI_ADMIN`  
**Request Body:**
```json
{
  "studentId": "uuid",
  "studentName": "Mock User",
  "programTitle": "Mock Program",
  "score": 95,
  "type": "PROGRAM | ASSESSMENT | MERIT"
}
```

**Response:** `201 Created` — Mock credential object

---

## Credential Query

### `GET /api/credentials/me`

Retrieve all credentials earned by the currently authenticated user.

**Auth:** JWT only (strict authorization enforced)  
**Response:**
```json
{
  "success": true,
  "credentials": [
    {
      "id": "uuid",
      "program": { "title": "Strategic AI Leadership" },
      "institution": { "name": "Global Tech University" },
      "user": { "name": "John Doe" },
      "verificationUrl": "https://dezai.com/verify/ABC123XYZ",
      "approvalStatus": "APPROVED",
      "issuedAt": "2026-06-24T12:00:00.000Z"
    }
  ]
}
```
*Note: `email` is explicitly excluded from the `user` relation for privacy compliance.*

---

### `GET /api/credentials/:id`

Retrieve details of a specific credential by its ID.

**Auth:** JWT only  
**URL Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `id` | string (UUID) | Credential ID |

**Response:** `200 OK` — Detailed credential object

---

## Credential Verification (Public)

### `GET /api/credentials/verify/:code`

Cryptographically verify a credential's authenticity. This endpoint is public and does not require authentication.

**Auth:** Public  
**URL Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `code` | string | The 8-character verification code |

**Response:**
```json
{
  "success": true,
  "valid": true,
  "credential": {
    "id": "uuid",
    "verificationCode": "ABC123XYZ",
    "issuedAt": "2026-06-24T12:00:00.000Z",
    "metadata": {
      "type": "PROGRAM",
      "studentName": "John Doe"
    },
    "program": { "title": "Strategic AI Leadership" },
    "user": { "name": "John Doe" }
  }
}
```

---

## Credential State Management

### `PATCH /api/credentials/state/:id`

Update the lifecycle state (e.g., REVOKED, APPROVED) of a credential.

**Auth:** JWT + `DEZAI_ADMIN`  
**Request Body:**
```json
{
  "status": "REVOKED",
  "reason": "Violation of academic integrity"
}
```

**Response:** `200 OK` — Updated credential object

---

### `GET /api/credentials/state/:id/logs`

View the audit trail and lifecycle logs for a specific credential.

**Auth:** JWT + `DEZAI_ADMIN`  
**Response:**
```json
{
  "success": true,
  "logs": [
    {
      "id": "uuid",
      "action": "REVOKED",
      "actorId": "admin-system",
      "reason": "Violation of academic integrity",
      "createdAt": "2026-06-25T12:00:00.000Z"
    }
  ]
}
```
