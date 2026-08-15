import { Test, TestingModule } from '@nestjs/testing';
import { XpService } from '../../src/modules/users/services/xp.service';
import { PrismaService } from '../../src/database/prisma.service';
import { XpType } from '@prisma/client';

describe('XpService', () => {
  let xpService: XpService;

  const mockTx = {
    user: { update: jest.fn(), findUnique: jest.fn() },
    xpTransaction: { create: jest.fn() },
  };

  const mockPrisma = {
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
    },
    xpTransaction: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        XpService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    xpService = module.get<XpService>(XpService);
  });

  describe('awardXp', () => {
    it('should award XP and create transaction', async () => {
      mockPrisma.$transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
        mockTx.user.update.mockResolvedValue({ xp: 100 });
        mockTx.xpTransaction.create.mockResolvedValue({});
        return cb(mockTx);
      });

      const result = await xpService.awardXp('user-1', XpType.DAILY_STREAK);

      expect(result.success).toBe(true);
      expect(result.amountAwarded).toBe(10);
      expect(result.currentXp).toBe(100);
      expect(mockTx.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { xp: { increment: 10 } },
      });
      expect(mockTx.xpTransaction.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', amount: 10, type: XpType.DAILY_STREAK },
      });
    });

    it('should award custom amount when provided', async () => {
      mockPrisma.$transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
        mockTx.user.update.mockResolvedValue({ xp: 500 });
        mockTx.xpTransaction.create.mockResolvedValue({});
        return cb(mockTx);
      });

      const result = await xpService.awardXp('user-1', XpType.MODULE_COMPLETION, 75);

      expect(result.amountAwarded).toBe(75);
    });

    it('should return success false when amount is 0', async () => {
      const result = await xpService.awardXp('user-1', XpType.ACHIEVEMENT_REWARD);

      expect(result.success).toBe(false);
      expect(result.amountAwarded).toBe(0);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe('computeLevel', () => {
    it('should return level 1 for 0 XP', () => {
      const result = xpService.computeLevel(0);
      expect(result.level).toBe(1);
      expect(result.currentLevelXp).toBe(0);
      expect(result.progress).toBe(0);
    });

    it('should return level 1 for 999 XP (99.9% rounds to 100)', () => {
      const result = xpService.computeLevel(999);
      expect(result.level).toBe(1);
      expect(result.currentLevelXp).toBe(999);
      expect(result.progress).toBe(100);
    });

    it('should return level 2 at 1000 XP', () => {
      const result = xpService.computeLevel(1000);
      expect(result.level).toBe(2);
      expect(result.currentLevelXp).toBe(0);
      expect(result.progress).toBe(0);
    });

    it('should return level 5 at 4500 XP', () => {
      const result = xpService.computeLevel(4500);
      expect(result.level).toBe(5);
      expect(result.currentLevelXp).toBe(500);
      expect(result.progress).toBe(50);
    });
  });

  describe('getUserXpDetails', () => {
    it('should return XP details with level info', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        xp: 2500,
        streakCount: 5,
      });
      mockPrisma.xpTransaction.findMany.mockResolvedValue([
        { id: 'tx-1', amount: 50, type: XpType.MODULE_COMPLETION, createdAt: new Date() },
      ]);

      const result = await xpService.getUserXpDetails('user-1');

      expect(result.xp).toBe(2500);
      expect(result.streakCount).toBe(5);
      expect(result.level.level).toBe(3);
      expect(result.level.totalXp).toBe(2500);
      expect(result.recentTransactions).toHaveLength(1);
    });

    it('should return defaults when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.xpTransaction.findMany.mockResolvedValue([]);

      const result = await xpService.getUserXpDetails('nonexistent');

      expect(result.xp).toBe(0);
      expect(result.streakCount).toBe(0);
      expect(result.level.level).toBe(1);
    });
  });
});
