import Link from "next/link";
import { db } from "@/lib/db";
import { toCard } from "@/lib/card";
import { genreCounts } from "@/lib/queries";
import {
  heroTitles, railGenre, railNewReleases, railPopularMovies, railPopularTV,
  railRecentlyAdded, railTopRated, railTrending,
} from "@/lib/queries";
import { genres as allGenres } from "@/lib/seed";
import type { Title } from "@/lib/types";
import HomeHero from "@/components/home/HomeHero";
import { ContinueWatchingRail, RecommendedRail } from "@/components/home/PersonalRails";
import Row, { RowItem } from "@/components/cards/Row";
import MovieCard from "@/components/cards/MovieCard";
import TitleArt from "@/components/art/TitleArt";
import { IconChevronRight } from "@/components/icons";

export const revalidate = 0;

const SECTION_HREF: Record<string, string | undefined> = {
  trending: "/trending",
  "new-releases": "/new",
  "popular-movies": "/movies",
  "popular-tv": "/tv",
  "top-rated": "/browse?sort=rating",
  "recently-added": "/browse?sort=added",
};

export default function HomePage() {
  const sections = [...db().sections].filter(s => s.enabled).sort((a, b) => a.order - b.order);
  const heroes: Title[] = heroTitles().slice(0, 6);
  const allCards = db().titles.map(toCard);
  const counts = genreCounts();

  let railIndex = 0;

  return (
    <>
      <HomeHero titles={heroes} />

      <div className="relative z-20 -mt-16 space-y-10 pb-6 sm:-mt-20 lg:-mt-24 lg:space-y-12">
        {sections.map(section => {
          if (section.type === "continue-watching") {
            return <ContinueWatchingRail key={section.id} allCards={allCards} />;
          }
          if (section.type === "recommended") {
            const fallback = [...allCards]
              .sort((a, b) => b.rating * 10 + b.popularity - (a.rating * 10 + a.popularity))
              .slice(0, 16);
            return <RecommendedRail key={section.id} fallback={fallback} />;
          }

          let titles: Title[] = [];
          if (section.type === "trending") titles = railTrending();
          else if (section.type === "popular-movies") titles = railPopularMovies();
          else if (section.type === "popular-tv") titles = railPopularTV();
          else if (section.type === "new-releases") titles = railNewReleases();
          else if (section.type === "recently-added") titles = railRecentlyAdded();
          else if (section.type === "top-rated") titles = railTopRated();
          else if (section.type === "genre" && section.genre) titles = railGenre(section.genre);
          if (titles.length === 0) return null;

          const cards = titles.map(toCard);
          const href = section.type === "genre" ? `/genre/${section.genre}` : SECTION_HREF[section.type];
          const rail = (
            <Row key={section.id} title={section.label} href={href} id={section.id}>
              {cards.map(card => (
                <RowItem key={card.id}>
                  <MovieCard card={card} />
                </RowItem>
              ))}
            </Row>
          );

          railIndex += 1;
          // Editorial break: genre discovery strip after the fourth content rail
          if (railIndex === 4) {
            return (
              <div key={section.id}>
                {rail}
                <section className="mt-10 lg:mt-12" aria-labelledby="browse-genres-title">
                  <div className="shell mb-3 flex items-end justify-between">
                    <h2 id="browse-genres-title" className="section-title">Browse by Genre</h2>
                    <Link href="/genres" className="group inline-flex items-center gap-1 text-[13px] font-semibold text-mist-400 transition-colors hover:text-ember-300">
                      All genres
                      <IconChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                  <ul className="rail-scroll shell no-scrollbar">
                    {allGenres.filter(g => counts[g.slug] > 0).map(g => (
                      <li key={g.slug} className="w-[180px] shrink-0 sm:w-[210px]">
                        <Link
                          href={`/genre/${g.slug}`}
                          className="group relative block aspect-[16/10] overflow-hidden rounded-xl2 ring-1 ring-white/[0.07] transition-all duration-300 ease-cinema hover:-translate-y-1 hover:shadow-lift hover:ring-ember-400/40"
                        >
                          <TitleArt seed={`genre-${g.slug}`} title={g.name} genres={[g.slug]} variant="still" bare className="h-full w-full transition-transform duration-700 ease-cinema group-hover:scale-105" />
                          <span className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/25 to-transparent" aria-hidden="true" />
                          <span className="absolute inset-x-0 bottom-0 p-3.5">
                            <span className="block font-display text-[15px] font-bold text-mist-50">{g.name}</span>
                            <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-wider text-mist-400">
                              {counts[g.slug]} title{counts[g.slug] === 1 ? "" : "s"}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            );
          }
          return rail;
        })}
      </div>
    </>
  );
}
