import { PageContainer } from "@/shared/components/page-container";
import { LoadingSkeleton } from "@/shared/components/loading-skeleton";

export default function Loading() {
  return (
    <PageContainer className="py-16">
      <LoadingSkeleton />
    </PageContainer>
  );
}
