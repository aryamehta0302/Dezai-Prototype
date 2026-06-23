# Leaderboards API Documentation

This document describes the API endpoints, authorization/role checks, parameters, and response structures for the Dezai Leaderboards module.

---

## Ranking Rules and Computations

* **Student Leaderboards:**
  * **Weekly:** Aggregated sum of `XpTransaction.amount` where `createdAt >= (now - 7 days)`.
  * **Monthly:** Aggregated sum of `XpTransaction.amount` where `createdAt >= (now - 30 days)`.
  * **All-time:** Read directly from `User.xp` running total field (high performance).
  * **Streak:** `User.streakCount` is display-only and is **never** used as a ranking criteria.
* **University Leaderboard:**
  * Aggregated sum of `User.xp` for all unique users enrolled in any program of the institution.
  * *Deduplication:* If a student is enrolled in multiple programs under the same institution, they are counted only once to prevent double-counting.
* **Program Leaderboard:**
  * Aggregated sum of `User.xp` for all enrolled students in the program.
* **Tie-Breaking Rule:** Standard competition ranking (also known as "1224" ranking). Equal XP values receive the same rank, and the next rank is skipped.
  * *Example:* If two students tie for rank 1 with 500 XP, they both get rank 1. The next student gets rank 3.
* **Active Students:** A student is considered active if their `lastActiveAt` field is within the last 30 days.
* **Fastest Completion:** The minimum difference in days between `createdAt` and `completedAt` across all enrollments. Returns `null` if no enrollments have been completed yet.
* **Limit Clamping:** All endpoints accept a `limit` query param which is clamped between `1` (minimum) and `100` (maximum) to prevent database resource exhaustion.

---

## Endpoint Directory

| Method | Route | Auth | Roles | Description |
|---|---|---|---|---|
| GET | `/api/leaderboards/students` | JWT | All | Ranked student leaderboard (weekly/monthly/all) |
| GET | `/api/leaderboards/universities` | JWT | All | Ranked institution leaderboard |
| GET | `/api/leaderboards/programs` | JWT | All | Ranked program leaderboard |
| GET | `/api/leaderboards/widgets/student` | JWT | All | Student dashboard compact top-N widget |
| GET | `/api/leaderboards/widgets/faculty` | JWT | `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN` | Faculty dashboard compact top-N widget |

---

## Endpoints Detailed Specification

### 1. Get Student Leaderboard
Retrieve a ranked list of students based on XP earned over a selected time range.

* **Method:** `GET`
* **Route:** `/api/leaderboards/students`
* **Query Parameters:**
  * `range` (string, optional) — Options: `weekly` (7 days), `monthly` (30 days), `all` (default).
  * `limit` (string, optional) — Max rows to return. Default: `50`, max: `100`.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "range": "weekly",
      "generatedAt": "2026-06-18T14:40:00.000Z",
      "total": 3,
      "entries": [
        {
          "rank": 1,
          "userId": "u1-uuid-1111-2222",
          "name": "Alice Cooper",
          "xp": 450,
          "streakCount": 5,
          "institution": "Stanford University"
        },
        {
          "rank": 2,
          "userId": "u2-uuid-3333-4444",
          "name": "Bob Marley",
          "xp": 300,
          "streakCount": 2,
          "institution": "Independent"
        },
        {
          "rank": 2,
          "userId": "u3-uuid-5555-6666",
          "name": "Charlie Chaplin",
          "xp": 300,
          "streakCount": 12,
          "institution": "Stanford University"
        }
      ]
    }
  }
  ```

---

### 2. Get University Leaderboard
Retrieve institutions ranked by the total XP of all unique students enrolled in their programs.

* **Method:** `GET`
* **Route:** `/api/leaderboards/universities`
* **Query Parameters:**
  * `limit` (string, optional) — Max rows to return. Default: `20`, max: `100`.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "generatedAt": "2026-06-18T14:40:00.000Z",
      "total": 2,
      "entries": [
        {
          "rank": 1,
          "institutionId": "inst-stanford-uuid",
          "institutionName": "Stanford University",
          "totalXp": 8500,
          "activeStudents": 45,
          "fastestCompletionDays": 12
        },
        {
          "rank": 2,
          "institutionId": "inst-mit-uuid",
          "institutionName": "MIT",
          "totalXp": 6200,
          "activeStudents": 30,
          "fastestCompletionDays": null
        }
      ]
    }
  }
  ```

---

### 3. Get Program Leaderboard
Retrieve programs ranked by the total XP of all enrolled students.

* **Method:** `GET`
* **Route:** `/api/leaderboards/programs`
* **Query Parameters:**
  * `limit` (string, optional) — Max rows to return. Default: `20`, max: `100`.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "generatedAt": "2026-06-18T14:40:00.000Z",
      "total": 2,
      "entries": [
        {
          "rank": 1,
          "programId": "prog-cs101-uuid",
          "programTitle": "Introduction to Computer Science",
          "institutionName": "Stanford University",
          "totalXp": 5400,
          "activeStudents": 25,
          "fastestCompletionDays": 14
        },
        {
          "rank": 2,
          "programId": "prog-data201-uuid",
          "programTitle": "Data Structures & Algorithms",
          "institutionName": "Stanford University",
          "totalXp": 3100,
          "activeStudents": 20,
          "fastestCompletionDays": 21
        }
      ]
    }
  }
  ```

---

### 4. Get Student Dashboard Widget
Retrieve a compact top-N student ranking widget showing all-time XP, highlighting the logged-in student, and resolving their personal rank.

* **Method:** `GET`
* **Route:** `/api/leaderboards/widgets/student`
* **Query Parameters:**
  * `limit` (string, optional) — Number of top students to show. Default: `5`, max: `100`.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "currentUserRank": 14,
      "currentUserXp": 850,
      "topStudents": [
        {
          "rank": 1,
          "userId": "top-student-1-uuid",
          "name": "Jane Doe",
          "xp": 5000,
          "isCurrentUser": false
        },
        {
          "rank": 2,
          "userId": "top-student-2-uuid",
          "name": "John Smith",
          "xp": 4200,
          "isCurrentUser": false
        },
        {
          "rank": 14,
          "userId": "requesting-user-uuid",
          "name": "My Name",
          "xp": 850,
          "isCurrentUser": true
        }
      ]
    }
  }
  ```

---

### 5. Get Faculty Dashboard Widget
Retrieve a compact top-N student ranking widget scoped to the faculty's most recently created program or a specified program ID.

* **Method:** `GET`
* **Route:** `/api/leaderboards/widgets/faculty`
* **Query Parameters:**
  * `limit` (string, optional) — Number of top students to show. Default: `5`, max: `100`.
  * `programId` (string, optional) — Pin to a specific program. If omitted, uses the faculty member's most recently created program.
* **Roles Allowed:** `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "programId": "prog-cs101-uuid",
      "programTitle": "Introduction to Computer Science",
      "topStudents": [
        {
          "rank": 1,
          "userId": "student-1-uuid",
          "name": "Alice Miller",
          "xp": 1200,
          "isCurrentUser": false
        },
        {
          "rank": 2,
          "userId": "student-2-uuid",
          "name": "Bob Vance",
          "xp": 950,
          "isCurrentUser": false
        }
      ]
    }
  }
  ```
* **Error Responses:**
  * `403 Forbidden` (if the requesting user's role is not allowed, e.g. a student attempts to view it):
    ```json
    {
      "statusCode": 403,
      "message": "Forbidden resource",
      "error": "Forbidden"
    }
    ```
  * `404 Not Found` (if the user does not have a FacultyMember profile in the database):
    ```json
    {
      "statusCode": 404,
      "message": "Faculty profile not found for this user. Please complete onboarding first.",
      "error": "Not Found"
    }
    ```
