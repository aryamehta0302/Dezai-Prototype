# Notifications API Documentation

This document describes the API endpoints, authorization rules, request parameters, and response structures for the Dezai Notifications module.

---

## Architecture and General Rules

* **Security & Ownership:** A user can only access or modify their own notifications. All read/write operations filter by both `userId` and `notificationId`. Trying to read or write a notification belonging to another user will result in a `404 Not Found` response.
* **Archiving Policy:** In line with Dezai terminology, notifications are **archived** (not deleted, not hidden). Archived notifications are excluded from the default inbox and are not affected by the "mark all read" action.
* **Ordering:** All notification lists are sorted by `createdAt` in descending order (newest first).
* **Unread Badge Count:** Every list retrieval returns the current count of unread, non-archived notifications (`unreadCount`), ensuring the UI badge is always synchronized.

---

## Endpoint Directory

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications` | JWT | Fetch notification inbox (supports legacy and new formats, with filtering) |
| PATCH | `/api/notifications/mark-all-read` | JWT | Mark all active notifications as read |
| POST | `/api/notifications/read-all` | JWT | Legacy: Mark all active notifications as read |
| POST | `/api/notifications` | JWT | Utility: Create a new notification for test/triggers |
| PATCH | `/api/notifications/:id/read` | JWT | Mark a single notification as read |
| PATCH | `/api/notifications/:id/unread` | JWT | Mark a single notification as unread |
| PATCH | `/api/notifications/:id/archive` | JWT | Archive a single notification |

---

## Endpoints Detailed Specification

### 1. Get Notifications Inbox
Retrieve notifications for the authenticated user, filtered by status.

* **Method:** `GET`
* **Route:** `/api/notifications`
* **Query Parameters:**
  * `filter` (string, optional):
    * `all` (default) — Returns all active (non-archived) notifications.
    * `unread` — Returns active, unread (`read: false`, `archived: false`) notifications only.
    * `archived` — Returns archived (`archived: true`) notifications only.
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "notifications": [
      {
        "id": "a0e1c2d3-b4e5-6f7a-8b9c-0d1e2f3a4b5c",
        "title": "New Milestone Unlocked",
        "message": "Congratulations! You earned the 'Fast Learner' badge.",
        "type": "CREDENTIAL",
        "read": false,
        "archived": false,
        "createdAt": "2026-06-18T12:00:00.000Z"
      }
    ],
    "data": {
      "total": 1,
      "unreadCount": 1,
      "notifications": [
        {
          "id": "a0e1c2d3-b4e5-6f7a-8b9c-0d1e2f3a4b5c",
          "title": "New Milestone Unlocked",
          "message": "Congratulations! You earned the 'Fast Learner' badge.",
          "type": "CREDENTIAL",
          "read": false,
          "archived": false,
          "createdAt": "2026-06-18T12:00:00.000Z"
        }
      ]
    }
  }
  ```

---

### 2. Mark All as Read (PATCH)
Mark all non-archived, unread notifications for the authenticated user as read.

* **Method:** `PATCH`
* **Route:** `/api/notifications/mark-all-read`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "updatedCount": 5
    }
  }
  ```

---

### 3. Mark All as Read (POST - Legacy)
Legacy endpoint used by the frontend console to mark all notifications as read.

* **Method:** `POST`
* **Route:** `/api/notifications/read-all`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "All notifications marked as read"
  }
  ```

---

### 4. Create Notification (Utility)
Create a new notification. Mainly used by other backend modules to trigger events, or for administrative triggers/testing.

* **Method:** `POST`
* **Route:** `/api/notifications`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Request Body:**
  ```json
  {
    "userId": "usr-8a9b...",
    "title": "Review Required",
    "message": "Assessment Neural Architecture Quiz requires review.",
    "type": "ALERT"
  }
  ```
* **Success Response (201 Created):**
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
      "archived": false,
      "createdAt": "2026-06-18T13:45:00.000Z"
    }
  }
  ```

---

### 5. Mark Single Notification as Read
Mark a single notification as read.

* **Method:** `PATCH`
* **Route:** `/api/notifications/:id/read`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Path Parameters:**
  * `id` (string, required) — The unique UUID of the notification.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "notification": {
      "id": "a0e1c2d3-b4e5-6f7a-8b9c-0d1e2f3a4b5c",
      "userId": "usr-8a9b...",
      "title": "New Milestone Unlocked",
      "message": "Congratulations! You earned the 'Fast Learner' badge.",
      "type": "CREDENTIAL",
      "read": true,
      "archived": false,
      "createdAt": "2026-06-18T12:00:00.000Z"
    },
    "data": {
      "id": "a0e1c2d3-b4e5-6f7a-8b9c-0d1e2f3a4b5c",
      "read": true,
      "archived": false
    }
  }
  ```
* **Error Responses:**
  * `404 Not Found` (when the notification does not exist or does not belong to the user):
    ```json
    {
      "statusCode": 404,
      "message": "Notification with ID \"a0e1c2d3-b4e5-6f7a-8b9c-0d1e2f3a4b5c\" not found",
      "error": "Not Found"
    }
    ```

---

### 6. Mark Single Notification as Unread
Mark a single notification as unread.

* **Method:** `PATCH`
* **Route:** `/api/notifications/:id/unread`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Path Parameters:**
  * `id` (string, required) — The unique UUID of the notification.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "a0e1c2d3-b4e5-6f7a-8b9c-0d1e2f3a4b5c",
      "read": false,
      "archived": false
    }
  }
  ```

---

### 7. Archive Single Notification
Set the `archived` status of a notification to `true`. Archived notifications are hidden from the standard inbox but can be queried using `?filter=archived`.

* **Method:** `PATCH`
* **Route:** `/api/notifications/:id/archive`
* **Headers:** `Authorization: Bearer <JWT_TOKEN>`
* **Path Parameters:**
  * `id` (string, required) — The unique UUID of the notification.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "a0e1c2d3-b4e5-6f7a-8b9c-0d1e2f3a4b5c",
      "read": false,
      "archived": true
    }
  }
  ```
