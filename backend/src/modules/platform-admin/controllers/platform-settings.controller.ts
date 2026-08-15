import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { PlatformSettingsService } from '../services/platform-settings.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../../common/guards/super-admin.guard';
import { UpdatePlatformSettingsDto } from '../dto/platform-settings.dto';

@Controller('platform-admin/settings')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class PlatformSettingsController {
  constructor(private readonly settingsService: PlatformSettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getPlatformSettings();
  }

  @Patch()
  async updateSettings(@Req() req, @Body() body: UpdatePlatformSettingsDto) {
    return this.settingsService.updatePlatformSettings(body, req.user.id || req.user.userId);
  }
}
