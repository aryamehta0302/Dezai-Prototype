import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentAnalyticsService } from './assessment-analytics.service';
import { PrismaService } from '../../../database/prisma.service';
import { AssessmentService } from './assessment.service';
import { WeakTopicDetectionService } from './weak-topic-detection.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('AssessmentAnalyticsService', () => {
  let service: AssessmentAnalyticsService;
  let weakTopicService: WeakTopicDetectionService;

  const mockPrisma = {
    assessment: {
      findUnique: jest.fn(),
    },
    assessmentAttempt: {
      findMany: jest.fn(),
    },
    attemptAnswer: {
      findMany: jest.fn(),
    },
  };

  const mockAssessmentService = {
    validateAssessmentFacultyOwnership: jest.fn(),
  };

  const mockWeakTopicService = {
    getAssessmentWeakTopics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentAnalyticsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AssessmentService, useValue: mockAssessmentService },
        { provide: WeakTopicDetectionService, useValue: mockWeakTopicService },
      ],
    }).compile();

    service = module.get<AssessmentAnalyticsService>(AssessmentAnalyticsService);
    weakTopicService = module.get<WeakTopicDetectionService>(WeakTopicDetectionService);

    jest.clearAllMocks();
  });

  describe('getAssessmentPerformanceReport', () => {
    const assessmentId = 'assessment-123';
    const facultyUserId = 'faculty-456';

    const mockAssessment = {
      id: assessmentId,
      title: 'Analytics Test',
      sampleSize: 10,
      passingScore: 80,
    };

    const mockAttempts = [
      { score: 9, passed: true, completedAt: new Date(), userId: 's1', assessment: { sampleSize: 10 } },
      { score: 6, passed: false, completedAt: new Date(), userId: 's2', assessment: { sampleSize: 10 } },
    ];

    it('should throw NotFoundException if assessment does not exist', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(null);

      await expect(
        service.getAssessmentPerformanceReport(assessmentId, facultyUserId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should propagate ForbiddenException if faculty member does not own the assessment', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(mockAssessment);
      mockAssessmentService.validateAssessmentFacultyOwnership.mockRejectedValue(
        new ForbiddenException('You do not have access to this assessment'),
      );

      await expect(
        service.getAssessmentPerformanceReport(assessmentId, facultyUserId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return combined report including weakTopics on success', async () => {
      mockPrisma.assessment.findUnique.mockResolvedValue(mockAssessment);
      mockAssessmentService.validateAssessmentFacultyOwnership.mockResolvedValue(true);
      mockPrisma.assessmentAttempt.findMany.mockResolvedValue(mockAttempts);
      mockPrisma.attemptAnswer.findMany.mockResolvedValue([]);
      mockWeakTopicService.getAssessmentWeakTopics.mockResolvedValue([
        { category: 'Math', affectedStudents: 1, totalStudents: 2, affectedRate: 0.5, averageWrongRate: 0.6 },
      ]);

      const report = await service.getAssessmentPerformanceReport(
        assessmentId,
        facultyUserId,
      );

      expect(report.assessmentId).toBe(assessmentId);
      expect(report.totalAttempts).toBe(2);
      expect(report.uniqueStudents).toBe(2);
      expect(report.weakTopics).toBeDefined();
      expect(report.weakTopics[0].category).toBe('Math');
      expect(weakTopicService.getAssessmentWeakTopics).toHaveBeenCalledWith(
        assessmentId,
        facultyUserId,
      );
    });
  });
});
