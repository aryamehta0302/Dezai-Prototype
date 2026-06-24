# Frontend Credentials Architecture

This directory handles the Next.js React UI and API bindings for the credentials module.

## Folder Structure

```
credentials/
├── hooks/
│   ├── useCredentials.ts          # Central React Query hooks
├── services/
│   └── credentials-api.service.ts # Central fetch logic using session-token
├── types/
│   └── credential.types.ts        # Enums and Interfaces representing the backend schema
```

## Core Logic

1. **API Service (`credentials-api.service.ts`)**
   - Implements native browser `fetch` using `CredentialsAPI.request()`.
   - It seamlessly attaches the NextAuth session token to authenticate requests to the backend API (`/api/credentials/*`).
   - Mock API routes and dummy local data have been completely retired in favor of hitting the live backend.

2. **React Query Hooks (`useCredentials.ts`)**
   - Automatically handles loading spinners, query invalidation, and data fetching for the Dashboard UI.
   - `useGenerateCredential()` provides an easy way for faculty to push credentials, automatically updating the UI list after success.
   - `useVerifyCredential(code)` drives the public verification page logic.
