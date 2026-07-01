import { Injectable, MessageEvent } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PrismaService } from '../../../database/prisma.service';

interface SseEvent {
  facultyUserId: string;
  type: string;
  data: Record<string, unknown>;
}

@Injectable()
export class InsightsSseService {
  private readonly eventsSubject = new Subject<SseEvent>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Emit an event to a specific faculty user or administrator
   */
  emit(event: SseEvent) {
    this.eventsSubject.next(event);
  }

  /**
   * Get the event stream for a specific faculty user
   */
  getStream(facultyUserId: string): Observable<MessageEvent> {
    return this.eventsSubject.asObservable().pipe(
      filter((event) => event.facultyUserId === facultyUserId),
      map((event) => ({
        type: event.type,
        data: event.data,
      } as MessageEvent))
    );
  }

  /**
   * Notify only the faculty/admins of a specific program about a student update.
   * When programId is provided, only that program's faculty & institution admins are notified.
   * This prevents leaking activity across programs for multi-enrolled students.
   *
   * Queries are batched to avoid N+1 patterns.
   */
  async notifyFacultyOfStudentUpdate(
    studentUserId: string,
    type: string,
    data: Record<string, unknown>,
    programId?: string,
  ) {
    try {
      // Fetch enrollments scoped to a specific program (or all if not provided)
      const enrollments = await this.prisma.enrollment.findMany({
        where: {
          userId: studentUserId,
          ...(programId ? { programId } : {}),
        },
        include: {
          program: {
            select: {
              id: true,
              title: true,
              facultyId: true,
              institutionId: true,
            },
          },
        },
      });

      const student = await this.prisma.user.findUnique({
        where: { id: studentUserId },
        select: { name: true, email: true },
      });

      const studentName = student?.name || 'A student';

      // Collect unique facultyIds and institutionIds to batch-query
      const facultyIds = new Set<string>();
      const institutionIds = new Set<string>();

      for (const enrollment of enrollments) {
        if (enrollment.program?.facultyId) facultyIds.add(enrollment.program.facultyId);
        if (enrollment.program?.institutionId) institutionIds.add(enrollment.program.institutionId);
      }

      // Batch query: fetch all relevant faculty members in one call
      const facultyMembers = facultyIds.size > 0
        ? await this.prisma.facultyMember.findMany({
            where: { id: { in: Array.from(facultyIds) } },
            select: { id: true, userId: true },
          })
        : [];

      // Batch query: fetch all relevant institution admins in one call
      const institutionAdmins = institutionIds.size > 0
        ? await this.prisma.institutionAdmin.findMany({
            where: { institutionId: { in: Array.from(institutionIds) } },
            select: { userId: true, institutionId: true },
          })
        : [];

      // Build lookup maps for O(1) access
      const facultyByMemberId = new Map(facultyMembers.map(f => [f.id, f.userId]));
      const adminsByInstitutionId = new Map<string, string[]>();
      for (const admin of institutionAdmins) {
        const existing = adminsByInstitutionId.get(admin.institutionId) || [];
        existing.push(admin.userId);
        adminsByInstitutionId.set(admin.institutionId, existing);
      }

      // Emit events using pre-fetched data (no more N+1 queries)
      for (const enrollment of enrollments) {
        const program = enrollment.program;
        if (!program) continue;

        const eventPayload = {
          ...data,
          studentName,
          programTitle: program.title,
          programId: program.id,
        };

        // Notify faculty member
        if (program.facultyId) {
          const facultyUserId = facultyByMemberId.get(program.facultyId);
          if (facultyUserId) {
            this.emit({ facultyUserId, type, data: eventPayload });
          }
        }

        // Notify institution admins
        if (program.institutionId) {
          const adminUserIds = adminsByInstitutionId.get(program.institutionId) || [];
          for (const adminUserId of adminUserIds) {
            this.emit({ facultyUserId: adminUserId, type, data: eventPayload });
          }
        }
      }
    } catch (err) {
      console.error('Error emitting real-time student updates to faculty:', err);
    }
  }
}
