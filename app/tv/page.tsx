import type { Metadata } from "next";
import BrowseView from "@/components/browse/BrowseView";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "TV Shows",
  description: "Stream classic television series and chapter-play serials, episode by episode — fully public-domain seasons with real episode guides.",
  alternates: { canonical: "/tv" },
};

export default function TvPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  return (
    <BrowseView
      eyebrow="Catalog"
      heading="TV Shows"
      description="Series and serials with full season and episode guides — from the Dragnet case files to Flash Gordon's journey across Mongo."
      searchParams={searchParams}
      forced={{ kinds: ["tv"], hideKindControl: true }}
    />
  );
}
