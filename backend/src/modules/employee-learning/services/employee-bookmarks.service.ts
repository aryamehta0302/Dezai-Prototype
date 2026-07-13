import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EmployeeLearningRepository } from '../repositories/employee-learning.repository';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class EmployeeBookmarksService {
  constructor(
    private readonly repo: EmployeeLearningRepository,
    private readonly auditService: AuditService,
  ) {}

  async toggleBookmark(userId: string, assessmentId: string) {
    const assessment = await this.repo.findAssessmentById(assessmentId);
    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    const employee = await this.repo.findEmployeeByUserId(userId);
    if (!employee) {
      throw new BadRequestException('User is not an employee');
    }

    if (assessment.organizationId !== employee.organizationId) {
      throw new BadRequestException('Assessment not available to this employee');
    }

    const result = await this.repo.toggleBookmark(userId, assessmentId);

    const action = result.bookmarked
      ? AuditAction.EMPLOYEE_BOOKMARK_ADDED
      : AuditAction.EMPLOYEE_BOOKMARK_REMOVED;
    await this.auditService.logAction(userId, action, `Bookmark ${result.bookmarked ? 'added to' : 'removed from'} assessment ${assessmentId}`);

    return {
      assessmentId,
      bookmarked: result.bookmarked,
    };
  }

  async getBookmarks(userId: string) {
    const bookmarks = await this.repo.findBookmarks(userId);
    return bookmarks.map((b) => ({
      id: b.id,
      assessmentId: b.assessmentId,
      assessmentTitle: b.assessment.title,
      complianceTrack: b.assessment.complianceTrack,
      passingScore: b.assessment.passingScore,
      createdAt: b.createdAt,
    }));
  }

  async isBookmarked(userId: string, assessmentId: string) {
    return this.repo.isBookmarked(userId, assessmentId);
  }
}
