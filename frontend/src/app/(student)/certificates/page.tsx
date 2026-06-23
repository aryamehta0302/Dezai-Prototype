"use client";

import { useAuthStore } from "@/lib/stores/auth.store";
import { CredentialProvider } from "@/features/credentials/context/CredentialContext";
import { StudentCredentialCenter } from "@/features/credentials/pages/StudentCredentialCenter";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;
  return (
    <CredentialProvider>
      <StudentCredentialCenter userId={user.id} />
    </CredentialProvider>
  );
}
