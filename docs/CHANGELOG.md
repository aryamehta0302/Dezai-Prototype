# Dezai — Changelog

All notable changes to this project will be documented in this file.

---

## [Sprint 4] — 2026-06-18

### Assessment Lifecycle & Results (Manan Panchal)

#### Added

- **Assessment Attempt System** — Backend service and controller to start, resume, autosave, and submit student assessment attempts. Integrates with the existing `ExamSession` proctoring logs and enforces maximum attempts limits.
  - Files: [attempt.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/attempt.service.ts), [attempt.controller.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/controllers/attempt.controller.ts)
  - Endpoints: `POST /api/assessments/attempts/start`, `GET /api/assessments/attempts/history/:assessmentId`, `GET /api/assessments/attempts/:id/resume`, `POST /api/assessments/attempts/:id/auto-save`, `POST /api/assessments/attempts/:id/submit`, `GET /api/assessments/attempts/:id/result`

- **Faculty Assessment Results Review** — Faculty-facing endpoint to retrieve detailed student score breakdowns and proctoring violation counts for class tracking.
  - Files: [assessment.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/assessment.service.ts), [assessment.controller.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/controllers/assessment.controller.ts)
  - Endpoints: `GET /api/assessments/:id/results`

- **Recommendation Engine** — Implements a learning path recommendation system to suggest: the next module and lesson based on progress, a continue learning payload based on recent activity, and a list of completed-lesson modules with ready-to-take assessments.
  - Files: [recommendation.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/recommendation.service.ts), [assessment.controller.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/controllers/assessment.controller.ts)
  - Endpoints: `GET /api/assessments/recommendations/next-module/:programId`, `GET /api/assessments/recommendations/continue-learning`, `GET /api/assessments/recommendations/ready-assessments`

- **Assessment Player UI** — Student-facing React component, types, and hooks implementing a secure taking layout. Integrates countdown timer, navigation sidebar, auto-save status indicators, and proctoring violation alerts/blocking overlays.
  - Files: [AssessmentPlayer.tsx](file:///d:/git/dezai/Dezai-Prototype/frontend/src/features/assessments/pages/AssessmentPlayer.tsx), [useAttempt.ts](file:///d:/git/dezai/Dezai-Prototype/frontend/src/features/assessments/hooks/useAttempt.ts), [assessment.types.ts](file:///d:/git/dezai/Dezai-Prototype/frontend/src/features/assessments/types/assessment.types.ts), [assessment-attempt.service.ts](file:///d:/git/dezai/Dezai-Prototype/frontend/src/features/assessments/services/assessment-attempt.service.ts)
  - Pages: `/programs/:slug/assessment/:assessmentId`

- **Assessment Results & Review UI** — Custom, styled screens displaying passing/failing banners, attempt score breakdowns, question-by-question reviews highlighting selected options and explanations, and previous attempt history tables.
  - Files: [AssessmentResult.tsx](file:///d:/git/dezai/Dezai-Prototype/frontend/src/features/assessments/pages/AssessmentResult.tsx), [AssessmentReview.tsx](file:///d:/git/dezai/Dezai-Prototype/frontend/src/features/assessments/pages/AssessmentReview.tsx)
  - Pages: `/programs/:slug/assessment/:assessmentId/results`, `/programs/:slug/assessment/:assessmentId/review`

#### Changed

- **QuestionSelectionService Seeding** — Updated `selectQuestions` to support seed strings, enabling deterministic shuffles and question subset selections. Resuming an attempt now serves the exact same question set and option ordering.
  - File: [question-selection.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/question-selection.service.ts)

- **AssessmentsModule Wiring** — Imported `UsersModule` to inject `XpService` into `AttemptService` and registered all new controllers and services.
  - File: [assessments.module.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/assessments.module.ts)

---

### AI Mentor (AI Mentor Owner)

#### Added

- **AI Mentor Module: Complete Phase 1 Implementation** — Full backend API + AI provider abstraction + context injection for lesson-aware responses.

- **Backend: AI Provider Abstraction Layer** — Pluggable provider architecture supporting multiple LLM backends.
  - **AIProvider Interface**: `ai-provider.interface.ts` — Contract for all providers
  - **MockProvider**: `mock-provider.ts` — Development/fallback provider with contextual responses
  - **ClaudeProvider**: `claude-provider.ts` — Anthropic Claude integration (structure ready for Phase 2)
  - **GeminiProvider**: `gemini-provider.ts` — Google Gemini integration (structure ready for Phase 2)
  - **AIProviderService**: `ai-provider.service.ts` — Provider selection & delegation with automatic fallback

- **Backend: Context Injection System** — Lesson/Module/Program context automatically injected into AI prompts.
  - Fetches lesson content, module title, program title from database
  - Builds enriched system prompt with curriculum context
  - Fallback gracefully if context unavailable
  - Enables semantic relevance without external vector DB

- **Frontend: AI Mentor Workspace** — Complete chat UI with sidebar, message history, smart buttons.
  - **Components**: ChatWindow (message display), MessageInput (send prompt), SessionSidebar (session list), SmartButtons (quick actions)
  - **Chat Page**: `chat-page.tsx` — Main chat interface with session management
  - **Route**: `/(student)/chat` — Accessible from student dashboard

- **Frontend: State Management** — Zustand store with localStorage persistence.
  - **useChatStore**: Manages sessions, current session ID, message history, loading states
  - Persists currentSessionId to localStorage for resuming chats
  - Excludes message bodies from persistence (refetch from API)

- **Frontend: React Query Integration** — Server state management for API operations.
  - **useChatSessions**: Fetch user sessions with pagination
  - **useChatSession**: Fetch specific session with messages
  - **useCreateSession**: Create new chat
  - **useDeleteSession**: Delete session
  - **useSendMessage**: Send message & get response
  - **useUpdateContext**: Update active lesson/module/program

- **Frontend: Smart Buttons** — Quick action prompts for common tasks.
  - Explain Concept
  - Summarize
  - Generate Notes
  - Real Example

- **API Service Layer** — Type-safe API client for chat operations.
  - `aiMentorApi.getSessions()`
  - `aiMentorApi.createSession()`
  - `aiMentorApi.getSession()`
  - `aiMentorApi.deleteSession()`
  - `aiMentorApi.sendMessage()`
  - `aiMentorApi.updateContext()`

- **6 API Endpoints** (all protected by `JwtAuthGuard`):
  - `GET /api/ai-mentor/sessions` — List user sessions (paginated)
  - `POST /api/ai-mentor/sessions` — Create new session
  - `GET /api/ai-mentor/sessions/:id` — Get session with messages
  - `DELETE /api/ai-mentor/sessions/:id` — Delete session
  - `POST /api/ai-mentor/chat` — Send message & get response
  - `POST /api/ai-mentor/sessions/:id/context` — Update active lesson/module/program

- **TypeScript Types**: Full type safety across all layers.
  - `ChatSession`, `ChatMessage`, `CreateSessionRequest`, `SendMessageRequest`, `UpdateContextRequest`
  - Response types: `ChatSessionResponse`, `ChatSessionsResponse`, `SendMessageResponse`

#### Changed

- **ChatService refactored** — Now uses AIProviderService instead of inline mock responses
- **AiModule expanded** — Registers MockProvider, ClaudeProvider, GeminiProvider, AIProviderService
- **docs/PROJECT_STATUS.md** — Comprehensive project status updated (70% completion, team roles, 53 total endpoints)
- **docs/API/ai-mentor.md** — Full API contract with examples

#### Features

✅ **User Ownership Validation** — All operations verify session ownership  
✅ **JWT Authentication** — Secured via JwtAuthGuard  
✅ **Context Injection** — Lesson/module/program context in AI prompts  
✅ **Provider Abstraction** — Pluggable LLM backends (Claude, Gemini, Mock)  
✅ **Graceful Fallback** — Falls back to Mock if primary provider fails  
✅ **Pagination Ready** — getUserSessions and getSessionMessages support offset/limit  
✅ **Cascading Deletes** — Deleting session auto-deletes messages  
✅ **Input Validation** — All DTOs use class-validator  
✅ **Message Ordering** — Messages always ordered by createdAt  
✅ **Persistent Sessions** — localStorage remembers last session ID  
✅ **Resume Chat** — Users can resume previous conversations  
✅ **Auto-scroll** — Chat window auto-scrolls to latest messages  
✅ **Loading States** — Visual feedback during API calls  
✅ **Error Handling** — Toast notifications + error display  

#### Notes

- **No schema changes** — ChatSession and ChatMessage models were pre-defined
- **Mock responses only** — Phase 1 uses mock provider; Phase 2 will add real LLM
- **Provider configuration** — Set `ANTHROPIC_API_KEY`, `GEMINI_API_KEY` in `.env` for real LLM
- **Context injection** — Automatically fetches lesson content for semantic relevance
- **Lesson path** — Full path is: Lesson → Module → ProgramTrack → Program
- **localStorage** — Only persists session IDs, not message bodies (to save space)

#### Files Created (Backend)

```
backend/src/modules/ai/
├── services/
│   ├── ai-provider.service.ts (NEW)
│   ├── chat.service.ts (UPDATED)
│   └── providers/
│       ├── ai-provider.interface.ts (NEW)
│       ├── mock-provider.ts (NEW)
│       ├── claude-provider.ts (NEW - structure ready)
│       └── gemini-provider.ts (NEW - structure ready)
├── repositories/chat.repository.ts (EXISTING)
├── controllers/chat.controller.ts (EXISTING)
├── dto/chat.dto.ts (EXISTING)
└── ai.module.ts (UPDATED)
```

#### Files Created (Frontend)

```
frontend/src/features/ai-mentor/
├── components/
│   ├── chat-window.tsx (NEW)
│   ├── message-input.tsx (NEW)
│   ├── session-sidebar.tsx (NEW)
│   └── smart-buttons.tsx (NEW)
├── hooks/useChat.ts (NEW)
├── services/ai-mentor-api.service.ts (NEW)
├── store/chat-store.ts (NEW)
├── types/index.ts (NEW)
├── pages/chat-page.tsx (NEW)
└── index.ts (NEW)

frontend/src/app/(student)/chat/page.tsx (NEW)
```

---

## [Sprint 3] — 2026-06-17

**Developer:** Manan Panchal (Assessment Engine Owner)

### Added

- **Assessment Engine: Question Bank CRUD** — Full create, read, update, delete operations for question banks with institution-scoped ownership validation. Faculty and University Admins can only manage banks belonging to their institution; DEZAI_ADMIN bypasses all checks.
  - Files: [assessment.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/assessment.service.ts), [assessment.controller.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/controllers/assessment.controller.ts)
  - Endpoints: `GET/POST /api/assessments/question-banks`, `GET/PUT/DELETE /api/assessments/question-banks/:id`

- **Assessment Engine: Question Management** — CRUD for individual questions within a bank, supporting MCQ, Single/Multi Correct, and True/False via a flexible `options[]` array. Includes deep-copy duplication with "(Copy)" suffix.
  - Files: [assessment.dto.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/dto/assessment.dto.ts), [assessment.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/assessment.service.ts)
  - Endpoints: `POST /api/assessments/question-banks/:bankId/questions`, `PUT/DELETE /api/assessments/questions/:questionId`, `POST /api/assessments/questions/:questionId/duplicate`

- **Assessment Engine: Assessment Builder** — Faculty can create assessments that bind a QuestionBank to a Module with configurable passing score and sample size. Enforces the **100-question gate** — a QuestionBank must have ≥ 100 questions before an assessment can be published against it. This enforces the 100:15 architecture from the Dezai blueprint.
  - Files: [assessment.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/assessment.service.ts)
  - Endpoints: `GET /api/assessments/modules/:moduleId`, `GET/POST/PUT/DELETE /api/assessments/:id`

- **QuestionSelectionService: Fisher-Yates 100:15 Dynamic Question Selection** — Dedicated injectable service implementing randomized question selection. Applies Fisher-Yates shuffle to the full question pool, slices `sampleSize` (default 15) questions, then independently shuffles each question's options. Each API call produces a unique permutation so no two students see the same order. `isCorrect` is intentionally stripped from the response to prevent answer leakage.
  - File: [question-selection.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/question-selection.service.ts)
  - Endpoint: `GET /api/assessments/:id/questions/select`

- **Faculty Analytics Dashboard** — Aggregates completed `AssessmentAttempt` data to compute: total attempts, pass rate (%), average score, highest score, and lowest score per assessment. Only counts completed attempts (`completedAt IS NOT NULL`).
  - File: [assessment.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/assessment.service.ts)
  - Endpoint: `GET /api/assessments/:id/analytics`

- **16 new API endpoints** under `/api/assessments` — All protected by `JwtAuthGuard`; write operations gated by `RolesGuard` with `@Roles(FACULTY, UNIVERSITY_ADMIN, DEZAI_ADMIN)`. Full API contract documented in [docs/API/assessments.md](file:///d:/git/dezai/Dezai-Prototype/docs/API/assessments.md).

- **7 DTOs with class-validator decorators** — `CreateQuestionBankDto`, `UpdateQuestionBankDto`, `CreateQuestionOptionDto`, `CreateQuestionDto`, `UpdateQuestionDto`, `CreateAssessmentDto`, `UpdateAssessmentDto`. All follow `Action + Entity + Dto` naming convention.
  - File: [assessment.dto.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/dto/assessment.dto.ts)

- **API Documentation** — Full endpoint contract covering method, route, request body, response shape, auth requirements, and error cases.
  - File: [docs/API/assessments.md](file:///d:/git/dezai/Dezai-Prototype/docs/API/assessments.md)

### Fixed

- **Global ValidationPipe enabled in main.ts** — Added `app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))` to the NestJS bootstrap. Without this, all `class-validator` decorators (`@IsString()`, `@IsNotEmpty()`, `@Min()`, etc.) were silently ignored and invalid payloads passed through unchecked. This fix applies to **all modules**, not just assessments.
  - File: [main.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/main.ts)

### Changed

- **AssessmentsModule wired** — Updated the empty scaffold module to import `AuditModule`, register `AssessmentController`, and provide `AssessmentService` + `QuestionSelectionService`.
  - File: [assessments.module.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/assessments.module.ts)

- **IMPLEMENTED.md updated** — Added Section 9 documenting Sprint 3 Assessment Engine implementation with full endpoint table.
  - File: [docs/IMPLEMENTED.md](file:///d:/git/dezai/Dezai-Prototype/docs/IMPLEMENTED.md)

### Notes

- **No schema changes** — All Prisma models (`QuestionBank`, `QuestionBankQuestion`, `QuestionOption`, `Assessment`, `AssessmentAttempt`, `AttemptAnswer`, `ViolationLog`) were pre-defined in the locked schema. Zero migrations required.

- **Program/Track/Module bindings for Question Banks** — The Sprint 3 allocation lists "Program/Track/Module bindings" under Question Bank Management. The current implementation scopes Question Banks by `institutionId` (which is how the Prisma schema defines them). Since Programs belong to Institutions, filtering by `?institutionId` effectively scopes to the correct program set. Assessments themselves are bound to Modules via the `Assessment.moduleId` foreign key. No dedicated binding table or schema change was required.

- **AuditAction enum** — All write operations log using the existing `ASSESSMENT_PUBLISHED` enum value with descriptive `details` strings to differentiate actions (e.g. `"QuestionBank created: ..."`, `"Question deleted: ..."`), since the Prisma enum is locked.

- **No banned terms** — Verified zero occurrences of `exam`, `course`, `chapter`, `certificate` in the assessments module.

---

## [Sprint 2] — Prior

- Enrollment, Progress, XP systems (Ansh)
- See previous sprint documentation.

---

## [Sprint 1] — Prior

- Authentication & RBAC System
- Curriculum & Program Management (Manan Panchal)
- See [IMPLEMENTED.md](file:///d:/git/dezai/Dezai-Prototype/docs/IMPLEMENTED.md) Sections 5–7.
