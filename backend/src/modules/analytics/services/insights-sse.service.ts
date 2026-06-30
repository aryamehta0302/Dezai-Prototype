import { Injectable, MessageEvent } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { PrismaService } from '../../../database/prisma.service';

interface SseEvent {
  facultyUserId: string;
  type: string;
  data: any;
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
   * Look up all faculty members that teach the student across their enrolled programs,
   * and notify them about a student progress/score update.
   */
  async notifyFacultyOfStudentUpdate(studentUserId: string, type: string, data: any) {
    try {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { userId: studentUserId },
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

      for (const enrollment of enrollments) {
        const program = enrollment.program;
        if (!program) continue;

        if (program.facultyId) {
          const faculty = await this.prisma.facultyMember.findUnique({
            where: { id: program.facultyId },
            select: { userId: true },
          });

          if (faculty) {
            this.emit({
              facultyUserId: faculty.userId,
              type,
              data: {
                ...data,
                studentName,
                programTitle: program.title,
                programId: program.id,
              },
            });
          }
        }

        if (program.institutionId) {
          const admins = await this.prisma.institutionAdmin.findMany({
            where: { institutionId: program.institutionId },
            select: { userId: true },
          });
          for (const admin of admins) {
            this.emit({
              facultyUserId: admin.userId,
              type,
              data: {
                ...data,
                studentName,
                programTitle: program.title,
                programId: program.id,
              },
            });
          }
        }
      }
    } catch (err) {
      console.error('Error emitting real-time student updates to faculty:', err);
    }
  }
}
