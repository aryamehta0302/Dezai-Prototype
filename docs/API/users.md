# Users & Faculty Profile API — Dezai Backend

> **Base URL**: `/api/users`
> **Auth**: All endpoints require a valid `Bearer <JWT>` token in the `Authorization` header.

---

## Endpoints

---

### 1. `GET /api/users/faculty/profile`

**Description**: Retrieves the full profile of the authenticated faculty member, including personal information, university affiliation, and status.

**Auth Required**: Yes
**Roles**: `FACULTY`

**Example Request**:
```http
GET /api/users/faculty/profile
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "id": "fac-1a2b...",
  "userId": "usr-8a9b...",
  "department": "Computer Science",
  "designation": "Associate Professor",
  "verificationStatus": "APPROVED",
  "user": {
    "name": "Jane Doe",
    "email": "jane@university.edu",
    "institution": {
      "id": "inst-3c4d...",
      "name": "Stanford University"
    }
  }
}
```

---

### 2. `PATCH /api/users/faculty/profile`

**Description**: Updates the authenticated faculty member's profile fields. Specifically, this updates the user's `name` in the global `User` table, and the `department` and `designation` fields in the `FacultyMember` table in a single atomic database transaction.

**Auth Required**: Yes
**Roles**: `FACULTY`

**Request Body**:
```json
{
  "name": "Prof. Jane Doe",
  "department": "Computer Science & Engineering",
  "designation": "Professor"
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "profile": {
    "id": "fac-1a2b...",
    "userId": "usr-8a9b...",
    "department": "Computer Science & Engineering",
    "designation": "Professor",
    "verificationStatus": "APPROVED"
  }
}
```

**Error Responses**:
| Status | Reason |
|---|---|
| `400 Bad Request` | Validation failed (e.g., name too short, invalid field types) |
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | User does not have the FACULTY role |
| `404 Not Found` | Faculty profile not found |

---

### 3. `GET /api/users/faculty/dashboard`

**Description**: Retrieves overview stats for the authenticated faculty member's console dashboard.

**Auth Required**: Yes
**Roles**: `FACULTY`

**Example Request**:
```http
GET /api/users/faculty/dashboard
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "totalPrograms": 4,
  "totalStudents": 25,
  "pendingAttempts": 2,
  "verificationStatus": "APPROVED"
}
```

---

## Data Sources

| Field | Source Table | Description |
|---|---|---|
| `name` | `users` | Global name of the user account |
| `department` | `faculty_members` | Department of the faculty member |
| `designation` | `faculty_members` | Designation of the faculty member |
| `verificationStatus` | `faculty_members` | Status: `PENDING`, `APPROVED`, `REJECTED` |

---

## Backend Files

| Type | File Path |
|---|---|
| Service | `backend/src/modules/users/services/users.service.ts` |
| Controller | `backend/src/modules/users/controllers/users.controller.ts` |
| Module | `backend/src/modules/users/users.module.ts` |
