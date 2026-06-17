import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UserRole, TrackType, AuditAction } from '@prisma/client';
import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class ProgramsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  /**
   * Validate that the faculty/admin user has permission to manage this program.
   * Self-healing/ownership verification logic.
   */
  async validateProgramOwnership(userId: string, programId: string, userRole: UserRole) {
    if (userRole === UserRole.DEZAI_ADMIN) return true;

    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: { faculty: true },
    });

    if (!program) {
      throw new NotFoundException('Program not found');
    }

    if (userRole === UserRole.UNIVERSITY_ADMIN) {
      const admin = await this.prisma.institutionAdmin.findUnique({
        where: { userId },
      });
      if (!admin || admin.institutionId !== program.institutionId) {
        throw new ForbiddenException('Unauthorized: Admin institution mismatch');
      }
      return true;
    }

    if (userRole === UserRole.FACULTY) {
      const faculty = await this.prisma.facultyMember.findUnique({
        where: { userId },
      });
      if (!faculty) {
        throw new ForbiddenException('Faculty profile not found');
      }

      const isOwner = program.facultyId === faculty.id;
      const isSameInstitution = program.institutionId === faculty.institutionId;

      if (!isOwner && !isSameInstitution) {
        throw new ForbiddenException('Unauthorized: You do not own this program or belong to its institution');
      }
      return true;
    }

    throw new ForbiddenException('Unauthorized role');
  }

  /**
   * List all programs, optionally filtering by query parameters.
   */
  async getPrograms() {
    return this.prisma.program.findMany({
      include: {
        institution: {
          select: { name: true, logoUrl: true },
        },
        faculty: {
          include: { user: { select: { name: true } } },
        },
        tracks: {
          orderBy: { createdAt: 'asc' },
          include: {
            modules: {
              orderBy: { order: 'asc' },
              include: {
                lessons: {
                  orderBy: { order: 'asc' },
                  select: { id: true, title: true, order: true, videoUrl: true },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Fetch a single program by ID with all tracks, modules, and lessons.
   */
  async getProgramById(id: string) {
    const program = await this.prisma.program.findUnique({
      where: { id },
      include: {
        institution: true,
        faculty: {
          include: { user: { select: { name: true, email: true } } },
        },
        tracks: {
          include: {
            modules: {
              orderBy: { order: 'asc' },
              include: {
                lessons: {
                  orderBy: { order: 'asc' },
                  select: { id: true, title: true, order: true, videoUrl: true },
                },
              },
            },
          },
        },
      },
    });

    if (!program) {
      throw new NotFoundException(`Program with ID ${id} not found`);
    }

    return program;
  }

  /**
   * Create a new program. Resolves faculty profile automatically.
   */
  async createProgram(
    userId: string,
    userRole: UserRole,
    data: { title: string; description: string; institutionId?: string }
  ) {
    let institutionId = data.institutionId;
    let facultyId: string | null = null;

    if (userRole === UserRole.FACULTY) {
      const faculty = await this.prisma.facultyMember.findUnique({
        where: { userId },
      });
      if (!faculty) {
        throw new ForbiddenException('Faculty profile must exist to create a program');
      }
      facultyId = faculty.id;
      institutionId = faculty.institutionId;
    } else if (userRole === UserRole.UNIVERSITY_ADMIN) {
      const admin = await this.prisma.institutionAdmin.findUnique({
        where: { userId },
      });
      if (!admin) {
        throw new ForbiddenException('Admin profile must exist to create a program');
      }
      institutionId = admin.institutionId;
    }

    if (!institutionId) {
      throw new ForbiddenException('An institutionId is required to create a program');
    }

    // Create program
    const program = await this.prisma.program.create({
      data: {
        title: data.title,
        description: data.description,
        institutionId,
        facultyId,
      },
    });

    // Automatically bootstrap ROOTS and EDGE tracks for V1 convenience
    await this.prisma.programTrack.createMany({
      data: [
        { programId: program.id, type: TrackType.ROOTS, title: 'Foundational Track' },
        { programId: program.id, type: TrackType.EDGE, title: 'Advanced Track' },
      ],
    });

    // Log audit action
    await this.auditService.logAction(
      userId,
      AuditAction.PROGRAM_CREATED,
      `Program "${program.title}" (ID: ${program.id}) created by ${userRole}`
    );

    return this.getProgramById(program.id);
  }

  /**
   * Update program details.
   */
  async updateProgram(id: string, data: { title?: string; description?: string }, userId: string) {
    const program = await this.prisma.program.update({
      where: { id },
      data,
    });

    // Log audit action
    await this.auditService.logAction(
      userId,
      AuditAction.PROGRAM_UPDATED,
      `Program "${program.title}" (ID: ${program.id}) updated`
    );

    return program;
  }

  /**
   * Add a curriculum module to a program track.
   */
  async addModule(trackId: string, data: { title: string; order: number }) {
    return this.prisma.module.create({
      data: {
        trackId,
        title: data.title,
        order: data.order,
      },
    });
  }
}
