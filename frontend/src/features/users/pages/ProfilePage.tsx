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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { User, Trophy, Activity, Award, BookOpen, Clock, Flame } from "lucide-react";

export function ProfilePage() {
  const { user, stats, activity } = useProfile();
  const { achievements } = useAchievements();
  const { xpEarned, globalRank, fetchEnrollments, fetchStats } = useEnrollmentStore();

  useEffect(() => {
    fetchEnrollments();
    fetchStats();
  }, [fetchEnrollments, fetchStats]);

  if (!user) return null;

  return (
    <PageContainer className="py-12 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Fixed Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <ProfileHeaderCard user={user} />
          <LevelProgressCard xp={xpEarned} />
          <div className="card-elevation p-6 space-y-4">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider">Learning Stats</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-low">
                <span className="text-xs text-muted flex items-center gap-2"><BookOpen className="h-4 w-4" /> Enrolled</span>
                <span className="text-sm font-bold">{stats.enrolledCourses}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-low">
                <span className="text-xs text-muted flex items-center gap-2"><Trophy className="h-4 w-4" /> Completed</span>
                <span className="text-sm font-bold">{stats.completedCourses}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-low">
                <span className="text-xs text-muted flex items-center gap-2"><Flame className="h-4 w-4" /> Streak</span>
                <span className="text-sm font-bold">{stats.learningStreak}d</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-low">
                <span className="text-xs text-muted flex items-center gap-2"><Award className="h-4 w-4" /> Rank</span>
                <span className="text-sm font-bold">#{globalRank}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Scrollable Content */}
        <div className="lg:col-span-3 space-y-8">
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

            <TabsContent value="overview" className="space-y-8">
              <section className="card-elevation p-6 space-y-4">
                <h3 className="text-xl font-bold">About Me</h3>
                <p className="text-muted leading-relaxed">
                  I'm a dedicated learner focusing on mastering generative AI and its strategic impact on business. Currently pursuing a TIER-2 Academic track at Dezai.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border-light">
                  <div className="space-y-1">
                    <span className="text-xs text-muted font-bold uppercase">Learning Focus</span>
                    <p className="text-sm font-medium">Artificial Intelligence</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted font-bold uppercase">Main Language</span>
                    <p className="text-sm font-medium">English</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted font-bold uppercase">Target Goals</span>
                    <p className="text-sm font-medium">5 Programs / 10k XP</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Featured Achievements
                </h3>
                <AchievementGrid achievements={achievements.slice(0, 3)} />
              </section>
            </TabsContent>

            <TabsContent value="achievements">
              <AchievementGrid achievements={achievements} />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityTimeline activities={activity} />
            </TabsContent>

            <TabsContent value="credentials">
              <div className="card-elevation p-12 text-center space-y-4 bg-surface-low/50">
                <div className="h-16 w-16 bg-muted/10 rounded-full flex items-center justify-center mx-auto">
                  <Award className="h-12 w-12 text-muted" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold">No credentials yet</h3>
                  <p className="text-sm text-muted max-w-sm mx-auto">
                    Credentials are issued upon successful completion of a program and assessment. Keep learning to earn your first one!
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
