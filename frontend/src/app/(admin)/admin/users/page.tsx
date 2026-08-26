import { Suspense } from "react";
import { UserManagementPage } from "@/features/platform-admin/pages/UserManagementPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading users...</div>}>
      <UserManagementPage />
    </Suspense>
  );
}
