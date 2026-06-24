import type { NextAuthConfig } from "next-auth";
import { UserRole } from "@/shared/types/common.types";
import { getAuthProviders } from "./providers";
import { getDashboardForRole } from "./permissions";
import { isPublicPath } from "./route-permissions";
import { signBackendToken } from "./jwt-helper";

/**
 * Dezai Auth Configuration — NextAuth v5
 *
 * Provider-agnostic. Business logic never references a specific OAuth provider.
 * Providers are registered in `./providers.ts` and injected here.
 *
 * Session strategy: JWT (stateless, no DB session table needed for V1).
 */

// ─── Type Augmentation ───

declare module "next-auth" {
  interface User {
    role?: UserRole;
    onboarded?: boolean;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: UserRole;
      onboarded: boolean;
    };
    accessToken?: string;
  }

  interface JWT {
    id?: string;
    role?: UserRole;
    onboarded?: boolean;
    accessToken?: string;
  }
}

// ─── Config ───

export const authConfig: NextAuthConfig = {
  providers: getAuthProviders(),

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    /**
     * JWT callback — runs on every token creation/refresh.
     * Persists user id, role, and onboarding status into the JWT.
     * No provider-specific logic here.
     */
    async jwt({ token, user, account, trigger, session }) {
      // First sign-in: bootstrap token from the user object
      if (account && user) {
        token.id = user.id;
        if (account.provider === "credentials") {
          token.role = user.role ?? UserRole.STUDENT;
          token.onboarded = user.onboarded ?? false;
        } else {
          // Social logins: hit backend to check onboarding/role status
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
            const response = await fetch(`${apiUrl}/auth/session-sync`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                id: user.id,
                email: user.email,
                name: user.name,
              }),
            });
            if (response.ok) {
              const data = await response.json();
              token.role = data.user.role ?? UserRole.STUDENT;
              token.onboarded = data.user.onboarded ?? false;
            } else {
              token.role = UserRole.STUDENT;
              token.onboarded = false;
            }
          } catch (error) {
            console.error("OAuth session sync failed:", error);
            token.role = UserRole.STUDENT;
            token.onboarded = false;
          }
        }
      }

      // Session update trigger (e.g., after onboarding or profile update)
      if (trigger === "update" && session) {
        if (session.role) token.role = session.role as UserRole;
        if (session.onboarded !== undefined) token.onboarded = session.onboarded;
        if (session.name) token.name = session.name;
      }

      // Sign the backend JWT token using the shared secret
      if (token.id && token.email) {
        try {
          token.accessToken = await signBackendToken({
            id: token.id as string,
            email: token.email as string,
            role: (token.role as UserRole) ?? UserRole.STUDENT,
            onboarded: (token.onboarded as boolean) ?? false,
          });

          // Trigger login audit on the backend asynchronously (if this is the first sign-in)
          if (account && user) {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
            fetch(`${apiUrl}/auth/login-audit`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token.accessToken}`,
                "Content-Type": "application/json",
              },
            }).catch((err) => {
              console.error("Failed to log login audit on backend:", err);
            });
          }
        } catch (error) {
          console.error("Error signing backend token:", error);
        }
      }

      return token;
    },

    /**
     * Session callback — shapes the session object exposed to the client.
     */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as UserRole) ?? UserRole.STUDENT;
        session.user.onboarded = (token.onboarded as boolean) ?? false;
      }
      session.accessToken = token.accessToken as string;
      return session;
    },

    /**
     * Authorized callback — middleware-level route protection.
     * Decides whether to allow, redirect, or block the request.
     */
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      // Public paths — always accessible
      if (isPublicPath(pathname) || pathname === "/") {
        // If logged in and on auth pages, redirect to dashboard
        if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
          const role = (auth?.user as { role?: UserRole })?.role ?? UserRole.STUDENT;
          return Response.redirect(new URL(getDashboardForRole(role), nextUrl));
        }
        return true;
      }

      // Not logged in — redirect to login
      if (!isLoggedIn) {
        return false; // NextAuth auto-redirects to pages.signIn
      }

      // Logged in but not onboarded — force onboarding
      const onboarded = (auth?.user as { onboarded?: boolean })?.onboarded;
      if (!onboarded && !pathname.startsWith("/onboarding")) {
        return Response.redirect(new URL("/onboarding", nextUrl));
      }

      // Onboarded user trying to access /onboarding — redirect to dashboard
      if (onboarded && pathname.startsWith("/onboarding")) {
        const role = (auth?.user as { role?: UserRole })?.role ?? UserRole.STUDENT;
        return Response.redirect(new URL(getDashboardForRole(role), nextUrl));
      }

      // Route-level RBAC is handled by AuthGuard in layouts (client-side).
      // Middleware only enforces auth + onboarding gating.
      return true;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.AUTH_SECRET,
};
