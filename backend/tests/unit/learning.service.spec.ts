import { Test, TestingModule } from '@nestjs/testing';
import { LearningService } from '../../src/modules/learning/services/learning.service';
import { PrismaService } from '../../src/database/prisma.service';
import { EnrollmentService } from '../../src/modules/programs/services/enrollment.service';
import { XpService } from '../../src/modules/users/services/xp.service';
import { AwardService } from '../../src/modules/achievements/services/award.service';
import { AuditService } from '../../src/modules/audit/services/audit.service';
import { XpType, AchievementCategory, AuditAction } from '@prisma/client';
import { InsightsSseService } from '../../src/modules/analytics/services/insights-sse.service';

describe('LearningService', () => {
  let service: LearningService;

  const mockTx = {
    progress: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
    lesson: { findUnique: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn() },
    xpTransaction: { create: jest.fn() },
    enrollment: { count: jest.fn() },
  };

  const mockPrisma = {
    progress: { findUnique: jest.fn(), create: jest.fn(), count: jest.fn(), delete: jest.fn() },
    lesson: { findUnique: jest.fn() },
    bookmark: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
    note: { findUnique: jest.fn(), upsert: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn(), count: jest.fn() },
    resource: { findMany: jest.fn() },
    enrollment: { count: jest.fn(), findUnique: jest.fn() },
    retryOnWakeup: jest.fn((fn: () => Promise<any>) => fn()),
    $transaction: jest.fn(),
  };

  const mockEnrollmentService = {
    updateEnrollmentProgress: jest.fn(),
  };

  const mockXpService = {
    awardXp: jest.fn(),
    getUserXpDetails: jest.fn(),
  };

  const mockAwardService = {
    checkAndAward: jest.fn(),
  };

  const mockAuditService = {
    logAction: jest.fn(),
  };

  const mockInsightsSse = {
    notifyFacultyOfStudentUpdate: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EnrollmentService, useValue: mockEnrollmentService },
        { provide: XpService, useValue: mockXpService },
        { provide: AwardService, useValue: mockAwardService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: InsightsSseService, useValue: mockInsightsSse },
      ],
    }).compile();

    service = module.get<LearningService>(LearningService);
    mockPrisma.enrollment.findUnique.mockResolvedValue({ progress: 50 });
  });

  describe('completeLesson', () => {
    const lessonWithModule = {
      id: 'lesson-1',
      module: {
        lessons: [{ id: 'lesson-1' }, { id: 'lesson-2' }],
        track: { programId: 'prog-1' },
      },
    };

    it('should return alreadyCompleted if progress exists', async () => {
      mockPrisma.progress.findUnique.mockResolvedValue({ id: 'p-1', userId: 'u1', lessonId: 'l1' });

      const result = await service.completeLesson('user-1', 'lesson-1');

      expect(result.alreadyCompleted).toBe(true);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('should create progress and update enrollment within transaction', async () => {
      mockPrisma.progress.findUnique.mockResolvedValue(null);

      // Mock $transaction to execute the callback with mockTx
      mockPrisma.$transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
        mockTx.progress.findUnique.mockResolvedValue(null);
        mockTx.progress.create.mockResolvedValue({ id: 'p-new', userId: 'user-1', lessonId: 'lesson-1' });
        mockTx.user.findUnique.mockResolvedValue({ streakCount: 0, lastActiveAt: null });
        mockTx.user.update.mockResolvedValue({});
        mockTx.lesson.findUnique.mockResolvedValue(lessonWithModule);
        mockTx.progress.count.mockResolvedValue(1);
        mockTx.xpTransaction.create.mockResolvedValue({});
        mockEnrollmentService.updateEnrollmentProgress.mockResolvedValue(undefined);
        return cb(mockTx);
      });

      const result = await service.completeLesson('user-1', 'lesson-1');

      expect(result.success).toBe(true);
      expect(result.alreadyCompleted).toBeUndefined();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockEnrollmentService.updateEnrollmentProgress).toHaveBeenCalledWith('user-1', 'prog-1', mockTx);
      expect(mockAwardService.checkAndAward).toHaveBeenCalledWith('user-1', AchievementCategory.STREAK);
      expect(mockAwardService.checkAndAward).toHaveBeenCalledWith('user-1', AchievementCategory.COMPLETION);
      expect(mockAwardService.checkAndAward).toHaveBeenCalledWith('user-1', AchievementCategory.XP);
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'user-1',
        AuditAction.LESSON_COMPLETED,
        expect.stringContaining('lesson-1'),
      );
    });

    it('should detect concurrent completion via transaction re-check', async () => {
      mockPrisma.progress.findUnique.mockResolvedValue(null);

      mockPrisma.$transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
        mockTx.progress.findUnique.mockResolvedValue({ id: 'p-existing' }); // conflict detected in tx
        return cb(mockTx);
      });

      const result = await service.completeLesson('user-1', 'lesson-1');

      expect(result.alreadyCompleted).toBe(true);
    });

    it('should award MODULE_COMPLETION XP when all module lessons done', async () => {
      mockPrisma.progress.findUnique.mockResolvedValue(null);

      mockPrisma.$transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
        mockTx.progress.findUnique.mockResolvedValue(null);
        mockTx.progress.create.mockResolvedValue({ id: 'p-new' });
        mockTx.user.findUnique.mockResolvedValue({ streakCount: 0, lastActiveAt: null });
        mockTx.user.update.mockResolvedValue({ xp: 150 });
        mockTx.lesson.findUnique.mockResolvedValue(lessonWithModule);
        mockTx.progress.count.mockResolvedValue(2); // all done
        mockTx.xpTransaction.create.mockResolvedValue({});
        mockEnrollmentService.updateEnrollmentProgress.mockResolvedValue(undefined);
        return cb(mockTx);
      });

      const result = await service.completeLesson('user-1', 'lesson-1');

      expect(mockTx.xpTransaction.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', amount: 50, type: XpType.MODULE_COMPLETION },
      });
      expect(result.xpResult).toBeDefined();
      expect(result.xpResult.currentXp).toBe(150);
    });

    it('should check achievements after completion', async () => {
      mockPrisma.progress.findUnique.mockResolvedValue(null);

      mockPrisma.$transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
        mockTx.progress.findUnique.mockResolvedValue(null);
        mockTx.progress.create.mockResolvedValue({ id: 'p-new' });
        mockTx.user.findUnique.mockResolvedValue({ streakCount: 0, lastActiveAt: null });
        mockTx.user.update.mockResolvedValue({});
        mockTx.lesson.findUnique.mockResolvedValue(lessonWithModule);
        mockTx.progress.count.mockResolvedValue(1);
        mockTx.xpTransaction.create.mockResolvedValue({});
        mockEnrollmentService.updateEnrollmentProgress.mockResolvedValue(undefined);
        return cb(mockTx);
      });

      await service.completeLesson('user-1', 'lesson-1');

      expect(mockAwardService.checkAndAward).toHaveBeenCalledWith('user-1', AchievementCategory.STREAK);
      expect(mockAwardService.checkAndAward).toHaveBeenCalledWith('user-1', AchievementCategory.COMPLETION);
      expect(mockAwardService.checkAndAward).toHaveBeenCalledWith('user-1', AchievementCategory.XP);
    });
  });

  describe('toggleBookmark', () => {
    it('should create bookmark when none exists', async () => {
      mockPrisma.bookmark.findUnique.mockResolvedValue(null);
      mockPrisma.bookmark.create.mockResolvedValue({ id: 'bm-1', userId: 'u1', lessonId: 'l1' });
      mockAwardService.checkAndAward.mockResolvedValue(undefined);
      mockAuditService.logAction.mockResolvedValue(undefined);

      const result = await service.toggleBookmark('user-1', 'lesson-1');

      expect(result.bookmarked).toBe(true);
      expect(mockPrisma.bookmark.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', lessonId: 'lesson-1' },
      });
      expect(mockAwardService.checkAndAward).toHaveBeenCalledWith('user-1', AchievementCategory.ENGAGEMENT);
      expect(mockAuditService.logAction).toHaveBeenCalled();
    });

    it('should delete bookmark when one exists', async () => {
      mockPrisma.bookmark.findUnique.mockResolvedValue({ id: 'bm-1', userId: 'u1', lessonId: 'l1' });
      mockPrisma.bookmark.delete.mockResolvedValue({});

      const result = await service.toggleBookmark('user-1', 'lesson-1');

      expect(result.bookmarked).toBe(false);
      expect(mockPrisma.bookmark.delete).toHaveBeenCalledWith({
        where: { userId_lessonId: { userId: 'user-1', lessonId: 'lesson-1' } },
      });
      expect(mockAwardService.checkAndAward).not.toHaveBeenCalled();
    });
  });

  describe('upsertNote', () => {
    it('should create a new note when none exists', async () => {
      mockPrisma.note.findUnique.mockResolvedValue(null);
      mockPrisma.note.upsert.mockResolvedValue({ id: 'note-1', userId: 'u1', lessonId: 'l1', content: 'my note' });

      const result = await service.upsertNote('user-1', 'lesson-1', 'my note');

      expect(result.content).toBe('my note');
      expect(mockPrisma.note.upsert).toHaveBeenCalledWith({
        where: { userId_lessonId: { userId: 'user-1', lessonId: 'lesson-1' } },
        update: { content: 'my note' },
        create: { userId: 'user-1', lessonId: 'lesson-1', content: 'my note' },
      });
      expect(mockAwardService.checkAndAward).toHaveBeenCalledWith('user-1', AchievementCategory.ENGAGEMENT);
    });

    it('should update existing note', async () => {
      mockPrisma.note.findUnique.mockResolvedValue({ id: 'note-1', content: 'old' });
      mockPrisma.note.upsert.mockResolvedValue({ id: 'note-1', content: 'updated note' });

      const result = await service.upsertNote('user-1', 'lesson-1', 'updated note');

      expect(result.content).toBe('updated note');
      expect(mockAwardService.checkAndAward).not.toHaveBeenCalled();
    });
  });

  describe('getStudentStats', () => {
    it('should return aggregated stats', async () => {
      mockXpService.getUserXpDetails.mockResolvedValue({ xp: 500, streakCount: 3 });
      mockPrisma.enrollment.count
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(2);
      mockPrisma.user.count.mockResolvedValue(10);

      const stats = await service.getStudentStats('user-1');

      expect(stats.xp).toBe(500);
      expect(stats.streakCount).toBe(3);
      expect(stats.enrolledCourses).toBe(5);
      expect(stats.completedCourses).toBe(2);
      expect(stats.globalRank).toBe(11);
    });
  });
});
