"use client";

import { Badge } from "@/shared/ui/badge";
import { Mail, Calendar, GraduationCap } from "lucide-react";
import { formatDate } from "@/shared/utils/format";
import type { AuthUser } from "@/lib/stores/auth.store";

import { useEnrollmentStore } from "@/lib/stores/enrollment.store";

interface ProfileHeaderCardProps {
  user: AuthUser;
}

export function ProfileHeaderCard({ user }: ProfileHeaderCardProps) {
  const { enrollments } = useEnrollmentStore();
  const joinedAt = (user as AuthUser & { joinedAt?: string }).joinedAt || new Date().toISOString();
  const enrollmentCount = Object.keys(enrollments).length;
  const avatarUrl = (user as AuthUser & { avatar?: string }).avatar || (user as AuthUser & { image?: string }).image;
  return (
    <div className="card-elevation p-6">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        {/* Avatar */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-2xl font-bold text-white flex-shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .substring(0, 2)
          )}
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-xl font-bold text-on-surface">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="secondary" className="capitalize">
                {user.role.replace("_", " ")}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              {user.email}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Joined {formatDate(joinedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              {enrollmentCount} courses enrolled
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
