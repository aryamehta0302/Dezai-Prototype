import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class FacultyVerifiedGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.user?.userId;

    if (!userId) {
      throw new ForbiddenException('User context missing');
    }

    const faculty = await this.prisma.facultyMember.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!faculty || faculty.verificationStatus !== 'APPROVED') {
      throw new ForbiddenException('Faculty account not yet verified by university admin');
    }

    if (faculty.user.accountStatus !== 'ACTIVE') {
      throw new ForbiddenException('Faculty account is suspended or inactive');
    }

    return true;
  }
}
