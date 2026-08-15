"use client";

/**
 * /enterprise/analytics — App Router thin page.
 * Inherits the enterprise layout (sidebar + TopAppBar) from app/enterprise/layout.tsx automatically.
 * Sprint 8 — Enterprise Analytics Dashboard
 * New file — additive only.
 */

import { EnterpriseAnalyticsDashboard } from "@/features/analytics/pages/EnterpriseAnalyticsDashboard";

export default function Page() {
  return <EnterpriseAnalyticsDashboard />;
}
