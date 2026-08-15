import { CredentialsService } from '../services/credentials.service';
import { CredentialsRepository } from '../repositories/credentials.repository';
import { TemplateService } from '../services/template.service';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CredentialsService', () => {
  let service: CredentialsService;
  let mockRepository: any;
  let mockTemplateService: any;
  let mockPrisma: any;
  let mockAuditService: any;
  let mockNotificationsService: any;

  beforeEach(async () => {
    mockRepository = {
      createCredential: jest.fn(),
      findAll: jest.fn(),
      findByVerificationCode: jest.fn(),
      updateStatus: jest.fn(),
      search: jest.fn(),
    };

    mockTemplateService = {
      getTemplateById: jest.fn(),
      getAllTemplates: jest.fn(),
      getTemplatesByType: jest.fn(),
    };

    mockPrisma = {
      credential: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      program: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
      },
      enrollment: {
        findUnique: jest.fn(),
      },
      assessmentAttempt: {
        findFirst: jest.fn(),
      },
      auditLog: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn((cb: any) => cb(mockPrisma)),
    };

    mockAuditService = {
      logAction: jest.fn(),
    };

    mockNotificationsService = {
      createNotification: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsService,
        { provide: CredentialsRepository, useValue: mockRepository },
        { provide: TemplateService, useValue: mockTemplateService },
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditService, useValue: mockAuditService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<CredentialsService>(CredentialsService);
  });

  describe('verifyCredential', () => {
    const mockCredential = {
      id: 'cred-1',
      verificationCode: 'A1B2C3D4E5F6G7H8I9',
      verificationStatus: 'ACTIVE',
      userId: 'user-1',
      programId: 'prog-1',
      institutionId: 'inst-1',
      metadata: JSON.stringify({
        signature: 'valid-signature',
        statusHistory: [{ status: 'ACTIVE', changedBy: 'admin', reason: 'Issued', date: '2026-01-01' }],
      }),
      user: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
      program: { title: 'Test Program', institution: { name: 'Test Institution' } },
      issuer: { id: 'admin-1', name: 'Admin' },
    };

    it('should return valid result for active credential', async () => {
      mockPrisma.credential.findUnique.mockResolvedValue(mockCredential);
      // Mock the HMAC verification to pass
      jest.spyOn(service as any, 'verifyCredentialMetadata').mockReturnValue(true);

      const result = await service.verifyCredential('A1B2C3D4E5F6G7H8I9');
      expect(result.valid).toBe(true);
      expect(result.status).toBe('ACTIVE');
      expect(result.data).toBeDefined();
    });

    it('should return invalid for non-existent code', async () => {
      mockPrisma.credential.findUnique.mockResolvedValue(null);

      const result = await service.verifyCredential('INVALIDCODE12345678');
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Invalid Verification Code');
    });

    it('should detect tampered metadata', async () => {
      mockPrisma.credential.findUnique.mockResolvedValue(mockCredential);
      jest.spyOn(service as any, 'verifyCredentialMetadata').mockReturnValue(false);

      const result = await service.verifyCredential('A1B2C3D4E5F6G7H8I9');
      expect(result.valid).toBe(false);
      expect(result.tampered).toBe(true);
      expect(result.message).toContain('tampering');
    });

    it('should return revoked status for revoked credential', async () => {
      const revokedCred = { ...mockCredential, verificationStatus: 'REVOKED' };
      mockPrisma.credential.findUnique.mockResolvedValue(revokedCred);
      jest.spyOn(service as any, 'verifyCredentialMetadata').mockReturnValue(true);

      const result = await service.verifyCredential('REVOKEDCODE12345678');
      expect(result.valid).toBe(false);
      expect(result.status).toBe('REVOKED');
    });

    it('should return suspended status for suspended credential', async () => {
      const suspendedCred = { ...mockCredential, verificationStatus: 'SUSPENDED' };
      mockPrisma.credential.findUnique.mockResolvedValue(suspendedCred);
      jest.spyOn(service as any, 'verifyCredentialMetadata').mockReturnValue(true);

      const result = await service.verifyCredential('SUSPENDEDCODE12345');
      expect(result.valid).toBe(false);
      expect(result.status).toBe('SUSPENDED');
    });

    it('should use cached result on repeated verification', async () => {
      mockPrisma.credential.findUnique.mockResolvedValue(mockCredential);
      jest.spyOn(service as any, 'verifyCredentialMetadata').mockReturnValue(true);

      // First call hits DB
      await service.verifyCredential('CACHEDTESTCODE1234');
      // Second call should use cache (not hit DB again)
      const result = await service.verifyCredential('CACHEDTESTCODE1234');
      expect(result.valid).toBe(true);
      expect(mockPrisma.credential.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeCredentialStatus', () => {
    const mockCredential = {
      id: 'cred-2',
      verificationCode: 'STATUSCHANGE123456',
      verificationStatus: 'ACTIVE',
      userId: 'user-1',
      programId: 'prog-1',
      institutionId: 'inst-1',
      metadata: JSON.stringify({
        signature: 'sig',
        statusHistory: [],
      }),
    };

    const mockUpdated = {
      ...mockCredential,
      verificationStatus: 'REVOKED',
      program: { title: 'Test Program', institution: { name: 'Test' } },
      user: { id: 'user-1', name: 'Test' },
      issuer: { id: 'admin-1', name: 'Admin' },
    };

    it('should throw NotFoundException for non-existent credential', async () => {
      mockPrisma.credential.findUnique.mockResolvedValue(null);
      await expect(
        service.changeCredentialStatus('non-existent', 'REVOKED' as any, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should successfully change status to REVOKED', async () => {
      mockPrisma.credential.findUnique.mockResolvedValue(mockCredential);
      mockPrisma.credential.update.mockResolvedValue(mockUpdated);
      jest.spyOn(service as any, 'signCredentialMetadata').mockReturnValue('new-signature');

      await service.changeCredentialStatus('cred-2', 'REVOKED' as any, 'admin-1', 'Policy violation');

      expect(mockPrisma.credential.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cred-2' },
          data: expect.objectContaining({
            verificationStatus: 'REVOKED',
          }),
        }),
      );

      // Verify notifications were sent
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        'user-1',
        expect.any(String),
        expect.any(String),
        'SYSTEM',
      );
    });

    it('should evict cache after status change', async () => {
      mockPrisma.credential.findUnique.mockResolvedValue(mockCredential);
      mockPrisma.credential.update.mockResolvedValue(mockUpdated);
      jest.spyOn(service as any, 'signCredentialMetadata').mockReturnValue('new-sig');
      jest.spyOn(service as any, 'cacheEvict');

      await service.changeCredentialStatus('cred-2', 'SUSPENDED' as any, 'admin-1');

      expect((service as any).cacheEvict).toHaveBeenCalledWith('STATUSCHANGE123456');
    });
  });

  describe('issueCredential', () => {
    it('should throw BadRequestException for invalid template', async () => {
      mockTemplateService.getTemplateById.mockResolvedValue(null);
      await expect(
        service.issueCredential({
          userId: 'user-1',
          programId: 'prog-1',
          institutionId: 'inst-1',
          issuedById: 'admin-1',
          templateId: 'invalid-template',
          credentialType: 'PROGRAM' as any,
          tier: 'CITADEL' as any,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should issue credential with valid template', async () => {
      mockTemplateService.getTemplateById.mockResolvedValue({
        id: 'template-1',
        type: 'PROGRAM',
        defaultTier: 'CITADEL',
      });

      mockRepository.createCredential.mockResolvedValue({
        id: 'new-cred',
        verificationCode: 'ABC123DEF456GHI789',
      });

      const result = await service.issueCredential({
        userId: 'user-1',
        programId: 'prog-1',
        institutionId: 'inst-1',
        issuedById: 'admin-1',
        templateId: 'template-1',
        credentialType: 'PROGRAM' as any,
        tier: 'CITADEL' as any,
      });

      expect(result).toBeDefined();
      expect(mockRepository.createCredential).toHaveBeenCalled();
      expect(mockAuditService.logAction).toHaveBeenCalled();
    });
  });

  describe('signCredentialMetadata', () => {
    it('should produce deterministic signatures for same input', () => {
      const sig1 = (service as any).signCredentialMetadata(
        'cred-1', 'CODE123', 'ACTIVE', 'user-1', 'prog-1', { some: 'data' }, 'inst-1',
      );
      const sig2 = (service as any).signCredentialMetadata(
        'cred-1', 'CODE123', 'ACTIVE', 'user-1', 'prog-1', { some: 'data' }, 'inst-1',
      );
      expect(sig1).toBe(sig2);
    });

    it('should produce different signatures for different statuses', () => {
      const sigActive = (service as any).signCredentialMetadata(
        'cred-1', 'CODE123', 'ACTIVE', 'user-1', 'prog-1', { some: 'data' }, 'inst-1',
      );
      const sigRevoked = (service as any).signCredentialMetadata(
        'cred-1', 'CODE123', 'REVOKED', 'user-1', 'prog-1', { some: 'data' }, 'inst-1',
      );
      expect(sigActive).not.toBe(sigRevoked);
    });
  });

  describe('brute force verification', () => {
    it('should handle rapid invalid verifications gracefully', async () => {
      mockPrisma.credential.findUnique.mockResolvedValue(null);

      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(service.verifyCredential(`INVALID${i}CODE12345678`));
      }

      const results = await Promise.all(promises);
      results.forEach((r) => {
        expect(r.valid).toBe(false);
      });
    });
  });
});
