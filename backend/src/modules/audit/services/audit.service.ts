import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditAction, AuditLog } from '@prisma/client';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Log an audit action in the database.
   */
  async logAction(
    userId: string | null,
    action: AuditAction,
    details?: string,
    ipAddress?: string
  ): Promise<AuditLog> {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        details,
        ipAddress,
      },
    });
  }

  /**
   * Retrieve audit logs, optionally filtered by user or action.
   */
  async getLogs(filters?: { userId?: string; action?: AuditAction; take?: number }) {
    return this.prisma.auditLog.findMany({
      where: {
        userId: filters?.userId,
        action: filters?.action,
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.take ?? 50,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }
}
