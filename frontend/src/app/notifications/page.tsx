import type { Metadata } from "next";
import { NotificationsCenterPage } from "@/features/notifications/pages/NotificationsCenterPage";

export const metadata: Metadata = {
  title: "Notifications — Dezai",
  description:
    "Your Notification Center — credentials, reminders, announcements and system notices in one place.",
};

export default function NotificationsPage() {
  return <NotificationsCenterPage />;
}
