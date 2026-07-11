import { Test, TestingModule } from '@nestjs/testing';
import { ComplianceAssessmentService } from './compliance-assessment.service';
import { EnterpriseQuestionBankService } from './enterprise-question-bank.service';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ComplianceTrack, Difficulty, QuestionBankSourceType } from '@prisma/client';

describe('ComplianceAssessmentService', () => {
  let service: ComplianceAssessmentService;
  let prisma: PrismaService;
  let cacheManager: any;

  const mockPrisma = {
    complianceAssessment: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    enterpriseQuestionBank: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    enterpriseQuestion: {
      create: jest.fn(),
    },
    organizationAdmin: {
      findUnique: jest.fn(),
    },
    employee: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
  };

  const mockAudit = {
    logAction: jest.fn(),
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockQuestionBankService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplianceAssessmentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
        { provide: CACHE_MANAGER, useValue: mockCache },
        { provide: EnterpriseQuestionBankService, useValue: mockQuestionBankService },
      ],
    }).compile();

    service = module.get<ComplianceAssessmentService>(ComplianceAssessmentService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  describe('createAssessment', () => {
    it('should throw BadRequestException if bank has fewer than 10 questions', async () => {
      mockPrisma.enterpriseQuestionBank.findUnique.mockResolvedValue({
        id: 'bank-123',
        _count: { questions: 8 },
      });

      const dto = {
        organizationId: 'org-123',
        questionBankId: 'bank-123',
        title: 'Cyber Compliance',
        complianceTrack: ComplianceTrack.CYBER_SECURITY,
      };

      await expect(service.createAssessment(dto, 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create compliance assessment if bank has >=10 questions', async () => {
      mockPrisma.enterpriseQuestionBank.findUnique.mockResolvedValue({
        id: 'bank-123',
        _count: { questions: 12 },
      });
      mockPrisma.complianceAssessment.create.mockResolvedValue({ id: 'ass-123', title: 'Cyber Compliance' });
      mockPrisma.complianceAssessment.findUnique.mockResolvedValue({ id: 'ass-123', title: 'Cyber Compliance' });

      const dto = {
        organizationId: 'org-123',
        questionBankId: 'bank-123',
        title: 'Cyber Compliance',
        complianceTrack: ComplianceTrack.CYBER_SECURITY,
      };

      const result = await service.createAssessment(dto, 'user-123');
      expect(result.id).toBe('ass-123');
      expect(mockPrisma.complianceAssessment.create).toHaveBeenCalled();
      expect(mockAudit.logAction).toHaveBeenCalled();
    });
  });

  describe('ingestGeneratedAssessment', () => {
    it('should throw BadRequestException if questions count is under 10', async () => {
      const dto = {
        organizationId: 'org-123',
        title: 'AI Compliance',
        complianceTrack: ComplianceTrack.PASSWORD_SECURITY,
        questions: Array(5).fill({ text: 'Q', options: [] }),
      };

      await expect(service.ingestGeneratedAssessment(dto, 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create question bank, questions, and assessment in a transaction', async () => {
      const questionsDto = Array(10).fill(null).map((_, i) => ({
        text: `Question ${i}`,
        category: 'PassSec',
        difficulty: Difficulty.MEDIUM,
        explanation: 'Exp',
        options: [
          { text: 'A', isCorrect: true },
          { text: 'B', isCorrect: false },
        ],
      }));

      const dto = {
        organizationId: 'org-123',
        title: 'AI Compliance',
        complianceTrack: ComplianceTrack.PASSWORD_SECURITY,
        sourceDocumentId: 'doc-456',
        questions: questionsDto,
      };

      mockPrisma.enterpriseQuestionBank.create.mockResolvedValue({ id: 'bank-ai' });
      mockPrisma.complianceAssessment.create.mockResolvedValue({ id: 'ass-ai' });
      mockPrisma.complianceAssessment.findUnique.mockResolvedValue({ id: 'ass-ai', title: 'AI Compliance' });

      const result = await service.ingestGeneratedAssessment(dto, 'user-123');

      expect(result.title).toBe('AI Compliance');
      expect(mockPrisma.enterpriseQuestionBank.create).toHaveBeenCalledWith({
        data: {
          title: 'AI Compliance - Question Bank',
          description: 'AI-generated compliance questions from document doc-456',
          organizationId: 'org-123',
          departmentId: undefined,
          complianceTrack: ComplianceTrack.PASSWORD_SECURITY,
          sourceType: QuestionBankSourceType.AI_GENERATED,
          sourceDocumentId: 'doc-456',
        },
      });
      expect(mockPrisma.enterpriseQuestion.create).toHaveBeenCalledTimes(10);
      expect(mockPrisma.complianceAssessment.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org-123',
          departmentId: undefined,
          questionBankId: 'bank-ai',
          title: 'AI Compliance',
          complianceTrack: ComplianceTrack.PASSWORD_SECURITY,
          passingScore: 80,
          sampleSize: 10,
          timeLimit: 900,
          maxAttempts: 3,
          timeLimitEnabled: true,
          allowResume: true,
        },
      });
      expect(mockAudit.logAction).toHaveBeenCalled();
    });
  });
});
