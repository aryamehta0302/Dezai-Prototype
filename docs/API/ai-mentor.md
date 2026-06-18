# AI Mentor API — Dezai Backend

> **Base URL**: `/api/ai-mentor`
> **Auth**: All endpoints require a valid `Bearer <JWT>` token in the `Authorization` header.
> **Allowed Roles**: `STUDENT`, `FACULTY`, `UNIVERSITY_ADMIN`, `DEZAI_ADMIN` (all authenticated users)

---

## Endpoints

---

### 1. `GET /api/ai-mentor/sessions`

**Description**: Retrieve all chat sessions for the authenticated user with pagination support.

**Auth Required**: Yes (`JwtAuthGuard`)
**Roles**: All authenticated users

**Query Parameters**:
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 50 | Max sessions to return |
| `offset` | number | 0 | Number of sessions to skip |

**Example Request**:
```http
GET /api/ai-mentor/sessions?limit=10&offset=0
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "sessions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "user-123",
      "activeProgramId": "program-1",
      "activeModuleId": "module-5",
      "activeLessonId": "lesson-12",
      "createdAt": "2026-06-18T10:30:00Z",
      "messages": [
        {
          "id": "msg-001",
          "sender": "USER",
          "content": "What is machine learning?",
          "createdAt": "2026-06-18T10:31:00Z"
        }
      ]
    }
  ],
  "total": 15,
  "limit": 10,
  "offset": 0
}
```

**Field Definitions**:
| Field | Type | Description |
|-------|------|-------------|
| `sessions[]` | ChatSession[] | Array of user's chat sessions |
| `total` | number | Total number of user sessions |
| `limit` | number | Pagination limit used |
| `offset` | number | Pagination offset used |

**Error Responses**:
| Status | Reason |
|--------|--------|
| `401 Unauthorized` | Missing or invalid JWT token |

---

### 2. `POST /api/ai-mentor/sessions`

**Description**: Create a new chat session. Optionally specify the active program, module, or lesson context.

**Auth Required**: Yes (`JwtAuthGuard`)
**Roles**: All authenticated users

**Request Body**:
```json
{
  "activeProgramId": "program-1",
  "activeModuleId": "module-5",
  "activeLessonId": "lesson-12"
}
```

**Body Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `activeProgramId` | UUID | No | Program ID for context injection |
| `activeModuleId` | UUID | No | Module ID for context injection |
| `activeLessonId` | UUID | No | Lesson ID for context injection |

**Example Request**:
```http
POST /api/ai-mentor/sessions
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "activeProgramId": "program-1",
  "activeModuleId": "module-5",
  "activeLessonId": "lesson-12"
}
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-123",
    "activeProgramId": "program-1",
    "activeModuleId": "module-5",
    "activeLessonId": "lesson-12",
    "createdAt": "2026-06-18T10:30:00Z",
    "messages": []
  }
}
```

**Error Responses**:
| Status | Reason |
|--------|--------|
| `401 Unauthorized` | Missing or invalid JWT token |
| `400 Bad Request` | Invalid UUID format |

---

### 3. `GET /api/ai-mentor/sessions/:id`

**Description**: Retrieve a specific chat session with all its messages. User must own the session.

**Auth Required**: Yes (`JwtAuthGuard`)
**Roles**: All authenticated users (owner only)

**URL Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `id` | UUID | The session ID to retrieve |

**Example Request**:
```http
GET /api/ai-mentor/sessions/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-123",
    "activeProgramId": "program-1",
    "activeModuleId": "module-5",
    "activeLessonId": "lesson-12",
    "createdAt": "2026-06-18T10:30:00Z",
    "messages": [
      {
        "id": "msg-001",
        "sessionId": "550e8400-e29b-41d4-a716-446655440000",
        "sender": "USER",
        "content": "What is machine learning?",
        "createdAt": "2026-06-18T10:31:00Z"
      },
      {
        "id": "msg-002",
        "sessionId": "550e8400-e29b-41d4-a716-446655440000",
        "sender": "MENTOR",
        "content": "Great question about \"What is machine learning...\" in the current lesson! 📚 To give you the best answer, I'd need to understand more about what specifically you're trying to learn. Can you elaborate a bit more?",
        "createdAt": "2026-06-18T10:31:05Z"
      }
    ]
  }
}
```

**Error Responses**:
| Status | Reason |
|--------|--------|
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | User does not own this session |
| `404 Not Found` | Session does not exist |

---

### 4. `DELETE /api/ai-mentor/sessions/:id`

**Description**: Delete a chat session and all its messages. User must own the session.

**Auth Required**: Yes (`JwtAuthGuard`)
**Roles**: All authenticated users (owner only)

**URL Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `id` | UUID | The session ID to delete |

**Example Request**:
```http
DELETE /api/ai-mentor/sessions/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "message": "Chat session deleted successfully"
}
```

**Error Responses**:
| Status | Reason |
|--------|--------|
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | User does not own this session |
| `404 Not Found` | Session does not exist |

---

### 5. `POST /api/ai-mentor/chat`

**Description**: Send a message to the AI mentor within a session. Returns both the saved user message and the mentor's response.

**Auth Required**: Yes (`JwtAuthGuard`)
**Roles**: All authenticated users

**Request Body**:
```json
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "How do I apply machine learning to my project?"
}
```

**Body Fields**:
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `sessionId` | UUID | Yes | Must exist and belong to user | The session to send message to |
| `content` | string | Yes | Max 5000 chars, non-empty | The message content |

**Example Request**:
```http
POST /api/ai-mentor/chat
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "content": "How do I apply machine learning to my project?"
}
```

**Success Response** `201 Created`:
```json
{
  "success": true,
  "userMessage": {
    "id": "msg-003",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "sender": "USER",
    "content": "How do I apply machine learning to my project?",
    "createdAt": "2026-06-18T10:35:00Z"
  },
  "mentorMessage": {
    "id": "msg-004",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "sender": "MENTOR",
    "content": "That's a thoughtful question regarding \"How do I apply machine learning to my...\" in the current lesson! 💡 Here are the main points to consider: 1) Start with the basics, 2) Practice with examples, 3) Review and reflect on what you've learned.",
    "createdAt": "2026-06-18T10:35:02Z"
  }
}
```

**Field Definitions**:
| Field | Type | Description |
|-------|------|-------------|
| `userMessage` | ChatMessage | The saved user message |
| `mentorMessage` | ChatMessage | The AI mentor's response |
| `mentorMessage.sender` | string | Always "MENTOR" |

**Error Responses**:
| Status | Reason |
|--------|--------|
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | User does not own this session |
| `404 Not Found` | Session does not exist |
| `400 Bad Request` | Content is empty or exceeds 5000 chars |

---

### 6. `POST /api/ai-mentor/sessions/:id/context`

**Description**: Update the active context (program, module, lesson) for a session. Useful when user navigates to a different lesson.

**Auth Required**: Yes (`JwtAuthGuard`)
**Roles**: All authenticated users (owner only)

**URL Parameters**:
| Param | Type | Description |
|-------|------|-------------|
| `id` | UUID | The session ID to update |

**Request Body**:
```json
{
  "activeProgramId": "program-2",
  "activeModuleId": "module-8",
  "activeLessonId": "lesson-25"
}
```

**Body Fields** (all optional):
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `activeProgramId` | UUID | No | New program context |
| `activeModuleId` | UUID | No | New module context |
| `activeLessonId` | UUID | No | New lesson context |

**Example Request**:
```http
POST /api/ai-mentor/sessions/550e8400-e29b-41d4-a716-446655440000/context
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "activeLessonId": "lesson-25"
}
```

**Success Response** `200 OK`:
```json
{
  "success": true,
  "session": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-123",
    "activeProgramId": "program-1",
    "activeModuleId": "module-5",
    "activeLessonId": "lesson-25",
    "createdAt": "2026-06-18T10:30:00Z",
    "messages": [...]
  }
}
```

**Error Responses**:
| Status | Reason |
|--------|--------|
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | User does not own this session |
| `404 Not Found` | Session does not exist |
| `400 Bad Request` | Invalid UUID format |

---

## Response Schemas

### ChatSession
```typescript
interface ChatSession {
  id: string;                      // UUID
  userId: string;                  // UUID of session owner
  activeProgramId?: string;        // Optional: current program context
  activeModuleId?: string;         // Optional: current module context
  activeLessonId?: string;         // Optional: current lesson context
  createdAt: Date;                 // ISO 8601 timestamp
  messages?: ChatMessage[];        // Included in GET endpoints
}
```

### ChatMessage
```typescript
interface ChatMessage {
  id: string;                      // UUID
  sessionId: string;               // UUID of parent session
  sender: 'USER' | 'MENTOR';       // Who sent the message
  content: string;                 // Message text (max 5000 chars)
  createdAt: Date;                 // ISO 8601 timestamp
}
```

---

## Error Handling

All errors return a standard error response:

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "Description of what went wrong"
}
```

Common HTTP status codes:
- `200 OK` — Successful GET or POST response
- `201 Created` — Resource successfully created
- `400 Bad Request` — Validation failed (see message)
- `401 Unauthorized` — Missing or invalid JWT token
- `403 Forbidden` — User lacks permission (not session owner)
- `404 Not Found` — Session or resource does not exist
- `500 Internal Server Error` — Server error (contact support)

---

## Rate Limiting (Future)

Currently unlimited. Planned for Phase 2:
- **Per-user message limit**: 100 messages/hour
- **Session limit**: 20 sessions/user
- **Response time SLA**: <2 seconds for mentor response

---

## Example Workflow

### Create a session and send a message:

1. **Create session**:
```bash
curl -X POST http://localhost:3001/api/ai-mentor/sessions \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"activeLessonId": "lesson-12"}'
```

2. **Send message**:
```bash
curl -X POST http://localhost:3001/api/ai-mentor/chat \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "550e8400-...", "content": "What is AI?"}'
```

3. **Get conversation history**:
```bash
curl -X GET http://localhost:3001/api/ai-mentor/sessions/550e8400-... \
  -H "Authorization: Bearer <your_jwt_token>"
```

---

## Notes for Frontend Integration

- **Timestamps**: All timestamps are ISO 8601 format (UTC). Parse with `new Date(timestamp)`
- **Pagination**: Use `limit` and `offset` for efficient session list loading
- **Message order**: Messages are always ordered by `createdAt` (oldest first)
- **Context updates**: Call `/context` when user navigates to a new lesson to update AI prompt context
- **Session ownership**: All session/message operations are implicitly scoped to the authenticated user
- **Mock responses**: Phase 1 uses contextual mock responses; Phase 2 will integrate real LLM

---

**API Version**: 1.0 (Phase 1)  
**Last Updated**: 2026-06-18  
**Next Phase**: LLM integration, streaming responses, RAG system
