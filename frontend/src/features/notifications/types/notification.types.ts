export type NotificationType =
  | "REMINDER"
  | "CREDENTIAL"
  | "UPDATE"
  | "SYSTEM"
  | "ANNOUNCEMENT";

export type NotificationFilter = "all" | "unread" | "archived";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  actionUrl?: string;
  read: boolean;
  archived: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  notifications: NotificationItem[];
  data: {
    total: number;
    unreadCount: number;
    notifications: NotificationItem[];
  };
}

export interface NotificationSummary {
  total: number;
  unreadCount: number;
  archivedCount: number;
  byType: Partial<Record<NotificationType, number>>;
}

export interface NotificationSummaryResponse {
  success: boolean;
  data: NotificationSummary;
}

// ─── Preferences ─────────────────────────────────────────────────────────────

export interface NotificationPreference {
  type: NotificationType;
  enabled: boolean;
  defaultEnabled: boolean;
  isOverride: boolean;
}

export interface NotificationPreferences {
  role: string;
  defaultTypes: NotificationType[];
  types: NotificationPreference[];
}

export interface NotificationPreferencesResponse {
  success: boolean;
  data: NotificationPreferences;
}

// ─── Faculty follows ─────────────────────────────────────────────────────────

export interface FollowedFaculty {
  id: string;
  facultyUserId: string;
  name: string;
  email: string;
  designation: string | null;
  department: string | null;
  programCount: number;
  followedAt: string;
  isFollowing?: boolean;
}

export interface FollowsResponse {
  success: boolean;
  data: { following: FollowedFaculty[] };
}

export interface FollowStatusResponse {
  success: boolean;
  data: { isFollowing: boolean; followId: string | null };
}

export const NOTIFICATION_TYPE_META: Record<
  NotificationType,
  { label: string; description: string }
> = {
  REMINDER: { label: "Reminders", description: "Course deadlines, streaks and outreach" },
  CREDENTIAL: { label: "Credentials", description: "Certificate issuance, verification and status" },
  UPDATE: { label: "Updates", description: "Content, program and enrollment changes" },
  SYSTEM: { label: "System", description: "Account, security and platform notices" },
  ANNOUNCEMENT: { label: "Announcements", description: "News from your institution and Dezai" },
};

export const NOTIFICATION_TYPE_ORDER: NotificationType[] = [
  "REMINDER",
  "CREDENTIAL",
  "UPDATE",
  "SYSTEM",
  "ANNOUNCEMENT",
];

export const NOTIFICATION_ROLE_LABELS: Record<string, string> = {
  STUDENT: "Student",
  FACULTY: "Faculty",
  UNIVERSITY_ADMIN: "University Admin",
  DEZAI_ADMIN: "Dezai Admin",
  ORGANIZATION_ADMIN: "Organization Admin",
  ORGANIZATION_MANAGER: "Organization Manager",
  EMPLOYEE: "Employee",
};
