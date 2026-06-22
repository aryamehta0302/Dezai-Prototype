"use client";

import { useEffect } from "react";
import { PageContainer } from "@/shared/components/page-container";
import { ProfileHeaderCard } from "../components/profile-header-card";
import { ProfileStatBento } from "../components/profile-stat-bento";
import { ActivityTimeline } from "../components/activity-timeline";
import { useProfile } from "../hooks/useProfile";
import { useAchievements } from "@/features/achievements/hooks/useAchievements";
import { useEnrollmentStore } from "@/lib/stores/enrollment.store";
import { LevelProgressCard } from "@/features/achievements/components/level-progress-card";
import { AchievementGrid } from "@/features/achievements/components/achievement-grid";
import { LoadingSkeleton } from "@/shared/components/loading-skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { User, Trophy, Activity, Award } from "lucide-react";

function ProfilePageSkeleton() {
  return (
    <div className="py-12 space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <LoadingSkeleton className="h-32 rounded-xl" />
          <LoadingSkeleton className="h-52 rounded-xl" />
          <LoadingSkeleton className="h-64 rounded-xl" />
        </div>
        <div className="lg:col-span-3 space-y-6">
          <LoadingSkeleton className="h-10 w-96 rounded-lg" />
          <LoadingSkeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user, stats, activity } = useProfile();
  const { achievements } = useAchievements();
  const { xpEarned, globalRank, fetchEnrollments, fetchStats } = useEnrollmentStore();

  useEffect(() => {
    fetchEnrollments();
    fetchStats();
  }, [fetchEnrollments, fetchStats]);

  if (!user) return <ProfilePageSkeleton />;

  return (
    <PageContainer className="py-12 space-y-8">
      <ProfileHeaderCard user={user} />

      <ProfileStatBento stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <LevelProgressCard xp={xpEarned} />

          <div className="card-elevation p-5 space-y-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Ranking</h3>
            <div className="flex items-center justify-between p-3 rounded-lg bg-surface-low">
              <span className="text-sm text-muted">Global Rank</span>
              <span className="text-lg font-bold text-on-surface">#{globalRank}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6 bg-surface-low border border-border-light p-1">
              <TabsTrigger value="overview" className="gap-2">
                <User className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="achievements" className="gap-2">
                <Trophy className="h-4 w-4" /> Achievements
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="h-4 w-4" /> Activity
              </TabsTrigger>
              <TabsTrigger value="credentials" className="gap-2">
                <Award className="h-4 w-4" /> Credentials
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <section className="card-elevation p-6 space-y-4">
                <h3 className="text-lg font-semibold text-on-surface">About</h3>
                <p className="text-sm text-muted leading-relaxed max-w-2xl">
                  No bio added yet.
                </p>
              </section>

              {achievements.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-on-surface">Recent Achievements</h3>
                    <span className="text-xs text-muted">{achievements.filter(a => a.isUnlocked).length} unlocked</span>
                  </div>
                  <AchievementGrid achievements={achievements.slice(0, 6)} />
                </section>
              )}
            </TabsContent>

            <TabsContent value="achievements">
              {achievements.length > 0 ? (
                <AchievementGrid achievements={achievements} />
              ) : (
                <div className="card-elevation py-12 text-center space-y-3">
                  <Trophy className="h-10 w-10 text-muted/30 mx-auto" />
                  <p className="text-sm font-medium text-muted">No achievements yet</p>
                  <p className="text-xs text-muted">Complete courses to start earning badges.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity">
              {activity.length > 0 ? (
                <ActivityTimeline activities={activity} />
              ) : (
                <div className="card-elevation py-12 text-center space-y-3">
                  <Activity className="h-10 w-10 text-muted/30 mx-auto" />
                  <p className="text-sm font-medium text-muted">No recent activity</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="credentials">
              <div className="card-elevation py-16 text-center space-y-4">
                <div className="h-14 w-14 rounded-full bg-muted/10 flex items-center justify-center mx-auto">
                  <Award className="h-7 w-7 text-muted" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-on-surface">No credentials yet</p>
                  <p className="text-xs text-muted max-w-xs mx-auto">
                    Complete a program and pass the assessment to earn your first credential.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}
