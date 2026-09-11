import type { Metadata } from "next";
import Link from "next/link";
import BrowseView, { PageHeader } from "@/components/browse/BrowseView";
import { popularSearches } from "@/lib/queries";
import { IconSearch, IconSpark } from "@/components/icons";

export const revalidate = 0;

export async function generateMetadata({ searchParams }: { searchParams: { q?: string } }): Promise<Metadata> {
  const q = (searchParams.q ?? "").trim();
  return {
    title: q ? `Search: ${q}` : "Search",
    description: q
      ? `Results for “${q}” across Lumora's legally-streamable catalog of movies and series.`
      : "Search Lumora by title, actor, director, genre, year or language.",
    robots: { index: false, follow: true },
  };
}

export default function SearchPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";

  if (!q) {
    const popular = popularSearches();
    return (
      <>
        <PageHeader
          eyebrow="Search"
          title="Find Something to Watch"
          description="Search matches titles, cast, directors, creators, genres, release years and languages."
        />
        <div className="shell py-10">
          <div className="rounded-xl2 border border-dashed border-white/10 bg-ink-900/40 px-6 py-14 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-white/[0.05] text-mist-400">
              <IconSearch size={22} />
            </div>
            <h2 className="font-display text-lg font-bold text-mist-50">Start typing to search</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-mist-400">
              Press <kbd className="rounded border border-white/15 bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-bold">⌘K</kbd> anywhere,
              or try one of the popular searches below.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-2">
              {popular.map(term => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="chip border-ember-400/25 bg-ember-400/[0.07] text-mist-200 transition-colors hover:border-ember-400/60 hover:text-white"
                >
                  <IconSpark size={11} className="text-ember-400" /> {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <BrowseView
      eyebrow="Search results"
      heading={`“${q}”`}
      description="Sorted by relevance. Refine with filters — search also matches cast, directors, genres, years and languages."
      searchParams={searchParams}
      emptyHint={`Nothing matched “${q}”. Check the spelling, or try a broader term like a genre (“horror”) or a year (“1959”).`}
    />
  );
}
