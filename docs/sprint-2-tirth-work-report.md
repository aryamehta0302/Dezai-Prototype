# Walkthrough - Real-Time Proctoring & Security Feature

Successfully implemented the real-time proctoring and focus-loss tracking features. Here is a summary of the changes across the database, backend, and frontend.

## Changes Made

### 1. Database Model Changes
* **[Modified] [schema.prisma](file:///d:/DezAI/Dezai-Prototype/backend/prisma/schema.prisma)**:
  * Added the `ExamSession` model to track live exam status, warnings, and lockouts.
  * Added the `ExamStatus` enum (`ACTIVE`, `SUBMITTED`, `TERMINATED`).
  * Updated the `ViolationLog` model to support optional relations to `ExamSession` and `AssessmentAttempt`.
  * Added corresponding relations to the `User` and `Assessment` models.
  * Ran migrations using `npx prisma migrate dev --name add_exam_sessions`.

### 2. Backend API
* **[Modified] [assessments.service.ts](file:///d:/DezAI/Dezai-Prototype/backend/src/modules/assessments/services/assessments.service.ts)**:
  * Implemented `createSession` to initialize proctoring sessions (max 3 free attempts limit).
  * Added `getActiveSession` to find a running active assessment session.
  * Added self-healing question seeding to dynamically generate assessment entities in the database if they do not exist.
  * Implemented `logViolation` which handles proctoring warning levels:
    * First offense: Logs violation, timer halts.
    * Second offense: Logs violation, applies 15% score deduction, sets 30-second lockout.
    * Third offense: Logs violation, marks session `TERMINATED`, creates 0% score attempt in the database.
  * Implemented `submitSession` to calculate scores, apply penalties, and record final attempts.
  * Fixed a type compilation error by explicitly declaring `newStatus: ExamStatus`.
* **[New] [assessments.controller.ts](file:///d:/DezAI/Dezai-Prototype/backend/src/modules/assessments/controllers/assessments.controller.ts)**:
  * Exposed REST endpoints (`GET /sessions/active`, `POST /sessions`, `POST /sessions/:id/violations`, `POST /sessions/:id/submit`).
* **[Modified] [assessments.module.ts](file:///d:/DezAI/Dezai-Prototype/backend/src/modules/assessments/assessments.module.ts)**:
  * Registered the controller and service, importing the `DatabaseModule`.

### 3. Frontend Client
* **[Modified] [security-toast.tsx](file:///d:/DezAI/Dezai-Prototype/frontend/src/features/quizzes/components/security-toast.tsx)**:
  * Implemented tab switch detection (`visibilitychange`), window blur/focus loss, and clipboard event prevention (`copy`, `cut`, `paste`).
  * Blocked the right-click context menu and disabled common developer tools keyboard shortcuts (F12, Ctrl+Shift+I/J/C, Cmd+Option+I/J/C, Ctrl+U, Ctrl+S).
  * Intercepted and blocked browser navigation and tab-switching hotkeys—including **Ctrl+Tab**, **Ctrl+Shift+Tab**, **Ctrl+T** (new tab), **Ctrl+N** (new window), and **Ctrl+Shift+N / Ctrl+Shift+P** (incognito/private windows)—directly triggering a `TAB_SWITCH` violation.
* **[Modified] [QuizPage.tsx](file:///d:/DezAI/Dezai-Prototype/frontend/src/features/quizzes/pages/QuizPage.tsx)**:
  * Connected page load/start triggers to the backend session API.
  * Added dynamic HTML5 Fullscreen triggers when starting the assessment or acknowledging warnings.
  * Monitored the `fullscreenchange` event to catch and log escaping fullscreen as a focus-loss violation.
  * Added a `useEffect` hook to automatically exit fullscreen mode (`document.exitFullscreen()`) when the quiz is submitted or terminated, returning the user to their default screen view.
  * Added a window `beforeunload` event interceptor that prompts a confirmation dialog if the student attempts to reload the page or close the tab while the proctored quiz is active.
  * Added a full-screen blocking overlay (**Fullscreen Required**) that triggers on refresh or escape if fullscreen is inactive. This overlay blocks access to the quiz until the student clicks the button to re-enter fullscreen mode.
  * Added a mount-level session restoration hook (`useEffect`) that automatically checks for an active session on reload. If found, it restores the session state (countdown timer, warning counts, lockouts).
  * Handled violation events to trigger visual overlays and warning states.
  * Wrapped the quiz interface in a dynamic layout container (`pointer-events-none select-none blur-sm`) when the warning modal is active. This prevents users from clicking options, reading text, or interacting with the assessment behind the popup.
  * Added `localStorage` tracking (`ack_warnings_[sessionId]`) to prevent students from bypassing the proctoring warnings (1st warning modal, 2nd warning lockout countdown, or 3rd warning termination) by reloading the page.
  * Enabled continuous proctoring checks during active warning modals and lockout states. If a student attempts to switch tabs again while a warning is on screen, the system immediately logs the violation, advances to the next warning level, and closes/updates the active overlays (yellow modal -> orange 30s lock -> red termination).
  * Added a 2-second throttle (`lastViolationTime` state) to prevent multiple double-firing events when a user switches tabs or blurs.
  * Integrated browser-native `alert()` prompts for each warning/lockout phase. Because these are browser-level modal dialogs, they freeze page interaction and force alert visibility/blocking even if the user switches to another tab.
  * Fixed hydration errors by adding `render={<div />}` to Base UI `<DialogDescription>` components to avoid invalid `<p>` tag nesting.
  * Fixed narrow horizontal collapse on all modals and overlays on viewports/containers by applying `w-full max-w-md` classes and wrapping elements inside structured, centered layout wrappers.
  * Changed the warning modal's classes to `ring-0` and added gorgeous pulsing inner-glow box shadows and backdrop-blur glassmorphism filters (removing solid border lines) to create a premium, clean warning state on all overlays (yellow warning modal, orange screen lockout, and red termination). Note that the blur filter was removed from the high z-index yellow warning overlay element itself to prevent blurring the foreground warning dialog text.
  * Fixed a modal blinking issue where browser-native `alert()` popups triggered window focus-loss events, causing a loop of repeated violations. To resolve this while maintaining active proctoring, we keep `SecurityToast` active at all times, but modify `handleViolation` to filter out and ignore focus loss (`FOCUS_LOSS`) events while a warning modal or screen lockout is open. Tab-switching (`TAB_SWITCH`) events remain continuously active and will escalate warnings if the user switches tabs again while a warning is displayed.
  * Disabled the warning dialog's top-right "X" close button (`showCloseButton={false}`) to guarantee students cannot dismiss or bypass the proctoring warning modal without clicking "I Acknowledge and Will Keep Focus".
* **[Modified] [layout.tsx](file:///d:/DezAI/Dezai-Prototype/frontend/src/app/(student)/layout.tsx)**:
  * Implemented an active exam session validator that runs on layout mount and route transitions.
  * Attached window `focus` and document `visibilitychange` listeners to the active session check. If a user already had another tab open on a course/catalog page and switches to it while the quiz is active in a separate tab, the second tab immediately triggers a re-fetch, detects the active session, and renders the **Assessment In Progress** blocking overlay.
  * Added a full-screen **Assessment In Progress** blocking modal overlay that blocks access to any other student pages (Dashboard, Profile, Catalog, Settings) if they attempt to navigate away via header links or URL path typing, presenting a single CTA to return to the active assessment.
  * Conditionally hid the navigation header (`TopAppBar`) and `Footer` during active quiz execution (excluding the results page) to eliminate exit paths and visual distractions.
* **[Modified] [dialog.tsx](file:///d:/DezAI/Dezai-Prototype/frontend/src/shared/ui/dialog.tsx)**:
  * Fixed global width collapse bug in the `DialogContent` component by adding explicit responsive Tailwind CSS classes (`w-[calc(100vw-2rem)] sm:w-[32rem]`) to the base `DialogPrimitive.Popup` element.

## Verification Details

* Tested proctoring session creation, violation updates, and point deduction calculations.
* Simulated focus loss (switching tabs, blurring window) and confirmed that:
  1. Warning modal halts timer on 1st switch.
  2. 30s lockout and 15% penalty applies on 2nd switch.
  3. Termination is triggered on 3rd switch.
* Verified that copying and pasting within the quiz page is blocked and logged as a violation.
