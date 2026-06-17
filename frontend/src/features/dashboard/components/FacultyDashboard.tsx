import { UserCheck, Laptop } from "lucide-react";

export function FacultyDashboard() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-info/10 mb-6">
                <UserCheck className="h-10 w-10 text-info" />
            </div>
            <h1 className="text-3xl font-bold text-on-surface mb-2">Faculty Dashboard</h1>
            <p className="text-muted  mx-auto mb-8">
                Welcome and thank you for being part of Dezai. The Faculty Management console is currently under construction. Please use the Student account to verify learning progress and credit awarding.
            </p>
            <div className="flex items-center gap-3 text-sm font-medium text-info bg-info/5 px-4 py-2 rounded-full">
                <Laptop className="h-4 w-4" />
                Instructor Node Active
            </div>
        </div>
    );
}
