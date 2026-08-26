import { Suspense } from "react";
import { FacultyManagementPage } from "@/features/university-admin/pages/FacultyManagementPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading faculty...</div>}>
      <FacultyManagementPage />
    </Suspense>
  );
}
