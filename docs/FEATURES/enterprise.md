# Enterprise Module — Backend Architecture & Feature Guide

> **Module**: `academy`
> **Location**: `backend/src/modules/academy/`
> **Added in**: Sprint 2 (Enterprise Phase)
> **Author**: Deep Mehta

---

## Purpose

The Enterprise module (`academy`) powers the **B2B SaaS** layer of Dezai. It allows companies to:

1. **Register** as an Enterprise Organization
2. **Structure** their teams into Departments
3. **Invite & manage** Employees (with status lifecycle: `INVITED → ACTIVE → TERMINATED`)
4. **Assign Role-Based Access Control** (RBAC) via `OWNER`, `ADMIN`, and `MANAGER` roles

---

## Module Architecture

The module follows the **Atomic Service Pattern** where every service file handles exactly one business operation. This makes each piece independently testable and avoids monolithic service classes.

```
academy/
├── academy.module.ts          # NestJS module wiring
│
├── controllers/               # HTTP layer (route handlers only, no logic)
│   ├── organization.controller.ts
│   ├── department.controller.ts
│   ├── employee.controller.ts
│   └── org-admin.controller.ts
│
├── repositories/              # Database layer (Prisma adapters)
│   ├── organization.repository.ts
│   ├── department.repository.ts
│   ├── employee.repository.ts
│   └── org-admin.repository.ts
│
├── dto/                       # Input validation schemas
│   ├── organization.dto.ts
│   ├── department.dto.ts
│   ├── employee.dto.ts
│   └── org-admin.dto.ts
│
├── services/                  # Business logic (one file = one operation)
│   ├── organization/
│   │   ├── create-organization.service.ts
│   │   ├── get-organization.service.ts
│   │   ├── update-organization.service.ts
│   │   └── delete-organization.service.ts
│   ├── department/
│   │   ├── create-department.service.ts
│   │   ├── get-departments.service.ts
│   │   ├── update-department.service.ts
│   │   └── delete-department.service.ts
│   ├── employee/
│   │   ├── invite-employee.service.ts
│   │   ├── accept-invitation.service.ts
│   │   ├── get-employees.service.ts
│   │   └── remove-employee.service.ts
│   └── org-admin/
│       ├── assign-org-admin.service.ts
│       ├── get-org-admins.service.ts
│       └── remove-org-admin.service.ts
│
├── entities/                  # Prisma type mappings
└── validators/                # Zod validators for complex params
```

---

## Design Decisions

### 1. Atomic Services (Single Responsibility)
Each service file is responsible for **one and only one action** (e.g., `InviteEmployeeService` only handles the invite flow). This avoids the "God Service" antipattern and makes each piece independently testable.

### 2. Repository Pattern
All Prisma calls are routed through Repository classes. Controllers and Services **never** call `prisma.*` directly. This:
- Provides a consistent abstraction layer
- Makes swapping DB providers easier
- Enables easy mocking in unit tests

### 3. Conflict & Guard Validation in Services
Business rule checks (e.g., "user is already an employee") are handled in the Service layer, **not** the Controller. This keeps the Controller as a thin HTTP adapter.

---

## Employee Status Lifecycle

```
Invite Sent
     │
     ▼
 [INVITED] ──── Admin Removes ────► [TERMINATED / deleted]
     │
     │  accept-invitation called
     ▼
  [ACTIVE]
     │
     │  (future: suspend action)
     ▼
[SUSPENDED]
     │
     │  (future: terminate action)
     ▼
[TERMINATED]
```

---

## RBAC Role Hierarchy

The `OrganizationAdmin` table is separate from the `Employee` table. A user can be both an Employee and an Admin simultaneously.

```
OWNER
  └── ADMIN
        └── MANAGER
```

| Role | Permissions |
|---|---|
| `OWNER` | All permissions including org deletion and billing management |
| `ADMIN` | All CRUD on employees, departments, and admin assignments (except owner-level) |
| `MANAGER` | Can view and manage employees and departments |

---

## Prisma Schema Entities (Relevant Tables)

> See `prisma/schema.prisma` for the full definitions.

- **`Organization`** — Top-level workspace record
- **`Department`** — Sub-unit within an organization
- **`Employee`** — Links a `User` to an `Organization` with a status and optional department
- **`OrganizationAdmin`** — Links a `User` to an `Organization` with an administrative role

---

## API Summary

> Full API reference: [`docs/API/enterprise.md`](../API/enterprise.md)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/organizations` | Register a new organization |
| `GET` | `/api/organizations` | List all organizations |
| `GET` | `/api/organizations/:id` | Get organization by ID |
| `PUT` | `/api/organizations/:id` | Update organization profile |
| `DELETE` | `/api/organizations/:id` | Delete organization |
| `POST` | `/api/organizations/:id/departments` | Create department |
| `GET` | `/api/organizations/:id/departments` | List departments |
| `PUT` | `/api/organizations/:id/departments/:deptId` | Update department |
| `DELETE` | `/api/organizations/:id/departments/:deptId` | Delete department |
| `POST` | `/api/organizations/:id/employees/invite` | Invite employee |
| `GET` | `/api/organizations/:id/employees` | List employees |
| `POST` | `/api/organizations/:id/employees/:empId/accept-invitation` | Accept invite |
| `DELETE` | `/api/organizations/:id/employees/:empId` | Remove employee |
| `POST` | `/api/organizations/:id/admins` | Assign admin role |
| `GET` | `/api/organizations/:id/admins` | List admins |
| `DELETE` | `/api/organizations/:id/admins/:adminId` | Revoke admin role |
