import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { CredentialGenerationService } from '../services/credential-generation.service';
import { CreateProgramCredentialDto } from '../dto/create-program-credential.dto';
import { CreateAssessmentCredentialDto } from '../dto/create-assessment-credential.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('credentials/generate')
@UseGuards(JwtAuthGuard)
export class CredentialGenerationController {
  constructor(private readonly credentialGenerationService: CredentialGenerationService) { }

  @Post('program')
  async generateProgramCredential(@Body() dto: CreateProgramCredentialDto, @Req() req: any) {
    const actorId = req.user?.id || 'system';
    return this.credentialGenerationService.generateProgramCredential(dto, actorId);
  }

  @Post('assessment')
  async generateAssessmentCredential(@Body() dto: CreateAssessmentCredentialDto, @Req() req: any) {
    const actorId = req.user?.id || 'system';
    return this.credentialGenerationService.generateAssessmentCredential(dto, actorId);
  }
}
