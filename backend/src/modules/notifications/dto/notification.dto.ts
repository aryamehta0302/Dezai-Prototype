/**
 * notification.dto.ts
 *
 * Response type interfaces for the Notifications module.
 *
 * Dezai Terminology:
 *   - Notification   (not Alert, not Message)
 *   - archived       (not deleted, not hidden)
 *   - NotificationType enum: REMINDER | CREDENTIAL | UPDATE | SYSTEM | ANNOUNCEMENT
 *
 * No request-body DTOs are needed here.
 * All notification write operations are triggered by path params only (:id).
 * The GET inbox uses an optional query param (?filter=) which is a plain string.
 */

// ─── SINGLE NOTIFICATION RECORD ───────────────────────────────────────────────

/**
 * Shape of a single notification row returned by the API.
 * Maps directly from the Prisma Notification model.
 */
export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: string;       // NotificationType enum value as string (e.g. 'REMINDER')
  read: boolean;
  archived: boolean;
  createdAt: Date;
}

// ─── NOTIFICATION LIST RESPONSE ───────────────────────────────────────────────

/**
 * Response shape for GET /api/notifications
 *
 * Includes:
 *   - total:       total number of notifications in the current filtered view
 *   - unreadCount: count of read=false, archived=false notifications (for badge display)
 *   - notifications: ordered list newest-first
 */
export interface NotificationListResponseDto {
  total: number;
  unreadCount: number;
  notifications: NotificationDto[];
}

// ─── SINGLE NOTIFICATION ACTION RESPONSE ──────────────────────────────────────

/**
 * Response shape for PATCH operations (read, unread, archive).
 * Returns the updated notification so the frontend can update its local state.
 */
export interface NotificationActionResponseDto {
  id: string;
  read: boolean;
  archived: boolean;
}

// ─── MARK ALL READ RESPONSE ───────────────────────────────────────────────────

/**
 * Response shape for PATCH /api/notifications/mark-all-read
 * Returns the count of notifications that were actually updated.
 */
export interface MarkAllReadResponseDto {
  updatedCount: number;
}
