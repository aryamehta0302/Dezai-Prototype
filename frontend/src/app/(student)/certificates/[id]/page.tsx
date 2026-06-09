import { CertificateDetailPage } from "@/features/certificates/pages/CertificateDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CertificateDetailPage id={id} />;
}
