# Enterprise — Organization Management API

> **Base URL**: `/api/organizations`
> **Auth**: All endpoints require a valid `Bearer <JWT>` token in the `Authorization` header.
> **Allowed Roles**: `ORGANIZATION_ADMIN`, `ORGANIZATION_MANAGER`, `DEZAI_ADMIN`

---

## Overview

The Enterprise module provides a complete B2B workspace management layer. It enables companies to register as an Enterprise Organization, structure their internal teams into Departments, and manage Employee lifecycle — from invitation to offboarding.

---

## Endpoints

---

### 1. `POST /api/organizations`

**Description**: Registers a new Enterprise Organization. The authenticated user becomes the initial `OWNER`.

**Auth Required**: Yes
**Roles**: Any authenticated user

**Request Body**:
```json
{
  "name": "Acme Corporation",
  "industry": "technology",
  "size": "MEDIUM"
}
```

**Field Constraints**:
| Field | Required | Type | Notes |
|---|---|---|---|
| `name` | ✅ | string | The official name of the organization |
| `industry` | ❌ | string | e.g. `technology`, `education`, `healthcare` |
| `size` | ❌ | string | Enum: `SMALL`, `MEDIUM`, `LARGE`, `ENTERPRISE` |

**Success Response** `201 Created`:
```json
{
  "id": "org-uuid-...",
  "name": "Acme Corporation",
  "industry": "technology",
  "size": "MEDIUM",
  "logoUrl": null,
  "createdAt": "2026-07-15T10:00:00Z"
}
```

**Error Responses**:
| Status | Reason |
|---|---|
| `400 Bad Request` | Validation failed (e.g., `name` is missing) |
| `401 Unauthorized` | Missing or invalid JWT |

---

### 2. `GET /api/organizations`

**Description**: Retrieves all organizations accessible to the current user.

**Auth Required**: Yes

**Example Request**:
```http
GET /api/organizations
Authorization: Bearer <your_jwt_token>
```

**Success Response** `200 OK`:
```json
[
  {
    "id": "org-uuid-...",
    "name": "Acme Corporation",
    "industry": "technology",
    "size": "MEDIUM",
    "logoUrl": null,
    "createdAt": "2026-07-15T10:00:00Z"
  }
]
```

---

### 3. `GET /api/organizations/:id`

**Description**: Retrieves a specific organization by its UUID.

**Auth Required**: Yes

**Path Parameters**:
| Param | Type | Description |
|---|---|---|
| `id` | UUID | The organization's unique identifier |

**Success Response** `200 OK`: Returns a single `Organization` object.

**Error Responses**:
| Status | Reason |
|---|---|
| `404 Not Found` | Organization with that ID does not exist |

---

### 4. `PUT /api/organizations/:id`

**Description**: Updates an existing organization's profile (name, industry, size, logo).

**Auth Required**: Yes
**Roles**: `ORGANIZATION_ADMIN`, `OWNER`

**Request Body** (all fields optional):
```json
{
  "name": "Acme Corp Inc.",
  "industry": "finance",
  "size": "LARGE"
}
```

**Success Response** `200 OK`: Returns the updated `Organization` object.

---

### 5. `DELETE /api/organizations/:id`

**Description**: Permanently deletes an organization and all associated data (departments, employees, admin records).

**Auth Required**: Yes
**Roles**: `OWNER` only

> [!CAUTION]
> This is a destructive, cascading delete. Use with extreme care.

**Success Response** `200 OK`: Returns the deleted `Organization` object.

---

## Department Sub-Endpoints

> **Base**: `/api/organizations/:organizationId/departments`

---

### `POST /api/organizations/:organizationId/departments`

**Description**: Creates a new department inside the specified organization.

**Request Body**:
```json
{
  "name": "Engineering",
  "description": "Builds the core product."
}
```

**Success Response** `201 Created`:
```json
{
  "id": "dept-uuid-...",
  "organizationId": "org-uuid-...",
  "name": "Engineering",
  "description": "Builds the core product.",
  "createdAt": "2026-07-15T10:05:00Z"
}
```

---

### `GET /api/organizations/:organizationId/departments`

**Description**: Lists all departments in the specified organization.

**Success Response** `200 OK`: Array of `Department` objects.

---

### `GET /api/organizations/:organizationId/departments/:id`

**Description**: Retrieves a single department by its UUID.

**Success Response** `200 OK`: Single `Department` object.

**Error Responses**:
| Status | Reason |
|---|---|
| `404 Not Found` | Department does not exist |

---

### `PUT /api/organizations/:organizationId/departments/:id`

**Description**: Updates a department's name or description.

**Request Body** (all optional):
```json
{
  "name": "Platform Engineering",
  "description": "Manages cloud infrastructure and developer tooling."
}
```

**Success Response** `200 OK`: Updated `Department` object.

---

### `DELETE /api/organizations/:organizationId/departments/:id`

**Description**: Deletes a department. Employees assigned to this department become unassigned (`departmentId` set to `null`).

**Success Response** `200 OK`: Deleted `Department` object.

---

## Employee Sub-Endpoints

> **Base**: `/api/organizations/:organizationId/employees`

---

### `POST /api/organizations/:organizationId/employees/invite`

**Description**: Invites an existing Dezai user to join the organization. Creates an `Employee` record with status `INVITED`.

> **Note**: The `userId` must reference an existing user account in the `users` table.

**Request Body**:
```json
{
  "userId": "usr-uuid-...",
  "departmentId": "dept-uuid-...",
  "title": "Software Engineer"
}
```

**Field Constraints**:
| Field | Required | Type | Notes |
|---|---|---|---|
| `userId` | ✅ | UUID | Must be an existing user |
| `departmentId` | ❌ | UUID | If omitted, employee is unassigned |
| `title` | ❌ | string | Job title |

**Success Response** `201 Created`:
```json
{
  "id": "emp-uuid-...",
  "userId": "usr-uuid-...",
  "organizationId": "org-uuid-...",
  "departmentId": "dept-uuid-...",
  "title": "Software Engineer",
  "employmentStatus": "INVITED",
  "invitedAt": "2026-07-15T10:10:00Z",
  "joinedAt": null
}
```

**Error Responses**:
| Status | Reason |
|---|---|
| `404 Not Found` | Organization does not exist |
| `409 Conflict` | User is already an employee or has a pending invitation |

---

### `GET /api/organizations/:organizationId/employees`

**Description**: Lists all employees (across all statuses) in the organization.

**Success Response** `200 OK`: Array of `Employee` objects with nested `user` and `department` data.

---

### `POST /api/organizations/:organizationId/employees/:id/accept-invitation`

**Description**: Accepts a pending invitation. Changes the employee's status from `INVITED` → `ACTIVE` and sets `joinedAt` to the current timestamp.

> **Typical usage**: Called when the invited user logs in and accepts their invitation.

**Path Parameters**:
| Param | Type | Description |
|---|---|---|
| `id` | UUID | The `Employee` record ID to accept |

**Request Body**: Empty `{}` or optional `{ "employeeId": "..." }`.

**Success Response** `200 OK`:
```json
{
  "id": "emp-uuid-...",
  "employmentStatus": "ACTIVE",
  "joinedAt": "2026-07-15T11:00:00Z"
}
```

**Error Responses**:
| Status | Reason |
|---|---|
| `404 Not Found` | Employee record not found |
| `400 Bad Request` | Employee status is not `INVITED` (e.g., already `ACTIVE`) |

---

### `DELETE /api/organizations/:organizationId/employees/:id`

**Description**: Offboards and permanently removes an employee from the organization.

**Success Response** `200 OK`: The deleted `Employee` object.

---

## Org Admin Sub-Endpoints (RBAC)

> **Base**: `/api/organizations/:organizationId/admins`

---

### `POST /api/organizations/:organizationId/admins`

**Description**: Assigns an administrative role to an existing user within the organization.

**Request Body**:
```json
{
  "userId": "usr-uuid-...",
  "role": "ADMIN"
}
```

**Roles Enum**:
| Value | Access Level |
|---|---|
| `OWNER` | Full access including billing and org deletion |
| `ADMIN` | Full access except billing and owner management |
| `MANAGER` | Can manage departments and employees |

**Success Response** `201 Created`:
```json
{
  "id": "admin-uuid-...",
  "userId": "usr-uuid-...",
  "organizationId": "org-uuid-...",
  "role": "ADMIN",
  "assignedAt": "2026-07-15T10:00:00Z"
}
```

**Error Responses**:
| Status | Reason |
|---|---|
| `404 Not Found` | Organization or user not found |
| `409 Conflict` | User already has an admin role in this org |

---

### `GET /api/organizations/:organizationId/admins`

**Description**: Lists all admin role assignments for the organization.

**Success Response** `200 OK`: Array of `OrganizationAdmin` objects with nested `user` data.

---

### `DELETE /api/organizations/:organizationId/admins/:id`

**Description**: Revokes an admin role from a user.

**Path Parameters**:
| Param | Type | Description |
|---|---|---|
| `id` | UUID | The `OrganizationAdmin` record ID |

**Success Response** `200 OK`: The deleted `OrganizationAdmin` object.

---

## Data Models

### `Organization`
| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `name` | string | Display name of the organization |
| `industry` | string? | Industry sector |
| `size` | string? | Company size tier |
| `logoUrl` | string? | URL to the organization's logo |
| `createdAt` | DateTime | Creation timestamp |

### `Department`
| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `organizationId` | UUID | FK → Organization |
| `name` | string | Department name |
| `description` | string? | Optional description |
| `createdAt` | DateTime | Creation timestamp |

### `Employee`
| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `userId` | UUID | FK → User |
| `organizationId` | UUID | FK → Organization |
| `departmentId` | UUID? | FK → Department (nullable) |
| `title` | string? | Job title |
| `employmentStatus` | enum | `INVITED`, `ACTIVE`, `SUSPENDED`, `TERMINATED` |
| `invitedAt` | DateTime? | When the invitation was sent |
| `joinedAt` | DateTime? | When the invitation was accepted |

### `OrganizationAdmin`
| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `userId` | UUID | FK → User |
| `organizationId` | UUID | FK → Organization |
| `role` | enum | `OWNER`, `ADMIN`, `MANAGER` |
| `assignedAt` | DateTime | When the role was assigned |

---

## Backend Files

| Type | File Path |
|---|---|
| Module | `backend/src/modules/academy/academy.module.ts` |
| Organization Controller | `backend/src/modules/academy/controllers/organization.controller.ts` |
| Department Controller | `backend/src/modules/academy/controllers/department.controller.ts` |
| Employee Controller | `backend/src/modules/academy/controllers/employee.controller.ts` |
| Org Admin Controller | `backend/src/modules/academy/controllers/org-admin.controller.ts` |
| Organization Repository | `backend/src/modules/academy/repositories/organization.repository.ts` |
| Department Repository | `backend/src/modules/academy/repositories/department.repository.ts` |
| Employee Repository | `backend/src/modules/academy/repositories/employee.repository.ts` |
| Org Admin Repository | `backend/src/modules/academy/repositories/org-admin.repository.ts` |
| DTOs | `backend/src/modules/academy/dto/` |
| Services | `backend/src/modules/academy/services/` |
