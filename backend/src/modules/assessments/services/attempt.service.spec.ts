import { Test, TestingModule } from '@nestjs/testing';
import { AttemptService } from './attempt.service';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { PassFailEvaluationService } from './pass-fail-evaluation.service';
import { AwardService } from '../../achievements/services/award.service';
import { XpService } from '../../users/services/xp.service';
import { AssessmentService } from './assessment.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AttemptService', () => {
  let service: AttemptService;

  const mockPrisma = {
    assessmentAttempt: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    examSession: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    questionOption: {
      findUnique: jest.fn(),
    },
    attemptAnswer: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockAudit = {
    logAction: jest.fn(),
  };

  const mockPassFail = {
    calculatePercentage: jest.fn(),
  };

  const mockAward = {
    checkAndAward: jest.fn(),
  };

  const mockXpService = {
    awardXP: jest.fn(),
  };

  const mockAssessmentService = {
    getAssessmentById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttemptService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
        { provide: PassFailEvaluationService, useValue: mockPassFail },
        { provide: AwardService, useValue: mockAward },
        { provide: XpService, useValue: mockXpService },
        { provide: AssessmentService, useValue: mockAssessmentService },
      ],
    }).compile();

    service = module.get<AttemptService>(AttemptService);

    jest.clearAllMocks();
  });

  describe('syncAnswers', () => {
    const userId = 'student-123';
    const attemptId = 'attempt-789';
    const syncDto = {
      attemptId,
      answers: { 'q-1': 'opt-a', 'q-2': 'opt-b' },
    };

    it('should throw NotFoundException if attempt does not exist', async () => {
      mockPrisma.assessmentAttempt.findUnique.mockResolvedValue(null);

      await expect(service.syncAnswers(userId, syncDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if attempt belongs to another student', async () => {
      mockPrisma.assessmentAttempt.findUnique.mockResolvedValue({
        id: attemptId,
        userId: 'other-student',
        completedAt: null,
      });

      await expect(service.syncAnswers(userId, syncDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if attempt is already completed', async () => {
      mockPrisma.assessmentAttempt.findUnique.mockResolvedValue({
        id: attemptId,
        userId,
        completedAt: new Date(),
      });

      await expect(service.syncAnswers(userId, syncDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should successfully sync answers, calling autoSaveAnswers details', async () => {
      mockPrisma.assessmentAttempt.findUnique.mockResolvedValue({
        id: attemptId,
        userId,
        completedAt: null,
        assessment: {
          questionBank: {
            questions: [
              { id: 'q-1', options: [{ id: 'opt-a', isCorrect: true }] },
              { id: 'q-2', options: [{ id: 'opt-b', isCorrect: true }] },
            ],
          },
        },
      });

      // Mock the session validation inside autoSaveAnswers
      mockPrisma.examSession.findFirst = jest.fn().mockResolvedValue({
        id: 'session-1',
        status: 'ACTIVE',
      });
      mockPrisma.examSession.update.mockResolvedValue({});

      const result = await service.syncAnswers(userId, syncDto);

      expect(result).toEqual({
        syncedCount: 2,
        serverTimestamp: expect.any(Number),
      });
    });
  });
});
