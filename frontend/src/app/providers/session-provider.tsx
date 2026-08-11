"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { UserRole } from "@/shared/types/common.types";

interface Props {
  children: React.ReactNode;
}

export function SessionProvider({ children }: Props) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}
