import { CredentialVerifyPage } from "@/features/credentials/pages/CredentialVerifyPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CredentialVerifyPage id={id} />;
}
