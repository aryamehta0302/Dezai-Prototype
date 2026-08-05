import { CatalogPage } from "@/features/programs/pages/CatalogPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <CatalogPage initialSearch={q ?? ""} />;
}
