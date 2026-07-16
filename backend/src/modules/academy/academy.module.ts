import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';

// Controllers
import { OrganizationController } from './controllers/organization.controller';
import { DepartmentController } from './controllers/department.controller';
import { OrganizationAdminController } from './controllers/org-admin.controller';
import { EmployeeController } from './controllers/employee.controller';

// Repositories
import { OrganizationRepository } from './repositories/organization.repository';
import { DepartmentRepository } from './repositories/department.repository';
import { OrganizationAdminRepository } from './repositories/org-admin.repository';
import { EmployeeRepository } from './repositories/employee.repository';

// Organization Services
import { CreateOrganizationService } from './services/organization/create-organization.service';
import { GetOrganizationService } from './services/organization/get-organization.service';
import { UpdateOrganizationService } from './services/organization/update-organization.service';
import { DeleteOrganizationService } from './services/organization/delete-organization.service';

// Department Services
import { CreateDepartmentService } from './services/department/create-department.service';
import { GetDepartmentsService } from './services/department/get-departments.service';
import { UpdateDepartmentService } from './services/department/update-department.service';
import { DeleteDepartmentService } from './services/department/delete-department.service';

// Org Admin Services
import { AssignOrgAdminService } from './services/org-admin/assign-org-admin.service';
import { RemoveOrgAdminService } from './services/org-admin/remove-org-admin.service';
import { GetOrgAdminsService } from './services/org-admin/get-org-admins.service';

// Employee Services
import { InviteEmployeeService } from './services/employee/invite-employee.service';
import { AcceptInvitationService } from './services/employee/accept-invitation.service';
import { GetEmployeesService } from './services/employee/get-employees.service';
import { RemoveEmployeeService } from './services/employee/remove-employee.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    OrganizationController,
    DepartmentController,
    OrganizationAdminController,
    EmployeeController,
  ],
  providers: [
    // Repositories
    OrganizationRepository,
    DepartmentRepository,
    OrganizationAdminRepository,
    EmployeeRepository,
    
    // Organization Services
    CreateOrganizationService,
    GetOrganizationService,
    UpdateOrganizationService,
    DeleteOrganizationService,

    // Department Services
    CreateDepartmentService,
    GetDepartmentsService,
    UpdateDepartmentService,
    DeleteDepartmentService,

    // Org Admin Services
    AssignOrgAdminService,
    RemoveOrgAdminService,
    GetOrgAdminsService,

    // Employee Services
    InviteEmployeeService,
    AcceptInvitationService,
    GetEmployeesService,
    RemoveEmployeeService,
  ],
  exports: [
    OrganizationRepository,
    DepartmentRepository,
    OrganizationAdminRepository,
    EmployeeRepository,
  ],
})
export class AcademyModule {}
