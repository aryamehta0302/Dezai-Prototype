# Frontend Credentials Architecture

This document covers the complete lifecycle and architecture of the Credentials feature in the Dezai.ai Next.js frontend. It replaces all legacy dummy data and mock generators with real-time, authenticated data fetched securely from the NestJS backend.

---

## 1. Directory & Architectural Layout

```text
frontend/src/features/credentials/
├── components/
│   ├── atomic/                    # Small, reusable UI pieces
│   │   ├── credential-card.tsx
│   │   ├── credential-status-badge.tsx
│   │   └── verification-search.tsx
│   └── composites/                # Larger interactive modules
├── hooks/
│   └── useCredentials.ts          # Central React Query hooks
├── pages/
│   ├── student-dashboard.tsx      # Private view for users to see their portfolio
│   ├── generation-view.tsx        # Private view for faculty to issue credentials
│   ├── public-verification.tsx    # Unauthenticated route for cryptographic verification
│   └── credential-detail.tsx      # Full-page display of a single credential
├── services/
│   └── credentials-api.service.ts # Pure fetch logic bound to NextAuth session tokens
└── types/
    └── credential.types.ts        # TypeScript definitions matching the Prisma DB schema
```

---

## 2. Core Logic & Data Flow

The frontend never modifies credential data directly or stores mock variables. Instead, it relies on a strict **React Query + API Service** pipeline.

### Step A: The API Service (`credentials-api.service.ts`)
This file is the single source of truth for making HTTP calls to the backend (`/api/credentials/*`).
- **NextAuth Integration**: It uses a custom wrapper (`CredentialsAPI.request()`) that automatically intercepts the active user's session and attaches the JWT Bearer token to the `Authorization` header.
- **Strict Typing**: Every API function strictly returns standard generic types (e.g., `ICredential`, `ICredential[]`) ensuring the UI components never break silently.

### Step B: React Query Hooks (`useCredentials.ts`)
We use React Query to bridge the API Service to the UI.
- **Query Caching (`useStudentCredentials`)**: Fetches the user's credential portfolio. It caches the data locally, so moving between pages doesn't trigger redundant loading spinners.
- **Mutations (`useGenerateCredential`)**: When a Faculty member generates a credential, this hook fires a `POST` request. On success, it calls `queryClient.invalidateQueries()`, which instantly and seamlessly updates the UI with the fresh data from the database.
- **Verification (`useVerifyCredential`)**: Fetches verification details. It inherently handles 404s (Invalid Code) and 200s (Authentic Code) without needing complex local state logic.

---

## 3. UI Workflows

### 🎓 Student Dashboard
- **Route**: `/dashboard`
- **Logic**: Loads `useStudentCredentials(session.user.id)`. Iterates over the returned array to render `CredentialCard` components.
- **Security**: Only displays credentials tied to the currently authenticated NextAuth user.

### 🏛 Faculty Generation Dashboard
- **Route**: `/credentials/generate`
- **Logic**: A form utilizing `useGenerateCredential()`. Requires inputs like `programId`, `tier`, and `studentId`.
- **Security**: The backend verifies the user's JWT to ensure they hold the `FACULTY` or `DEZAI_ADMIN` role. If a student attempts to use this route, the backend responds with a 403 Forbidden.

### 🔍 Public Verification Portal
- **Route**: `/verify/:code`
- **Logic**: Completely unauthenticated. The UI calls `useVerifyCredential(code)`. 
- **Display**: If the backend successfully recalculates the mathematical hash, the UI shows a "Blockchain Verified & Authentic" success badge. If the credential was revoked by an admin, the UI shows a "Revoked" error badge.

---

## 4. Why We Removed Mock Data
Previously, the UI was littered with hardcoded `mock-data/` imports which caused sync issues and Next.js Turbopack compilation errors. 
By entirely ripping out the mock generation and dummy `JSON` files, the frontend is strictly bound to the real database. What you see on the screen is a 1:1 representation of the PostgreSQL truth.
