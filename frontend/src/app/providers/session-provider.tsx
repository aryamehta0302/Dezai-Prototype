"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

interface Props {
  children: React.ReactNode;
}

/**
 * Wraps the app in NextAuth's SessionProvider.
 * Placed in app/providers/ and composed in the root providers file.
 */
export function SessionProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      {children}
    </NextAuthSessionProvider>
  );
}
