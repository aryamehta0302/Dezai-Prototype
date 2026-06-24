import { QuizPage } from "@/features/quizzes/pages/QuizPage";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; quizId: string }>;
}) {
  const { slug, quizId } = await params;
  return <QuizPage slug={slug} quizId={quizId} />;
}
