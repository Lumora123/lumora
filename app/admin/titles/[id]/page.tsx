import type { Metadata } from "next";
import TitleForm from "@/components/admin/TitleForm";

export const metadata: Metadata = { title: "Edit Title" };

export default function EditTitlePage({ params }: { params: { id: string } }) {
  return <TitleForm id={params.id} />;
}
