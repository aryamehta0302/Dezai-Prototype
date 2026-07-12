"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Building2, Briefcase, Calendar, Mail, Zap, Target, Award, TrendingUp } from "lucide-react";
import type { EmployeeProfile } from "../types/employee-learning.types";
import { employeeLearningService } from "../services/employee-learning.service";

interface Props {
  profile: EmployeeProfile;
}

export function EmployeeProfileCard({ profile }: Props) {
  const level = employeeLearningService.calculateLevel(profile.totalXp);
  const initials = profile.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : "?";

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar || undefined} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Level {level.level}</Badge>
                <Badge variant="outline">{profile.employmentStatus}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Employment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <span>{profile.organization}</span>
          </div>
          {profile.department && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{profile.department}</span>
            </div>
          )}
          {profile.title && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span>{profile.title}</span>
            </div>
          )}
          {profile.joinedAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined {new Date(profile.joinedAt).toLocaleDateString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Learning Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-violet-50 p-1.5">
                <Zap className="h-4 w-4 text-violet-600" />
              </div>
              <div>
                <div className="text-sm font-medium">{profile.totalXp.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Total XP</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-50 p-1.5">
                <Target className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <div className="text-sm font-medium">{profile.assessmentsPassed}</div>
                <div className="text-xs text-muted-foreground">Passed</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-amber-50 p-1.5">
                <Award className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <div className="text-sm font-medium">{profile.credentialsEarned}</div>
                <div className="text-xs text-muted-foreground">Credentials</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-1.5">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium">{profile.currentStreak}</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
