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
  actionUrl?: string; // Optional deep link target (e.g. '/programs/<slug>')
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

// ─── NOTIFICATION SUMMARY RESPONSE ────────────────────────────────────────────

/**
 * Response shape for GET /api/notifications/summary
 *
 * Aggregates the logged-in user's non-archived inbox so the frontend
 * can render accurate filter chips (All / per type) and badge counts.
 */
export interface NotificationSummaryDto {
  total: number;
  unreadCount: number;
  archivedCount: number;
  /** Counts per NotificationType for non-archived notifications */
  byType: Record<string, number>;
}

// ─── NOTIFICATION PREFERENCES ────────────────────────────────────────────────

/**
 * Effective state of a single notification type for a user.
 * `enabled` = the value actually in effect (role default or explicit override).
 * `defaultEnabled` = what the user's role enables by default.
 * `isOverride` = true when the user has explicitly opted in/out (not inheriting).
 */
export interface NotificationPreferenceDto {
  type: string;
  enabled: boolean;
  defaultEnabled: boolean;
  isOverride: boolean;
}

/** Response for GET /api/notifications/preferences and reset. */
export interface NotificationPreferencesResponseDto {
  role: string;
  defaultTypes: string[];
  types: NotificationPreferenceDto[];
  resetAt: string | null;
}

// ─── FACULTY FOLLOWS ─────────────────────────────────────────────────────────

/** A followed faculty member (also used for follower entries). */
export interface FollowDto {
  id: string;
  facultyUserId: string;
  name: string;
  email: string;
  designation: string | null;
  department: string | null;
  programCount: number;
  followedAt: Date;
  /** Present on search results so the UI knows whether the user already follows. */
  isFollowing?: boolean;
}

/** Response for GET /api/notifications/follows and /follows/followers. */
export interface FollowsResponseDto {
  following: FollowDto[];
}

/** Response for GET /api/notifications/follows/status/:facultyUserId. */
export interface FollowStatusResponseDto {
  isFollowing: boolean;
  followId: string | null;
}
