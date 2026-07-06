'use client';

import { useAchievementNotifications } from '../hooks/useAchievementNotifications';

export function AchievementNotificationWatcher() {
  useAchievementNotifications();
  return null;
}
