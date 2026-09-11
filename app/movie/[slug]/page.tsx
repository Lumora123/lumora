import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getTitleBySlug } from "@/lib/queries";
import { moreLikeThis } from "@/lib/recommend";
import { toCard } from "@/lib/card";
import {
  countryName, formatDate, formatRuntime, genreName, languageLabel, playableSources, qualityBadge, timeAgo,
} from "@/lib/format";
import ArtImage from "@/components/art/ArtImage";
import DetailActions from "@/components/details/DetailActions";
import ResumeBar from "@/components/details/ResumeBar";
import { PlayabilityPanel } from "@/components/details/PlayabilityPanel";
import { DemoBadge, QualityBadge } from "@/components/ui/Badges";
import MovieGrid from "@/components/cards/MovieGrid";
import { IconCalendar, IconClock, IconFilm, IconGlobe, IconSpark } from "@/components/icons";

export const revalidate = 0;

export function generateStaticParams() {
  return db().titles.filter(t => t.kind === "movie").map(t => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const t = getTitleBySlug(params.slug, "movie");
  if (!t) return { title: "Movie not found" };
  const desc = `${t.title} (${t.year}) — ${t.synopsis.slice(0, 155)}…`;
  return {
    title: `${t.title} (${t.year})`,
    description: desc,
    alternates: { canonical: `/movie/${t.slug}` },
    openGraph: {
      type: "video.movie",
      title: `${t.title} (${t.year}) · Lumora`,
      description: desc,
      url: `/movie/${t.slug}`,
      images: [{ url: `/api/og/${t.kind}/${t.slug}`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: `${t.title} (${t.year})`, description: desc },
  };
}

function isoDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `PT${h}H${m}M` : `PT${m}M`;
}

export default function MoviePage({ params }: { params: { slug: string } }) {
  const t = getTitleBySlug(params.slug, "movie");
  if (!t) notFound();

  const related = moreLikeThis(t, 12).map(toCard);
  const live = playableSources(t.streamingSources);
  const attribution = live.find(s => s.attribution)?.attribution;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: t.title,
    description: t.synopsis,
    image: `/api/og/movie/${t.slug}`,
    datePublished: t.releaseDate,
    duration: isoDuration(t.runtime),
    contentRating: t.contentRating,
    genre: t.genres.map(genreName),
    inLanguage: t.languages.map(languageLabel),
    countryOfOrigin: t.countries.map(c => ({ "@type": "Country", name: countryName(c) })),
    director: t.director ? { "@type": "Person", name: t.director.split(",")[0].trim() } : undefined,
    actor: t.cast.slice(0, 8).map(c => ({ "@type": "Person", name: c.name })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ------------------------------- hero ------------------------------- */}
      <div className="relative">
        <div className="absolute inset-0" aria-hidden="true">
          <ArtImage
            src={t.backdrop}
            alt=""
            seed={t.slug}
            title={t.title}
            genres={t.genres}
            variant="backdrop"
            bare
            priority
            sizes="100vw"
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-hero-scrim" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 via-ink-950/30 to-transparent" />
        </div>

        <div className="shell relative flex min-h-[82svh] items-end pb-10 pt-[calc(var(--header-h)+3rem)] lg:pb-14">
          <div className="grid w-full gap-8 lg:grid-cols-[240px_1fr_300px] lg:items-end">
            <div className="hidden lg:block">
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl2 shadow-lift ring-1 ring-white/15">
                <ArtImage
                  src={t.poster}
                  alt={`${t.title} poster`}
                  seed={t.slug}
                  title={t.title}
                  genres={t.genres}
                  year={t.year}
                  demo={t.contentTier === "demo"}
                  priority
                  sizes="240px"
                  className="h-full w-full"
                />
              </div>
            </div>

            <div className="max-w-2xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="chip border-ember-400/30 bg-ember-400/10 text-ember-300">
                  <IconFilm size={11} /> Movie
                </span>
                {t.contentTier === "demo" && <DemoBadge className="px-2 py-0.5 text-[10px]" />}
                {t.flags?.lumoraPick && (
                  <span className="chip border-ember-400/30 bg-ember-400/10 text-ember-300">
                    <IconSpark size={11} /> Lumora Pick
                  </span>
                )}
              </div>

              <h1 className="font-display text-[clamp(2.2rem,5.5vw,4rem)] font-extrabold uppercase leading-[0.98] text-mist-50 drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
                {t.title}
              </h1>
              {t.tagline && <p className="mt-2 text-[15px] italic text-mist-300">“{t.tagline}”</p>}

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] font-semibold text-mist-300">
                <span className="flex items-center gap-1 rounded-md bg-black/45 px-2 py-1 text-ember-300 backdrop-blur">
                  <IconSpark size={13} /> {t.rating.toFixed(1)}<span className="text-mist-500">/10</span>
                </span>
                <span className="flex items-center gap-1.5"><IconCalendar size={13} className="text-mist-500" /> {t.year}</span>
                <span className="flex items-center gap-1.5"><IconClock size={13} className="text-mist-500" /> {formatRuntime(t.runtime)}</span>
                <span className="rounded border border-white/20 px-1.5 py-px text-[11px] font-bold text-mist-300">{t.contentRating}</span>
                <QualityBadge label={qualityBadge(t.streamingSources).label} className="px-1.5 py-0.5" />
                <span className="flex items-center gap-1.5"><IconGlobe size={13} className="text-mist-500" /> {t.languages.map(languageLabel).join(", ")}</span>
              </div>

              <p className="mt-3 text-[13px] font-semibold text-mist-400">
                {t.genres.map(g => genreName(g)).join(" · ")}
              </p>

              <div className="mt-6">
                <DetailActions title={t} />
              </div>

              <div className="mt-5">
                <ResumeBar progressKey={`movie:${t.slug}`} resumeHref={`/watch/movie/${t.slug}`} label="Resume" />
              </div>
            </div>

            <div className="hidden lg:block" />
          </div>
        </div>
      </div>

      {/* ------------------------------- body ------------------------------- */}
      <div className="shell relative z-10 py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
          <div className="min-w-0 space-y-10">
            <section aria-label="Synopsis">
              <h2 className="section-title mb-3">Synopsis</h2>
              <p className="max-w-3xl text-[15px] leading-[1.75] text-mist-300">{t.synopsis}</p>
            </section>

            <PlayabilityPanel
              sources={t.streamingSources}
              subtitles={t.subtitles}
              audioTracks={t.audioTracks}
              rightsNote={t.rightsNote}
              attribution={attribution}
            />

            <section aria-label="More like this">
              <h2 className="section-title mb-5">More Like This</h2>
              <MovieGrid cards={related.slice(0, 6)} />
              {related.length > 6 && (
                <div className="mt-8">
                  <MovieGrid cards={related.slice(6, 12)} />
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6" aria-label="Title details">
            <div className="rounded-xl2 border border-white/[0.07] bg-ink-900/50 p-5">
              <h2 className="mb-4 text-[11px] font-extrabold uppercase tracking-[0.2em] text-mist-400">Details</h2>
              <dl className="space-y-3.5 text-[13.5px]">
                {t.director && (
                  <div>
                    <dt className="text-mist-500">Director</dt>
                    <dd className="mt-0.5 font-semibold text-mist-100">
                      <Link href={`/search?q=${encodeURIComponent(t.director.split(",")[0].trim())}`} className="link-underline hover:text-ember-300">
                        {t.director}
                      </Link>
                    </dd>
                  </div>
                )}
                {t.cast.length > 0 && (
                  <div>
                    <dt className="text-mist-500">Cast</dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {t.cast.map(c => (
                        <Link
                          key={c.name}
                          href={`/search?q=${encodeURIComponent(c.name)}`}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[12px] font-semibold text-mist-200 transition-colors hover:border-ember-400/50 hover:text-ember-200"
                          title={c.role ? `${c.name} as ${c.role}` : c.name}
                        >
                          {c.name}
                        </Link>
                      ))}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-mist-500">Genres</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {t.genres.map(g => (
                      <Link key={g} href={`/genre/${g}`} className="rounded-full bg-ember-400/10 px-2.5 py-1 text-[12px] font-semibold text-ember-200 ring-1 ring-ember-400/25 transition-colors hover:bg-ember-400/20">
                        {genreName(g)}
                      </Link>
                    ))}
                  </dd>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <dt className="text-mist-500">Released</dt>
                    <dd className="mt-0.5 font-semibold text-mist-100">{formatDate(t.releaseDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-mist-500">Runtime</dt>
                    <dd className="mt-0.5 font-semibold text-mist-100">{formatRuntime(t.runtime)}</dd>
                  </div>
                  <div>
                    <dt className="text-mist-500">Countries</dt>
                    <dd className="mt-0.5 font-semibold text-mist-100">{t.countries.map(countryName).join(", ")}</dd>
                  </div>
                  <div>
                    <dt className="text-mist-500">Languages</dt>
                    <dd className="mt-0.5 font-semibold text-mist-100">{t.languages.map(languageLabel).join(", ")}</dd>
                  </div>
                  <div>
                    <dt className="text-mist-500">Content rating</dt>
                    <dd className="mt-0.5 font-semibold text-mist-100">{t.contentRating}</dd>
                  </div>
                  <div>
                    <dt className="text-mist-500">Added to Lumora</dt>
                    <dd className="mt-0.5 font-semibold text-mist-100">{timeAgo(t.createdAt)}</dd>
                  </div>
                </div>
              </dl>
            </div>

            {/* poster for small screens lives here instead of the hero grid */}
            <div className="lg:hidden">
              <div className="relative mx-auto aspect-[2/3] w-44 overflow-hidden rounded-xl2 shadow-lift ring-1 ring-white/15">
                <ArtImage src={t.poster} alt={`${t.title} poster`} seed={t.slug} title={t.title} genres={t.genres} year={t.year} demo={t.contentTier === "demo"} sizes="176px" className="h-full w-full" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
