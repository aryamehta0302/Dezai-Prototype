import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CredentialVerificationService } from '../services/credential-verification.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('credentials')
export class CredentialVerificationController {
  constructor(private readonly credentialVerificationService: CredentialVerificationService) { }

  // Admin / General Fetch
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN)
  async getAllCredentials() {
    return this.credentialVerificationService.getAllCredentials();
  }

  // Student specific fetch
  @Get('student/:studentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DEZAI_ADMIN, UserRole.UNIVERSITY_ADMIN)
  async getStudentCredentials(@Param('studentId') studentId: string) {
    return this.credentialVerificationService.getStudentCredentials(studentId);
  }

  // PUBLIC Verification Endpoint (No Auth Guard)
  @Get('verify/:idOrCode')
  async verifyCredential(@Param('idOrCode') idOrCode: string) {
    return this.credentialVerificationService.verifyCredential(idOrCode);
  }
}
