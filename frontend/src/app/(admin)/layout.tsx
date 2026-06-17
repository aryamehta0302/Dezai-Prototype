"use client";

import { AuthGuard } from "@/features/auth/components/auth-guard";
import { TopAppBar } from "@/shared/components/top-app-bar";
import { UserRole } from "@/shared/types/common.types";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuthStore();
    const { logout } = useAuth();

    return (
        <AuthGuard allowedRoles={[UserRole.DEZAI_ADMIN]}>
            <div className="flex min-h-screen flex-col">
                <TopAppBar
                    variant="admin"
                    user={
                        user
                            ? {
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                avatar: user.avatar,
                            }
                            : null
                    }
                    onLogout={logout}
                />
                <main className="flex-1 bg-surface-lowest">{children}</main>
            </div>
        </AuthGuard>
    );
}
