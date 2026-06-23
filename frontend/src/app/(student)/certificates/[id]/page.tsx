"use client";

import { useParams } from "next/navigation";
import { CredentialCard } from "@/features/credentials/components/CredentialCard";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Credential Details</h1>
      <p className="text-muted">Credential ID: {id}</p>
    </div>
  );
}
