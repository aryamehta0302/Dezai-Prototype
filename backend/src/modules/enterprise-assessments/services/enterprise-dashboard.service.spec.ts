import { Test, TestingModule } from '@nestjs/testing';
import { EnterpriseDashboardService } from './enterprise-dashboard.service';
import { PrismaService } from '../../../database/prisma.service';
import { PassFailEvaluationService } from '../../assessments/services/pass-fail-evaluation.service';
import { NotFoundException } from '@nestjs/common';
import { ComplianceTrack } from '@prisma/client';

describe('EnterpriseDashboardService', () => {
  let service: EnterpriseDashboardService;
  let prisma: PrismaService;

  const mockPrisma = {
    organization: {
      findUnique: jest.fn(),
    },
    complianceAssessment: {
      findMany: jest.fn(),
    },
    complianceAssessmentAttempt: {
      findMany: jest.fn(),
    },
    employee: {
      count: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    department: {
      findUnique: jest.fn(),
    },
  };

  const mockPassFail = {
    calculatePercentage: jest.fn().mockImplementation((correct, total) => (correct / total) * 100),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterpriseDashboardService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PassFailEvaluationService, useValue: mockPassFail },
      ],
    }).compile();

    service = module.get<EnterpriseDashboardService>(EnterpriseDashboardService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('getOrganizationDashboard', () => {
    const orgId = 'org-123';

    it('should throw NotFoundException if organization does not exist', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue(null);
      await expect(service.getOrganizationDashboard(orgId)).rejects.toThrow(NotFoundException);
    });

    it('should calculate overall stats and per-track breakdown correctly', async () => {
      mockPrisma.organization.findUnique.mockResolvedValue({ id: orgId, name: 'Dezai Corp' });
      mockPrisma.complianceAssessment.findMany.mockResolvedValue([
        { id: 'a1', complianceTrack: ComplianceTrack.CYBER_SECURITY },
        { id: 'a2', complianceTrack: ComplianceTrack.PASSWORD_SECURITY },
      ]);
      mockPrisma.complianceAssessmentAttempt.findMany.mockResolvedValue([
        { assessmentId: 'a1', percentage: 90.0, passed: true },
        { assessmentId: 'a1', percentage: 50.0, passed: false },
        { assessmentId: 'a2', percentage: 100.0, passed: true },
      ]);
      mockPrisma.employee.count.mockResolvedValue(10);

      const dashboard = await service.getOrganizationDashboard(orgId);

      expect(dashboard.organizationName).toBe('Dezai Corp');
      expect(dashboard.totalAssessments).toBe(2);
      expect(dashboard.totalAttempts).toBe(3);
      expect(dashboard.totalEmployees).toBe(10);
      expect(dashboard.passRate).toBe((2 / 3) * 100);
      expect(dashboard.averagePercentage).toBeCloseTo((90 + 50 + 100) / 3);

      const cyberSecTrack = dashboard.trackBreakdown.find((t) => t.track === ComplianceTrack.CYBER_SECURITY);
      expect(cyberSecTrack).toBeDefined();
      expect(cyberSecTrack?.totalAssessments).toBe(1);
      expect(cyberSecTrack?.totalAttempts).toBe(2);
      expect(cyberSecTrack?.passRate).toBe(50.0);
    });
  });

  describe('getEmployeeDashboard', () => {
    const userId = 'user-123';

    it('should throw NotFoundException if employee profile does not exist', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);
      await expect(service.getEmployeeDashboard(userId)).rejects.toThrow(NotFoundException);
    });

    it('should return compliance status per track', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue({
        id: 'emp-123',
        userId,
        organization: { name: 'Dezai Corp' },
        department: { name: 'IT' },
      });

      mockPrisma.complianceAssessment.findMany.mockResolvedValue([
        { id: 'a1', title: 'Cyber Sec 1', complianceTrack: ComplianceTrack.CYBER_SECURITY },
        { id: 'a2', title: 'Password Sec 1', complianceTrack: ComplianceTrack.PASSWORD_SECURITY },
      ]);

      mockPrisma.complianceAssessmentAttempt.findMany.mockResolvedValue([
        { assessmentId: 'a1', percentage: 90.0, passed: true, completedAt: new Date() },
        { assessmentId: 'a2', percentage: 60.0, passed: false, completedAt: new Date() },
      ]);

      const dashboard = await service.getEmployeeDashboard(userId);

      expect(dashboard.organizationName).toBe('Dezai Corp');
      expect(dashboard.departmentName).toBe('IT');
      expect(dashboard.overallComplianceRate).toBe(50.0); // 1 passed out of 2 tracks with assessments

      const cyberSecTrack = dashboard.tracks.find((t) => t.track === ComplianceTrack.CYBER_SECURITY);
      expect(cyberSecTrack?.passed).toBe(true);
      expect(cyberSecTrack?.bestPercentage).toBe(90.0);

      const passwordSecTrack = dashboard.tracks.find((t) => t.track === ComplianceTrack.PASSWORD_SECURITY);
      expect(passwordSecTrack?.passed).toBe(false);
      expect(passwordSecTrack?.bestPercentage).toBe(60.0);
    });
  });
});
