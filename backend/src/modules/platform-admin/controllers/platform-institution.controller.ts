import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PlatformInstitutionService } from '../services/platform-institution.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../../common/guards/super-admin.guard';
import { InstitutionStatus } from '@prisma/client';
import { RejectInstitutionDto, SuspendInstitutionDto } from '../dto/platform-institution.dto';

@Controller('platform-admin/institutions')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class PlatformInstitutionController {
  constructor(private readonly institutionService: PlatformInstitutionService) {}

  @Get()
  async getAllInstitutions(
    @Query('status') status?: InstitutionStatus,
    @Query('search') search?: string,
  ) {
    return this.institutionService.getAllInstitutions({ status, search });
  }

  @Get(':id')
  async getInstitutionById(@Param('id') id: string) {
    return this.institutionService.getInstitutionById(id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approveInstitution(@Req() req, @Param('id') id: string) {
    return this.institutionService.approveInstitution(id, req.user.id || req.user.userId);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async rejectInstitution(@Req() req, @Param('id') id: string, @Body() body: RejectInstitutionDto) {
    return this.institutionService.rejectInstitution(id, req.user.id || req.user.userId, body);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  async suspendInstitution(@Req() req, @Param('id') id: string, @Body() body: SuspendInstitutionDto) {
    return this.institutionService.suspendInstitution(id, req.user.id || req.user.userId, body);
  }

  @Post(':id/reactivate')
  @HttpCode(HttpStatus.OK)
  async reactivateInstitution(@Req() req, @Param('id') id: string) {
    return this.institutionService.reactivateInstitution(id, req.user.id || req.user.userId);
  }
}
