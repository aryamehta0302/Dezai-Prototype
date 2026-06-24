# Backend Credentials Architecture

This directory handles the complete credential logic for the NestJS API. All data is backed by PostgreSQL via Prisma.

## Folder Structure

```
credentials/
├── controllers/
│   ├── credential-generation.controller.ts  # Issue & Award credentials
│   ├── credential-query.controller.ts       # View credentials
│   ├── credential-state.controller.ts       # Revoke, Suspend, Approve
│   └── credential-verification.controller.ts# Public Verification
├── services/
│   ├── credential-generation.service.ts
│   ├── credential-query.service.ts
│   ├── credential-state.service.ts
│   └── credential-verification.service.ts
└── dto/
    └── credential.dto.ts
```

## Security & Gateways

1. **Generation (Awarding)**: `POST /api/credentials/generate/*`
   - Only `DEZAI_ADMIN`, `UNIVERSITY_ADMIN`, and `FACULTY` can generate credentials.
   - The data is mathematically hashed on generation using `AUTH_SECRET` inside `crypto.createHmac()`.

2. **State Management**: `PATCH /api/credentials/:id/status`
   - Admins can suspend or revoke credentials.

3. **Public Verification**: `GET /api/credentials/verify/:idOrCode`
   - This endpoint is intentionally completely open. Anyone with a credential code or ID can verify its authenticity.
   - The signature is recalculated on the fly to guarantee tamper-resistance.
