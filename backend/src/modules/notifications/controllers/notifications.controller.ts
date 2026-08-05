import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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
 *   Static paths (mark-all-read, read-all, preferences, follows/...) are declared
 *   BEFORE parameterized paths (:id, :type, :facultyUserId) so NestJS matches the
 *   literal path instead of swallowing it as a parameter and returning 404.
 *
 * Dezai Terminology:
 *   - Notification (not Alert, not Message)
 *   - archived     (not deleted, not hidden)
 *   - Follow       = subscribe to a faculty member for course-release alerts
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
    @Query('type') type?: NotificationType,
  ): Promise<{ success: boolean; notifications: any[]; data: NotificationListResponseDto }> {
    const data = await this.notificationsService.getNotifications(
      req.user.id,
      filter,
      type,
    );
    return {
      success: true,
      notifications: data.notifications,
      data,
    };
  }

  /**
   * GET /api/notifications/summary
   *
   * Returns aggregated inbox counts (total, unread, archived, per-type)
   * for the logged-in user.
   */
  @Get('summary')
  async getSummary(@Req() req) {
    const data = await this.notificationsService.getSummary(req.user.id);
    return { success: true, data };
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
    @Body() body: { userId: string; title: string; message: string; type: NotificationType; actionUrl?: string },
  ) {
    const notification = await this.notificationsService.createNotification(
      body.userId,
      body.title,
      body.message,
      body.type,
      body.actionUrl,
    );
    return { success: true, notification };
  }

  // ─────────────────────────── PREFERENCES ───────────────────────────

  /**
   * GET /api/notifications/preferences
   *
   * Returns each notification type's effective state for the logged-in user —
   * the role default overridden by any explicit per-user preference.
   */
  @Get('preferences')
  async getPreferences(@Req() req) {
    const data = await this.notificationsService.getPreferences(req.user.id);
    return { success: true, data };
  }

  /**
   * PATCH /api/notifications/preferences/:type
   *
   * Body: { enabled: boolean }
   * Opts a notification type in or out for the logged-in user.
   */
  @Patch('preferences/:type')
  async updatePreference(
    @Req() req,
    @Param('type') type: NotificationType,
    @Body() body: { enabled: boolean },
  ) {
    const data = await this.notificationsService.updatePreference(
      req.user.id,
      type,
      body.enabled,
    );
    return { success: true, data };
  }

  /**
   * POST /api/notifications/preferences/reset
   *
   * Clears all per-user overrides and falls back to role defaults.
   */
  @Post('preferences/reset')
  async resetPreferences(@Req() req) {
    const data = await this.notificationsService.resetPreferences(req.user.id);
    return { success: true, data };
  }

  // ─────────────────────────── FACULTY FOLLOWS ───────────────────────────

  /**
   * GET /api/notifications/follows
   *
   * Faculty members the logged-in user follows (course-release alerts).
   */
  @Get('follows')
  async getFollowing(@Req() req) {
    const data = await this.notificationsService.getFollowing(req.user.id);
    return { success: true, data };
  }

  /**
   * GET /api/notifications/follows/followers
   *
   * Users following the logged-in user (faculty only meaningful).
   */
  @Get('follows/followers')
  async getFollowers(@Req() req) {
    const data = await this.notificationsService.getFollowers(req.user.id);
    return { success: true, data };
  }

  /**
   * GET /api/notifications/follows/search?q=
   *
   * Search faculty members to follow (excludes the logged-in user).
   */
  @Get('follows/search')
  async searchFaculty(@Req() req, @Query('q') q?: string) {
    const data = await this.notificationsService.searchFaculty(req.user.id, q ?? '');
    return { success: true, data };
  }

  /**
   * GET /api/notifications/follows/status/:facultyUserId
   *
   * Whether the logged-in user currently follows the given faculty member.
   */
  @Get('follows/status/:facultyUserId')
  async getFollowStatus(@Req() req, @Param('facultyUserId') facultyUserId: string) {
    const data = await this.notificationsService.getFollowStatus(
      req.user.id,
      facultyUserId,
    );
    return { success: true, data };
  }

  /**
   * POST /api/notifications/follows/:facultyUserId
   *
   * Follow a faculty member to get notified when they publish a new course.
   */
  @Post('follows/:facultyUserId')
  async follow(@Req() req, @Param('facultyUserId') facultyUserId: string) {
    const data = await this.notificationsService.follow(req.user.id, facultyUserId);
    return { success: true, data };
  }

  /**
   * DELETE /api/notifications/follows/:facultyUserId
   *
   * Stop following a faculty member.
   */
  @Delete('follows/:facultyUserId')
  async unfollow(@Req() req, @Param('facultyUserId') facultyUserId: string) {
    const data = await this.notificationsService.unfollow(req.user.id, facultyUserId);
    return { success: true, data };
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
