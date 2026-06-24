import { Controller, Patch, Param, Body, Req, UseGuards, Get } from '@nestjs/common';
import { CredentialStateService } from '../services/credential-state.service';
import { UpdateCredentialStateDto } from '../dto/update-credential-state.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('credentials/state')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CredentialStateController {
  constructor(private readonly credentialStateService: CredentialStateService) { }

  @Patch(':id')
  @Roles(UserRole.DEZAI_ADMIN) // ONLY Dezai Admin can hit this gateway
  async updateCredentialState(
    @Param('id') id: string,
    @Body() dto: UpdateCredentialStateDto,
    @Req() req: any
  ) {
    const actorId = req.user?.id || 'admin-system';
    return this.credentialStateService.updateCredentialState(id, dto, actorId);
  }

  @Get(':id/logs')
  @Roles(UserRole.DEZAI_ADMIN) // ONLY Dezai Admin can view state logs
  async getCredentialLogs(@Param('id') id: string) {
    return this.credentialStateService.getCredentialLogs(id);
  }
}
