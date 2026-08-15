import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceAttemptService } from './compliance-attempt.service';
import { ComplianceAssessmentService } from './compliance-assessment.service';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { PassFailEvaluationService } from '../../assessments/services/pass-fail-evaluation.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ComplianceTrack } from '@prisma/client';

describe('ComplianceAttemptService', () => {
  let service: ComplianceAttemptService;
  let prisma: PrismaService;
  let mockAssessmentService: any;

  const mockPrisma = {
    complianceAssessment: {
      findUnique: jest.fn(),
    },
    employee: {
      findUnique: jest.fn(),
    },
    complianceAssessmentAttempt: {
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
      delete: jest.fn(),
    },
    complianceAttemptAnswer: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockAudit = {
    logAction: jest.fn(),
  };

  const mockPassFail = {
    calculatePercentage: jest.fn(),
  };

  const mockComplianceAssessmentService = {
    selectEnterpriseQuestions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceAttemptService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
        { provide: PassFailEvaluationService, useValue: mockPassFail },
        { provide: ComplianceAssessmentService, useValue: mockComplianceAssessmentService },
      ],
    }).compile();

    service = module.get<ComplianceAttemptService>(ComplianceAttemptService);
    prisma = module.get<PrismaService>(PrismaService);
    mockAssessmentService = module.get<ComplianceAssessmentService>(ComplianceAssessmentService);

    jest.clearAllMocks();
  });

  describe('startAttempt', () => {
    const userId = 'user-123';
    const assessmentId = 'assessment-123';
    const orgId = 'org-123';

    it('should throw NotFoundException if assessment does not exist', async () => {
      mockPrisma.complianceAssessment.findUnique.mockResolvedValue(null);
      await expect(service.startAttempt(userId, assessmentId)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if employee profile does not exist', async () => {
      mockPrisma.complianceAssessment.findUnique.mockResolvedValue({ id: assessmentId, organizationId: orgId });
      mockPrisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.startAttempt(userId, assessmentId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if employee does not belong to the assessment organization', async () => {
      mockPrisma.complianceAssessment.findUnique.mockResolvedValue({ id: assessmentId, organizationId: orgId });
      mockPrisma.employee.findUnique.mockResolvedValue({ id: 'emp-123', organizationId: 'different-org' });
      await expect(service.startAttempt(userId, assessmentId)).rejects.toThrow(ForbiddenException);
    });

    it('should create attempt and return questions when validation passes', async () => {
      mockPrisma.complianceAssessment.findUnique.mockResolvedValue({
        id: assessmentId,
        organizationId: orgId,
        maxAttempts: 3,
        allowResume: true,
      });
      mockPrisma.employee.findUnique.mockResolvedValue({ id: 'emp-123', organizationId: orgId });
      mockPrisma.complianceAssessmentAttempt.findFirst.mockResolvedValue(null);
      mockPrisma.complianceAssessmentAttempt.count.mockResolvedValue(0);
      mockPrisma.complianceAssessmentAttempt.create.mockResolvedValue({ id: 'attempt-123', startedAt: new Date() });
      mockAssessmentService.selectEnterpriseQuestions.mockResolvedValue({
        questions: [{ id: 'q1', text: 'Q1' }],
      });

      const result = await service.startAttempt(userId, assessmentId);
      expect(result.attemptId).toBe('attempt-123');
      expect(mockPrisma.complianceAssessmentAttempt.create).toHaveBeenCalled();
      expect(mockAssessmentService.selectEnterpriseQuestions).toHaveBeenCalledWith(assessmentId);
    });
  });

  describe('submitAttempt', () => {
    const userId = 'user-123';
    const attemptId = 'attempt-123';

    it('should calculate score and percentage correctly, and save them on attempt submit', async () => {
      mockPrisma.complianceAssessmentAttempt.findUnique.mockResolvedValue({
        id: attemptId,
        userId,
        startedAt: new Date(),
        completedAt: null,
        assessment: {
          sampleSize: 2,
          passingScore: 80,
          questionBank: {
            questions: [
              { id: 'q1', options: [{ id: 'o1', isCorrect: true }, { id: 'o2', isCorrect: false }] },
              { id: 'q2', options: [{ id: 'o3', isCorrect: true }, { id: 'o4', isCorrect: false }] },
            ],
          },
        },
      });

      mockPassFail.calculatePercentage.mockReturnValue(50.0);
      mockPrisma.complianceAssessmentAttempt.update.mockResolvedValue({
        id: attemptId,
        score: 1,
        percentage: 50.0,
        passed: false,
      });

      const result = await service.submitAttempt(userId, attemptId, {
        q1: 'o1', // correct
        q2: 'o4', // incorrect
      });

      expect(result.score).toBe(1);
      expect(result.percentage).toBe(50.0);
      expect(result.passed).toBe(false);
      expect(mockPrisma.complianceAttemptAnswer.create).toHaveBeenCalledTimes(2);
      expect(mockPrisma.complianceAssessmentAttempt.update).toHaveBeenCalledWith({
        where: { id: attemptId },
        data: {
          score: 1,
          percentage: 50.0,
          passed: false,
          completedAt: expect.any(Date),
          timeTakenSeconds: expect.any(Number),
        },
      });
      expect(mockAudit.logAction).toHaveBeenCalled();
    });

    it('should fail the attempt if timeLimit is exceeded and timeLimitEnabled is true', async () => {
      // Set startedAt to 20 minutes ago
      const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);

      mockPrisma.complianceAssessmentAttempt.findUnique.mockResolvedValue({
        id: attemptId,
        userId,
        startedAt: twentyMinutesAgo,
        completedAt: null,
        assessment: {
          sampleSize: 2,
          passingScore: 80,
          timeLimit: 600, // 10 minutes limit
          timeLimitEnabled: true,
          questionBank: {
            questions: [
              { id: 'q1', options: [{ id: 'o1', isCorrect: true }, { id: 'o2', isCorrect: false }] },
              { id: 'q2', options: [{ id: 'o3', isCorrect: true }, { id: 'o4', isCorrect: false }] },
            ],
          },
        },
      });

      mockPassFail.calculatePercentage.mockReturnValue(100.0); // Passed score-wise
      mockPrisma.complianceAssessmentAttempt.update.mockResolvedValue({
        id: attemptId,
        score: 2,
        percentage: 100.0,
        passed: false, // expected false because time exceeded
      });

      const result = await service.submitAttempt(userId, attemptId, {
        q1: 'o1',
        q2: 'o3',
      });

      expect(result.passed).toBe(false);
      expect(mockPrisma.complianceAssessmentAttempt.update).toHaveBeenCalledWith({
        where: { id: attemptId },
        data: {
          score: 2,
          percentage: 100.0,
          passed: false, // enforced by service time limit check
          completedAt: expect.any(Date),
          timeTakenSeconds: expect.any(Number),
        },
      });
    });
  });
});
