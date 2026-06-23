# Learning API Documentation

Endpoints for student learning progress, enrollments, and statistics.

## Get Student Stats
Returns aggregated learning statistics for the authenticated student.

- **URL**: `/api/learning/stats`
- **Method**: `GET`
- **Auth Required**: Yes (Student)

### Success Response
- **Code**: `200 OK`
- **Content**:
```json
{
  "success": true,
  "stats": {
    "totalXp": 2500,
    "streakCount": 5,
    "completedPrograms": 2,
    "enrolledPrograms": 4,
    "totalLessonsCompleted": 12,
    "level": 3,
    "nextLevelXp": 3000,
    "progressToNextLevel": 50
  }
}
```

## Get My Enrollments
Returns all programs the authenticated student is currently enrolled in.

- **URL**: `/api/learning/enrollments` (Proxied to Enrollment Controller)
- **Method**: `GET`
- **Auth Required**: Yes (Student)

### Success Response
- **Code**: `200 OK`
- **Content**:
```json
{
  "success": true,
  "enrollments": [
    {
      "id": "enroll_1",
      "courseId": "prog_1",
      "progress": 45,
      "status": "IN_PROGRESS",
      "enrolledAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Get Lesson Details
Returns details for a single lesson, including markdown content format and resource attachments.

- **URL**: `/api/learning/lessons/:id`
- **Method**: `GET`
- **Auth Required**: Yes (Student)

### Success Response
- **Code**: `200 OK`
- **Content**:
```json
{
  "success": true,
  "lesson": {
    "id": "lesson-1",
    "moduleId": "mod-1",
    "title": "Introduction to AI",
    "content": "# Intro...",
    "contentFormat": "MARKDOWN",
    "videoUrl": "https://example.com/video.mp4",
    "order": 1,
    "createdAt": "2026-06-18T11:46:47.000Z",
    "updatedAt": "2026-06-18T11:46:47.000Z",
    "resources": [
      {
        "id": "res-1",
        "lessonId": "lesson-1",
        "title": "Cheat Sheet",
        "type": "PDF",
        "url": "https://example.com/cheatsheet.pdf",
        "order": 1
      }
    ]
  }
}
```

## Get Lesson Resources
Returns a list of resources / attachments associated with a specific lesson.

- **URL**: `/api/learning/lessons/:id/resources`
- **Method**: `GET`
- **Auth Required**: Yes (Student)

### Success Response
- **Code**: `200 OK`
- **Content**:
```json
{
  "success": true,
  "resources": [
    {
      "id": "res-1",
      "lessonId": "lesson-1",
      "title": "Cheat Sheet",
      "type": "PDF",
      "url": "https://example.com/cheatsheet.pdf",
      "order": 1,
      "createdAt": "2026-06-18T11:46:47.000Z",
      "updatedAt": "2026-06-18T11:46:47.000Z"
    }
  ]
}
```

