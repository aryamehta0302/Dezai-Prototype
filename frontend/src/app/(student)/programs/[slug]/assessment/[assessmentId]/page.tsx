import { AssessmentPlayer } from "@/features/assessments/pages/AssessmentPlayer";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; assessmentId: string }>;
}) {
  const { slug, assessmentId } = await params;
  return <AssessmentPlayer slug={slug} assessmentId={assessmentId} />;
}
