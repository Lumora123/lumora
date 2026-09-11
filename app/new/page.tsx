import type { Metadata } from "next";
import { PageHeader } from "@/components/browse/BrowseView";
import { db } from "@/lib/db";
import { toCard } from "@/lib/card";
import MovieGrid from "@/components/cards/MovieGrid";
import Row, { RowItem } from "@/components/cards/Row";
import MovieCard from "@/components/cards/MovieCard";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "New Releases",
  description: "The newest additions to the Lumora catalog — freshly restored public-domain classics and newly licensed open movies.",
  alternates: { canonical: "/new" },
};

export default function NewReleasesPage() {
  const titles = db().titles;
  const flagged = titles.filter(t => t.flags?.newRelease).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const recentlyAdded = [...titles].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 18);

  return (
    <>
      <PageHeader
        eyebrow="Fresh on Lumora"
        title="New Releases"
        description="Titles newly added to the catalog, each one rights-checked before it goes live."
      />
      <div className="py-8 lg:py-10">
        {flagged.length > 0 && (
          <Row title="Just arrived" id="just-arrived" className="mb-10">
            {flagged.map(t => (
              <RowItem key={t.id}>
                <MovieCard card={toCard(t)} />
              </RowItem>
            ))}
          </Row>
        )}
        <div className="shell">
          <h2 className="section-title mb-5">Recently added to the catalog</h2>
          <MovieGrid cards={recentlyAdded.map(toCard)} />
        </div>
      </div>
    </>
  );
}
