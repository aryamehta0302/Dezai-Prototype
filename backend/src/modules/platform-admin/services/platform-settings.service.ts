import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';
import { AuditAction } from '@prisma/client';
import { UpdatePlatformSettingsDto } from '../dto/platform-settings.dto';

@Injectable()
export class PlatformSettingsService {
  private memorySettings: Record<string, any> = {
    allowRegistration: true,
    maintenanceMode: false,
    bannedTerms: ['exam', 'course', 'chapter', 'certificate'],
    xpDailyStreakBonus: 50,
    xpAssessmentPassBonus: 100,
    xpModuleCompletionBonus: 200,
  };

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async getPlatformSettings() {
    return {
      settings: this.memorySettings,
      lastUpdated: new Date(),
    };
  }

  async updatePlatformSettings(dto: UpdatePlatformSettingsDto, adminUserId: string) {
    if (dto.settings) {
      this.memorySettings = {
        ...this.memorySettings,
        ...dto.settings,
      };
    }

    await this.auditService.logAction(
      adminUserId,
      AuditAction.PLATFORM_SETTINGS_UPDATED,
      `Platform settings updated by Super Admin ${adminUserId}`,
    );

    return {
      success: true,
      settings: this.memorySettings,
    };
  }
}
