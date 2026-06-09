import { VerifyPage } from "@/features/certificates/pages/VerifyPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VerifyPage id={id} />;
}
