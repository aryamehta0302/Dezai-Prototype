import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { XpService } from '../services/xp.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly xpService: XpService) {}

  /**
   * GET /api/users/me/xp
   * Get the authenticated user's XP total and streak.
   */
  @Get('me/xp')
  @UseGuards(JwtAuthGuard)
  async getMyXp(@Req() req) {
    const details = await this.xpService.getUserXpDetails(req.user.id);
    return { success: true, ...details };
  }
}
