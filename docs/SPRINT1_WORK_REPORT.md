# Dezai Sprint 1 — Work Report

**Developer:** Manan Panchal  
**Role:** Curriculum & Program Management Lead — Team B  
**Branch:** `feature/programs-crud`  
**Commit:** `c97cd49`  
**Date:** 2026-06-17  
**Status:** ✅ All Tasks Complete — Ready for CTO Review

## 1. Assigned Responsibilities
As defined in the Dezai Sprint 1 Task Allocation, ownership was assigned for the following domains:

| Ownership Domain | Allowed Module Paths |
| :--- | :--- |
| Programs | `programs/*` |
| Tracks | `tracks/*` |
| Modules | `modules/*` |
| Lessons | `lessons/*` |

### Sprint Tasks

**Program CRUD**
* Create Program
* Edit Program
* Delete Program
* Program Status

**Track CRUD**
* ROOTS Track
* EDGE Track

**Module CRUD**
* Add Module
* Edit Module
* Delete Module
* Reorder Modules

**Lesson CRUD**
* Add Lesson
* Edit Lesson
* Delete Lesson
* Ordering

**Faculty Program Management Backend**
* Program Builder
* Track Builder
* Module Builder
* Lesson Builder

### Restricted Modules (Not Modified)
Per team rules, the following modules were not touched:
* `learning/*`
* `assessments/*`
* `credentials/*`
* `ai/*`

---

## 2. Files Modified

### File 1 — `backend/src/modules/programs/dto/programs.dto.ts`
**Status:** 🆕 Created

**Purpose:** Introduced dedicated DTO classes using `class-validator` decorators to comply with backend standards.

**Added DTOs:**

| DTO | Purpose |
| :--- | :--- |
| `CreateProgramDto` | Validate program creation payload |
| `UpdateProgramDto` | Validate optional program update fields |
| `CreateTrackDto` | Validate ROOTS/EDGE track creation |
| `UpdateTrackDto` | Validate track updates |
| `CreateModuleDto` | Validate module creation |
| `UpdateModuleDto` | Validate module updates |
| `ReorderModulesDto` | Validate module reorder array |
| `CreateLessonDto` | Validate lesson creation |
| `UpdateLessonDto` | Validate lesson updates |

**Validation Standards Applied:** `@IsString()`, `@IsOptional()`, `@IsEnum()`, `@IsArray()`, `@IsInt()`, `@Min()`, `@IsUrl()`

### File 2 — `backend/src/modules/programs/controllers/programs.controller.ts`
**Status:** ♻️ Refactored

**Problems Fixed:**
* Inline DTOs without validation
* Missing delete endpoints
* Direct Prisma access inside controller
* Missing Track / Module / Lesson APIs

**Implemented Endpoints:**

**Program Endpoints**
| Endpoint | Status |
| :--- | :--- |
| `POST /api/programs` | ✅ |
| `GET /api/programs` | ✅ |
| `PUT /api/programs/:id` | ✅ |
| `DELETE /api/programs/:id` | ✅ |

**Track Endpoints**
| Endpoint | Status |
| :--- | :--- |
| `GET /api/programs/:id/tracks` | ✅ |
| `POST /api/programs/:id/tracks` | ✅ |
| `PUT /api/programs/tracks/:trackId` | ✅ |

**Module Endpoints**
| Endpoint | Status |
| :--- | :--- |
| `POST /api/programs/tracks/:trackId/modules` | ✅ |
| `PUT /api/programs/modules/:moduleId` | ✅ |
| `DELETE /api/programs/modules/:moduleId` | ✅ |
| `PUT /api/programs/modules/:moduleId/reorder` | ✅ |

**Lesson Endpoints**
| Endpoint | Status |
| :--- | :--- |
| `POST /api/programs/modules/:moduleId/lessons` | ✅ |
| `PUT /api/programs/lessons/:lessonId` | ✅ |
| `DELETE /api/programs/lessons/:lessonId` | ✅ |

**Security Standards:**
* **Read Routes:** `@UseGuards(JwtAuthGuard)`
* **Write Routes:** `@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles(FACULTY, UNIVERSITY_ADMIN, DEZAI_ADMIN)`

### File 3 — `backend/src/modules/programs/services/programs.service.ts`
**Status:** ♻️ Extended

**Added Business Logic:**

| Method | Purpose |
| :--- | :--- |
| `getPrograms(institutionId?)` | Program filtering |
| `deleteProgram()` | Delete program |
| `getProgramTracks()` | Fetch nested tracks/modules/lessons |
| `getTrackById()` | Ownership helper |
| `createTrack()` | Create ROOTS/EDGE track |
| `updateTrack()` | Edit track |
| `getModuleById()` | Ownership helper |
| `updateModule()` | Edit module |
| `deleteModule()` | Delete module |
| `reorderModules()` | Atomic reorder transaction |
| `getLessonById()` | Ownership helper |
| `addLesson()` | Create lesson |
| `updateLesson()` | Edit lesson |
| `deleteLesson()` | Delete lesson |

**Ownership Validation Chain:**
* **Lesson Route:** `getLessonById` → `getModuleById` → `getTrackById` → `validateProgramOwnership`
* **Module Route:** `getModuleById` → `getTrackById` → `validateProgramOwnership`
* **Track Route:** `getTrackById` → `validateProgramOwnership`
* **Program Route:** `validateProgramOwnership`

**Access Control Matrix:**

| Role | Access |
| :--- | :--- |
| `DEZAI_ADMIN` | Full access |
| `UNIVERSITY_ADMIN` | Same institution only |
| `FACULTY` | Owner OR same institution |

### File 4 — `backend/src/modules/programs/programs.module.ts`
**Status:** ♻️ Updated
* **Change:** `imports: [AuditModule]`
* **Reason:** Required for dependency injection of AuditService.

### File 5 — `backend/package.json`
**Status:** ♻️ Updated
* **Added Dependencies:**
  * `"class-transformer": "^0.5.1"`
  * `"class-validator": "^0.15.1"`
* **Reason:** Required for DTO validation using NestJS ValidationPipe.

### File 6 — `docs/IMPLEMENTED.md`
**Status:** ♻️ Updated
* **Added New section:** `Phase 3: Curriculum & Program Management (Sprint 1)`
* **Documented:** Features completed, Modified files, Sprint deliverables

---

## 3. Standards Compliance Checklist

| Rule | Status |
| :--- | :--- |
| No banned terminology used | ✅ |
| DTO naming conventions followed | ✅ |
| REST endpoints use plural naming | ✅ |
| Correct branch naming convention | ✅ |
| Consistent variable naming | ✅ |
| No unauthorized module edits | ✅ |
| Documentation updated | ✅ |
| No schema changes made | ✅ |
| Validation decorators applied | ✅ |
| Audit logging implemented | ✅ |

---

## 4. Sprint Success Criteria

| Capability | Endpoint / Method | Status |
| :--- | :--- | :--- |
| Create Program | `POST /api/programs` | ✅ |
| Auto-create ROOTS + EDGE tracks | `createProgram()` | ✅ |
| Filter Programs by Institution | `GET /api/programs?institutionId=` | ✅ |
| Update Program | `PUT /api/programs/:id` | ✅ |
| Delete Program | `DELETE /api/programs/:id` | ✅ |
| View Program Tracks | `GET /api/programs/:id/tracks` | ✅ |
| Create Track | `POST /api/programs/:id/tracks` | ✅ |
| Update Track | `PUT /api/programs/tracks/:trackId` | ✅ |
| Add Module | `POST /api/programs/tracks/:trackId/modules` | ✅ |
| Edit Module | `PUT /api/programs/modules/:moduleId` | ✅ |
| Delete Module | `DELETE /api/programs/modules/:moduleId` | ✅ |
| Reorder Modules | `PUT /api/programs/modules/:moduleId/reorder` | ✅ |
| Add Lesson | `POST /api/programs/modules/:moduleId/lessons` | ✅ |
| Edit Lesson | `PUT /api/programs/lessons/:lessonId` | ✅ |
| Delete Lesson | `DELETE /api/programs/lessons/:lessonId` | ✅ |

---

## 5. Database Changes
No database schema modifications were made.  
Existing Prisma models used:
* `Program`
* `ProgramTrack`
* `Module`
* `Lesson`

---

## 6. Known Issues
1. **Lesson Order Uniqueness:** Lesson ordering uniqueness is not enforced at the database level.
   * *Impact:* Frontend must prevent duplicate order values.
2. **Missing Audit Enum:** `AuditAction.PROGRAM_DELETED` does not currently exist.
   * *Temporary Solution:* `PROGRAM_UPDATED` is used as fallback for delete logging.

---

### Final Summary
All Sprint 1 responsibilities assigned to the Curriculum & Program Management domain were completed successfully within architecture and governance constraints.

**Deliverables Completed:**
* Program CRUD
* Track CRUD
* Module CRUD
* Lesson CRUD
* Ownership validation
* Role-based access control
* DTO validation compliance
* Audit logging integration
* Documentation updates

**Prepared By:** Manan Panchal  
**Team:** Team B — Dezai  
**Sprint:** Sprint 1  
**Date:** June 17, 2026
