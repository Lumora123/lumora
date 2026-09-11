import { Suspense } from "react";
import Link from "next/link";
import { listTitles, facets as getFacets, type ListFilters } from "@/lib/queries";
import { parseListParams, buildQuery, type SP } from "@/lib/params";
import { toCard } from "@/lib/card";
import { cx } from "@/lib/format";
import MovieGrid from "@/components/cards/MovieGrid";
import FilterBar, { type Facets } from "./FilterBar";
import { EmptyState, GridSkeleton } from "@/components/ui/States";
import { IconChevronLeft, IconChevronRight, IconSearch } from "@/components/icons";

import PageHeader from "./PageHeader";
export { PageHeader };

export default function BrowseView({
  eyebrow,
  heading,
  description,
  searchParams,
  forced = {},
  emptyHint,
  facetsOverride,
}: {
  eyebrow?: string;
  heading: string;
  description?: string;
  searchParams: SP;
  forced?: Partial<ListFilters> & { hideGenresControl?: boolean; hideKindControl?: boolean };
  emptyHint?: string;
  facetsOverride?: Partial<Facets>;
}) {
  const { filters, page } = parseListParams(searchParams, forced);
  const result = listTitles({ ...filters, page });
  const cards = result.items.map(toCard);
  const f = getFacets();

  const facets: Facets = {
    genres: (facetsOverride?.genres ?? f.genres.map(g => ({ slug: g.slug, name: g.name }))),
    languages: facetsOverride?.languages ?? f.languages,
    countries: facetsOverride?.countries ?? f.countries,
    decades: [...new Set(f.years.map(y => Math.floor(y / 10) * 10))].sort(),
  };

  const qsBase: Record<string, unknown> = {
    type: searchParams.type, genre: searchParams.genre, decade: searchParams.decade,
    rating: searchParams.rating, lang: searchParams.lang, country: searchParams.country,
    runtime: searchParams.runtime, sort: searchParams.sort, q: searchParams.q,
  };

  return (
    <>
      <PageHeader eyebrow={eyebrow} title={heading} description={description} />
      <div className="shell py-8 lg:py-10">
        <Suspense fallback={<div className="skeleton mb-8 h-10 w-full max-w-md rounded-lg" />}>
          <FilterBar
            facets={facets}
            resultCount={result.total}
            forced={{ kinds: forced.hideKindControl, genres: forced.hideGenresControl }}
          />
        </Suspense>

        {cards.length === 0 ? (
          <EmptyState
            icon={<IconSearch size={22} />}
            title="No titles match your filters"
            body={emptyHint ?? "Try removing a filter or two — the catalog spans horror, comedy, sci-fi, documentary and more."}
            action={
              <Link href="/movies" className="btn-ghost btn-md">Browse all movies</Link>
            }
          />
        ) : (
          <MovieGrid cards={cards} />
        )}

        {result.pages > 1 && (
          <Pagination page={result.page} pages={result.pages} qsBase={qsBase} />
        )}
      </div>
    </>
  );
}

export function Pagination({ page, pages, qsBase }: { page: number; pages: number; qsBase: Record<string, unknown> }) {
  const href = (p: number) => buildQuery({ ...qsBase, page: p > 1 ? p : null });
  const windowStart = Math.max(1, Math.min(page - 2, pages - 4));
  const window = Array.from({ length: Math.min(5, pages) }, (_, i) => windowStart + i);

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={href(page - 1)}
        aria-label="Previous page"
        aria-disabled={page <= 1}
        className={cx(
          "grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-mist-300 transition-colors",
          page <= 1 ? "pointer-events-none opacity-30" : "hover:border-white/30 hover:text-white"
        )}
      >
        <IconChevronLeft size={17} />
      </Link>
      {windowStart > 1 && (
        <>
          <Link href={href(1)} className="h-10 w-10 rounded-lg text-sm font-semibold text-mist-400 hover:text-white grid place-items-center">1</Link>
          {windowStart > 2 && <span className="px-1 text-mist-600">…</span>}
        </>
      )}
      {window.map(p => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={cx(
            "grid h-10 w-10 place-items-center rounded-lg text-sm font-bold transition-colors",
            p === page ? "bg-ember-400 text-ink-950" : "text-mist-400 hover:bg-white/[0.06] hover:text-white"
          )}
        >
          {p}
        </Link>
      ))}
      {windowStart + 5 <= pages && (
        <>
          {windowStart + 5 < pages && <span className="px-1 text-mist-600">…</span>}
          <Link href={href(pages)} className="h-10 w-10 rounded-lg text-sm font-semibold text-mist-400 hover:text-white grid place-items-center">{pages}</Link>
        </>
      )}
      <Link
        href={href(page + 1)}
        aria-label="Next page"
        aria-disabled={page >= pages}
        className={cx(
          "grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-mist-300 transition-colors",
          page >= pages ? "pointer-events-none opacity-30" : "hover:border-white/30 hover:text-white"
        )}
      >
        <IconChevronRight size={17} />
      </Link>
    </nav>
  );
}

export { GridSkeleton };
