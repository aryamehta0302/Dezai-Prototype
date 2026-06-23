import { Controller, Get, Post, Body, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { CredentialsService } from '../services/credentials.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('credentials')
export class CredentialsController {
  constructor(private readonly credentialsService: CredentialsService) {}

  /**
   * POST /api/credentials/claim
   * Claim credential for a completed program.
   */
  @Post('claim')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async claim(@Req() req, @Body('programId') programId: string) {
    const cred = await this.credentialsService.issueCredential(req.user.id, programId);
    return { success: true, credential: cred };
  }

  /**
   * GET /api/credentials/student
   * List all credentials for the currently logged-in student.
   */
  @Get('student')
  @UseGuards(JwtAuthGuard)
  async getStudentCredentials(@Req() req) {
    const credentials = await this.credentialsService.getStudentCredentials(req.user.id);
    return { success: true, data: credentials };
  }

  /**
   * GET /api/credentials/verify/:code
   * Public endpoint to verify a credential by its code.
   */
  @Get('verify/:code')
  async verify(@Param('code') code: string) {
    const credential = await this.credentialsService.verifyCredential(code);
    return { success: true, credential };
  }

  /**
   * GET /api/credentials/:id
   * Get specific credential details.
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getDetails(@Param('id') id: string) {
    const credential = await this.credentialsService.getCredentialDetails(id);
    return { success: true, credential };
  }
}
