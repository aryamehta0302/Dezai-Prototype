import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../../database/prisma.service";
import { UserRole, TrackType, AuditAction } from "@prisma/client";
import { AuditService } from "../../audit/services/audit.service";
import {
  CreateProgramDto,
  UpdateProgramDto,
  CreateTrackDto,
  UpdateTrackDto,
  CreateModuleDto,
  UpdateModuleDto,
  CreateLessonDto,
  UpdateLessonDto,
} from "../dto/programs.dto";

@Injectable()
export class ProgramsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService
  ) {}

  // ─────────────────── OWNERSHIP GUARD ───────────────────

  async validateProgramOwnership(
    userId: string,
    programId: string,
    userRole: UserRole
  ): Promise<true> {
    if (userRole === UserRole.DEZAI_ADMIN) return true;

    const program = await this.prisma.program.findUnique({
      where: { id: programId },
    });
    if (!program) throw new NotFoundException("Program not found");

    if (userRole === UserRole.UNIVERSITY_ADMIN) {
      const admin = await this.prisma.institutionAdmin.findUnique({
        where: { userId },
      });
      if (!admin || admin.institutionId !== program.institutionId) {
        throw new ForbiddenException("Unauthorized: Admin institution mismatch");
      }
      return true;
    }

    if (userRole === UserRole.FACULTY) {
      const faculty = await this.prisma.facultyMember.findUnique({
        where: { userId },
      });
      if (!faculty) throw new ForbiddenException("Faculty profile not found");
      const isOwner = program.facultyId === faculty.id;
      const isSameInstitution = program.institutionId === faculty.institutionId;
      if (!isOwner && !isSameInstitution) {
        throw new ForbiddenException(
          "Unauthorized: You do not own this program or belong to its institution"
        );
      }
      return true;
    }

    throw new ForbiddenException("Unauthorized role");
  }

  // ─────────────────── PROGRAMS ───────────────────

  async getPrograms(institutionId?: string) {
    return this.prisma.program.findMany({
      where: institutionId ? { institutionId } : undefined,
      include: {
        institution: { select: { name: true, logoUrl: true } },
        faculty: { include: { user: { select: { name: true } } } },
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
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                  select: {
                    id: true,
                    title: true,
                    order: true,
                    videoUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!program)
      throw new NotFoundException(`Program with ID ${id} not found`);
    return program;
  }

  async createProgram(
    userId: string,
    userRole: UserRole,
    data: CreateProgramDto
  ) {
    let institutionId = data.institutionId;
    let facultyId: string | null = null;

    if (userRole === UserRole.FACULTY) {
      const faculty = await this.prisma.facultyMember.findUnique({
        where: { userId },
      });
      if (!faculty)
        throw new ForbiddenException(
          "Faculty profile must exist to create a program"
        );
      facultyId = faculty.id;
      institutionId = faculty.institutionId;
    } else if (userRole === UserRole.UNIVERSITY_ADMIN) {
      const admin = await this.prisma.institutionAdmin.findUnique({
        where: { userId },
      });
      if (!admin)
        throw new ForbiddenException(
          "Admin profile must exist to create a program"
        );
      institutionId = admin.institutionId;
    }

    if (!institutionId)
      throw new ForbiddenException("An institutionId is required");

    const program = await this.prisma.program.create({
      data: {
        title: data.title,
        description: data.description,
        institutionId,
        facultyId,
      },
    });

    // Auto-bootstrap ROOTS + EDGE tracks
    await this.prisma.programTrack.createMany({
      data: [
        {
          programId: program.id,
          type: TrackType.ROOTS,
          title: "Foundational Track",
        },
        {
          programId: program.id,
          type: TrackType.EDGE,
          title: "Advanced Track",
        },
      ],
    });

    await this.auditService.logAction(
      userId,
      AuditAction.PROGRAM_CREATED,
      `Program "${program.title}" (ID: ${program.id}) created by ${userRole}`
    );

    return this.getProgramById(program.id);
  }

  async updateProgram(id: string, data: UpdateProgramDto, userId: string) {
    const program = await this.prisma.program.update({
      where: { id },
      data,
    });
    await this.auditService.logAction(
      userId,
      AuditAction.PROGRAM_UPDATED,
      `Program "${program.title}" (ID: ${program.id}) updated`
    );
    return program;
  }

  async deleteProgram(id: string, userId: string) {
    const program = await this.prisma.program.delete({ where: { id } });
    await this.auditService.logAction(
      userId,
      AuditAction.PROGRAM_UPDATED,
      `Program "${program.title}" (ID: ${program.id}) deleted`
    );
  }

  // ─────────────────── TRACKS ───────────────────

  async getProgramTracks(programId: string) {
    return this.prisma.programTrack.findMany({
      where: { programId },
      include: {
        modules: {
          orderBy: { order: "asc" },
          include: { lessons: { orderBy: { order: "asc" } } },
        },
      },
    });
  }

  async getTrackById(trackId: string) {
    const track = await this.prisma.programTrack.findUnique({
      where: { id: trackId },
    });
    if (!track) throw new NotFoundException("Track not found");
    return track;
  }

  async createTrack(programId: string, data: CreateTrackDto) {
    return this.prisma.programTrack.create({
      data: {
        programId,
        type: data.type,
        title: data.title,
        description: data.description,
      },
    });
  }

  async updateTrack(trackId: string, data: UpdateTrackDto) {
    return this.prisma.programTrack.update({
      where: { id: trackId },
      data,
    });
  }

  // ─────────────────── MODULES ───────────────────

  async getModuleById(moduleId: string) {
    const mod = await this.prisma.module.findUnique({
      where: { id: moduleId },
    });
    if (!mod) throw new NotFoundException("Module not found");
    return mod;
  }

  async addModule(trackId: string, data: CreateModuleDto) {
    return this.prisma.module.create({
      data: { trackId, title: data.title, order: data.order },
    });
  }

  async updateModule(moduleId: string, data: UpdateModuleDto) {
    return this.prisma.module.update({
      where: { id: moduleId },
      data,
    });
  }

  async deleteModule(moduleId: string) {
    return this.prisma.module.delete({ where: { id: moduleId } });
  }

  async reorderModules(trackId: string, orderedIds: string[]) {
    const updates = orderedIds.map((id, index) =>
      this.prisma.module.update({
        where: { id },
        data: { order: index },
      })
    );
    return this.prisma.$transaction(updates);
  }

  // ─────────────────── LESSONS ───────────────────

  async getLessonById(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException("Lesson not found");
    return lesson;
  }

  async addLesson(moduleId: string, data: CreateLessonDto) {
    return this.prisma.lesson.create({
      data: {
        moduleId,
        title: data.title,
        content: data.content,
        order: data.order,
        videoUrl: data.videoUrl,
      },
    });
  }

  async updateLesson(lessonId: string, data: UpdateLessonDto) {
    return this.prisma.lesson.update({
      where: { id: lessonId },
      data,
    });
  }

  async deleteLesson(lessonId: string) {
    return this.prisma.lesson.delete({ where: { id: lessonId } });
  }
}
