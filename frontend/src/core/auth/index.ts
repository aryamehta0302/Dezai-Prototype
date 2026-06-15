import NextAuth from "next-auth";
import { authConfig } from "./auth-config";

/**
 * NextAuth.js v5 — Central exports
 *
 * All auth operations flow through these exports.
 * Components use `auth()` for server-side session.
 * Client components use `useSession()` from next-auth/react.
 */

export const {
  handlers,  // GET, POST route handlers
  auth,      // Server-side session getter
  signIn,    // Server action: trigger sign-in
  signOut,   // Server action: trigger sign-out
} = NextAuth(authConfig);
