import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PlatformAuditService } from '../services/platform-audit.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../../common/guards/super-admin.guard';
import { AuditAction, UserRole } from '@prisma/client';

@Controller('platform-admin')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class PlatformAuditController {
  constructor(private readonly auditService: PlatformAuditService) {}

  @Get('audit-logs')
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('userRole') userRole?: UserRole,
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;
    return this.auditService.getAuditLogs({ userId, action, userRole, search, skip, take });
  }

  @Get('uploads')
  async getUploads(
    @Query('entityType') entityType?: string,
    @Query('search') search?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    const take = parseInt(limit, 10);
    const skip = (parseInt(page, 10) - 1) * take;
    return this.auditService.getAllUploadedDocuments({ entityType, search, skip, take });
  }
}
