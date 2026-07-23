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
} from '@nestjs/common';
import { FacultyManagementService } from '../services/faculty-management.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole, FacultyVerificationStatus } from '@prisma/client';
import { InstitutionScopeGuard } from '../../../common/guards/institution-scope.guard';
import {
  CreateFacultyRegistrationDto,
  UpdateFacultyProfileDto,
  RejectFacultyDto,
} from '../dto/faculty-management.dto';

@Controller('university-admin/faculty')
@UseGuards(JwtAuthGuard, RolesGuard, InstitutionScopeGuard)
@Roles(UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
export class FacultyManagementController {
  constructor(private readonly facultyService: FacultyManagementService) {}

  @Get('pending')
  async getPendingRegistrations(@Req() req) {
    return this.facultyService.getPendingFacultyRegistrations(req.institutionId);
  }

  @Get('search')
  async searchFaculty(
    @Req() req,
    @Query('query') query?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: FacultyVerificationStatus,
  ) {
    return this.facultyService.getAllFaculty(req.institutionId, {
      search: query,
      departmentId,
      status,
    });
  }

  @Get()
  async getAllFaculty(
    @Req() req,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: FacultyVerificationStatus,
    @Query('search') search?: string,
  ) {
    return this.facultyService.getAllFaculty(req.institutionId, {
      departmentId,
      status,
      search,
    });
  }

  @Get(':id')
  async getFacultyById(@Req() req, @Param('id') id: string) {
    return this.facultyService.getFacultyById(id, req.institutionId);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approveFaculty(@Req() req, @Param('id') id: string) {
    return this.facultyService.approveFaculty(id, req.institutionId, req.user.id || req.user.userId);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectFaculty(@Req() req, @Param('id') id: string, @Body() body: RejectFacultyDto) {
    return this.facultyService.rejectFaculty(id, req.institutionId, req.user.id || req.user.userId, body);
  }

  @Post('assign')
  @HttpCode(HttpStatus.CREATED)
  async assignFaculty(
    @Req() req,
    @Query('userId') userId: string,
    @Body() body: CreateFacultyRegistrationDto,
  ) {
    return this.facultyService.assignFacultyToUniversity(
      userId,
      req.institutionId,
      body,
      req.user.id || req.user.userId,
    );
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  async suspendFaculty(@Req() req, @Param('id') id: string) {
    return this.facultyService.suspendFaculty(id, req.institutionId, req.user.id || req.user.userId);
  }

  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  async reactivateFaculty(@Req() req, @Param('id') id: string) {
    return this.facultyService.reactivateFaculty(id, req.institutionId, req.user.id || req.user.userId);
  }

  @Delete(':id')
  async removeFaculty(@Req() req, @Param('id') id: string) {
    return this.facultyService.removeFacultyFromUniversity(id, req.institutionId, req.user.id || req.user.userId);
  }

  @Patch(':id')
  async updateFacultyProfile(
    @Req() req,
    @Param('id') id: string,
    @Body() body: UpdateFacultyProfileDto,
  ) {
    return this.facultyService.updateFacultyProfile(id, req.institutionId, body, req.user.id || req.user.userId);
  }
}
