import { Suspense } from "react";
import { StudentManagementPage } from "@/features/university-admin/pages/StudentManagementPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading students...</div>}>
      <StudentManagementPage />
    </Suspense>
  );
}
