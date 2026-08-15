import { InstitutionActiveGuard } from '../../src/common/guards/institution-active.guard';
import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('InstitutionActiveGuard', () => {
  let guard: InstitutionActiveGuard;
  let mockPrisma: any;
  let mockRbacScopeService: any;

  beforeEach(() => {
    mockPrisma = {
      facultyMember: {
        findUnique: jest.fn(),
      },
      enrollment: {
        findFirst: jest.fn(),
      },
      institution: {
        findUnique: jest.fn(),
      },
    };

    mockRbacScopeService = {
      getAdminInstitutionId: jest.fn(),
    };

    guard = new InstitutionActiveGuard(mockPrisma as any, mockRbacScopeService as any);
  });

  function createMockContext(user: any): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
        getResponse: () => null,
        getNext: () => null,
      }),
      getClass: () => null,
      getHandler: () => null,
      getArgs: () => [],
      getArgByIndex: () => null,
      getType: () => 'http',
      switchToRpc: () => null as any,
      switchToWs: () => null as any,
    } as unknown as ExecutionContext;
  }

  it('should allow unauthenticated request (user missing)', async () => {
    const context = createMockContext(null);
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should allow DEZAI_ADMIN to bypass institution suspension check', async () => {
    const context = createMockContext({ id: 'admin-1', role: UserRole.DEZAI_ADMIN });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(mockPrisma.institution.findUnique).not.toHaveBeenCalled();
  });

  it('should allow FACULTY from active institution', async () => {
    const context = createMockContext({ id: 'fac-1', role: UserRole.FACULTY });
    mockPrisma.facultyMember.findUnique.mockResolvedValue({ institutionId: 'inst-1' });
    mockPrisma.institution.findUnique.mockResolvedValue({ id: 'inst-1', status: 'APPROVED' });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException for FACULTY from SUSPENDED institution', async () => {
    const context = createMockContext({ id: 'fac-1', role: UserRole.FACULTY });
    mockPrisma.facultyMember.findUnique.mockResolvedValue({ institutionId: 'inst-1' });
    mockPrisma.institution.findUnique.mockResolvedValue({ id: 'inst-1', status: 'SUSPENDED' });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should allow STUDENT from active institution enrollment', async () => {
    const context = createMockContext({ id: 'stu-1', role: UserRole.STUDENT });
    mockPrisma.enrollment.findFirst.mockResolvedValue({
      program: { institutionId: 'inst-1' },
    });
    mockPrisma.institution.findUnique.mockResolvedValue({ id: 'inst-1', status: 'APPROVED' });

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw ForbiddenException for STUDENT with active enrollment in SUSPENDED institution', async () => {
    const context = createMockContext({ id: 'stu-1', role: UserRole.STUDENT });
    mockPrisma.enrollment.findFirst.mockResolvedValue({
      program: { institutionId: 'inst-1' },
    });
    mockPrisma.institution.findUnique.mockResolvedValue({ id: 'inst-1', status: 'SUSPENDED' });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException for UNIVERSITY_ADMIN from SUSPENDED institution', async () => {
    const context = createMockContext({ id: 'uadmin-1', role: UserRole.UNIVERSITY_ADMIN });
    mockRbacScopeService.getAdminInstitutionId.mockResolvedValue('inst-1');
    mockPrisma.institution.findUnique.mockResolvedValue({ id: 'inst-1', status: 'SUSPENDED' });

    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('should allow user if no institutionId is associated', async () => {
    const context = createMockContext({ id: 'fac-no-inst', role: UserRole.FACULTY });
    mockPrisma.facultyMember.findUnique.mockResolvedValue(null);

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });
});
