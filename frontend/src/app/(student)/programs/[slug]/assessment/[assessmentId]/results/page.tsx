import { AssessmentResult } from "@/features/results/pages/AssessmentResult";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; assessmentId: string }>;
}) {
  const { slug, assessmentId } = await params;
  return <AssessmentResult slug={slug} assessmentId={assessmentId} />;
}
