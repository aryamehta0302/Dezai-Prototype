import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { DepartmentService } from '../services/department.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { RbacScopeService } from '../../../shared/services/rbac-scope.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  AssignDepartmentHeadDto,
} from '../dto/department.dto';

@Controller('departments')
export class DepartmentController {
  constructor(
    private readonly departmentService: DepartmentService,
    private readonly rbacScopeService: RbacScopeService,
  ) {}

  private async resolveInstitutionId(req: any, dtoInstitutionId?: string): Promise<string> {
    const user = req.user;
    if (user.role === UserRole.DEZAI_ADMIN) {
      if (!dtoInstitutionId) {
        throw new ForbiddenException('institutionId parameter is required for platform admin');
      }
      return dtoInstitutionId;
    }
    return this.rbacScopeService.getAdminInstitutionId(user.id || user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async createDepartment(@Req() req, @Body() body: CreateDepartmentDto) {
    const institutionId = await this.resolveInstitutionId(req, body.institutionId);
    return this.departmentService.createDepartment(institutionId, body, req.user.id || req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getDepartments(@Req() req, @Query('institutionId') queryInstitutionId?: string) {
    let instId = queryInstitutionId;
    if (req.user.role === UserRole.UNIVERSITY_ADMIN) {
      instId = await this.rbacScopeService.getAdminInstitutionId(req.user.id || req.user.userId);
    }
    if (!instId) {
      throw new ForbiddenException('institutionId query parameter required');
    }
    return this.departmentService.getDepartments(instId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getDepartmentById(@Param('id') id: string) {
    return this.departmentService.getDepartmentById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async updateDepartment(
    @Req() req,
    @Param('id') id: string,
    @Query('institutionId') queryInstId: string,
    @Body() body: UpdateDepartmentDto,
  ) {
    const instId = await this.resolveInstitutionId(req, queryInstId);
    return this.departmentService.updateDepartment(id, instId, body, req.user.id || req.user.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async deleteDepartment(
    @Req() req,
    @Param('id') id: string,
    @Query('institutionId') queryInstId: string,
  ) {
    const instId = await this.resolveInstitutionId(req, queryInstId);
    return this.departmentService.deleteDepartment(id, instId, req.user.id || req.user.userId);
  }

  @Post(':id/head')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async assignHead(
    @Req() req,
    @Param('id') id: string,
    @Query('institutionId') queryInstId: string,
    @Body() body: AssignDepartmentHeadDto,
  ) {
    const instId = await this.resolveInstitutionId(req, queryInstId);
    return this.departmentService.assignDepartmentHead(
      id,
      body.facultyId,
      instId,
      req.user.id || req.user.userId,
    );
  }

  @Get(':id/statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
  async getDepartmentStatistics(
    @Req() req,
    @Param('id') id: string,
    @Query('institutionId') queryInstId: string,
  ) {
    const instId = await this.resolveInstitutionId(req, queryInstId);
    return this.departmentService.getDepartmentStatistics(id, instId);
  }
}
