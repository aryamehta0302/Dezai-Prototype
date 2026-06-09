import { CourseDetailPage } from "@/features/courses/pages/CourseDetailPage";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CourseDetailPage slug={slug} />;
}
