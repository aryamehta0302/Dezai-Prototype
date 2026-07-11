import { EnterpriseCredentialsService } from '../services/enterprise-credentials.service';
import { EnterpriseCredentialsRepository } from '../repositories/enterprise-credentials.repository';
import { EnterpriseTemplateService } from '../services/enterprise-template.service';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('EnterpriseCredentialsService', () => {
  let service: EnterpriseCredentialsService;
  let mockRepository: any;
  let mockTemplateService: any;
  let mockPrisma: any;
  let mockAuditService: any;
  let mockNotificationsService: any;

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByVerificationCode: jest.fn(),
      updateStatus: jest.fn(),
      batchUpdateStatus: jest.fn(),
      findByEmployeeId: jest.fn(),
      search: jest.fn(),
      getAnalytics: jest.fn(),
    };

    mockTemplateService = {
      getTemplateById: jest.fn(),
      getAllTemplates: jest.fn(),
      getTemplatesByTrack: jest.fn(),
    };

    mockPrisma = {
      employee: {
        findUnique: jest.fn(),
      },
      organizationAdmin: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      department: {
        update: jest.fn(),
      },
      enterpriseQuestion: {
        count: jest.fn(),
      },
    };

    mockAuditService = {
      logAction: jest.fn(),
    };

    mockNotificationsService = {
      createNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterpriseCredentialsService,
        { provide: EnterpriseCredentialsRepository, useValue: mockRepository },
        { provide: EnterpriseTemplateService, useValue: mockTemplateService },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAuditService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<EnterpriseCredentialsService>(EnterpriseCredentialsService);
  });

  describe('issueCredential', () => {
    it('should throw NotFoundException if employee does not exist', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);

      await expect(
        service.issueCredential({
          employeeId: 'invalid-emp',
          organizationId: 'org-1',
          complianceTrack: 'CYBER_SECURITY',
        }, 'user-admin'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should issue a credential and log it', async () => {
      const mockEmployee = { id: 'emp-1', userId: 'user-emp-1', user: { name: 'Test Emp', email: 'emp@corp.com' } };
      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      
      const mockCred = {
        id: 'cred-1',
        verificationCode: 'ABC123XYZ456',
        complianceTrack: 'CYBER_SECURITY',
      };
      mockRepository.create.mockResolvedValue(mockCred);

      const result = await service.issueCredential({
        employeeId: 'emp-1',
        organizationId: 'org-1',
        complianceTrack: 'CYBER_SECURITY',
      }, 'user-admin');

      expect(result).toBeDefined();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockNotificationsService.createNotification).toHaveBeenCalled();
      expect(mockAuditService.logAction).toHaveBeenCalled();
    });
  });

  describe('verifyCredential', () => {
    it('should return invalid if credential code is not found', async () => {
      mockRepository.findByVerificationCode.mockResolvedValue(null);

      const res = await service.verifyCredential('INVALIDCODE1234');
      expect(res.valid).toBe(false);
      expect(res.message).toBe('Invalid Verification Code');
    });

    it('should return valid if credential is active and signature matches', async () => {
      const mockCred = {
        id: 'cred-1',
        employeeId: 'emp-1',
        organizationId: 'org-1',
        verificationCode: 'ALLIANZCYBER202611',
        verificationStatus: 'ACTIVE',
        complianceTrack: 'CYBER_SECURITY',
        metadata: JSON.stringify({
          signature: 'valid-sig-placeholder',
        }),
      };
      
      // Stub signCredentialMetadata to return match
      jest.spyOn(service as any, 'signCredentialMetadata').mockReturnValue('valid-sig-placeholder');
      mockRepository.findByVerificationCode.mockResolvedValue(mockCred);

      const res = await service.verifyCredential('ALLIANZCYBER202611');
      expect(res.valid).toBe(true);
      expect(res.status).toBe('ACTIVE');
    });

    it('should detect tampered credentials if signatures do not match', async () => {
      const mockCred = {
        id: 'cred-1',
        employeeId: 'emp-1',
        organizationId: 'org-1',
        verificationCode: 'ALLIANZCYBER202611',
        verificationStatus: 'ACTIVE',
        complianceTrack: 'CYBER_SECURITY',
        metadata: JSON.stringify({
          signature: 'tampered-sig',
        }),
        employee: { userId: 'user-1' }
      };

      jest.spyOn(service as any, 'signCredentialMetadata').mockReturnValue('valid-sig-placeholder');
      mockRepository.findByVerificationCode.mockResolvedValue(mockCred);

      const res = await service.verifyCredential('ALLIANZCYBER202611');
      expect(res.valid).toBe(false);
      expect(res.tampered).toBe(true);
    });
  });

  describe('changeCredentialStatus', () => {
    it('should update status and trigger audit/notification', async () => {
      const mockCred = {
        id: 'cred-1',
        verificationCode: 'ALLIANZCYBER202611',
        complianceTrack: 'CYBER_SECURITY',
        employee: { userId: 'user-emp-1' }
      };
      mockRepository.findById.mockResolvedValue(mockCred);
      mockRepository.updateStatus.mockResolvedValue({ ...mockCred, verificationStatus: 'REVOKED' });

      const res = await service.changeCredentialStatus('cred-1', 'REVOKED', 'user-admin', 'No longer compliant');
      expect(res.verificationStatus).toBe('REVOKED');
      expect(mockRepository.updateStatus).toHaveBeenCalledWith('cred-1', 'REVOKED');
      expect(mockNotificationsService.createNotification).toHaveBeenCalled();
      expect(mockAuditService.logAction).toHaveBeenCalled();
    });
  });
});
