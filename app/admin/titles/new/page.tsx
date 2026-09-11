import type { Metadata } from "next";
import TitleForm from "@/components/admin/TitleForm";

export const metadata: Metadata = { title: "New Title" };

export default function NewTitlePage() {
  return <TitleForm id={null} />;
}
