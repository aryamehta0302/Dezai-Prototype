import { AssessmentReview } from "@/features/assessments/pages/AssessmentReview";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; assessmentId: string }>;
}) {
  const { slug, assessmentId } = await params;
  return <AssessmentReview slug={slug} assessmentId={assessmentId} />;
}
