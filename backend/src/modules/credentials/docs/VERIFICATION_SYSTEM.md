# Credential Verification System & Security Architecture

This document describes the security hardening, verification workflows, caching policies, and UX polish implemented for the Dezai Credential Verification System.

---

## 1. Cryptographically Secure Code Generation
We audited the generation service to eliminate predictable verification codes. Instead of substring slicing a standard UUIDv4, the system generates cryptographically secure, random 18-character uppercase hex strings using the Node.js `crypto` module.

- **Source File**: [credentials.service.ts](../services/credentials.service.ts)
- **Algorithm**: `crypto.randomBytes(9).toString('hex').toUpperCase()`
- **Entropy**: 18 hex characters provide $16^{18} \approx 4.7 \times 10^{21}$ possibilities, rendering guessing attacks mathematically infeasible.

---

## 2. Tamper-Proof Metadata (Cryptographic Signatures)
To prevent unauthorized alterations directly in the database (e.g. manually modifying a credential status from `REVOKED` or `SUSPENDED` back to `ACTIVE`), we sign credential details and their metadata history using an HMAC signature.

- **Hashing Algorithm**: HMAC-SHA256
- **Secret Key**: `CREDENTIAL_SIGNING_SECRET` (configured via environment variables, must be at least 32 characters in production).
- **Signed Fields**:
  - Credential Database ID (`id`)
  - Verification Code (`verificationCode`)
  - Current Status (`verificationStatus`)
  - Recipient Student ID (`userId`)
  - Course Program ID (`programId`)
  - Institution ID (`institutionId`)
  - Metadata Payload Content (`statusHistory`, etc., excluding the signature itself)
- **Workflow**:
  1. During issuance, the signature is computed and saved inside the `metadata` JSON column.
  2. When changing status (or batch-updating status), the status changes are recorded in `statusHistory`, and a new signature is calculated and stored.
  3. During public verification (`GET /api/credentials/verify/:code`), the system re-calculates the signature and compares it with the stored signature using `crypto.timingSafeEqual` (preventing timing attacks).
  4. If the signature doesn't match or is missing, verification fails immediately, rendering a **Critical Security Alert** on the UI and logging a security event.

---

## 3. Caching Strategy with Immediate Eviction
To optimize lookup performance and scale the verification API under heavy traffic, we implemented an in-memory verification cache inside the backend.

- **Cache TTL**: 5 minutes
- **Scope**: Successful lookups, suspended, revoked, and tampered statuses are cached to avoid database roundtrips.
- **Eviction Rule**: The cache is evicted immediately upon status update or batch status update.
  - When calling `changeCredentialStatus` or `batchStatusUpdate`, the system maps the target record ID to its `verificationCode` and invalidates it using `cacheEvict(code)`.
  - This ensures that a `REVOKED` status immediately invalidates the Public Verification Page.
- **Cache-Control Headers**: Active credentials return `public, max-age=300`; revoked/tampered return `no-store`.

---

## 4. Rate Limiting & Brute-Force Lockout
We implemented an IP-based rate limiting guard (`VerificationRateLimitGuard`) to prevent code guessing (brute force) and server exhaustion.

- **Source File**: [verification-rate-limit.guard.ts](../guards/verification-rate-limit.guard.ts)
- **Rate Limit**: Max 10 verification requests per minute per client IP.
- **Brute-Force Protection Lockout**:
  - Tracks failed verification attempts (invalid codes).
  - If a client IP fails verification 5 times within a 5-minute window, the IP is locked out.
  - **Lockout Duration**: 15 minutes.
  - During lockout, the guard rejects requests immediately with a `429 Too Many Requests` (Locked Out) status.
- **Security Logging**: All rate limit events (lockout, threshold exceeded, expiry) are logged via NestJS Logger.

---

## 5. Revocation Propagation & SYSTEM Notifications
When a faculty member, institution admin, or platform admin revokes a student's credential, the status update is propagated in real-time.

- **Flow**:
  1. Admin updates credential status to `REVOKED`.
  2. The cache entry is invalidated immediately.
  3. A new metadata state is signed and saved.
  4. A `SYSTEM` type notification is dispatched to the student's notifications inbox stating that their credential has been permanently revoked, along with the reason.
  5. A `CREDENTIAL` type notification is also sent for the status change.
  6. The event is logged as a security event with full context.
- **Source Files**:
  - [credentials.service.ts](../services/credentials.service.ts)
  - [notifications.service.ts](../../notifications/services/notifications.service.ts)

---

## 6. Input Validation & API Security

### 6.1 Code Validation
The `GET /api/credentials/verify/:code` endpoint validates the verification code format:
- Must be exactly 18 uppercase hexadecimal characters (`/^[0-9A-F]{18}$/`)
- Returns `400 Bad Request` for invalid formats

### 6.2 Cache-Control Headers
| Scenario | Cache-Control Header |
|---|---|
| Active credential | `public, max-age=300, s-maxage=300` |
| Revoked/Suspended/Invalid | `no-store, must-revalidate` |

---

## 7. UX Polish & Print CSS
The Public Verification page (`/verify/[code]`) has been updated to feel highly responsive, premium, and print-ready:

- **Error Boundary**: Network errors and API failures are caught and displayed with a "Try Again" button.
- **Loading Skeleton**: Dedicated `LoadingSkeleton` component for a polished loading state.
- **Watermarked Revocation UI**: Revoked or tampered credentials show a dedicated alert screen with a blinking "SECURITY ALERT: TAMPERING DETECTED" or a clear "Credential Revoked" banner. The attempted certificate details are blurred, struck-out, and watermarked to prevent fraudulent screenshots.
- **Print Certificate Button**: Allows students to print their certificates directly.
- **Print-Friendly CSS Styles**:
  - Hides non-essential UI: sharing options, copy buttons, navigational links, platform branding panels, and search input forms.
  - Scales the certificate card to fill standard A4/Letter pages in portrait.
  - Retains high-quality gradients and backgrounds during printing using `print-color-adjust: exact`.
- **Mobile Responsiveness**: Two-column layout collapses to single column below 1280px. Touch-friendly controls and responsive typography.

---

## 8. Testing

### 8.1 Rate Limit Guard Tests
**File**: `tests/verification-rate-limit.guard.spec.ts`
- Allows up to 10 requests per IP per minute
- Blocks the 11th request with 429
- Tracks different IPs independently
- Locks out IP after 5 failed verification attempts
- Properly handles X-Forwarded-For headers

### 8.2 Credentials Service Tests
**File**: `tests/credentials.service.spec.ts`
- Verifies active credentials return valid results
- Detects tampered metadata via HMAC mismatch
- Handles REVOKED, SUSPENDED statuses correctly
- Uses in-memory cache on repeated verification
- Sends notifications on status changes
- Evicts cache on status updates
- Validates credential issuance flow
- Tests HMAC signature determinism and status-dependency
