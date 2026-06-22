import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UserRole, FacultyVerificationStatus, AuditAction } from '@prisma/client';
import { AuditService } from '../../audit/services/audit.service';
import { CreateInstitutionDto, UpdateInstitutionDto } from '../dto/institution.dto';

@Injectable()
export class InstitutionsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // ─────────────────── INSTITUTIONS ───────────────────

  /**
   * Get all institutions with optional location filters.
   * Used for student institution selection (Country → State → City → University).
   */
  async getInstitutions(filters?: {
    country?: string;
    state?: string;
    city?: string;
  }) {
    return this.prisma.institution.findMany({
      where: {
        country: filters?.country || undefined,
        state: filters?.state || undefined,
        city: filters?.city || undefined,
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        description: true,
        country: true,
        state: true,
        city: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get unique location values (countries, states, cities) for cascading dropdowns.
   * Supports Student Institution Selection UI (Country → State → City).
   */
  async getLocations(filters?: { country?: string; state?: string }) {
    if (filters?.state) {
      // Return distinct cities for the given country + state
      const rows = await this.prisma.institution.findMany({
        where: {
          country: filters.country || undefined,
          state: filters.state,
        },
        select: { city: true },
        distinct: ['city'],
        orderBy: { city: 'asc' },
      });
      return { cities: rows.map((r) => r.city).filter(Boolean) };
    }

    if (filters?.country) {
      // Return distinct states for the given country
      const rows = await this.prisma.institution.findMany({
        where: { country: filters.country },
        select: { state: true },
        distinct: ['state'],
        orderBy: { state: 'asc' },
      });
      return { states: rows.map((r) => r.state).filter(Boolean) };
    }

    // Return all distinct countries
    const rows = await this.prisma.institution.findMany({
      select: { country: true },
      distinct: ['country'],
      orderBy: { country: 'asc' },
    });
    return { countries: rows.map((r) => r.country).filter(Boolean) };
  }

  /**
   * Get a single institution by ID.
   */
  async getInstitutionById(id: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
      include: {
        admins: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        faculty: {
          select: {
            id: true,
            department: true,
            designation: true,
            verificationStatus: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!institution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }
    return institution;
  }

  /**
   * Create a new institution. Only DEZAI_ADMIN can do this.
   */
  async createInstitution(createdByUserId: string, data: CreateInstitutionDto) {
    const institution = await this.prisma.institution.create({ data });
    await this.auditService.logAction(
      createdByUserId,
      AuditAction.INSTITUTION_CREATED,
      `Institution "${institution.name}" (ID: ${institution.id}) created`,
    );
    return institution;
  }

  /**
   * Update an institution. Only DEZAI_ADMIN can do this.
   */
  async updateInstitution(updatedByUserId: string, id: string, data: UpdateInstitutionDto) {
    await this.getInstitutionById(id);
    const institution = await this.prisma.institution.update({ where: { id }, data });
    await this.auditService.logAction(
      updatedByUserId,
      AuditAction.INSTITUTION_UPDATED,
      `Institution "${institution.name}" (ID: ${id}) updated`,
    );
    return institution;
  }

  // ─────────────────── FACULTY MANAGEMENT ───────────────────

  /**
   * Get all faculty members for a given institution.
   * Used by UNIVERSITY_ADMIN and DEZAI_ADMIN.
   */
  async getFacultyByInstitution(institutionId: string) {
    return this.prisma.facultyMember.findMany({
      where: { institutionId },
      select: {
        id: true,
        department: true,
        designation: true,
        verificationStatus: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { verificationStatus: 'asc' },
    });
  }

  /**
   * Get faculty members filtered by verification status.
   */
  async getFacultyByStatus(
    institutionId: string,
    status: FacultyVerificationStatus,
  ) {
    return this.prisma.facultyMember.findMany({
      where: { institutionId, verificationStatus: status },
      select: {
        id: true,
        department: true,
        designation: true,
        verificationStatus: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  /**
   * Update faculty verification status (PENDING → APPROVED | REJECTED).
   * Only UNIVERSITY_ADMIN of the same institution or DEZAI_ADMIN can call this.
   */
  async updateFacultyVerificationStatus(
    requestingUserId: string,
    requestingUserRole: UserRole,
    facultyMemberId: string,
    newStatus: FacultyVerificationStatus,
  ) {
    // Find the faculty member
    const facultyMember = await this.prisma.facultyMember.findUnique({
      where: { id: facultyMemberId },
    });
    if (!facultyMember) {
      throw new NotFoundException(`Faculty member with ID ${facultyMemberId} not found`);
    }

    // RBAC: DEZAI_ADMIN can approve anyone;
    // UNIVERSITY_ADMIN must belong to the same institution
    if (requestingUserRole === UserRole.UNIVERSITY_ADMIN) {
      const admin = await this.prisma.institutionAdmin.findUnique({
        where: { userId: requestingUserId },
      });
      if (!admin || admin.institutionId !== facultyMember.institutionId) {
        throw new ForbiddenException(
          'You are not authorised to verify faculty from a different institution',
        );
      }
    } else if (requestingUserRole !== UserRole.DEZAI_ADMIN) {
      throw new ForbiddenException('Only University Admins or Dezai Admins can verify faculty');
    }

    const result = await this.prisma.facultyMember.update({
      where: { id: facultyMemberId },
      data: { verificationStatus: newStatus },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await this.auditService.logAction(
      requestingUserId,
      AuditAction.FACULTY_VERIFIED,
      `Faculty member ${facultyMemberId} verification status changed to ${newStatus}`,
    );

    return result;
  }
}
