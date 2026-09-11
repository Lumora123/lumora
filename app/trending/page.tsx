import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/browse/BrowseView";
import { listTitles } from "@/lib/queries";
import { toCard } from "@/lib/card";
import { titleLink, formatRuntime, genreName, cx } from "@/lib/format";
import ArtImage from "@/components/art/ArtImage";
import MovieGrid from "@/components/cards/MovieGrid";
import { RatingBadge } from "@/components/ui/Badges";
import { IconSpark } from "@/components/icons";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Trending Now",
  description: "What everyone is watching on Lumora right now — the ten hottest legally-streamable titles this week.",
  alternates: { canonical: "/trending" },
};

export default function TrendingPage() {
  const trending = listTitles({ pageSize: 100 }).items.filter(t => t.trending).sort((a, b) => b.popularity - a.popularity);
  const top10 = trending.slice(0, 10);
  const rest = trending.slice(10);
  const also = rest.length ? rest : listTitles({ sort: "popular", pageSize: 24 }).items.filter(t => !top10.includes(t)).slice(0, 12);

  return (
    <>
      <PageHeader
        eyebrow="This week"
        title="Trending Now"
        description="Ranked by what Lumora viewers are actually watching — refreshed from playback and discovery signals across the catalog."
      />
      <div className="shell py-8 lg:py-10">
        <ol className="space-y-3">
          {top10.map((t, i) => {
            const card = toCard(t);
            return (
              <li key={t.id}>
                <Link
                  href={titleLink(card)}
                  className="group flex items-center gap-4 rounded-xl2 border border-white/[0.06] bg-ink-900/50 p-3 transition-all duration-300 ease-cinema hover:border-ember-400/30 hover:bg-ink-850/80 sm:gap-6 sm:p-4"
                >
                  <span
                    className="w-10 shrink-0 text-center font-display text-[2.2rem] font-extrabold leading-none text-transparent sm:w-16 sm:text-[3.4rem]"
                    style={{ WebkitTextStroke: "1.5px rgba(245,166,35,0.55)" }}
                    aria-label={`Rank ${i + 1}`}
                  >
                    {i + 1}
                  </span>
                  <span className="relative hidden h-24 w-16 shrink-0 overflow-hidden rounded-md ring-1 ring-white/10 sm:block">
                    <ArtImage src={t.poster} alt="" seed={t.slug} title={t.title} genres={t.genres} year={t.year} sizes="64px" className="h-full w-full" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-display text-base font-bold text-mist-50 transition-colors group-hover:text-ember-300 sm:text-lg">{t.title}</span>
                      <RatingBadge rating={t.rating} />
                    </span>
                    <span className="mt-1 block truncate text-[12.5px] text-mist-400">
                      {t.year} · {t.kind === "movie" ? "Movie" : "Series"} · {formatRuntime(t.runtime)}{t.kind === "tv" ? " / ep" : ""} · {t.genres.slice(0, 2).map(genreName).join(" · ")}
                    </span>
                    <span className="mt-1.5 hidden text-[12.5px] leading-relaxed text-mist-500 line-clamp-2 md:block">{t.synopsis}</span>
                  </span>
                  <span className={cx("hidden shrink-0 items-center gap-1.5 rounded-full bg-ember-400/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-ember-300 ring-1 ring-ember-400/25 lg:flex")}>
                    <IconSpark size={12} /> Hot
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>

        <h2 className="section-title mb-4 mt-14">Also trending</h2>
        <MovieGrid cards={also.map(toCard)} />
      </div>
    </>
  );
}
