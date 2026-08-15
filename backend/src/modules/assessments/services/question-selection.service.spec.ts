import { Test, TestingModule } from '@nestjs/testing';
import { QuestionSelectionService } from './question-selection.service';
import { PrismaService } from '../../../database/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';

describe('QuestionSelectionService', () => {
  let service: QuestionSelectionService;
  let prisma: PrismaService;
  let cacheManager: any;

  const mockPrisma = {
    assessment: {
      findUnique: jest.fn(),
    },
    questionBank: {
      findUnique: jest.fn(),
    },
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionSelectionService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<QuestionSelectionService>(QuestionSelectionService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('selectQuestions', () => {
    const assessmentId = 'assessment-123';
    const mockAssessment = {
      id: assessmentId,
      title: 'Sample Assessment',
      passingScore: 80,
      timeLimit: 1800,
      sampleSize: 3,
      questionBankId: 'qbank-456',
    };

    const mockRawQuestions = [
      { id: 'q1', text: 'Q1', category: 'C1', timerSeconds: 60, options: [{ id: 'o1', text: 'Opt 1' }] },
      { id: 'q2', text: 'Q2', category: 'C2', timerSeconds: 60, options: [{ id: 'o2', text: 'Opt 2' }] },
      { id: 'q3', text: 'Q3', category: 'C3', timerSeconds: 60, options: [{ id: 'o3', text: 'Opt 3' }] },
      { id: 'q4', text: 'Q4', category: 'C4', timerSeconds: 60, options: [{ id: 'o4', text: 'Opt 4' }] },
    ];

    it('should throw NotFoundException if assessment does not exist', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(null);

      await expect(service.selectQuestions(assessmentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should hit cache and return formatted question subset without querying question bank', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(mockAssessment);
      mockCache.get.mockResolvedValue(mockRawQuestions);

      const result = await service.selectQuestions(assessmentId);

      expect(cacheManager.get).toHaveBeenCalledWith(`qbank:${assessmentId}:questions`);
      expect(prisma.questionBank.findUnique).not.toHaveBeenCalled();
      expect(result.questions.length).toBe(mockAssessment.sampleSize);
      expect(result.totalAvailable).toBe(mockRawQuestions.length);
    });

    it('should query DB and populate cache on cache miss', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(mockAssessment);
      mockCache.get.mockResolvedValue(null);
      mockPrisma.questionBank.findUnique.mockResolvedValue({
        id: 'qbank-456',
        questions: mockRawQuestions,
      });

      const result = await service.selectQuestions(assessmentId);

      expect(prisma.questionBank.findUnique).toHaveBeenCalled();
      expect(cacheManager.set).toHaveBeenCalledWith(
        `qbank:${assessmentId}:questions`,
        expect.any(Array),
        300000,
      );
      expect(result.questions.length).toBe(mockAssessment.sampleSize);
    });

    it('should produce deterministic selections when a seed is provided', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(mockAssessment);
      mockCache.get.mockResolvedValue(mockRawQuestions);

      // Run multiple times with the same seed
      const res1 = await service.selectQuestions(assessmentId, 'fixedseed');
      const res2 = await service.selectQuestions(assessmentId, 'fixedseed');

      expect(res1.questions).toEqual(res2.questions);
    });
  });
});
