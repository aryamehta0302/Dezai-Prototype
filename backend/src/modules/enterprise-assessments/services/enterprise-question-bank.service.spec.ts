import { Test, TestingModule } from '@nestjs/testing';
import { EnterpriseQuestionBankService } from './enterprise-question-bank.service';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole, Difficulty, ComplianceTrack, QuestionBankSourceType } from '@prisma/client';

describe('EnterpriseQuestionBankService', () => {
  let service: EnterpriseQuestionBankService;
  let prisma: PrismaService;
  let cacheManager: any;

  const mockPrisma = {
    enterpriseQuestionBank: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    enterpriseQuestion: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    organizationAdmin: {
      findUnique: jest.fn(),
    },
    employee: {
      findUnique: jest.fn(),
    },
    complianceAssessment: {
      findMany: jest.fn(),
    },
  };

  const mockAudit = {
    logAction: jest.fn(),
  };

  const mockCache = {
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterpriseQuestionBankService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAudit },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<EnterpriseQuestionBankService>(EnterpriseQuestionBankService);
    prisma = module.get<PrismaService>(PrismaService);
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  describe('validateEnterpriseQuestionBankOwnership', () => {
    const userId = 'user-123';
    const bankId = 'bank-123';
    const orgId = 'org-123';

    it('should allow DEZAI_ADMIN to bypass ownership checks', async () => {
      const result = await service.validateEnterpriseQuestionBankOwnership(userId, bankId, UserRole.DEZAI_ADMIN);
      expect(result).toBe(true);
      expect(mockPrisma.enterpriseQuestionBank.findUnique).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if bank does not exist', async () => {
      mockPrisma.enterpriseQuestionBank.findUnique.mockResolvedValue(null);
      await expect(
        service.validateEnterpriseQuestionBankOwnership(userId, bankId, UserRole.STUDENT),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow OrganizationAdmin belonging to the same organization', async () => {
      mockPrisma.enterpriseQuestionBank.findUnique.mockResolvedValue({ organizationId: orgId });
      mockPrisma.organizationAdmin.findUnique.mockResolvedValue({ organizationId: orgId });

      const result = await service.validateEnterpriseQuestionBankOwnership(userId, bankId, UserRole.FACULTY);
      expect(result).toBe(true);
    });

    it('should allow Employee belonging to the same organization', async () => {
      mockPrisma.enterpriseQuestionBank.findUnique.mockResolvedValue({ organizationId: orgId });
      mockPrisma.organizationAdmin.findUnique.mockResolvedValue(null);
      mockPrisma.employee.findUnique.mockResolvedValue({ organizationId: orgId });

      const result = await service.validateEnterpriseQuestionBankOwnership(userId, bankId, UserRole.STUDENT);
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user belongs to a different organization', async () => {
      mockPrisma.enterpriseQuestionBank.findUnique.mockResolvedValue({ organizationId: orgId });
      mockPrisma.organizationAdmin.findUnique.mockResolvedValue({ organizationId: 'different-org' });
      mockPrisma.employee.findUnique.mockResolvedValue({ organizationId: 'different-org-2' });

      await expect(
        service.validateEnterpriseQuestionBankOwnership(userId, bankId, UserRole.STUDENT),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createQuestionBank', () => {
    it('should create an EnterpriseQuestionBank and log the audit action', async () => {
      const userId = 'user-123';
      const dto = {
        title: 'New Bank',
        description: 'Desc',
        organizationId: 'org-123',
        complianceTrack: ComplianceTrack.CYBER_SECURITY,
        sourceType: QuestionBankSourceType.MANUAL,
      };

      mockPrisma.enterpriseQuestionBank.create.mockResolvedValue({ id: 'bank-123', title: 'New Bank' });
      mockPrisma.enterpriseQuestionBank.findUnique.mockResolvedValue({ id: 'bank-123', title: 'New Bank', questions: [] });

      const result = await service.createQuestionBank(userId, dto);
      expect(result.id).toBe('bank-123');
      expect(mockPrisma.enterpriseQuestionBank.create).toHaveBeenCalled();
      expect(mockAudit.logAction).toHaveBeenCalled();
    });
  });
});
