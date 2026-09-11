import type { Metadata } from "next";
import BrowseView from "@/components/browse/BrowseView";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Movies",
  description: "Browse every legally streamable movie on Lumora — public-domain classics, noir, horror, comedy, sci-fi and CC-licensed open films. Filter by genre, decade, rating, language and runtime.",
  alternates: { canonical: "/movies" },
};

export default function MoviesPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return (
    <BrowseView
      eyebrow="Catalog"
      heading="Movies"
      description="Feature films from the public-domain vault and the open-movie movement — every stream rights-verified, many restored in HD."
      searchParams={searchParams}
      forced={{ kinds: ["movie"], hideKindControl: true }}
    />
  );
}
