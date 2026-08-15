import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditAction, UserRole } from '@prisma/client';

@Injectable()
export class PlatformAuditService {
  constructor(private prisma: PrismaService) {}

  async getAuditLogs(filters?: {
    userId?: string;
    action?: AuditAction;
    userRole?: UserRole;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = filters.action;
    if (filters?.userRole) where.userRole = filters.userRole;
    if (filters?.search) {
      where.details = { contains: filters.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: filters?.skip ?? 0,
        take: filters?.take ?? 50,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }

  async getAllUploadedDocuments(filters?: { entityType?: string; search?: string; skip?: number; take?: number }) {
    const where: any = {};
    if (filters?.entityType) where.entityType = filters.entityType;
    if (filters?.search) {
      where.fileName = { contains: filters.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.upload.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: filters?.skip ?? 0,
        take: filters?.take ?? 50,
      }),
      this.prisma.upload.count({ where }),
    ]);

    return { items, total };
  }
}
