"use client";

import { PageContainer } from "@/shared/components/page-container";
import { ProfileHeaderCard } from "../components/profile-header-card";
import { ProfileStatBento } from "../components/profile-stat-bento";
import { ActivityTimeline } from "../components/activity-timeline";
import { useProfile } from "../hooks/useProfile";

export function ProfilePage() {
  const { user, stats, activity } = useProfile();

  if (!user) return null;

  return (
    <PageContainer className="py-8 space-y-8">
      <ProfileHeaderCard user={user} />
      <ProfileStatBento stats={stats} />
      <ActivityTimeline activities={activity} />
    </PageContainer>
  );
}
