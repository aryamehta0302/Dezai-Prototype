/**
 * @module features/notifications
 *
 * Notification system feature.
 *
 * Owns: notification bell, notification dropdown, notification list,
 *       notification preferences, mark-as-read, notification settings.
 *
 * Exports components, hooks, services, schemas, and types
 * related to the notification system.
 */

// Export public API from this feature
export { NotificationsCenterPage } from './pages/NotificationsCenterPage';
export { notificationsApi } from './services/notifications-api.service';
export type {
  NotificationItem,
  NotificationFilter,
  NotificationType,
  NotificationSummary,
  NotificationListResponse,
  NotificationSummaryResponse,
} from './types/notification.types';
export {
  NOTIFICATION_TYPE_META,
  NOTIFICATION_TYPE_ORDER,
} from './types/notification.types';
