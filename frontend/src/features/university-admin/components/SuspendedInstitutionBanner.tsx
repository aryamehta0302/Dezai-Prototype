"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface SuspendedInstitutionBannerProps {
  status?: string;
}

export const SuspendedInstitutionBanner: React.FC<SuspendedInstitutionBannerProps> = ({ status }) => {
  if (status !== "SUSPENDED") return null;

  return (
    <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 backdrop-blur-md">
      <div className="flex items-center space-x-3">
        <div className="rounded-full bg-destructive/20 p-2">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div>
          <h4 className="font-semibold text-destructive">Institution Suspended</h4>
          <p className="text-sm opacity-90 text-destructive">
            Access for faculty and students in this institution is currently suspended. Please contact platform support for resolution.
          </p>
        </div>
      </div>
    </div>
  );
};
