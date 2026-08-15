import { Test, TestingModule } from '@nestjs/testing';
import { LearningService } from '../../src/modules/learning/services/learning.service';
import { PrismaService } from '../../src/database/prisma.service';
import { EnrollmentService } from '../../src/modules/programs/services/enrollment.service';
import { XpService } from '../../src/modules/users/services/xp.service';
import { AwardService } from '../../src/modules/achievements/services/award.service';
import { AuditService } from '../../src/modules/audit/services/audit.service';
import { XpType, AchievementCategory } from '@prisma/client';

describe('Concurrent Progress Requests', () => {
  let service: LearningService;

  const mockTx = {
    progress: { findUnique: jest.fn(), create: jest.fn(), count: jest.fn() },
    lesson: { findUnique: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn() },
    xpTransaction: { create: jest.fn() },
    enrollment: { count: jest.fn() },
  };

  const mockPrisma = {
    progress: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockEnrollmentService = {
    updateEnrollmentProgress: jest.fn(),
  };

  const mockXpService = {
    getUserXpDetails: jest.fn(),
  };

  const mockAwardService = {
    checkAndAward: jest.fn(),
  };

  const mockAuditService = {
    logAction: jest.fn(),
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
      ],
    }).compile();

    service = module.get<LearningService>(LearningService);
  });

  it('should handle multiple rapid completions of the same lesson', async () => {
    // First call: no existing progress
    mockPrisma.progress.findUnique
      .mockResolvedValueOnce(null)  // first call - no existing
      .mockResolvedValueOnce(null); // second call - no existing (both pass early check)

    // First transaction: creates progress successfully
    // Second transaction: detects conflict via re-check
    mockPrisma.$transaction
      .mockImplementationOnce(async (cb: (tx: any) => Promise<any>) => {
        mockTx.progress.findUnique.mockResolvedValue(null);
        mockTx.progress.create.mockResolvedValue({ id: 'p-1' });
        mockTx.user.findUnique.mockResolvedValue({ streakCount: 0, lastActiveAt: null });
        mockTx.user.update.mockResolvedValue({});
        mockTx.lesson.findUnique.mockResolvedValue({
          id: 'lesson-1',
          module: {
            lessons: [{ id: 'lesson-1' }, { id: 'lesson-2' }],
            track: { programId: 'prog-1' },
          },
        });
        mockTx.progress.count.mockResolvedValue(1);
        mockEnrollmentService.updateEnrollmentProgress.mockResolvedValue(undefined);
        return cb(mockTx);
      })
      .mockImplementationOnce(async (cb: (tx: any) => Promise<any>) => {
        mockTx.progress.findUnique.mockResolvedValue({ id: 'p-1' }); // conflict!
        return cb(mockTx);
      });

    const [result1, result2] = await Promise.all([
      service.completeLesson('user-1', 'lesson-1'),
      service.completeLesson('user-1', 'lesson-1'),
    ]);

    // Exactly one should succeed, the other should report alreadyCompleted
    const successes = [result1, result2].filter((r) => r.success && !r.alreadyCompleted);
    const conflicts = [result1, result2].filter((r) => r.alreadyCompleted);

    expect(successes).toHaveLength(1);
    expect(conflicts).toHaveLength(1);
    // XP should only be awarded once (via the successful transaction)
    const xpCalls = mockTx.xpTransaction.create.mock.calls.filter(
      (call: any) => call[0]?.data?.type === XpType.MODULE_COMPLETION
    );
    expect(xpCalls).toHaveLength(0); // module not yet completed (only 1/2 lessons)
  });

  it('should not double-award module XP when same lesson completed concurrently (tx re-check)', async () => {
    const moduleWithTwoLessons = {
      id: 'lesson-2',
      module: {
        lessons: [{ id: 'lesson-1' }, { id: 'lesson-2' }],
        track: { programId: 'prog-1' },
      },
    };

    mockPrisma.progress.findUnique
      .mockResolvedValueOnce(null) // first call
      .mockResolvedValueOnce(null); // second call (both pass early check)

    // First transaction: succeeds normally
    // Second transaction: detects conflict via tx re-check
    mockPrisma.$transaction
      .mockImplementationOnce(async (cb: (tx: any) => Promise<any>) => {
        mockTx.progress.findUnique.mockResolvedValue(null);
        mockTx.progress.create.mockResolvedValue({ id: 'p-1' });
        mockTx.user.findUnique.mockResolvedValue({ streakCount: 0, lastActiveAt: null });
        mockTx.user.update.mockResolvedValue({ xp: 150 });
        mockTx.lesson.findUnique.mockResolvedValue(moduleWithTwoLessons);
        mockTx.progress.count.mockResolvedValue(2); // all done
        mockTx.xpTransaction.create.mockResolvedValue({});
        mockEnrollmentService.updateEnrollmentProgress.mockResolvedValue(undefined);
        return cb(mockTx);
      })
      .mockImplementationOnce(async (cb: (tx: any) => Promise<any>) => {
        mockTx.progress.findUnique.mockResolvedValue({ id: 'p-1' }); // re-check catches it
        return cb(mockTx);
      });

    const [result1, result2] = await Promise.all([
      service.completeLesson('user-1', 'lesson-2'),
      service.completeLesson('user-1', 'lesson-2'),
    ]);

    const successes = [result1, result2].filter((r) => r.success && !r.alreadyCompleted);
    const conflicts = [result1, result2].filter((r) => r.alreadyCompleted);

    expect(successes).toHaveLength(1);
    expect(conflicts).toHaveLength(1);

    // Only one MODULE_COMPLETION XP awarded (from successful transaction)
    const moduleXpAwards = mockTx.xpTransaction.create.mock.calls.filter(
      (call: any) => call[0]?.data?.type === XpType.MODULE_COMPLETION
    );
    expect(moduleXpAwards).toHaveLength(1);
  });
});
