import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { RbacScopeService } from '../../shared/services/rbac-scope.service';

@Injectable()
export class InstitutionActiveGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private rbacScopeService: RbacScopeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true; // Unauthenticated routes handles by Auth Guard if required
    }

    if (user.role === UserRole.DEZAI_ADMIN) {
      return true; // Super admin bypasses suspension checks
    }

    const userId = user.id || user.userId;
    let institutionId: string | null = null;

    if (user.role === UserRole.FACULTY) {
      const faculty = await this.prisma.facultyMember.findUnique({
        where: { userId },
      });
      institutionId = faculty?.institutionId ?? null;
    } else if (user.role === UserRole.STUDENT) {
      const enrollment = await this.prisma.enrollment.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: { program: true },
      });
      institutionId = enrollment?.program.institutionId ?? null;
    } else if (user.role === UserRole.UNIVERSITY_ADMIN) {
      try {
        institutionId = await this.rbacScopeService.getAdminInstitutionId(userId);
      } catch {
        institutionId = null;
      }
    }

    if (institutionId) {
      const institution = await this.prisma.institution.findUnique({
        where: { id: institutionId },
      });
      if (institution?.status === 'SUSPENDED') {
        throw new ForbiddenException('This institution has been suspended. Access is temporarily blocked.');
      }
    }

    return true;
  }
}
