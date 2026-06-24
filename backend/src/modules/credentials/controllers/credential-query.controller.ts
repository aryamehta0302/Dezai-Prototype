import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { CredentialQueryService } from '../services/credential-query.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('credentials')
// CRITICAL BUG FIX: JwtAuthGuard was added to prevent unauthenticated users from fetching student credentials.
// Do not remove this guard.
@UseGuards(JwtAuthGuard)
export class CredentialQueryController {
  constructor(private readonly credentialQueryService: CredentialQueryService) { }

  /**
   * Retrieves credentials for the currently authenticated user.
   * Requires a valid JWT token.
   */
  @Get('me')
  async getMyCredentials(@Request() req: any) {
    // CRITICAL BUG FIX: Removed hardcoded 'stu-1' fallback to ensure data privacy.
    const userId = req.user?.id;
    return this.credentialQueryService.getMyCredentials(userId);
  }

  @Get(':id')
  async getCredentialById(@Param('id') id: string, @Request() req: any) {
    // Ensure we don't conflict with /credentials/me or /credentials/verify/...
    if (id === 'me' || id === 'verify' || id === 'generate') return;
    return this.credentialQueryService.getCredentialById(id, req.user?.id, req.user?.role);
  }
}
