# Credential Verification System — Implementation Report

**Author:** Tirth Patel — Credentials & Verification Lead  
**Date:** 2026-06-30  
**Sprint:** Sprint 5 — Credential Verification Infrastructure Hardening

---

## Overview

This document details the complete implementation of the hardened Credential Verification infrastructure, covering revocation propagation, security audit of the generation service, UX polish for the Public Verification Page, API hardening, and brute-force protection testing.

---

## 1. Revocation Propagation

### 1.1 Immediate Cache Invalidation

When a credential's status is changed to `REVOKED`, the in-memory verification cache is immediately evicted:

- **File:** `backend/src/modules/credentials/services/credentials.service.ts` — `changeCredentialStatus()` method (line 202)
- **Mechanism:** `cacheEvict(current.verificationCode)` deletes the cached entry before the database update completes
- **Scope:** Both single-status changes (`PATCH /api/credentials/:id/status`) and batch updates (`POST /api/credentials/batch-status`) trigger cache eviction

### 1.2 Notification to Student

On revocation, the following notifications are dispatched to the affected student:

| Notification Type | Title | Purpose |
|---|---|---|
| `SYSTEM` | "Credential Revoked" | Critical alert with revocation reason |
| `CREDENTIAL` | "Credential Status Updated" | Informational status change notice |

- **File:** `credentials.service.ts:258-267` (single), `credentials.service.ts:625-637` (batch)
- **Service:** `NotificationsService.createNotification()`

### 1.3 Suspension Notifications

For SUSPENDED status changes, a `CREDENTIAL` type notification is also sent:

- **File:** `credentials.service.ts:330-335` (single), `credentials.service.ts:643-652` (batch)

### 1.4 Security Event Logging

All revocation events are logged via the internal `logSecurityEvent()` method and the `AuditService`:

- **Logged data:** credentialId, userId, changedBy, reason, previousStatus, newStatus, verificationCode
- **Audit action:** `AuditAction.CREDENTIAL_ISSUED` with details string

---

## 2. Security Audit — Credential Generation Service

### 2.1 Verification Code Generation

- **Algorithm:** `crypto.randomBytes(9).toString('hex').toUpperCase()`
- **Length:** 18 uppercase hexadecimal characters
- **Entropy:** $16^{18} \approx 4.7 \times 10^{21}$ possibilities
- **Uniqueness:** Enforced by `@unique` constraint on `verificationCode` in Prisma schema

### 2.2 Tamper-Proof Metadata (HMAC-SHA256)

Every credential's metadata is cryptographically signed at issuance and re-signed on every status change:

| Field | Included in HMAC |
|---|---|
| `credentialId` | Yes |
| `verificationCode` | Yes |
| `verificationStatus` | Yes |
| `userId` | Yes |
| `programId` | Yes |
| `institutionId` | Yes (added in current sprint) |
| `metadata` (all fields except `signature`) | Yes |

- **Algorithm:** HMAC-SHA256 with `crypto.timingSafeEqual` comparison
- **Secret key:** `CREDENTIAL_SIGNING_SECRET` environment variable (min 32 chars recommended)
- **Verification:** During `GET /api/credentials/verify/:code` — if HMAC mismatch, returns `tampered: true` with status `REVOKED`

### 2.3 Input Validation

Added to the verify endpoint controller:

- **Code format validation:** Must match `/^[0-9A-F]{18}$/` (exactly 18 uppercase hex characters)
- **HTTP 400** returned for malformed codes before reaching the service layer

### 2.4 Cache-Control Headers

The verify endpoint now sets appropriate caching headers:

| Scenario | Cache-Control Header |
|---|---|
| Active credential | `public, max-age=300, s-maxage=300` |
| Revoked/Suspended/Invalid | `no-store, must-revalidate` |

---

## 3. Rate Limiting & Brute-Force Protection

### 3.1 Verification Rate Limit Guard

**File:** `backend/src/modules/credentials/guards/verification-rate-limit.guard.ts`

| Setting | Value |
|---|---|
| Max requests per window | 10 |
| Window duration | 1 minute |
| Max failed attempts before lockout | 5 |
| Failure tracking window | 5 minutes |
| Lockout duration | 15 minutes |

### 3.2 Brute-Force Lockout Flow

1. Client sends verification requests with invalid codes
2. Controller calls `rateLimitGuard.recordFailure(ip)` for each invalid code
3. After 5 failures within 5 minutes, IP is locked out for 15 minutes
4. Locked-out IPs receive `429 Too Many Requests` with `"Locked Out"` error
5. After lockout expires, the IP is automatically cleared and can retry

### 3.3 Security Logging

The rate limit guard logs security events via NestJS `Logger`:

- Lockout events (IP, remaining lockout time)
- Rate limit exceeded events (IP, request count)
- Lockout expiration events

---

## 4. API Endpoints

### 4.1 Public Endpoint

`GET /api/credentials/verify/:code`

| Aspect | Implementation |
|---|---|
| Authentication | None (public) |
| Rate limiting | Yes (10/min per IP, 5 failures = 15 min lockout) |
| Caching | In-memory (5 min TTL), immediate eviction on status change |
| Response format | `{ success, valid, credential, data, message, status, tampered }` |

### 4.2 Protected Endpoints

| Method | Route | Roles | Description |
|---|---|---|---|
| POST | `/api/credentials/issue` | DEZAI_ADMIN, UNIV_ADMIN, FACULTY | Issue new credential |
| POST | `/api/credentials/claim` | Any authenticated | Auto-claim credential |
| PATCH | `/api/credentials/:id/status` | DEZAI_ADMIN, UNIV_ADMIN, FACULTY | Change credential status |
| POST | `/api/credentials/batch-status` | DEZAI_ADMIN, UNIV_ADMIN, FACULTY | Batch status update |

### 4.3 Seed Data Verification Codes

Available test verification codes from the seed data can be found by querying the database. Example:

```sql
SELECT "verificationCode", "verificationStatus" FROM credentials LIMIT 5;
```

---

## 5. Frontend — Public Verification Page

### 5.1 Page Routes

| Route | Component | Description |
|---|---|---|
| `/verify` | `CredentialLookupPage` | Code input + lookup form |
| `/verify/[id]` | `VerificationPortal` | Full verification result UI |

### 5.2 Verification States

| State | Visual Treatment |
|---|---|
| **Loading** | Spinner with "Authenticating" status, skeleton placeholder |
| **Active** | Green gradient banner, full credential details, sharing options, print button |
| **Revoked** | Red alert banner, "INVALIDATED CREDENTIAL" watermark, blurred/struck-through details |
| **Suspended** | Amber warning, watermark overlay |
| **Tampered** | Flashing red "CRITICAL SECURITY BREACH" banner, strobe effect, tamper indicator |
| **Invalid Code** | "Verification Failed" card with retry option |
| **Network Error** | "Verification Error" fallback with "Try Again" button |

### 5.3 Error Boundary

A dedicated `ErrorBoundaryFallback` component handles network errors and API failures:

- Displays error message
- Provides "Try Again" button that re-triggers the verification
- Reset when the verification code changes

### 5.4 Print Styles

Comprehensive `@media print` CSS rules in `globals.css`:

- **Page setup:** A4 portrait, 1.5cm margins
- **Hidden elements:** nav, header, footer, buttons, sharing controls (`print:hidden`)
- **Visible elements:** Credential card, verification code (`print:block`)
- **Color preservation:** `print-color-adjust: exact` on all elements
- **Break prevention:** `break-inside: avoid` on credential cards

### 5.5 Mobile Responsiveness

- Two-column layout (`xl:flex-row`) collapses to single column on screens < 1280px
- Touch-friendly button sizes
- Responsive padding (`px-4 sm:px-8 lg:px-12`)
- Mobile logo shown on small screens, hidden on large screens
- Verification detail grid adapts from 2 columns to 1 column on small screens

---

## 6. Testing

### 6.1 Rate Limit Guard Tests

**File:** `backend/src/modules/credentials/tests/verification-rate-limit.guard.spec.ts`

Test cases:

| Test | Description |
|---|---|
| Allow under rate limit | 10 requests from same IP should succeed |
| Block over rate limit | 11th request should throw 429 |
| Independent IP tracking | Different IPs have independent counters |
| X-Forwarded-For handling | Proxy headers properly parsed |
| 5 failures = lockout | After 5 failed attempts, IP is locked |
| No lockout before 5 | 4 failures should still allow requests |
| IP fallback chain | Correct IP extraction logic |

### 6.2 Credentials Service Tests

**File:** `backend/src/modules/credentials/tests/credentials.service.spec.ts`

Test cases:

| Test | Description |
|---|---|
| Active credential verification | Valid code returns valid result |
| Invalid code handling | Non-existent code returns invalid |
| Tamper detection | HMAC mismatch detected as tampered |
| Revoked status | REVOKED credential returns proper status |
| Suspended status | SUSPENDED credential returns proper status |
| Cache hit | Repeated verification uses cache |
| Status change to REVOKED | Notifications sent, status updated |
| Status change cache eviction | Cache cleared after status update |
| Invalid template | BadRequestException thrown |
| Valid credential issuance | Credential created, audit logged |
| Deterministic HMAC | Same inputs produce same signature |
| Status-dependent HMAC | Different statuses produce different signatures |
| Rapid invalid verifications | Multiple invalid codes handled gracefully |

---

## 7. Files Modified/Created

### Backend

| File | Change |
|---|---|
| `src/modules/credentials/controllers/credentials.controller.ts` | Added input validation, Cache-Control headers, enhanced response schema |
| `src/modules/credentials/services/credentials.service.ts` | Enhanced HMAC (institutionId), security logging, dual notifications, improved signing secret validation |
| `src/modules/credentials/guards/verification-rate-limit.guard.ts` | Added structured logging for rate limit events |
| `src/modules/credentials/tests/verification-rate-limit.guard.spec.ts` | **New** — Rate limit and brute-force protection tests |
| `src/modules/credentials/tests/credentials.service.spec.ts` | **New** — Service layer tests covering verification, status changes, HMAC, caching |

### Frontend

| File | Change |
|---|---|
| `src/app/globals.css` | Added comprehensive `@media print` styles and mobile responsive utilities |
| `src/features/credentials/pages/VerificationPortal.tsx` | Added `LoadingSkeleton`, `ErrorBoundaryFallback`, error/retry state, enhanced tampered UI with strobe effect |
| `src/features/credentials/hooks/useVerification.ts` | Added `error` and `refetch` return values |

### Documentation

| File | Description |
|---|---|
| `docs/CREDENTIAL_VERIFICATION_SYSTEM.md` | **This file** — Comprehensive implementation report |

---

## 8. Verification Flow Diagram

```
User enters code → GET /verify/[code]
    ↓
VerificationRateLimitGuard
    ├── Check lockout → 429 if locked
    └── Check rate limit → 429 if exceeded
    ↓
CredentialsController.verify()
    ├── Validate code format → 400 if invalid
    └── CredentialsService.verifyCredential()
        ├── Check in-memory cache → return cached if valid
        ├── Query database by verificationCode
        ├── Verify HMAC signature → tampered if mismatch
        ├── Check status (ACTIVE/REVOKED/SUSPENDED)
        ├── Cache result (5 min TTL)
        └── Return result with status + data
    ↓
Frontend VerificationPortal
    ├── Loading → LoadingSkeleton
    ├── Active → Green card with details + share options
    ├── Revoked → Red card with watermark + audit info
    ├── Suspended → Amber card with warning
    ├── Tampered → Flashing red security alert
    ├── Invalid → Error card with retry
    └── Network Error → Fallback with Try Again
```

---

## 9. Security Checklist

- [x] Cryptographically secure verification codes (`crypto.randomBytes`)
- [x] HMAC-SHA256 tamper-proof metadata
- [x] Constant-time signature comparison (`timingSafeEqual`)
- [x] Input validation on verification codes (length + format)
- [x] Rate limiting (10 req/min per IP)
- [x] Brute-force lockout (5 fails = 15 min lock)
- [x] Cache eviction on status change
- [x] SYSTEM notification on revocation
- [x] Security event logging (tamper, lockout, revocation)
- [x] Cache-Control headers for public endpoint
- [x] Production secret key warning (min 32 chars)
