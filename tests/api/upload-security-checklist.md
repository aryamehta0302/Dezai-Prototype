---
sprint: 4
date: 2026-06-24
author: Hitarth
status: Verified
---

# Upload Security & Exam Integrity Checklist

This document details the security checks required for S3-bound asset uploads (Section 9.1) and the server-side validation mechanics to prevent copy/paste during assessments (Section 5.2).

## 1. Upload System Security Checklist

The upload service (powering course media and faculty video uploads) must be verified against the following security controls:

### 1.1 Upload Controls & Policy Matrix
| Control | Target Resource | Validation Technique | Expected Outcome |
| :--- | :--- | :--- | :--- |
| **File-Type Allowlist** | Course Media / Video | Verify Magic Bytes (file headers) match allowed MIME types (e.g., `video/mp4`, `image/png`, `application/pdf`). | Deny requests relying solely on file extension renaming (`.exe` renamed to `.mp4`). Return `400 Bad Request`. |
| **Size Limit Enforcement** | Faculty Video | Max video upload: `500 MB`. Max document upload: `10 MB`. Checked in gateway. | Reject payload at gateway level before buffering to disk. Return `413 Payload Too Large`. |
| **Signed-URL Lifecycle** | S3 Assets (Section 9.1) | Verify AWS S3 pre-signed URLs are issued with short expiration times (`Expires: 900` / 15 minutes). | Expired URLs must return `403 Forbidden` from S3. Access must be scoped using minimal IAM permissions. |
| **S3 Bucket Access ACL** | Storage Layer (DevOps) | Verify bucket policies enforce `Block public access` and prevent anonymous `s3:PutObject` or `s3:GetObject`. | Direct attempts to access bucket URLs without signed authorization return AWS XML `AccessDenied` error. |
| **Malicious Payload Scan** | All uploads | Stream upload buffers through a virus/malware scanner hook (ClamAV API) prior to writing to S3. | Return `422 Unprocessable Entity` with "Security threat detected" message if malware signatures match. |

---

## 2. Server-Side Anti-Copy/Paste Validation (Section 5.2)

Client-side copy/paste blocks (JavaScript event listeners like `onpaste="return false;"`) can be easily bypassed by disabling JavaScript or using browser developer consoles. Therefore, the NestJS backend must execute independent exam integrity checks.

### 2.1 Exam Integrity Backend Flow
1. **Frontend Event Tracking**: The frontend tracks keyboard paste actions during the exam session and populates a telemetry package inside the submit payload.
2. **Backend Submission Interceptor**:
   - Route: `POST /api/assessments/attempts/:id/submit`
   - The payload contains:
     ```json
     {
       "answers": [...],
       "telemetry": {
         "blurCount": 2,
         "pasteEvents": [
           { "questionId": "q-101", "pastedLength": 240, "timestamp": 178234823 }
         ]
       }
     }
     ```
3. **Redundancy & Validation Logic**:
   - The backend checks `telemetry.pasteEvents`. If a text-input answer has a length change matching a `pasteEvent`, it logs a proctoring violation.
   - If a student submits long text answers without keypress telemetry (indicating a programmatic paste bypass), the backend automatically triggers a **Yellow/Orange Strike** (Section 6.1).
   - If the student hits the max violation limit, the backend locks out the exam session and issues a **24-hour Lockout** (Section 6.2).

### 2.2 Validation Test Cases
- **TC-INT-001 (Paste Detection)**: Send a submit request with text answers containing large blocks of text matching an event listener paste flag. Verify a proctoring violation row is written to the database.
- **TC-INT-002 (Bypass Attempt)**: Send a submit request with standard text input answer updates but zero keyup/keydown telemetry. The backend should flag the submission as "Suspicious: Telemetry Mismatch" and record a violation.
