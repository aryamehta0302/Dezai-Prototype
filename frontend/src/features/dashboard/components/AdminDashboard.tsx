import { GraduationCap, ShieldAlert } from "lucide-react";

export function AdminDashboard() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 mb-6">
                <ShieldAlert className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-on-surface mb-2">Admin Dashboard</h1>
            <p className="text-muted  mx-auto mb-8">
                The Dezai Administrator Portal is currently under construction. Please use the Student Dashboard for testing the Learning System integration.
            </p>
            <div className="flex items-center gap-3 text-sm font-medium text-primary bg-primary/5 px-4 py-2 rounded-full">
                <GraduationCap className="h-4 w-4" />
                V1 Learning Engine Operational
            </div>
        </div>
    );
}
