# Dezai — Shipped Features & Capabilities

This document logs active platform capabilities delivered during features implementation sprints.

---

## 1. Faculty Real-Time Insights & Intervention Portal (Sprint 7.1)

Provides instructors and faculty members with automated, real-time diagnostic tools to audit student learning paths, identify low performers, and take action.

### Key Shipped Capabilities

#### Real-Time SSE Streams
- **SSE Connection Handshake**: Secure `GET /api/assessments/faculty-insights/stream` endpoint delivering at-risk alert streams to faculty.
- **Client hook (`useFacultyInsightsStream`)**: Robust React fetch-based SSE hook featuring:
  - Exponential backoff reconnection with jitter (caps at 30 seconds, maximum 10 attempts).
  - Sync abort controller checks on unmount and remounting to prevent network leak.
  - Granular connection state indicators (`Live`, `Reconnecting`, `Connecting`, `Offline`).
- **Mid-stream JWT Verification**: Server-side JWT token expiration re-checks during streaming, sending a final `session_expired` event and closing the connection cleanly on expiration.

#### Hardened Security & Isolation Boundaries
- **Ownership Verification on repeated-failures**: Added strict checks to prevent cross-tenant queries when an instructor requests specific assessment details.
- **Institutions Controller Verification**: Restructured `GET /api/institutions/:id/faculty` and verify-faculty actions to prevent unauthorized access by administrators of other institutions.
- **Audit Interceptor (`FacultyDataAccessInterceptor`)**: Log-monitoring interceptor logging allowed requests at INFO level (`[ACCESS_ALLOWED]`) and denied or unauthorized requests at WARN level (`[ACCESS_DENIED]`).

#### Granular UX & Fallbacks
- **Granular Loading Skeletons**: Replaced the fullscreen dashboard spinner with per-section layout skeletons.
- **Granular Error Boundaries**: Section-level try/catch error cards with retry trigger buttons to reload metrics, activity feeds, or charts individually without disrupting the main dashboard layout.
