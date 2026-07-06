import { Controller, Post, Get, Delete, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { EnrollmentService } from '../services/enrollment.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post(':programId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  async enroll(@Param('programId') programId: string, @Req() req) {
    if (!programId) {
      throw new BadRequestException('programId is required');
    }
    const enrollment = await this.enrollmentService.enrollStudent(req.user.id, programId);
    return { success: true, enrollment };
  }

  @Delete(':programId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  async drop(@Param('programId') programId: string, @Req() req) {
    if (!programId) {
      throw new BadRequestException('programId is required');
    }
    return this.enrollmentService.dropEnrollment(req.user.id, programId);
  }

  @Get()
  async getMyEnrollments(@Req() req) {
    const enrollments = await this.enrollmentService.getStudentEnrollments(req.user.id);
    return { success: true, enrollments };
  }
}
