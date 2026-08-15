import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditAction, AuditLog, UserRole } from '@prisma/client';
import { hashUserId } from '../../../common/utils/audit-hash.util';

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
    ipAddress?: string,
    userRoleOverride?: UserRole
  ): Promise<AuditLog> {
    let userRole: UserRole = UserRole.STUDENT;
    if (userRoleOverride) {
      userRole = userRoleOverride;
    } else if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user) {
        userRole = user.role;
      }
    }

    const userHash = userId ? hashUserId(userId) : hashUserId('SYSTEM_ACTOR');

    return this.prisma.auditLog.create({
      data: {
        userId,
        userHash,
        userRole,
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
