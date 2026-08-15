import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { RbacScopeService } from '../../shared/services/rbac-scope.service';

@Injectable()
export class InstitutionScopeGuard implements CanActivate {
  constructor(private rbacScopeService: RbacScopeService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User context missing');
    }

    if (user.role === UserRole.DEZAI_ADMIN) {
      return true;
    }

    if (user.role !== UserRole.UNIVERSITY_ADMIN) {
      throw new ForbiddenException('University Admin access required');
    }

    const userId = user.id || user.userId;
    request.institutionId = await this.rbacScopeService.getAdminInstitutionId(userId);
    return true;
  }
}
