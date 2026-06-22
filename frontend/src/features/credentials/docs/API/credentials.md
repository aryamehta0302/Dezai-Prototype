# API Specification: Credentials Module

## Core Endpoints
Base URL: `/api/credentials`

### 1. Issue Credential
- **Endpoint:** `POST /issue`
- **Description:** Generates a new credential, triggering auto-tier assignment and creating a secure verification code.
- **Body:** `CreateCredentialDto`
- **Response:** Hydrated `Credential` object including `user`, `program`, `credentialTemplate` and `institution`.

### 2. Get All Credentials
- **Endpoint:** `GET /all`
- **Description:** Returns all credentials for the Faculty Dashboard analytics and lists.
- **Response:** Array of `Credential` objects.

### 3. Get Student Credentials
- **Endpoint:** `GET /student/:userId`
- **Description:** Returns all credentials specific to a student.
- **Response:** Array of `Credential` objects.

### 4. Verify Credential
- **Endpoint:** `GET /verify/:code`
- **Description:** Authenticates a credential securely. Returns `404` or error string if suspended/revoked.
- **Response:** `{ valid: boolean, data?: Credential, message?: string }`

### 5. Update Status (Faculty Only)
- **Endpoint:** `PATCH /:id/status`
- **Description:** Revokes or Suspends an existing credential.
- **Body:** `{ status: 'REVOKED' | 'SUSPENDED' | 'ACTIVE' }`
- **Response:** Updated `Credential` object.

### 6. Get Templates
- **Endpoint:** `GET /templates` & `GET /templates/:type`
- **Description:** Retrieves `CredentialTemplate` objects for the dynamic Issue Modal.
- **Response:** Array of `CredentialTemplate` objects.
