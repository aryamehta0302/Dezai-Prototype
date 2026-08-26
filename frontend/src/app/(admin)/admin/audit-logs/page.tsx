import { Suspense } from "react";
import { AuditLogViewerPage } from "@/features/platform-admin/pages/AuditLogViewerPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading audit logs...</div>}>
      <AuditLogViewerPage />
    </Suspense>
  );
}
