import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { EmployeeLearningRepository } from '../repositories/employee-learning.repository';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction } from '@prisma/client';

@Injectable()
export class EmployeeNotesService {
  constructor(
    private readonly repo: EmployeeLearningRepository,
    private readonly auditService: AuditService,
  ) {}

  async upsertNote(userId: string, assessmentId: string, content: string) {
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

    const note = await this.repo.upsertNote(userId, assessmentId, content);

    await this.auditService.logAction(userId, AuditAction.NOTE_CREATED, `Note upserted for assessment ${assessmentId}`);

    return {
      id: note.id,
      assessmentId: note.assessmentId,
      assessmentTitle: note.assessment.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  async getNote(userId: string, assessmentId: string) {
    const note = await this.repo.findNote(userId, assessmentId);
    if (!note) return null;

    return {
      id: note.id,
      assessmentId: note.assessmentId,
      assessmentTitle: note.assessment.title,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  async getAllNotes(userId: string) {
    const notes = await this.repo.findAllNotes(userId);
    return notes.map((n) => ({
      id: n.id,
      assessmentId: n.assessmentId,
      assessmentTitle: n.assessment.title,
      complianceTrack: n.assessment.complianceTrack,
      content: n.content,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }));
  }
}
