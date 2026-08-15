import { Test, TestingModule } from '@nestjs/testing';
import { EnrollmentService } from '../../src/modules/programs/services/enrollment.service';
import { PrismaService } from '../../src/database/prisma.service';
import { AuditService } from '../../src/modules/audit/services/audit.service';
import { NotFoundException } from '@nestjs/common';
import { EnrollmentStatus } from '@prisma/client';

describe('EnrollmentService', () => {
  let service: EnrollmentService;

  const mockPrisma = {
    program: { findUnique: jest.fn() },
    enrollment: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    progress: { findMany: jest.fn(), count: jest.fn(), deleteMany: jest.fn() },
    bookmark: { deleteMany: jest.fn() },
    note: { deleteMany: jest.fn() },
    $transaction: jest.fn(),
  };

  const mockAuditService = {
    logAction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrollmentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<EnrollmentService>(EnrollmentService);
  });

  describe('enrollStudent', () => {
    it('should create a new enrollment', async () => {
      mockPrisma.program.findUnique.mockResolvedValue({ id: 'prog-1', title: 'Test Program' });
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);
      mockPrisma.enrollment.create.mockResolvedValue({
        id: 'enroll-1',
        userId: 'user-1',
        programId: 'prog-1',
        progress: 0,
        status: EnrollmentStatus.ACTIVE,
        createdAt: new Date(),
      });

      const result = await service.enrollStudent('user-1', 'prog-1');

      expect(result.progress).toBe(0);
      expect(result.userId).toBe('user-1');
      expect(mockAuditService.logAction).toHaveBeenCalledWith(
        'user-1',
        'ENROLLMENT_CREATED',
        expect.stringContaining('prog-1'),
      );
    });

    it('should return existing enrollment when already enrolled', async () => {
      const existing = { id: 'enroll-1', userId: 'user-1', programId: 'prog-1', progress: 50 };
      mockPrisma.program.findUnique.mockResolvedValue({ id: 'prog-1' });
      mockPrisma.enrollment.findUnique.mockResolvedValue(existing);

      const result = await service.enrollStudent('user-1', 'prog-1');

      expect(result).toEqual(existing);
      expect(mockPrisma.enrollment.create).not.toHaveBeenCalled();
    });

    it('should throw when program does not exist', async () => {
      mockPrisma.program.findUnique.mockResolvedValue(null);

      await expect(service.enrollStudent('user-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('dropEnrollment', () => {
    const mockProgramWithLessons = {
      id: 'prog-1',
      tracks: [
        {
          modules: [
            { lessons: [{ id: 'l1' }, { id: 'l2' }] },
          ],
        },
      ],
    };

    const mockEnrollment = {
      id: 'enroll-1',
      userId: 'user-1',
      programId: 'prog-1',
      progress: 50,
      status: EnrollmentStatus.ACTIVE,
      program: mockProgramWithLessons,
    };

    it('should drop enrollment and clean up bookmarks, notes, progress', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue(mockEnrollment);
      mockPrisma.$transaction.mockImplementation(async (cb: (tx: any) => Promise<any>) => {
        const mockTx = {
          bookmark: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
          note: { deleteMany: jest.fn().mockResolvedValue({ count: 2 }) },
          progress: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
          enrollment: { update: jest.fn().mockResolvedValue({ ...mockEnrollment, status: EnrollmentStatus.DROPPED, progress: 0 }) },
        };
        return cb(mockTx);
      });

      const result = await service.dropEnrollment('user-1', 'prog-1');

      expect(result.success).toBe(true);
      expect(mockAuditService.logAction).toHaveBeenCalled();
    });

    it('should throw when enrollment does not exist', async () => {
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);

      await expect(service.dropEnrollment('user-1', 'bad-prog')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStudentEnrollments', () => {
    it('should return enrollments with completed lesson IDs filtered per program', async () => {
      mockPrisma.enrollment.findMany.mockResolvedValue([
        {
          id: 'enroll-1',
          userId: 'user-1',
          programId: 'prog-1',
          progress: 50,
          status: EnrollmentStatus.ACTIVE,
          completedAt: null,
          program: {
            title: 'Program 1',
            institution: { name: 'Test Uni' },
            tracks: [
              {
                modules: [
                  { lessons: [{ id: 'lesson-1' }, { id: 'lesson-2' }] },
                ],
              },
            ],
          },
        },
      ]);
      mockPrisma.progress.findMany.mockResolvedValue([
        { lessonId: 'lesson-1' },
        { lessonId: 'lesson-2' },
        { lessonId: 'lesson-99' },
      ]);

      const result = await service.getStudentEnrollments('user-1');

      expect(result).toHaveLength(1);
      expect(result[0].completedLessonIds).toEqual(['lesson-1', 'lesson-2']);
      expect(result[0].completedLessonIds).not.toContain('lesson-99');
    });
  });

  describe('updateEnrollmentProgress', () => {
    it('should calculate and update progress percentage', async () => {
      mockPrisma.program.findUnique.mockResolvedValue({
        id: 'prog-1',
        tracks: [
          {
            modules: [
              { lessons: [{ id: 'l1' }, { id: 'l2' }] },
              { lessons: [{ id: 'l3' }, { id: 'l4' }] },
            ],
          },
        ],
      });
      mockPrisma.progress.count.mockResolvedValue(2);
      mockPrisma.enrollment.update.mockResolvedValue({ id: 'enroll-1', progress: 50 });

      await service.updateEnrollmentProgress('user-1', 'prog-1');

      expect(mockPrisma.enrollment.update).toHaveBeenCalledWith({
        where: { userId_programId: { userId: 'user-1', programId: 'prog-1' } },
        data: { progress: 50, completedAt: null, status: undefined },
      });
    });

    it('should set completedAt and status when progress reaches 100', async () => {
      mockPrisma.program.findUnique.mockResolvedValue({
        id: 'prog-1',
        tracks: [{ modules: [{ lessons: [{ id: 'l1' }, { id: 'l2' }] }] }],
      });
      mockPrisma.progress.count.mockResolvedValue(2);
      mockPrisma.enrollment.update.mockResolvedValue({ id: 'enroll-1', progress: 100 });

      await service.updateEnrollmentProgress('user-1', 'prog-1');

      expect(mockPrisma.enrollment.update).toHaveBeenCalledWith({
        where: { userId_programId: { userId: 'user-1', programId: 'prog-1' } },
        data: { progress: 100, completedAt: expect.any(Date), status: EnrollmentStatus.COMPLETED },
      });
    });

    it('should do nothing if program has no lessons', async () => {
      mockPrisma.program.findUnique.mockResolvedValue({
        id: 'prog-1',
        tracks: [{ modules: [{ lessons: [] }] }],
      });

      await service.updateEnrollmentProgress('user-1', 'prog-1');

      expect(mockPrisma.progress.count).not.toHaveBeenCalled();
      expect(mockPrisma.enrollment.update).not.toHaveBeenCalled();
    });

    it('should do nothing if program not found', async () => {
      mockPrisma.program.findUnique.mockResolvedValue(null);

      await service.updateEnrollmentProgress('user-1', 'nonexistent');

      expect(mockPrisma.progress.count).not.toHaveBeenCalled();
      expect(mockPrisma.enrollment.update).not.toHaveBeenCalled();
    });
  });
});
