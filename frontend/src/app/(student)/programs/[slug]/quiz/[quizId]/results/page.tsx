import { QuizResultsPage } from "@/features/quizzes/pages/QuizResultsPage";
import { Suspense } from "react";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; quizId: string }>;
}) {
  const { slug, quizId } = await params;
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted">Loading results...</div>}>
      <QuizResultsPage slug={slug} quizId={quizId} />
    </Suspense>
  );
}
