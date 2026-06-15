import { Controller, Post, Get, Param, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { EnrollmentService } from '../services/enrollment.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  /**
   * POST /api/enrollments/:programId
   * Enroll the authenticated user in the target program track.
   */
  @Post(':programId')
  @UseGuards(JwtAuthGuard)
  async enroll(@Param('programId') programId: string, @Req() req) {
    if (!programId) {
      throw new BadRequestException('programId is required');
    }
    const enrollment = await this.enrollmentService.enrollStudent(req.user.id, programId);
    return { success: true, enrollment };
  }

  /**
   * GET /api/enrollments
   * Get all active enrollments of the current student.
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyEnrollments(@Req() req) {
    const enrollments = await this.enrollmentService.getStudentEnrollments(req.user.id);
    return { success: true, enrollments };
  }
}
