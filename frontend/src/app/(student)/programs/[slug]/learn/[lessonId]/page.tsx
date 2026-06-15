import { CoursePlayerPage } from "@/features/learning/pages/CoursePlayerPage";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  return <CoursePlayerPage slug={slug} lessonId={lessonId} />;
}
