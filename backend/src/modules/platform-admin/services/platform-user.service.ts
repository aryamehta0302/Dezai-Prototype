import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction, UserRole, AccountStatus } from '@prisma/client';
import { SuspendUserDto, AssignAdminRoleDto } from '../dto/platform-user.dto';

@Injectable()
export class PlatformUserService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getAllUsers(filters?: { role?: UserRole; status?: AccountStatus; search?: string; skip?: number; take?: number }) {
    const where: any = {};
    if (filters?.role) where.role = filters.role;
    if (filters?.status) where.accountStatus = filters.status;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          accountStatus: true,
          xp: true,
          streakCount: true,
          createdAt: true,
          lastActiveAt: true,
          facultyInfo: { select: { id: true, institutionId: true } },
          instAdminInfo: { select: { id: true, institutionId: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: filters?.skip ?? 0,
        take: filters?.take ?? 50,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total };
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        facultyInfo: { include: { institution: { select: { id: true, name: true } }, institutionDept: true } },
        instAdminInfo: { include: { institution: { select: { id: true, name: true } } } },
        enrollments: { include: { program: { select: { id: true, title: true } } } },
        credentials: true,
        auditLogs: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }

  async suspendUser(userId: string, adminUserId: string, dto?: SuspendUserDto) {
    const user = await this.getUserById(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: AccountStatus.SUSPENDED,
        suspendedAt: new Date(),
        suspendedById: adminUserId,
      },
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.USER_SUSPENDED,
      `User "${user.name || user.email}" (${userId}) suspended. Reason: ${dto?.reason || 'None'}`,
    );

    return { success: true, message: 'User suspended successfully' };
  }

  async reactivateUser(userId: string, adminUserId: string) {
    const user = await this.getUserById(userId);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: AccountStatus.ACTIVE,
        suspendedAt: null,
        suspendedById: null,
      },
    });

    await this.auditService.logAction(
      adminUserId,
      AuditAction.USER_REACTIVATED,
      `User "${user.name || user.email}" (${userId}) reactivated`,
    );

    return { success: true, message: 'User reactivated successfully' };
  }

  async assignAdminRole(userId: string, dto: AssignAdminRoleDto, adminUserId: string) {
    const user = await this.getUserById(userId);

    if (dto.role === UserRole.UNIVERSITY_ADMIN) {
      if (!dto.institutionId) {
        throw new BadRequestException('institutionId is required when assigning UNIVERSITY_ADMIN role');
      }
      const inst = await this.prisma.institution.findUnique({ where: { id: dto.institutionId } });
      if (!inst) throw new NotFoundException('Institution not found');

      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: { role: UserRole.UNIVERSITY_ADMIN },
        }),
        this.prisma.institutionAdmin.upsert({
          where: { userId },
          create: { userId, institutionId: dto.institutionId },
          update: { institutionId: dto.institutionId },
        }),
      ]);
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: dto.role },
      });
    }

    await this.auditService.logAction(
      adminUserId,
      AuditAction.ADMIN_ROLE_ASSIGNED,
      `Assigned role ${dto.role} to user ${user.id}`,
    );

    return { success: true, message: `Role ${dto.role} assigned successfully` };
  }

  async revokeAdminRole(userId: string, adminUserId: string) {
    const user = await this.getUserById(userId);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { role: UserRole.STUDENT },
      }),
      this.prisma.institutionAdmin.deleteMany({
        where: { userId },
      }),
    ]);

    await this.auditService.logAction(
      adminUserId,
      AuditAction.ADMIN_ROLE_REVOKED,
      `Revoked admin role from user ${user.id}, demoted to STUDENT`,
    );

    return { success: true, message: 'Admin role revoked successfully' };
  }
}
