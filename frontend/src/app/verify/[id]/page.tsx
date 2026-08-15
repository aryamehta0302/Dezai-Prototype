import { VerificationPortal } from "@/features/credentials/pages/VerificationPortal";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <VerificationPortal />;
}
