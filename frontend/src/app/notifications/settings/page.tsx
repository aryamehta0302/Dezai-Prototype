import type { Metadata } from "next";
import { NotificationSettingsPage } from "@/features/notifications/pages/NotificationSettingsPage";

export const metadata: Metadata = {
  title: "Notification Settings — Dezai",
  description:
    "Choose which notifications reach your inbox and follow faculty to get course-release updates.",
};

export default function NotificationSettings() {
  return <NotificationSettingsPage />;
}
