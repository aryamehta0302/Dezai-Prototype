# Notifications API — Dezai Backend

> **Base URL**: `/api/notifications`
> **Auth**: All endpoints require a valid `Bearer <JWT>` token in the `Authorization` header.

---

## Endpoints

---

### 1. `GET /api/notifications`

**Description**: Retrieves all notifications/alerts for the currently logged-in user.

**Auth Required**: Yes
**Roles**: Any authenticated user (`STUDENT`, `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`)

**Example Request**:
```http
GET /api/notifications
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "notifications": [
    {
      "id": "not-1a2b3c4d...",
      "userId": "usr-8a9b...",
      "title": "New Enrollment",
      "message": "Aanya Sharma has enrolled in Generative AI for Leaders.",
      "type": "SYSTEM",
      "read": false,
      "createdAt": "2026-06-18T10:15:00.000Z"
    }
  ]
}
```

---

### 2. `PATCH /api/notifications/:id/read`

**Description**: Marks a specific notification as read.

**Auth Required**: Yes
**Roles**: Any authenticated user (must own the notification)

**URL Params**:
| Param | Type | Description |
|---|---|---|
| `id` | `string (UUID)` | The notification's unique identifier |

**Example Request**:
```http
PATCH /api/notifications/not-1a2b3c4d.../read
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "notification": {
    "id": "not-1a2b3c4d...",
    "userId": "usr-8a9b...",
    "title": "New Enrollment",
    "message": "Aanya Sharma has enrolled in Generative AI for Leaders.",
    "type": "SYSTEM",
    "read": true,
    "createdAt": "2026-06-18T10:15:00.000Z"
  }
}
```

---

### 3. `POST /api/notifications/read-all`

**Description**: Marks all unread notifications for the currently logged-in user as read.

**Auth Required**: Yes
**Roles**: Any authenticated user

**Example Request**:
```http
POST /api/notifications/read-all
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### 4. `POST /api/notifications`

**Description**: Create a new notification. This is a utility endpoint mainly used by other backend modules to trigger events, or for administrative triggers/testing.

**Auth Required**: Yes
**Roles**: `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`

**Request Body**:
```json
{
  "userId": "usr-8a9b...",
  "title": "Review Required",
  "message": "Assessment Neural Architecture Quiz requires review.",
  "type": "ALERT"
}
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "notification": {
    "id": "not-9x8y7z...",
    "userId": "usr-8a9b...",
    "title": "Review Required",
    "message": "Assessment Neural Architecture Quiz requires review.",
    "type": "ALERT",
    "read": false,
    "createdAt": "2026-06-18T13:45:00.000Z"
  }
}
```

---

## Data Sources

| Field | Source Table | Description |
|---|---|---|
| `userId` | `users` | The recipient user |
| `title` | `notifications` | Subject/header of the alert |
| `message` | `notifications` | Markdown or text detail |
| `type` | `notifications` | Notification type: `SYSTEM`, `ALERT`, `PROGRAM_UPDATE`, `XP_EARNED` |
| `read` | `notifications` | Boolean flag indicating if user viewed the alert |

---

## Backend Files

| Type | File Path |
|---|---|
| Service | `backend/src/modules/notifications/services/notifications.service.ts` |
| Controller | `backend/src/modules/notifications/controllers/notifications.controller.ts` |
| Module | `backend/src/modules/notifications/notifications.module.ts` |
