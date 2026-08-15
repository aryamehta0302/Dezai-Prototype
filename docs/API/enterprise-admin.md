# Enterprise Administration API

Base URL: `/api/enterprise-admin`

All endpoints require: `Authorization: Bearer <token>`

Authorized roles: `DEZAI_ADMIN`, `ORGANIZATION_ADMIN`, `ORGANIZATION_MANAGER`

---

## Organization Settings

### GET `/org/:organizationId`
Retrieve organization profile.

**Response**
```json
{
  "success": true,
  "organization": { "id": "...", "name": "Allianz Corp", "industry": "Finance", "size": "LARGE" }
}
```

### PATCH `/org/:organizationId/settings`
Update org settings.

**Body**
```json
{
  "name": "Acme Corp",
  "industry": "Technology",
  "size": "MEDIUM",
  "billingEmail": "billing@acme.com"
}
```

---

## Departments

### GET `/organizations/:organizationId/departments`
List all departments with manager and headcount.

### GET `/departments/:id`
Get a single department.

### POST `/departments`
Create a new department.

**Body**
```json
{
  "name": "Engineering",
  "description": "All engineering teams",
  "organizationId": "org-uuid",
  "managerId": "emp-uuid"   // optional
}
```

### PATCH `/departments/:id`
Update department name or description.

**Body**
```json
{ "name": "Engineering & Platform" }
```

### DELETE `/departments/:id`
Delete a department. Employees in it become department-less (`departmentId = null`).

**Response** `{ "success": true, "message": "Department deleted" }`

### GET `/organizations/:organizationId/department-stats`
Aggregate stats: headcount per department, managers assigned/unassigned.

**Response**
```json
{
  "success": true,
  "departments": [{ "id": "...", "name": "Eng", "headcount": 12, "manager": { ... } }],
  "summary": {
    "totalDepartments": 5,
    "totalEmployees": 48,
    "departmentsWithManager": 4,
    "departmentsWithoutManager": 1
  }
}
```

---

## Employees

### GET `/organizations/:organizationId/employees`
List all employees (full list, no pagination).

### GET `/organizations/:organizationId/employees/search`
Paginated, filtered employee search.

**Query params**
| Param | Type | Description |
|---|---|---|
| `query` | string | Full-text across name, email, title |
| `departmentId` | uuid | Filter by department |
| `managerId` | uuid | Filter by manager |
| `status` | `INVITED\|ACTIVE\|SUSPENDED\|OFFBOARDED` | Filter by employment status |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20, max: 100) |

**Response**
```json
{
  "success": true,
  "data": [...],
  "total": 48,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

### GET `/employees/:id`
Get a single employee.

### GET `/employees/:id/profile`
Full employee profile: personal info, dept, manager, list of direct reports.

### POST `/employees`
Create an employee record linked to an existing user.

**Body**
```json
{
  "userId": "user-uuid",
  "organizationId": "org-uuid",
  "departmentId": "dept-uuid",  // optional
  "title": "Senior Engineer",   // optional
  "employmentStatus": "ACTIVE"  // optional, defaults to INVITED
}
```

**Errors**
- `409 Conflict` — User is already an employee in another organization
- `404 Not Found` — User or organization or department not found

### PATCH `/employees/:id`
Update title or employment status.

### DELETE `/employees/:id`
Remove employee record.

---

## Assignment

### PATCH `/employees/:id/department`
Assign or reassign to a department. Send `null` to orphan (remove from department).

**Body**
```json
{ "departmentId": "dept-uuid" }
```
or
```json
{ "departmentId": null }
```

**Notes**
- Idempotent: if the employee is already in that department, returns without a DB write.
- Validated: department must belong to the same organization.

### PATCH `/employees/:id/manager`
Assign a manager. Send `null` to remove manager assignment.

**Body**
```json
{ "managerId": "emp-uuid" }
```

**Guards enforced**
- **Self-assignment**: `400 Bad Request` — An employee cannot be their own manager
- **Cross-org**: `400 Bad Request` — Manager must belong to the same organization
- **Circular chain**: `400 Bad Request` — Circular manager chain detected

---

## Org Directory

### GET `/organizations/:organizationId/directory`
Full browsable org directory ordered by department → employee name.

**Response**
```json
{
  "success": true,
  "directory": [
    {
      "id": "emp-uuid",
      "user": { "name": "Jane Doe", "email": "jane@org.com" },
      "department": { "name": "Engineering" },
      "manager": { "user": { "name": "Bob Smith" } },
      "employmentStatus": "ACTIVE"
    }
  ]
}
```

---

## Error Format

All errors follow NestJS default:
```json
{
  "statusCode": 404,
  "message": "Department not found",
  "error": "Not Found"
}
```
