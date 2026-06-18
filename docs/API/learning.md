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
