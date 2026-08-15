---
sprint: 4
date: 2026-06-24
author: Hitarth
status: Verified
---

# API Reference Registry

This registry tracks the active REST API endpoints across the Dezai AI platform and documents their QA validation status.

## 1. Auth Module Endpoints
| Method | Route | Description | Auth Required | QA Validation Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | No | `VERIFIED` |
| `POST` | `/api/auth/onboarding` | Faculty/Student onboarding profile update | Yes | `VERIFIED` |
| `POST` | `/api/auth/login-audit` | Log login metadata (IP, timestamp) | Yes | `VERIFIED` |
| `POST` | `/api/auth/session-sync` | Sync user role & status to client state | Yes | `VERIFIED` |

## 2. Assessments Module Endpoints
| Method | Route | Description | Auth Required | QA Validation Status |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/assessments/question-banks` | Retrieve all question banks | Yes (Faculty+) | `VERIFIED` |
| `POST` | `/api/assessments/question-banks` | Create a new question bank | Yes (Faculty+) | `VERIFIED` |
| `POST` | `/api/assessments/attempts/start` | Initialize assessment session | Yes (Student) | `VERIFIED` |
| `POST` | `/api/assessments/attempts/:id/submit`| Submit final assessment answers | Yes (Student) | `VERIFIED` |

## 3. Payments & Ledgers (Section 2)
| Method | Route | Description | Auth Required | QA Validation Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/checkout` | Trigger Razorpay checkout session | Yes (Student) | `VERIFIED_MOCK` |
| `POST` | `/api/learning/xp/threshold-unlock`| Unlock tiers using earned XP | Yes (Student) | `VERIFIED` |
| `POST` | `/api/leaderboards/freeze` | Freeze current leaderboard | Yes (Faculty+) | `VERIFIED` |

## 4. AI Mentor (Section 7)
| Method | Route | Description | Auth Required | QA Validation Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/ai-mentor/chat` | Send message to AI mentor | Yes (Student) | `VERIFIED` |
| `POST` | `/api/ai-mentor/sessions/:id/context`| Push learning context to AI session | Yes (Student) | `VERIFIED` |
| `POST` | `/api/ai-mentor/summary` | Generate lesson custom summary | Yes | `VERIFIED` |

---

## QA Review & Append Log
* **Sprint 4 Execution**: Verified that all endpoints validate request body shapes against `class-validator`/`zod` schemas and return expected `400 Bad Request` or `429 Too Many Requests` on failure.
* **Audit Event Integrity**: Endpoints are flagged as verified under mock conditions where the corresponding DB integration is still in progress (e.g. Payments).
