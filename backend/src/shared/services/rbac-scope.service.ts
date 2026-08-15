import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class RbacScopeService {
  constructor(private prisma: PrismaService) {}

  /**
   * Resolve institution ID for a UNIVERSITY_ADMIN user.
   */
  async getAdminInstitutionId(userId: string): Promise<string> {
    const admin = await this.prisma.institutionAdmin.findUnique({
      where: { userId },
    });
    if (!admin) {
      throw new ForbiddenException('User is not associated with any university as an administrator');
    }
    return admin.institutionId;
  }

  /**
   * Ensure that an institution is not suspended.
   */
  async validateInstitutionActive(institutionId: string): Promise<void> {
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });
    if (institution?.status === 'SUSPENDED') {
      throw new ForbiddenException('This institution is currently suspended. Contact platform support.');
    }
  }

  /**
   * Ensure target faculty or student belongs to the admin's institution.
   */
  async validateSameInstitution(adminUserId: string, targetFacultyOrStudentUserId: string): Promise<void> {
    const adminInstitutionId = await this.getAdminInstitutionId(adminUserId);

    // Check if target is faculty
    const faculty = await this.prisma.facultyMember.findUnique({
      where: { userId: targetFacultyOrStudentUserId },
    });
    if (faculty) {
      if (faculty.institutionId !== adminInstitutionId) {
        throw new ForbiddenException('Access denied: target faculty belongs to another institution');
      }
      return;
    }

    // Check if target is student enrolled in a program owned by the institution
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { userId: targetFacultyOrStudentUserId },
      include: { program: true },
    });
    if (enrollment) {
      if (enrollment.program.institutionId !== adminInstitutionId) {
        throw new ForbiddenException('Access denied: target student is enrolled in another institution');
      }
      return;
    }

    throw new ForbiddenException('Target user not found or not associated with your institution');
  }

  isSuperAdmin(role: UserRole): boolean {
    return role === UserRole.DEZAI_ADMIN;
  }
}
