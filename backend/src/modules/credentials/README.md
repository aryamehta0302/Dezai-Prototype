# Backend Credentials Architecture

This document covers the complete lifecycle, logic, and cryptography of the Credentials backend module in the Dezai.ai NestJS API.

---

## 1. Directory & Architectural Layout

```text
backend/src/modules/credentials/
├── controllers/
│   ├── credential-generation.controller.ts  # Handles POST requests to issue credentials
│   ├── credential-query.controller.ts       # Handles GET requests for portfolios
│   ├── credential-state.controller.ts       # Handles PATCH requests for status changes
│   └── credential-verification.controller.ts# Handles public GET verification
├── services/
│   ├── credential-generation.service.ts     # Cryptography and Prisma Inserts
│   ├── credential-query.service.ts          # Database lookups
│   ├── credential-state.service.ts          # Suspension/Revocation business logic
│   └── credential-verification.service.ts   # Hash recalculation math
└── dto/
    └── credential.dto.ts                    # Validation schemas (class-validator)
```

---

## 2. Core Gateways & Logic

The system is broken down into specific gateways to enforce Single Responsibility and strict Role-Based Access Control (RBAC).

### A. Generation (Awarding) Gateway
**Controller**: `credential-generation.controller.ts`
- **Endpoints**: `POST /api/credentials/generate/program`, `/generate/assessment`, `/generate/merit`
- **Security Guard**: `@Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN, UserRole.FACULTY)`
- **Logic**: 
  1. Validates the request (e.g., Did the student actually score 100% on the track?).
  2. Generates a unique 16-character alphanumeric `verificationCode`.
  3. **Cryptography**: Concatenates immutable fields (UserId, Date, Tier) into a payload string. Uses `crypto.createHmac('sha256', AUTH_SECRET)` to create a mathematically irreversible signature.
  4. Saves the credential to PostgreSQL via Prisma.

### B. Query (Viewing) Gateway
**Controller**: `credential-query.controller.ts`
- **Endpoints**: `GET /api/credentials/me`, `GET /api/credentials/student/:id`
- **Security Guard**: `@JwtAuthGuard`
- **Logic**: Retrieves credentials associated with the authenticated user. If a Faculty member uses `/student/:id`, it validates their authority to view that student's records.

### C. State Management Gateway
**Controller**: `credential-state.controller.ts`
- **Endpoints**: `PATCH /api/credentials/:id/status`, `PATCH /api/credentials/:id/approval`
- **Security Guard**: `@Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN)`
- **Logic**: Admins can suspend (`SUSPENDED`), revoke (`REVOKED`), or approve (`APPROVED`) credentials. This does *not* alter the credential's cryptographic hash; it merely acts as a system flag. If a revoked credential is queried publicly, the system reports it as mathematically authentic but administratively void.

### D. Public Verification Gateway
**Controller**: `credential-verification.controller.ts`
- **Endpoint**: `GET /api/credentials/verify/:code`
- **Security Guard**: **None.** (Public Access)
- **Logic**: 
  1. Looks up the credential by the provided code.
  2. Extracts the immutable fields from the DB record.
  3. Re-runs `crypto.createHmac` using the server's private `AUTH_SECRET`.
  4. Compares the newly generated hash against the `hashSignature` stored in the database.
  5. If they match exactly, the system mathematically guarantees the credential was created by the Dezai server and never tampered with.

---

## 3. Database Schema Mapping

This backend strictly relies on the Prisma generated types.
- **Roles mapping**: The system explicitly checks for `DEZAI_ADMIN` and `UNIVERSITY_ADMIN` (legacy roles like `PLATFORM_ADMIN` have been purged).
- **Immutability**: Once a credential row is inserted, fields like `hashSignature`, `userId`, and `issuedAt` are completely locked. No controller allows `PATCH` or `PUT` requests to these fields, preventing malicious internal data alteration.
