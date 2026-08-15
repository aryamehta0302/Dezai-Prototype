"use client";

import React from "react";
import { Badge } from "@/shared/ui/badge";

interface FacultyStatusBadgeProps {
  status: string;
  accountStatus?: string;
}

export const FacultyStatusBadge: React.FC<FacultyStatusBadgeProps> = ({ status, accountStatus }) => {
  if (accountStatus === "SUSPENDED") {
    return <Badge variant="destructive">Suspended</Badge>;
  }

  switch (status) {
    case "APPROVED":
      return <Badge variant="default">Active</Badge>;
    case "PENDING":
      return <Badge variant="secondary">Pending Approval</Badge>;
    case "REJECTED":
      return <Badge variant="destructive">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
