# Dezai — Changelog

All notable changes to this project will be documented in this file.

---

## [Sprint 6] — 2026-06-23

### Assessment Intelligence + Faculty Insights & Intervention System (Manan Panchal)

#### Added
- WeakTopicDetectionService: per-student and aggregated weak topic detection (40% threshold)
- Topic Accuracy Timeline & Improvement tracking per student
- IncorrectQuestionAnalysis: most-missed questions with distractor analysis
- AssessmentAnalyticsService: difficulty breakdown, trend analysis, performance reports
- Faculty Insight Summary & Institution Assessment Summary aggregations
- FacultyInsightService: at-risk, low-progress, and inactive student detection
- Repeated failure detection with consecutive failure streaks
- Student Academic Health Score (0-100 composite with risk level)
- Faculty Insight Dashboard: unified at-risk monitoring endpoint
- Student Detail Insight: full per-student view for faculty
- 2 new controllers: IntelligenceController, FacultyInsightsController
- 3 new services: WeakTopicDetectionService, AssessmentAnalyticsService, FacultyInsightService

### Developer: Manan Panchal · Branch: feature/assessment-intelligence

---

## [Sprint 5] — 2026-06-22

### Assessment Module Completion (Manan Panchal)

#### Added

- **Assessment Result Endpoint** — Rich attempt result with per-question breakdown including selected option, correct option, percentage, time taken, and passing status.
  - Files: [attempt.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/attempt.service.ts), [attempt.controller.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/controllers/attempt.controller.ts)
  - Endpoint: `GET /api/assessments/attempts/:attemptId/result`

- **Attempt History Endpoint** — Assessment-scoped attempt list with score, percentage, and pass status. Dual-role: students see own history, faculty see all students' history with ownership validation.
  - Files: [attempt.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/attempt.service.ts), [results.controller.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/controllers/results.controller.ts)
  - Endpoint: `GET /api/assessments/:assessmentId/attempts/history`

- **My History Endpoint** — Cross-assessment attempt history for the current student, including module titles.
  - Files: [attempt.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/attempt.service.ts), [attempt.controller.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/controllers/attempt.controller.ts)
  - Endpoint: `GET /api/assessments/attempts/my-history`

- **Attempt Status + Remaining Attempts Logic** — Shows attempts used/remaining, active attempt info, best score, and eligibility to start new attempt. Enforces `MAX_ATTEMPTS_DEFAULT = 3`.
  - Files: [attempt.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/attempt.service.ts), [results.controller.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/controllers/results.controller.ts)
  - Endpoint: `GET /api/assessments/:assessmentId/attempt-status`

- **PassFailEvaluationService** — Centralised scoring, status derivation, percentage calculation, and missed-question analysis. Pure computation service with zero database dependencies.
  - File: [pass-fail-evaluation.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/pass-fail-evaluation.service.ts)

- **Result Analytics** — Faculty-only endpoint returning pass rate, average score/percentage, unique students, and score distribution buckets (0-20%, 21-40%, etc.).
  - Files: [assessment.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/assessment.service.ts), [results.controller.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/controllers/results.controller.ts)
  - Endpoint: `GET /api/assessments/:assessmentId/result-analytics`

- **Missed Questions Analytics** — Faculty-only endpoint returning per-question wrong-answer rates sorted by wrongRate DESC (hardest questions first).
  - Files: [assessment.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/assessment.service.ts), [results.controller.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/controllers/results.controller.ts)
  - Endpoint: `GET /api/assessments/:assessmentId/missed-questions-analytics`

- **Credential Eligibility Notification Trigger** — After a student passes the final assessment in a track, checks if all modules are passed and fires a `CREDENTIAL` notification + `CREDENTIAL_ISSUED` audit log.
  - File: [attempt.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/attempt.service.ts)

- **XP Award on Assessment Pass** — 100 XP via `XpService.awardXp()` on first pass only (idempotent — subsequent passes do not re-award).

- **Response DTOs** — Type-safe response interfaces for all Sprint 5 endpoints.
  - File: [result.dto.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/dto/result.dto.ts)

- **Faculty Assessment Ownership Validation** — Reusable `validateAssessmentFacultyOwnership()` method traversing Assessment → Module → Track → Program → Faculty chain.
  - File: [assessment.service.ts](file:///d:/git/dezai/Dezai-Prototype/backend/src/modules/assessments/services/assessment.service.ts)

- **API Documentation** — Full endpoint contract for all 6 new endpoints.
  - File: [docs/API/assessment-results.md](file:///d:/git/dezai/Dezai-Prototype/docs/API/assessment-results.md)

#### Changed

- **AttemptService.startAttempt()** — Added enforcement of `MAX_ATTEMPTS_DEFAULT = 3` and active attempt conflict detection (`ConflictException`).

- **AttemptService.submitAttempt()** — Now delegates scoring to `PassFailEvaluationService`, fires audit log, and checks credential eligibility.

- **AttemptService.getAttemptResult()** — Enhanced to include percentage, passingScore, totalQuestions, timeTaken, and faculty access.

- **AttemptController** — Added `my-history` route before parameterised routes; enhanced `getAttemptResult` with dual-role support.

- **AssessmentsModule** — Registered `ResultsController` and `PassFailEvaluationService`.

### Developer: Manan Panchal · Branch: feature/assessment-completion

---

### Faculty Monitoring & Insights Modules (Faculty Experience & Dashboard Lead)

#### Added

- **Faculty Monitoring Endpoints** — Integrated 3 new REST endpoints to fetch programs taught by a faculty member (`GET /api/analytics/faculty/programs`), calculate module completion rates (`GET /api/analytics/programs/:id/modules/stats`), and pull detailed student progress checksheets and proctoring violation logs (`GET /api/analytics/programs/:programId/students/:userId`).
  - Files: [analytics.service.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/analytics/services/analytics.service.ts), [analytics.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/analytics/controllers/analytics.controller.ts)

- **Faculty Insights & Intervention Endpoints** — Implemented 3 new REST endpoints to detect at-risk students (`GET /api/analytics/programs/:id/insights`), trigger intervention outreach reminders (`POST /api/analytics/programs/:id/interventions`), and view sent interventions logs (`GET /api/analytics/programs/:id/interventions`).
  - Files: [analytics.service.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/analytics/services/analytics.service.ts), [analytics.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/analytics/controllers/analytics.controller.ts)

- **Faculty Monitoring & Audit Panel** — Developed an interactive console within the Faculty Dashboard showing module-level progress averages, an enrolled student cohort list, and a detailed audit drawer showcasing lesson-by-lesson completions, quiz scores, and proctoring alerts.
  - File: [FacultyDashboard.tsx](file:///d:/Project/Dezai-ai/Dezai-Prototype/frontend/src/features/dashboard/components/FacultyDashboard.tsx)

- **Faculty Insights & Interventions Tab** — Added a dashboard section featuring dynamic at-risk metrics cards, a sorted at-risk student table showing trigger reasons (inactivity, low progress, or assessment failures), a message drafting dialog modal, and an intervention history timeline feed.
  - File: [FacultyDashboard.tsx](file:///d:/Project/Dezai-ai/Dezai-Prototype/frontend/src/features/dashboard/components/FacultyDashboard.tsx)

### Developer: Faculty Experience & Dashboard Lead · Branch: feature/faculty-institution-lead

---


## [Sprint 4] — 2026-06-18

**Developers:** Faculty Experience & Dashboard Lead, Manan Panchal (Assessment & Learning Exp. Lead), AI Mentor Owner (AI Mentor), You (Learning Experience)

### Hybrid Content Delivery Engine (Learning Experience Lead)

#### Added

- **Additive Schema & DB Migration** — Added `Resource` model and `ContentFormat` enum to `schema.prisma` mapping lesson attachments and format.
  - Endpoints: `GET /api/learning/lessons/:id/resources`
  - Files: [schema.prisma](file:///d:/DEZAI/Dezai-Prototype/backend/prisma/schema.prisma)

- **Markdown & Video Renderers** — Replaced regex-based renderer and mocked video player with safe ReactMarkdown and custom HTML5 video controls.
  - Files: [lesson-markdown-renderer.tsx](file:///d:/DEZAI/Dezai-Prototype/frontend/src/features/learning/components/lesson-markdown-renderer.tsx), [lesson-video-player.tsx](file:///d:/DEZAI/Dezai-Prototype/frontend/src/features/learning/components/lesson-video-player.tsx)

- **Interactive Blocks & Registry** — Framer Motion block components (`MemoryLeakBlock`, `OverfitSqueezeBlock`), scroll-observer typography anchors (`interactive-cognitive-anchor.tsx`), and visual callouts (`concept-highlight.tsx`) connected dynamically via a unified `block-registry.ts`.
  - Files: [block-registry.ts](file:///d:/DEZAI/Dezai-Prototype/frontend/src/features/learning/components/blocks/block-registry.ts), [MemoryLeakBlock.tsx](file:///d:/DEZAI/Dezai-Prototype/frontend/src/features/learning/components/blocks/MemoryLeakBlock.tsx), [OverfitSqueezeBlock.tsx](file:///d:/DEZAI/Dezai-Prototype/frontend/src/features/learning/components/blocks/OverfitSqueezeBlock.tsx), [interactive-cognitive-anchor.tsx](file:///d:/DEZAI/Dezai-Prototype/frontend/src/features/learning/components/blocks/interactive-cognitive-anchor.tsx), [concept-highlight.tsx](file:///d:/DEZAI/Dezai-Prototype/frontend/src/features/learning/components/blocks/concept-highlight.tsx)

---

### Faculty Experience & Dashboard 2.0 (Faculty Experience Lead)

#### Added

- **Faculty Dashboard 2.0 Interface** — Created an interactive, tabbed dashboard console for faculty users supporting Overview, Cohort Analytics, and Instructor Profile settings, with modals for program/assessment publication triggers.
  - File: [FacultyDashboard.tsx](file:///d:/Project/Dezai-ai/Dezai-Prototype/frontend/src/features/dashboard/components/FacultyDashboard.tsx)
- **Extended Faculty Analytics** — Implemented metrics calculations for top 5 students leaderboard (by XP), low-progress weak students focus alerts, and diagnostic module warnings (low assessment pass rates).
  - Files: [analytics.service.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/analytics/services/analytics.service.ts), [analytics.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/analytics/controllers/analytics.controller.ts)
  - Endpoints: `GET /api/analytics/faculty/extended`
- **Chronological Activity Feed** — Aggregated recent student enrollments, micro-credential completions, and assessment attempt events into a unified chronological activity feed.
  - Files: [analytics.service.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/analytics/services/analytics.service.ts), [analytics.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/analytics/controllers/analytics.controller.ts)
  - Endpoints: `GET /api/analytics/faculty/activity`
- **Notifications Module & Slide-Over Drawer** — Implemented backend notifications module for generating and tracking read status of system alerts, paired with an interactive slide-over drawer on the frontend.
  - Files: [notifications.service.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/notifications/services/notifications.service.ts), [notifications.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/notifications/controllers/notifications.controller.ts), [notifications.module.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/notifications/notifications.module.ts)
  - Endpoints: `GET /api/notifications`, `PATCH /api/notifications/:id/read`, `POST /api/notifications/read-all`, `POST /api/notifications`
- **Faculty Profile Update API** — Added an endpoint to update faculty member name, department, and designation in a single atomic database transaction.
  - Files: [users.service.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/users/services/users.service.ts), [users.controller.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/users/controllers/users.controller.ts), [users.dto.ts](file:///d:/Project/Dezai-ai/Dezai-Prototype/backend/src/modules/users/dto/users.dto.ts)
  - Endpoints: `PATCH /api/users/faculty/profile`

#### Changed

- **IMPLEMENTED.md updated** — Added Section 11 documenting Sprint 4 features and endpoints.
  - File: [IMPLEMENTED.md](file:///d:/Project/Dezai-ai/Dezai-Prototype/docs/IMPLEMENTED.md)

---

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
  - Files: [AssessmentResult.tsx](file:///d:/git/dezai/Dezai-Prototype/frontend/src/features/results/pages/AssessmentResult.tsx), [AssessmentReview.tsx](file:///d:/git/dezai/Dezai-Prototype/frontend/src/features/results/pages/AssessmentReview.tsx)
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


---

---

## [Sprint 5] — 2026-06-22

**Developer:** Krish Parmar (Analytics & Quality Lead)

### Added

- **`StudentRankingCard` Component** — Dedicated frontend card displaying the student's global XP rank, total XP earned, and streak count. Rank badge adapts for top-3 and top-10 positions. Reads from existing `useEnrollmentStore()` — no new API calls.
  - File: [frontend/src/features/leaderboards/components/student-ranking-card.tsx](file:///d:/Dezai-Prototype-main/frontend/src/features/leaderboards/components/student-ranking-card.tsx)

- **`TopPerformerList` Component** — Student-facing leaderboard list showing top 10 globally ranked students. Monthly / All-Time tab switcher. Rank badge, student name, institution, XP per row. Highlights the current user with a `You` badge. Includes loading skeleton, empty state, and error/retry.
  - File: [frontend/src/features/leaderboards/components/top-performer-list.tsx](file:///d:/Dezai-Prototype-main/frontend/src/features/leaderboards/components/top-performer-list.tsx)
  - Endpoint: `GET /api/leaderboards/students` (existing Sprint 4 endpoint — no backend changes)

### Changed

- **Student Dashboard** — Both components integrated into the right sidebar of `StudentDashboardPage`. Ranking card placed above the activity feed; performer list placed below it.
  - File: [frontend/src/features/learning/pages/StudentDashboardPage.tsx](file:///d:/Dezai-Prototype-main/frontend/src/features/learning/pages/StudentDashboardPage.tsx)

- **IMPLEMENTED.md** — Added Section 12 documenting Sprint 5 leaderboard frontend components.

### Notes

- No backend changes. All 5 leaderboard API endpoints were production-complete from Sprint 4.
- No Prisma schema changes, no new routes, no new pages.

---

## [Sprint 4] — 2026-06-18

**Developer:** Leaderboards & Notifications Lead

### Added

- **Notification Center** — Endpoints to fetch active, unread, or archived notifications. Includes bulk and single-operation status management (read, unread, archive).
  - Files: [notification.dto.ts](file:///d:/Dezai-Prototype-main/backend/src/modules/notifications/dto/notification.dto.ts), [notifications.service.ts](file:///d:/Dezai-Prototype-main/backend/src/modules/notifications/services/notifications.service.ts), [notifications.controller.ts](file:///d:/Dezai-Prototype-main/backend/src/modules/notifications/controllers/notifications.controller.ts)
  - Endpoints: `GET /api/notifications`, `PATCH /api/notifications/mark-all-read`, `PATCH /api/notifications/:id/read`, `PATCH /api/notifications/:id/unread`, `PATCH /api/notifications/:id/archive`

- **Ranked Leaderboards** — Weekly, monthly, and all-time student rankings. Also includes university and program rankings based on total student XP, active students (30-day window), and completion speeds.
  - Files: [leaderboard.dto.ts](file:///d:/Dezai-Prototype-main/backend/src/modules/leaderboards/dto/leaderboard.dto.ts), [leaderboards.service.ts](file:///d:/Dezai-Prototype-main/backend/src/modules/leaderboards/services/leaderboards.service.ts), [leaderboards.controller.ts](file:///d:/Dezai-Prototype-main/backend/src/modules/leaderboards/controllers/leaderboards.controller.ts)
  - Endpoints: `GET /api/leaderboards/students`, `GET /api/leaderboards/universities`, `GET /api/leaderboards/programs`

- **Dashboard Widgets** — Compact student and faculty dashboard widgets.
  - Endpoints: `GET /api/leaderboards/widgets/student`, `GET /api/leaderboards/widgets/faculty`

- **API Documentation** — Detailed API documents for both modules.
  - Files: [notifications.md](file:///d:/Dezai-Prototype-main/docs/API/notifications.md), [leaderboards.md](file:///d:/Dezai-Prototype-main/docs/API/leaderboards.md)

### Changed

- **Notifications Schema** — Added `archived Boolean @default(false)` to support soft-archiving of notifications.
  - File: [schema.prisma](file:///d:/Dezai-Prototype-main/backend/prisma/schema.prisma)

- **AppModule and NotificationsModule** — Registered the new controllers, services, and wired the modules.
  - Files: [app.module.ts](file:///d:/Dezai-Prototype-main/backend/src/app.module.ts), [notifications.module.ts](file:///d:/Dezai-Prototype-main/backend/src/modules/notifications/notifications.module.ts)

- **IMPLEMENTED.md updated** — Appended Section 10 for Sprint 4.
  - File: [docs/IMPLEMENTED.md](file:///d:/Dezai-Prototype-main/docs/IMPLEMENTED.md)

---





