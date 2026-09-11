import type { Metadata } from "next";
import BrowseView from "@/components/browse/BrowseView";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Browse",
  description: "Browse the complete Lumora catalog with advanced filters — type, genre, decade, rating, runtime, language and country.",
  alternates: { canonical: "/browse" },
};

export default function BrowsePage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return (
    <BrowseView
      eyebrow="Catalog"
      heading="Browse Everything"
      description="Every movie and series on Lumora in one place, with advanced filtering and sorting."
      searchParams={searchParams}
    />
  );
}
