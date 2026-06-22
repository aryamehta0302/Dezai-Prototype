import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { UserAchievementService } from '../services/user-achievement.service';
import { AwardService } from '../services/award.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AchievementCategory } from '@prisma/client';
import { AchievementsQueryDto } from '../dto/achievements-query.dto';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(
    private readonly userAchievementService: UserAchievementService,
    private readonly awardService: AwardService,
  ) {}

  @Get()
  async getAchievements(@Req() req, @Query(new ValidationPipe({ transform: true })) query: AchievementsQueryDto) {
    const filter: { category?: string; unlocked?: boolean } = {};
    if (query.category) filter.category = query.category;
    if (query.unlocked !== undefined) filter.unlocked = query.unlocked === 'true';

    const data = await this.userAchievementService.getAchievements(req.user.id, filter);
    return { success: true, data };
  }

  @Get('recent')
  async getRecentUnlocks(@Req() req, @Query('limit') limit?: string) {
    const data = await this.userAchievementService.getRecentUnlocks(
      req.user.id,
      limit ? Math.max(1, Math.min(50, parseInt(limit, 10) || 5)) : 5,
    );
    return { success: true, data };
  }

  @Get('stats')
  async getStats(@Req() req) {
    const data = await this.userAchievementService.getStats(req.user.id);
    return { success: true, data };
  }

  @Get('check/:category')
  async triggerCheck(@Req() req, @Param('category') category: string) {
    const normalized = category.toUpperCase();
    if (!Object.values(AchievementCategory).includes(normalized as AchievementCategory)) {
      return {
        success: false,
        message: `Invalid category. Valid values: ${Object.values(AchievementCategory).join(', ')}`,
      };
    }
    const results = await this.awardService.checkAndAward(req.user.id, normalized as AchievementCategory);
    return { success: true, results };
  }
}
