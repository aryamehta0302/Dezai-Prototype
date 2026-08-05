import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { NotificationType, AuditAction, UserRole, Prisma } from '@prisma/client';
import { AuditService } from '../../audit/services/audit.service';
import {
  NotificationDto,
  NotificationListResponseDto,
  NotificationActionResponseDto,
  MarkAllReadResponseDto,
  NotificationSummaryDto,
  NotificationPreferenceDto,
  NotificationPreferencesResponseDto,
  FollowDto,
  FollowsResponseDto,
  FollowStatusResponseDto,
} from '../dto/notification.dto';

/**
 * Role-based notification defaults.
 *
 * Every role has a default set of notification types it cares about. A user can
 * opt in/out of any type (stored in `NotificationPreference`), which overrides
 * these defaults. Users without an explicit override inherit the role default,
 * so a freshly created account already receives the right notifications with
 * no seed or configuration work.
 *
 * Rules of thumb:
 *   - Learners (STUDENT / EMPLOYEE) get the full inbox: learning REMINDERs,
 *     CREDENTIALs, content UPDATEs, SYSTEM notices, ANNOUNCEMENTs.
 *   - Content managers (FACULTY / UNIVERSITY_ADMIN / ORGANIZATION_ADMIN /
 *     ORGANIZATION_MANAGER) get UPDATEs (their content / people) but no
 *     learning-streak REMINDERs and no learner CREDENTIALs.
 *   - Platform admins (DEZAI_ADMIN) only get SYSTEM + ANNOUNCEMENT.
 *   - SYSTEM + ANNOUNCEMENT are on for every role.
 */
const ROLE_NOTIFICATION_DEFAULTS: Record<UserRole, NotificationType[]> = {
  [UserRole.STUDENT]: ['REMINDER', 'CREDENTIAL', 'UPDATE', 'SYSTEM', 'ANNOUNCEMENT'],
  [UserRole.EMPLOYEE]: ['REMINDER', 'CREDENTIAL', 'UPDATE', 'SYSTEM', 'ANNOUNCEMENT'],
  [UserRole.FACULTY]: ['UPDATE', 'SYSTEM', 'ANNOUNCEMENT'],
  [UserRole.UNIVERSITY_ADMIN]: ['UPDATE', 'SYSTEM', 'ANNOUNCEMENT'],
  [UserRole.DEZAI_ADMIN]: ['SYSTEM', 'ANNOUNCEMENT'],
  [UserRole.ORGANIZATION_ADMIN]: ['UPDATE', 'SYSTEM', 'ANNOUNCEMENT'],
  [UserRole.ORGANIZATION_MANAGER]: ['UPDATE', 'SYSTEM', 'ANNOUNCEMENT'],
};

/** All NotificationType values, in canonical order. */
const ALL_NOTIFICATION_TYPES: NotificationType[] = [
  'REMINDER',
  'CREDENTIAL',
  'UPDATE',
  'SYSTEM',
  'ANNOUNCEMENT',
];

/** Client-side slugifier — mirrored from frontend `shared/utils/slug.ts`. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type TxClient = Omit<
  PrismaService,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * NotificationsService
 *
 * Handles all notification business logic:
 *   1. getNotifications          — fetch inbox (all | unread | archived, optional type)
 *   2. markAsRead / markAsUnread — toggle read on one notification
 *   3. archiveNotification       — archive one notification
 *   4. markAllAsRead             — mark all non-archived as read
 *   5. createNotification        — create a notification (honors user preference)
 *   6. getPreferences            — role defaults + per-user overrides
 *   7. updatePreference / resetPreferences — manage overrides
 *   8. follow / unfollow / getFollowing / getFollowers / getFollowStatus
 *   9. notifyFollowersOfProgram  — fan out a course-release UPDATE to a faculty's followers
 *
 * Security Rules:
 *   - Every write operation filters by BOTH userId AND notificationId.
 *   - A user can NEVER read or modify another user's notifications.
 *   - Archived notifications are excluded from default inbox and markAllAsRead.
 *   - A user can only follow FACULTY users, and never themselves.
 *
 * Ordering: newest first (orderBy: { createdAt: 'desc' })
 *
 * Dezai Terminology:
 *   - Notification (not Alert, not Message)
 *   - archived     (not deleted, not hidden)
 *   - Follow = subscribe to a faculty member for course-release alerts
 */
@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // ROLE DEFAULTS
  // ─────────────────────────────────────────────────────────────────────────

  /** Default enabled set for a given role. */
  getDefaultTypesForRole(role: UserRole): NotificationType[] {
    return ROLE_NOTIFICATION_DEFAULTS[role] ?? [];
  }

  /**
   * Whether a user should receive a notification of `type`.
   * An explicit NotificationPreference overrides the role default.
   */
  private async shouldNotify(
    userId: string,
    type: NotificationType,
    tx?: TxClient,
  ): Promise<boolean> {
    const client = tx ?? this.prisma;
    const pref = await client.notificationPreference.findUnique({
      where: { userId_type: { userId, type } },
    });
    if (pref) return pref.enabled;

    const user = await client.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) return false;
    return this.getDefaultTypesForRole(user.role).includes(type);
  }

  /** Subset of userIds whose preferences allow `type`. */
  private async filterEligibleUserIds(
    userIds: string[],
    type: NotificationType,
  ): Promise<string[]> {
    if (userIds.length === 0) return [];

    const [prefs, users] = await Promise.all([
      this.prisma.notificationPreference.findMany({
        where: { userId: { in: userIds }, type },
      }),
      this.prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, role: true },
      }),
    ]);

    const overrides = new Map(prefs.map((p) => [p.userId, p.enabled]));
    const roles = new Map(users.map((u) => [u.id, u.role]));

    return userIds.filter((id) => {
      const explicit = overrides.get(id);
      if (explicit !== undefined) return explicit;
      const role = roles.get(id);
      return role !== undefined && this.getDefaultTypesForRole(role).includes(type);
    });
  }

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
    type?: NotificationType,
  ): Promise<NotificationListResponseDto> {
    // Build the where clause based on filter
    let whereClause: Prisma.NotificationWhereInput;

    if (filter === 'unread') {
      whereClause = { userId, read: false, archived: false };
    } else if (filter === 'archived') {
      whereClause = { userId, archived: true };
    } else {
      // Default: 'all' = non-archived inbox
      whereClause = { userId, archived: false };
    }

    // Optional type narrowing (e.g. ?type=CREDENTIAL)
    if (type) {
      whereClause = { ...whereClause, type };
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
        actionUrl: true,
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
      actionUrl: n.actionUrl ?? undefined,
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
  ): Promise<NotificationActionResponseDto & { notification: any }> {
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
    });

    return {
      id: updated.id,
      read: updated.read,
      archived: updated.archived,
      notification: updated, // Also include the raw notification object for backwards compatibility
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

  // ─────────────────────────────────────────────────────────────────────────
  // 6. GET SUMMARY
  //    Aggregates inbox counts (total / unread / archived / per type) so the
  //    Notification Center can render accurate filter chips and badges.
  // ─────────────────────────────────────────────────────────────────────────
  async getSummary(userId: string): Promise<NotificationSummaryDto> {
    const [total, unreadCount, archivedCount, grouped] = await Promise.all([
      this.prisma.notification.count({
        where: { userId, archived: false },
      }),
      this.prisma.notification.count({
        where: { userId, read: false, archived: false },
      }),
      this.prisma.notification.count({
        where: { userId, archived: true },
      }),
      this.prisma.notification.groupBy({
        by: ['type'],
        where: { userId, archived: false },
        _count: { _all: true },
      }),
    ]);

    const byType: Record<string, number> = {};
    for (const row of grouped) {
      byType[row.type] = row._count._all;
    }

    return { total, unreadCount, archivedCount, byType };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. CREATE NOTIFICATION
  //    Create a new notification for a user (utility for other modules or tests).
  //    Honors the user's notification preferences — if the type is not enabled,
  //    the notification is silently dropped.
  // ─────────────────────────────────────────────────────────────────────────
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    actionUrl?: string,
  ) {
    if (!(await this.shouldNotify(userId, type))) return null;

    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        actionUrl: actionUrl ?? null,
        read: false,
        archived: false,
      },
    });

    await this.auditService.logAction(
      userId,
      AuditAction.NOTIFICATION_SENT,
      `Notification "${title}" (ID: ${notification.id}) sent to user ${userId}`,
    );

    return notification;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8. NOTIFICATION PREFERENCES
  //    Returns each type's effective state = role default overridden by any
  //    per-user NotificationPreference rows.
  // ─────────────────────────────────────────────────────────────────────────
  async getPreferences(userId: string): Promise<NotificationPreferencesResponseDto> {
    const [user, overrides] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
      this.prisma.notificationPreference.findMany({ where: { userId } }),
    ]);

    const role = user?.role ?? UserRole.STUDENT;
    const defaultTypes = this.getDefaultTypesForRole(role);
    const overrideMap = new Map(overrides.map((o) => [o.type, o.enabled]));

    const types: NotificationPreferenceDto[] = ALL_NOTIFICATION_TYPES.map((t) => {
      const defaultEnabled = defaultTypes.includes(t);
      const enabled = overrideMap.get(t) ?? defaultEnabled;
      return {
        type: t,
        enabled,
        defaultEnabled,
        isOverride: overrideMap.has(t),
      };
    });

    return {
      role,
      defaultTypes,
      types,
      resetAt: null,
    };
  }

  /** Upsert a single preference override. */
  async updatePreference(
    userId: string,
    type: NotificationType,
    enabled: boolean,
  ): Promise<NotificationPreferenceDto> {
    if (!ALL_NOTIFICATION_TYPES.includes(type)) {
      throw new BadRequestException(`Invalid notification type: ${type}`);
    }

    const saved = await this.prisma.notificationPreference.upsert({
      where: { userId_type: { userId, type } },
      update: { enabled },
      create: { userId, type, enabled },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const defaultEnabled = this.getDefaultTypesForRole(user?.role ?? UserRole.STUDENT).includes(
      type,
    );

    return {
      type: saved.type,
      enabled: saved.enabled,
      defaultEnabled,
      isOverride: true,
    };
  }

  /** Clear all per-user overrides and fall back to role defaults. */
  async resetPreferences(userId: string): Promise<NotificationPreferencesResponseDto> {
    await this.prisma.notificationPreference.deleteMany({ where: { userId } });
    return this.getPreferences(userId);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 9. FACULTY FOLLOWS
  //    A learner can follow a faculty member to receive a course-release UPDATE
  //    whenever that faculty publishes a new program.
  // ─────────────────────────────────────────────────────────────────────────

  /** Follow a faculty user to receive course-release alerts. */
  async follow(followerId: string, followingId: string): Promise<FollowDto> {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: followingId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        facultyInfo: { select: { designation: true, department: true } },
      },
    });

    if (!target) throw new NotFoundException('User to follow not found');
    if (target.role !== UserRole.FACULTY) {
      throw new BadRequestException(
        'Only faculty members can be followed for course-release alerts',
      );
    }

    const follow = await this.prisma.follow.upsert({
      where: {
        followerId_followingId: { followerId, followingId },
      },
      update: {},
      create: { followerId, followingId },
      include: { following: { select: { id: true, name: true, email: true } } },
    });

    await this.auditService.logAction(
      followerId,
      AuditAction.NOTIFICATION_SENT,
      `User ${followerId} started following faculty ${followingId} for course-release notifications`,
    );

    return this.toFollowDto(follow);
  }

  /** Unfollow a faculty user (silent if not followed). */
  async unfollow(followerId: string, followingId: string): Promise<{ success: boolean }> {
    await this.prisma.follow.deleteMany({
      where: { followerId, followingId },
    });
    return { success: true };
  }

  /** Faculty users the current user follows. */
  async getFollowing(userId: string): Promise<FollowsResponseDto> {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
            facultyInfo: { select: { id: true, designation: true, department: true } },
          },
        },
      },
    });

    const facultyIds = follows
      .map((f) => f.following.facultyInfo?.id)
      .filter((id): id is string => !!id);

    const programCounts =
      facultyIds.length > 0
        ? await this.prisma.program.groupBy({
            by: ['facultyId'],
            where: { facultyId: { in: facultyIds } },
            _count: { _all: true },
          })
        : [];
    const programCountMap = new Map(programCounts.map((p) => [p.facultyId, p._count._all]));

    return {
      following: follows.map((f) => ({
        id: f.id,
        facultyUserId: f.followingId,
        name: f.following.name ?? 'Faculty member',
        email: f.following.email,
        designation: f.following.facultyInfo?.designation ?? null,
        department: f.following.facultyInfo?.department ?? null,
        programCount: programCountMap.get(f.following.facultyInfo?.id ?? '') ?? 0,
        followedAt: f.createdAt,
      })),
    };
  }

  /** Users following the given user (used by faculty to see their followers). */
  async getFollowers(userId: string): Promise<FollowsResponseDto> {
    const follows = await this.prisma.follow.findMany({
      where: { followingId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        follower: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      following: follows.map((f) => ({
        id: f.id,
        facultyUserId: f.followerId,
        name: f.follower.name ?? 'User',
        email: f.follower.email,
        designation: null,
        department: null,
        programCount: 0,
        followedAt: f.createdAt,
      })),
    };
  }

  /** Whether `followerId` currently follows `followingId`. */
  async getFollowStatus(
    followerId: string,
    followingId: string,
  ): Promise<FollowStatusResponseDto> {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
      select: { id: true },
    });
    return { isFollowing: !!follow, followId: follow?.id ?? null };
  }

  /**
   * Search faculty members to follow (excludes the requesting user).
   * Used by the notification settings "follow faculty" picker.
   */
  async searchFaculty(userId: string, query: string): Promise<FollowsResponseDto> {
    const q = query.trim().toLowerCase();

    const facultyUsers = await this.prisma.user.findMany({
      where: {
        role: UserRole.FACULTY,
        id: { not: userId },
        ...(q
          ? { name: { contains: q, mode: 'insensitive' } }
          : {}),
      },
      take: 20,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        facultyInfo: { select: { id: true, designation: true, department: true } },
      },
    });

    const follows = await this.prisma.follow.findMany({
      where: {
        followerId: userId,
        followingId: { in: facultyUsers.map((u) => u.id) },
      },
      select: { followingId: true },
    });
    const followedSet = new Set(follows.map((f) => f.followingId));

    const facultyIds = facultyUsers
      .map((u) => u.facultyInfo?.id)
      .filter((id): id is string => !!id);

    const programCounts =
      facultyIds.length > 0
        ? await this.prisma.program.groupBy({
            by: ['facultyId'],
            where: { facultyId: { in: facultyIds } },
            _count: { _all: true },
          })
        : [];
    const programCountMap = new Map(programCounts.map((p) => [p.facultyId, p._count._all]));

    return {
      following: facultyUsers.map((u) => ({
        id: followedSet.has(u.id) ? `followed-${u.id}` : `not-followed-${u.id}`,
        facultyUserId: u.id,
        name: u.name ?? 'Faculty member',
        email: u.email,
        designation: u.facultyInfo?.designation ?? null,
        department: u.facultyInfo?.department ?? null,
        programCount: programCountMap.get(u.facultyInfo?.id ?? '') ?? 0,
        followedAt: new Date(0),
        isFollowing: followedSet.has(u.id),
      })),
    };
  }

  /**
   * Fan out a course-release UPDATE to everyone following the program's faculty.
   * Respects each follower's UPDATE preference.
   */
  async notifyFollowersOfProgram(
    program: { id: string; title: string; facultyId: string | null },
  ): Promise<number> {
    if (!program.facultyId) return 0;

    const faculty = await this.prisma.facultyMember.findUnique({
      where: { id: program.facultyId },
      select: { userId: true, user: { select: { name: true } } },
    });
    if (!faculty) return 0;

    const follows = await this.prisma.follow.findMany({
      where: { followingId: faculty.userId },
      select: { followerId: true },
    });
    if (follows.length === 0) return 0;

    const followerIds = await this.filterEligibleUserIds(
      follows.map((f) => f.followerId),
      'UPDATE',
    );

    if (followerIds.length === 0) return 0;

    const facultyName = faculty.user.name ?? 'A faculty member';
    const actionUrl = `/programs/${slugify(program.title)}`;
    await this.prisma.notification.createMany({
      data: followerIds.map((followerId) => ({
        userId: followerId,
        title: 'New course from a faculty you follow',
        message: `${facultyName} published a new course: "${program.title}". Tap to explore it before it fills up.`,
        type: 'UPDATE',
        actionUrl,
        read: false,
        archived: false,
      })),
    });

    return followerIds.length;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  private toFollowDto(
    follow: {
      id: string;
      followingId: string;
      createdAt: Date;
      following: { id: string; name: string | null; email: string };
    },
  ): FollowDto {
    return {
      id: follow.id,
      facultyUserId: follow.followingId,
      name: follow.following.name ?? 'Faculty member',
      email: follow.following.email,
      designation: null,
      department: null,
      programCount: 0,
      followedAt: follow.createdAt,
    };
  }
}
