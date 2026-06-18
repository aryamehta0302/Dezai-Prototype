import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import {
  NotificationListResponseDto,
  NotificationActionResponseDto,
  MarkAllReadResponseDto,
} from '../dto/notification.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';

/**
 * NotificationsController
 *
 * Exposes five notification endpoints under /api/notifications/
 * All routes are protected by JWT authentication.
 * No RolesGuard needed — all authenticated roles can manage their own notifications.
 *
 * ⚠️  ROUTE ORDER IS CRITICAL:
 *   Route 5 (PATCH /mark-all-read) is declared BEFORE Route 2 (PATCH /:id/read).
 *   NestJS matches routes top-to-bottom. If /:id/read appeared first,
 *   NestJS would attempt to match "mark-all-read" as a notification ID and return 404.
 *
 * Dezai Terminology:
 *   - Notification (not Alert, not Message)
 *   - archived     (not deleted, not hidden)
 *
 * Routes:
 *   GET   /api/notifications                   — fetch inbox (supports ?filter=)
 *   PATCH /api/notifications/mark-all-read     — mark all non-archived as read
 *   PATCH /api/notifications/:id/read          — mark one as read
 *   PATCH /api/notifications/:id/unread        — mark one as unread
 *   PATCH /api/notifications/:id/archive       — archive one notification
 */
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * GET /api/notifications
   *
   * Returns the notification inbox for the logged-in user.
   *
   * Query Parameters:
   *   ?filter=all      — (default) non-archived notifications
   *   ?filter=unread   — unread AND non-archived only
   *   ?filter=archived — archived notifications only
   *
   * Response: { success: true, data: NotificationListResponseDto }
   */
  @Get()
  async getNotifications(
    @Req() req,
    @Query('filter') filter: string = 'all',
  ): Promise<{ success: boolean; data: NotificationListResponseDto }> {
    const data = await this.notificationsService.getNotifications(
      req.user.id,
      filter,
    );
    return { success: true, data };
  }

  /**
   * PATCH /api/notifications/mark-all-read
   *
   * ⚠️  Must be declared BEFORE /:id/read to avoid route collision.
   *
   * Marks ALL non-archived, unread notifications as read for the logged-in user.
   * Silent success if all notifications are already read (count will be 0).
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
   * PATCH /api/notifications/:id/read
   *
   * Marks a single notification as read (read=true).
   * Returns 404 if the notification does not exist or does not belong to this user.
   *
   * Response: { success: true, data: NotificationActionResponseDto }
   */
  @Patch(':id/read')
  async markAsRead(
    @Req() req,
    @Param('id') notificationId: string,
  ): Promise<{ success: boolean; data: NotificationActionResponseDto }> {
    const data = await this.notificationsService.markAsRead(
      req.user.id,
      notificationId,
    );
    return { success: true, data };
  }

  /**
   * PATCH /api/notifications/:id/unread
   *
   * Marks a single notification as unread (read=false).
   * Returns 404 if the notification does not exist or does not belong to this user.
   *
   * Response: { success: true, data: NotificationActionResponseDto }
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
   * Archived notifications no longer appear in the default inbox.
   * They can be viewed with GET /api/notifications?filter=archived.
   * Returns 404 if the notification does not exist or does not belong to this user.
   *
   * Response: { success: true, data: NotificationActionResponseDto }
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
