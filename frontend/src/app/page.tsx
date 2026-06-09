import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/login");
}

export const dynamic = "force-dynamic";
