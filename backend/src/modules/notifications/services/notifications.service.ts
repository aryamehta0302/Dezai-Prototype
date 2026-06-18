import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  NotificationDto,
  NotificationListResponseDto,
  NotificationActionResponseDto,
  MarkAllReadResponseDto,
} from '../dto/notification.dto';

/**
 * NotificationsService
 *
 * Handles all notification business logic:
 *   1. getNotifications   — fetch inbox (with optional filter: all | unread | archived)
 *   2. markAsRead         — set read=true on one notification
 *   3. markAsUnread       — set read=false on one notification
 *   4. archiveNotification — set archived=true on one notification
 *   5. markAllAsRead      — set read=true on all active (non-archived) notifications
 *
 * Security Rules:
 *   - Every write operation filters by BOTH userId AND notificationId.
 *   - A user can NEVER read or modify another user's notifications.
 *   - Archived notifications are excluded from default inbox and markAllAsRead.
 *
 * Ordering: newest first (orderBy: { createdAt: 'desc' })
 *
 * Dezai Terminology:
 *   - Notification (not Alert, not Message)
 *   - archived     (not deleted, not hidden)
 */
@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // 1. GET NOTIFICATIONS
  //    Returns the notification inbox for the logged-in user.
  //    Default: non-archived notifications only.
  //    ?filter=unread   → read=false AND archived=false
  //    ?filter=archived → archived=true
  //    ?filter=all      → non-archived (same as default)
  // ─────────────────────────────────────────────────────────────────────────
  async getNotifications(
    userId: string,
    filter: string = 'all',
  ): Promise<NotificationListResponseDto> {
    // Build the where clause based on filter
    let whereClause: object;

    if (filter === 'unread') {
      whereClause = { userId, read: false, archived: false };
    } else if (filter === 'archived') {
      whereClause = { userId, archived: true };
    } else {
      // Default: 'all' = non-archived inbox
      whereClause = { userId, archived: false };
    }

    // Fetch filtered notifications (newest first)
    const notifications = await this.prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        message: true,
        type: true,
        read: true,
        archived: true,
        createdAt: true,
      },
    });

    // Always compute unread badge count (non-archived unread notifications)
    // This is independent of the current filter so the badge is always accurate
    const unreadCount = await this.prisma.notification.count({
      where: { userId, read: false, archived: false },
    });

    const shaped: NotificationDto[] = notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type as string,
      read: n.read,
      archived: n.archived,
      createdAt: n.createdAt,
    }));

    const result: NotificationListResponseDto = {
      total: shaped.length,
      unreadCount,
      notifications: shaped,
    };

    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. MARK AS READ
  //    Sets read=true on a single notification.
  //    Throws NotFoundException if the notification does not exist
  //    OR does not belong to the requesting user.
  // ─────────────────────────────────────────────────────────────────────────
  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationActionResponseDto> {
    // Step 1: Verify ownership — find notification by id AND userId together
    const existing = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Notification with ID "${notificationId}" not found`,
      );
    }

    // Step 2: Update read status
    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
      select: { id: true, read: true, archived: true },
    });

    return {
      id: updated.id,
      read: updated.read,
      archived: updated.archived,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. MARK AS UNREAD
  //    Sets read=false on a single notification.
  //    Same ownership guard as markAsRead.
  // ─────────────────────────────────────────────────────────────────────────
  async markAsUnread(
    userId: string,
    notificationId: string,
  ): Promise<NotificationActionResponseDto> {
    // Ownership check
    const existing = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Notification with ID "${notificationId}" not found`,
      );
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: false },
      select: { id: true, read: true, archived: true },
    });

    return {
      id: updated.id,
      read: updated.read,
      archived: updated.archived,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. ARCHIVE NOTIFICATION
  //    Sets archived=true on a single notification.
  //    Archived notifications disappear from the default inbox.
  //    They can still be viewed with ?filter=archived.
  //    Same ownership guard applies.
  // ─────────────────────────────────────────────────────────────────────────
  async archiveNotification(
    userId: string,
    notificationId: string,
  ): Promise<NotificationActionResponseDto> {
    // Ownership check
    const existing = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!existing) {
      throw new NotFoundException(
        `Notification with ID "${notificationId}" not found`,
      );
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { archived: true },
      select: { id: true, read: true, archived: true },
    });

    return {
      id: updated.id,
      read: updated.read,
      archived: updated.archived,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. MARK ALL AS READ
  //    Bulk-sets read=true on ALL non-archived notifications for this user.
  //    Archived notifications are intentionally excluded.
  //    Silent success if all are already read (updateMany returns count=0).
  // ─────────────────────────────────────────────────────────────────────────
  async markAllAsRead(userId: string): Promise<MarkAllReadResponseDto> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,      // Only update unread ones
        archived: false,  // Never touch archived notifications
      },
      data: { read: true },
    });

    return {
      updatedCount: result.count,
    };
  }
}
