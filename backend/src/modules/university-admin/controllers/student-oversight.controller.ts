import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StudentOversightService } from '../services/student-oversight.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { InstitutionScopeGuard } from '../../../common/guards/institution-scope.guard';
import { AssignMentorDto, ChangeMentorDto } from '../dto/student-management.dto';

@Controller('university-admin/students')
@UseGuards(JwtAuthGuard, RolesGuard, InstitutionScopeGuard)
@Roles(UserRole.UNIVERSITY_ADMIN, UserRole.DEZAI_ADMIN)
export class StudentOversightController {
  constructor(private readonly studentService: StudentOversightService) {}

  @Get('search')
  async searchStudents(
    @Req() req,
    @Query('query') query?: string,
    @Query('programId') programId?: string,
    @Query('status') status?: string,
  ) {
    return this.studentService.getAllStudents(req.institutionId, {
      search: query,
      programId,
      status,
    });
  }

  @Get()
  async getAllStudents(
    @Req() req,
    @Query('programId') programId?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.studentService.getAllStudents(req.institutionId, {
      programId,
      search,
      status,
    });
  }

  @Get(':id')
  async getStudentDetail(@Req() req, @Param('id') id: string) {
    return this.studentService.getStudentDetail(id, req.institutionId);
  }

  @Get(':id/progress')
  async getStudentProgress(@Req() req, @Param('id') id: string) {
    return this.studentService.getStudentProgress(id, req.institutionId);
  }

  @Get(':id/enrollments')
  async getStudentEnrollments(@Req() req, @Param('id') id: string) {
    return this.studentService.getStudentEnrollments(id, req.institutionId);
  }

  @Get(':id/assessments')
  async getStudentAssessments(@Req() req, @Param('id') id: string) {
    return this.studentService.getStudentAssessmentPerformance(id, req.institutionId);
  }

  @Get(':id/credentials')
  async getStudentCredentials(@Req() req, @Param('id') id: string) {
    return this.studentService.getStudentCredentials(id, req.institutionId);
  }

  @Post('mentor')
  @HttpCode(HttpStatus.OK)
  async assignMentor(@Req() req, @Body() body: AssignMentorDto) {
    return this.studentService.assignMentor(body, req.institutionId, req.user.id || req.user.userId);
  }

  @Post('mentor/change')
  @HttpCode(HttpStatus.OK)
  async changeMentor(
    @Req() req,
    @Query('enrollmentId') enrollmentId: string,
    @Body() body: ChangeMentorDto,
  ) {
    return this.studentService.changeMentor(
      enrollmentId,
      body,
      req.institutionId,
      req.user.id || req.user.userId,
    );
  }
}
