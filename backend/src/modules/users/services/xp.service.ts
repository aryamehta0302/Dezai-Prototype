import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { XpType } from '@prisma/client';

@Injectable()
export class XpService {
  constructor(private prisma: PrismaService) {}

  private readonly XP_VALUES: Record<XpType, number> = {
    [XpType.DAILY_STREAK]: 10,
    [XpType.MODULE_COMPLETION]: 50,
    [XpType.ASSESSMENT_PASS]: 100,
  };

  /**
   * Centralized method to award XP to a user and log the transaction.
   * Runs in a Prisma transaction to guarantee consistency.
   */
  async awardXp(userId: string, type: XpType, customAmount?: number) {
    const amount = customAmount ?? this.XP_VALUES[type] ?? 0;
    if (amount <= 0) return { success: false, currentXp: 0, amountAwarded: 0 };

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: amount },
        },
      });

      await tx.xpTransaction.create({
        data: {
          userId,
          amount,
          type,
        },
      });

      return user;
    });

    return {
      success: true,
      currentXp: result.xp,
      amountAwarded: amount,
    };
  }

  /**
   * Optional helper to fetch a user's total XP and transactions.
   */
  async getUserXpDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, streakCount: true },
    });

    const transactions = await this.prisma.xpTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      xp: user?.xp ?? 0,
      streakCount: user?.streakCount ?? 0,
      recentTransactions: transactions,
    };
  }
}
