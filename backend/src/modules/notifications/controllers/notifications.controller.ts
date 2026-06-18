import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { NotificationType } from '@prisma/client';
import {
  NotificationListResponseDto,
  NotificationActionResponseDto,
  MarkAllReadResponseDto,
} from '../dto/notification.dto';

/**
 * NotificationsController
 *
 * Exposes notification endpoints under /api/notifications/
 * All routes are protected by JWT authentication.
 *
 * ⚠️  ROUTE ORDER IS CRITICAL:
 *   Route 5 (PATCH /mark-all-read) and Route 6 (POST /read-all) are declared BEFORE Route 2 (PATCH /:id/read).
 *   NestJS matches routes top-to-bottom. If /:id/read appeared first,
 *   NestJS would attempt to match "mark-all-read" or "read-all" as a notification ID and return 404.
 *
 * Dezai Terminology:
 *   - Notification (not Alert, not Message)
 *   - archived     (not deleted, not hidden)
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /api/notifications
   *
   * Returns the notification inbox for the logged-in user.
   * Supports both legacy `{ success: true, notifications }` and new `{ success: true, data }` shapes.
   *
   * Query Parameters:
   *   ?filter=all      — (default) non-archived notifications
   *   ?filter=unread   — unread AND non-archived only
   *   ?filter=archived — archived notifications only
   */
  @Get()
  async getNotifications(
    @Req() req,
    @Query('filter') filter: string = 'all',
  ): Promise<{ success: boolean; notifications: any[]; data: NotificationListResponseDto }> {
    const data = await this.notificationsService.getNotifications(
      req.user.id,
      filter,
    );
    return {
      success: true,
      notifications: data.notifications,
      data,
    };
  }

  /**
   * PATCH /api/notifications/mark-all-read
   *
   * Marks ALL non-archived, unread notifications as read for the logged-in user.
   *
   * Response: { success: true, data: MarkAllReadResponseDto }
   */
  @Patch('mark-all-read')
  async markAllAsRead(
    @Req() req,
  ): Promise<{ success: boolean; data: MarkAllReadResponseDto }> {
    const data = await this.notificationsService.markAllAsRead(req.user.id);
    return { success: true, data };
  }

  /**
   * POST /api/notifications/read-all
   *
   * Legacy endpoint to mark all notifications as read.
   */
  @Post('read-all')
  async legacyMarkAllAsRead(@Req() req) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { success: true, message: 'All notifications marked as read' };
  }

  /**
   * POST /api/notifications
   *
   * Create a notification (utility for testing or inter-service triggers).
   */
  @Post()
  async createNotification(
    @Body() body: { userId: string; title: string; message: string; type: NotificationType },
  ) {
    const notification = await this.notificationsService.createNotification(
      body.userId,
      body.title,
      body.message,
      body.type,
    );
    return { success: true, notification };
  }

  /**
   * PATCH /api/notifications/:id/read
   *
   * Marks a single notification as read (read=true).
   */
  @Patch(':id/read')
  async markAsRead(
    @Req() req,
    @Param('id') notificationId: string,
  ): Promise<{ success: boolean; notification: any; data: NotificationActionResponseDto }> {
    const res = await this.notificationsService.markAsRead(
      req.user.id,
      notificationId,
    );
    return {
      success: true,
      notification: res.notification,
      data: {
        id: res.id,
        read: res.read,
        archived: res.archived,
      },
    };
  }

  /**
   * PATCH /api/notifications/:id/unread
   *
   * Marks a single notification as unread (read=false).
   */
  @Patch(':id/unread')
  async markAsUnread(
    @Req() req,
    @Param('id') notificationId: string,
  ): Promise<{ success: boolean; data: NotificationActionResponseDto }> {
    const data = await this.notificationsService.markAsUnread(
      req.user.id,
      notificationId,
    );
    return { success: true, data };
  }

  /**
   * PATCH /api/notifications/:id/archive
   *
   * Archives a single notification (archived=true).
   */
  @Patch(':id/archive')
  async archiveNotification(
    @Req() req,
    @Param('id') notificationId: string,
  ): Promise<{ success: boolean; data: NotificationActionResponseDto }> {
    const data = await this.notificationsService.archiveNotification(
      req.user.id,
      notificationId,
    );
    return { success: true, data };
  }
}
