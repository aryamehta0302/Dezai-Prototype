import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { NotificationType } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /api/notifications
   * Fetch all notifications for the logged-in user.
   */
  @Get()
  async getNotifications(@Req() req) {
    const notifications = await this.notificationsService.getNotifications(req.user.id);
    return { success: true, notifications };
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a specific notification as read.
   */
  @Patch(':id/read')
  async markAsRead(@Req() req, @Param('id') id: string) {
    const notification = await this.notificationsService.markAsRead(req.user.id, id);
    return { success: true, notification };
  }

  /**
   * POST /api/notifications/read-all
   * Mark all notifications as read.
   */
  @Post('read-all')
  async markAllAsRead(@Req() req) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { success: true, message: 'All notifications marked as read' };
  }

  /**
   * POST /api/notifications
   * Create a notification (Utility for testing or inter-service triggers).
   */
  @Post()
  async createNotification(
    @Body() body: { userId: string; title: string; message: string; type: NotificationType }
  ) {
    const notification = await this.notificationsService.createNotification(
      body.userId,
      body.title,
      body.message,
      body.type
    );
    return { success: true, notification };
  }
}
